import asyncio
from datetime import datetime
from enum import IntEnum
import json
import logging
from pathlib import Path
from typing import Sequence

import aiosqlite

from indy import ledger

from von_anchor import AnchorSmith
from von_anchor.anchor.base import _BaseAnchor
from von_anchor.nodepool import NodePool
from von_anchor.wallet import Wallet

LOGGER = logging.getLogger(__name__)

INDY_TXN_TYPES = {
  "0": "NODE",
  "1": "NYM",
  "3": "GET_TXN",
  "100": "ATTRIB",
  "101": "SCHEMA",
  "102": "CLAIM_DEF",
  "103": "DISCO",
  "104": "GET_ATTR",
  "105": "GET_NYM",
  "107": "GET_SCHEMA",
  "108": "GET_CLAIM_DEF",
  "109": "POOL_UPGRADE",
  "110": "NODE_UPGRADE",
  "111": "POOL_CONFIG",
  "112": "CHANGE_KEY",
}

INDY_ROLE_TYPES = {
  "0": "TRUSTEE",
  "2": "STEWARD",
  "100": "TGB",
  "101": "TRUST_ANCHOR",
}

class LedgerType(IntEnum):
  POOL = 0
  DOMAIN = 1
  CONFIG = 2

  @staticmethod
  def for_value(value):
    if isinstance(value, str):
      if value in '012':
        value = int(value)
      else:
        return LedgerType[value.upper()]
    return LedgerType(value)


class NotReadyException(Exception):
  pass


class AnchorHandle:
  def __init__(self):
    self._cache = None
    self._instance = None
    self._ready = False
    self._sync_lock = None

    pool_cfg = None # {'protocol': protocol_version}
    self._pool = NodePool(
      'nodepool',
      '/home/indy/.indy-cli/networks/sandbox/pool_transactions_genesis',
      pool_cfg,
    )
    self._wallet = Wallet(
      '000000000000000000000000Trustee1',
      'trustee_wallet',
    )

  async def open(self):
    self._cache = LedgerCache()
    await self._cache.open()
    await self._pool.open()
    await self._wallet.create()
    self._instance = AnchorSmith(self._wallet, self._pool)
    await self._instance.open()
    self._sync_lock = asyncio.Lock()
    asyncio.get_event_loop().create_task(self.sync_cache())
    self._ready = True

  async def close(self):
    self._ready = False
    await self._instance.close()
    await self._pool.close()
    await self._cache.close()

  @property
  def did(self):
    return self._wallet and self._wallet.did

  @property
  def instance(self):
    return self._instance

  @property
  def pool(self):
    return self._pool

  @property
  def ready(self):
    return self._ready

  @property
  def wallet(self):
    return self._wallet

  async def fetch_tail_txn(self, ledger_type: LedgerType, max_seqno=None):
    async with self._sync_lock:
      latest = await self._cache.get_latest_seqno(ledger_type)
      latest = latest and latest + 1 or 1
      if max_seqno and latest > max_seqno:
        return
      return await self.get_txn(ledger_type, latest, True, True)

  async def get_latest_seqno(self, ledger_type):
    ledger_type = LedgerType.for_value(ledger_type)
    return await self._cache.get_latest_seqno(ledger_type)

  async def get_nym(self, did):
    """
    Fetch a nym from the ledger
    """
    if not self.ready:
      raise NotReadyException()

    data = await self._instance.get_nym(did)
    return json.loads(data)

  async def get_txn(self, ledger_type, seq_no, cache=True, latest=False):
    """
    Fetch a transaction by sequence number
    """
    ledger_type = LedgerType.for_value(ledger_type)
    if not self.ready:
      raise NotReadyException()
    if cache:
      txn_info = await self._cache.get_txn(ledger_type, seq_no)
      if txn_info:
        if latest:
          await self._cache.set_latest(ledger_type, seq_no)
        return txn_info

    LOGGER.debug("Fetch %s %s", ledger_type, seq_no)
    req_json = await ledger.build_get_txn_request(self.did, ledger_type.name, seq_no)
    txn_json = await self._instance._submit(req_json)
    txn = json.loads(txn_json)
    data_json = self.pool.protocol.txn2data(txn)

    if data_json and data_json != "{}":
      body_json = json.dumps(txn["result"]["data"], separators=(',',':'), sort_keys=True)
      added = datetime.now() #self.pool.protocol.txntime(txn)
      if cache:
        await self._cache.add_txn(ledger_type, seq_no, body_json, added, latest)
      return (seq_no, added, body_json)

  async def get_txn_range(self, ledger_type, start=None, end=None):
    pos = start or 1
    ledger_type = LedgerType.for_value(ledger_type)
    rows = await self._cache.get_txn_range(ledger_type, pos, end)
    if rows:
      pos += len(rows)
    fetch_from = pos
    while not end or fetch_from <= end:
      row = await self.fetch_tail_txn(ledger_type, end)
      if row:
        fetch_from = row[0] + 1
      else:
        break
    if not end or pos <= end:
      rows.extend(await self._cache.get_txn_range(ledger_type, pos, end))
    return rows

  async def register_did(self, did, verkey, alias=None, role=None):
    """
    Register a DID and verkey on the ledger
    """
    if not self.ready:
      raise NotReadyException()

    LOGGER.info('Register agent')
    LOGGER.info("Get nym: %s", did)
    if not await self.get_nym(did):
      LOGGER.info("Send nym: %s/%s", did, verkey)
      await self._instance.send_nym(did, verkey, alias, role)

  async def seed_to_did(self, seed):
    """
    Resolve a DID and verkey from a seed
    """
    wallet = Wallet(
      seed,
      seed + '-wallet'
    )
    async with _BaseAnchor(await wallet.create(), self.pool) as new_agent:
      did = new_agent.did
      verkey = new_agent.verkey
      return (did, verkey)

  async def sync_cache(self):
    LOGGER.info("Syncing ledger cache")
    for type in LedgerType:
      await self.sync_ledger_cache(type)
    LOGGER.info("Finished sync")

  async def sync_ledger_cache(self, ledger_type: LedgerType):
    async with self._sync_lock:
      latest = await self._cache.get_latest_seqno(ledger_type)
      if latest:
        txn = await self.get_txn(ledger_type, latest, False)
        cache_txn = await self._cache.get_txn(ledger_type, latest)
        if not cache_txn or not txn or json.loads(cache_txn) != json.loads(txn):
          await self._cache.reset()
    while True:
      row = await self.fetch_tail_txn(ledger_type)
      if row:
        latest = row[0]
      else:
        break
    LOGGER.info("%s ledger synced with %s transaction(s)", ledger_type.name, latest or 0)

  async def validator_info(self):
    """
    Fetch the status of the validator nodes
    """
    if not self.ready:
      raise NotReadyException()

    req_json = await ledger.build_get_validator_info_request(self.did)
    result = await self._instance._sign_submit(req_json)
    node_data = json.loads(result)
    node_aliases = list(node_data.keys())
    node_aliases.sort()

    ret = []
    for node in node_aliases:
      reply = json.loads(node_data[node])
      if "result" not in reply:
        continue
      data = reply["result"].get("data")
      data["Node_info"]["Name"] = node
      ret.append(data)
    return ret


class LedgerCache:
  def __init__(self, db_path: str = None):
    self.db = None
    self.db_path = db_path or ":memory:"

  async def open(self):
    await self.close()
    path = Path(self.db_path)
    newDB = not path.exists()
    self.db = await aiosqlite.connect(str(path)).__aenter__()
    if newDB:
      await self.init_db()

  async def close(self):
    if self.db:
      await self.db.close()
      self.db = None

  async def query(self, sql, args=(), *, close=False, script=False):
    result = None
    if not isinstance(sql, str) and isinstance(sql, Sequence):
      for row in sql:
        if result:
          await result.close()
        if isinstance(sql, str) or not isinstance(row, Sequence):
          row = (row,)
        result = await self.query(*row, script=script)
    elif script:
      result = await self.db.executescript(sql)
    else:
      result = await self.db.execute(sql, args)
    if close and result:
      await result.close()
      result = None
    return result

  async def queryone(self, sql, args=()):
    async with await self.query(sql, args) as cursor:
      return await cursor.fetchone()

  async def perform(self, sql, args=(), script=False):
    return await self.query(sql, args, close=True, script=script)

  async def init_db(self):
    LOGGER.info("Initializing transaction database")
    await self.perform('''
      CREATE TABLE latest (
        ledger integer PRIMARY KEY,
        seqno integer NOT NULL DEFAULT 0
      );
      CREATE TABLE transactions (
        ledger integer NOT NULL,
        seqno integer NOT NULL,
        added timestamp,
        value text,
        PRIMARY KEY (ledger, seqno)
      )
      ''', script=True)

  async def reset(self):
    LOGGER.info("Resetting ledger cache")
    await self.perform('''
      TRUNCATE latest;
      TRUNCATE transactions
      ''', script=True)

  async def get_latest_seqno(self, ledger_type: LedgerType):
    row = await self.queryone(
      'SELECT seqno FROM latest WHERE ledger=?', (ledger_type.value,))
    return row and row[0] or None

  async def get_txn(self, ledger_type: LedgerType, seq_no):
    return await self.queryone(
      'SELECT seqno, added, value FROM transactions WHERE ledger=? AND seqno=?',
      (ledger_type.value, seq_no))

  async def get_txn_range(self, ledger_type: LedgerType, start=None, end=None):
    latest = await self.get_latest_seqno(ledger_type)
    if start is None:
      start = 1
    if end is None:
      end = latest
    ret = []
    if start and end:
      async with await self.query(
          'SELECT seqno, added, value FROM transactions WHERE ledger=? AND seqno BETWEEN ? AND ? ORDER BY seqno',
          (ledger_type.value, start, end)) as cursor:
        pos = start
        while True:
          rows = await cursor.fetchmany()
          for row in rows:
            # stop if we encounter a gap
            if row[0] != pos:
              rows = None
              break
            ret.append(row)
            pos += 1
          if not rows:
            break
    return ret

  async def add_txn(self, ledger_type: LedgerType, seq_no, value: str, added, latest=False):
    await self.perform(
      'INSERT INTO transactions (ledger, seqno, added, value) VALUES (?, ?, ?, ?)',
      (ledger_type.value, seq_no, added, value))
    if latest:
      await self.set_latest(ledger_type, seq_no)

  async def set_latest(self, ledger_type: LedgerType, seq_no):
    await self.perform(
      'REPLACE INTO latest (ledger, seqno) VALUES (?, ?)',
      (ledger_type.value, seq_no))

  async def __aenter__(self) -> "LedgerCache":
      await self.open()
      return self

  async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
      await self.close()
