#! /usr/bin/env python3

import asyncio
from datetime import datetime
import json
import shutil
import subprocess
import re

from aiohttp import web

from von_anchor import AnchorSmith
from von_anchor.anchor.base import _BaseAnchor
from von_anchor.nodepool import NodePool
from von_anchor.wallet import Wallet

APP = web.Application()
ROUTES = web.RouteTableDef()

@ROUTES.get('/')
async def index(request):
  return web.FileResponse('static/index.html')

@ROUTES.get('/favicon.ico')
async def favicon(request):
  return web.FileResponse('static/favicon.ico')

ROUTES.static('/include', './static/include')

PATHS = {
  'python': shutil.which('python3'),
  'validator-info': shutil.which('validator-info'),
  'read_ledger': shutil.which('read_ledger'),
}

indy_txn_types = {
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

indy_role_types = {
  "0": "TRUSTEE",
  "2": "STEWARD",
  "100": "TGB",
  "101": "TRUST_ANCHOR",
}


def json_response(data):
  # FIXME - use aiohttp-cors
  headers = {'Access-Control-Allow-Origin': '*'}
  return web.json_response(data, headers=headers)


def validator_info(node_name, as_json=True):
  args = [PATHS['validator-info']]
  if as_json:
    args.append("--json")
  else:
    args.append("-v")
  args.extend(["--basedir", "/home/indy/.mnt/" + node_name + "/sandbox/"])
  proc = subprocess.run(args, stdout=subprocess.PIPE, universal_newlines=True)
  if as_json:
    # The result is polluted with logs in the latest version.
    # We pull out json
    m = re.search(r'(?s)\n({.*})', proc.stdout)
    corrected_stdout = m.group(1) if m else proc.stdout
    return json.loads(corrected_stdout)
  return proc


def read_ledger(ledger, seq_no=0, seq_to=1000, node_name='node1', format="data"):
  if ledger != "domain" and ledger != "pool" and ledger != "config":
    raise ValueError("Unsupported ledger type: {}".format(ledger))
  args = [PATHS['read_ledger'], "--type", ledger]
  if seq_no > 0:
    args.extend(["--seq_no", str(seq_no)])
  args.extend(["--to", str(seq_to)])
  #args.extend(["--base_dir", "/home/indy/.mnt/" + node_name])
  args.extend(["--node_name", node_name])
  proc = subprocess.run(args, stdout=subprocess.PIPE, universal_newlines=True)

  if format == "pretty" or format == "data":
    lines = proc.stdout.splitlines()
    resp = []
    for line in lines:
      _seq_no, txn = line.split(' ', 2)
      parsed = json.loads(txn)
      if format == "pretty":
        parsed = json.dumps(parsed, indent=4, sort_keys=True)
      resp.append(parsed)
    if format == "pretty":
      return "\n\n".join(resp)
    return resp

  # format = json
  return proc.stdout


async def boot(_app):
  global pool
  global trust_anchor

  print('Creating trust anchor...')

  pool = NodePool(
    'nodepool',
    '/home/indy/.indy-cli/networks/sandbox/pool_transactions_genesis')
  wallet = Wallet(
    '000000000000000000000000Trustee1',
    'trustee_wallet'
  )
  await pool.open()
  await wallet.create()

  trust_anchor = AnchorSmith(wallet, pool)
  await trust_anchor.open()


@ROUTES.get("/status")
async def status(request):
  nodes = ["node1", "node2", "node3", "node4"]

  response = []
  for idx,node_name in enumerate(nodes):
    parsed = validator_info(node_name)
    if parsed:
      response.append(parsed)

  return json_response(response)


@ROUTES.get("/status/text")
async def status(request):
  nodes = ["node1", "node2", "node3", "node4"]

  response_text = ""
  for idx,node_name in enumerate(nodes):
    proc = validator_info(node_name, as_json=False)
    if idx > 0:
      response_text += "\n"
    response_text += node_name + "\n\n" + proc.stdout

  return web.Response(text=response_text)


@ROUTES.get("/ledger/{ledger_name}")
async def ledger(request):
  response = read_ledger(request.match_info['ledger_name'], format="json")
  return web.Response(text=response)


@ROUTES.get("/ledger/{ledger_name}/pretty")
async def ledger_pretty(request):
  response = read_ledger(request.match_info['ledger_name'], format="pretty")
  return web.Response(text=response)


@ROUTES.get("/ledger/{ledger_name}/text")
async def ledger_text(request):
  response = read_ledger(request.match_info['ledger_name'])
  text = []
  for seq_no, txn in response:
    if len(text):
      text.append("")

    type_name = indy_txn_types.get(txn['type'], txn['type'])
    text.append("[" + str(seq_no) + "]  TYPE: " + type_name)

    if type_name == "NYM":
      text.append("DEST: " + txn['dest'])

      role = txn.get('role')
      if role != None:
        role_name = indy_role_types.get(role, role)
        text.append("ROLE: " + role_name)

      verkey = txn.get('verkey')
      if verkey != None:
        text.append("VERKEY: " + verkey)

    ident = txn.get('identifier')
    if ident != None:
      text.append("IDENT: " + ident)

    txnTime = txn.get('txnTime')
    if txnTime != None:
      ftime = datetime.fromtimestamp(txnTime).strftime('%Y-%m-%d %H:%M:%S')
      text.append("TIME: " + ftime)

    reqId = txn.get('reqId')
    if reqId != None:
      text.append("REQ ID: " + str(reqId))

    refNo = txn.get('ref')
    if refNo != None:
      text.append("REF: " + str(refNo))

    txnId = txn.get('txnId')
    if txnId != None:
      text.append("TXN ID: " + txnId)

    if type_name == "SCHEMA" or type_name == "CLAIM_DEF" or type_name == "NODE":
      data = txn.get('data')
      text.append("DATA:")
      text.append(json.dumps(data, indent=4))

    sig = txn.get('signature')
    if sig != None:
      text.append("SIGNATURE: " + sig)

    sig_type = txn.get('signature_type')
    if sig_type != None:
      text.append("SIGNATURE TYPE: " + sig_type)

  return web.Response(text="\n".join(text))


@ROUTES.get("/ledger/{ledger_name}/{sequence_number:\d+}")
async def ledger_seq(request):
  seq_no = int(request.match_info['sequence_number'])
  response = read_ledger(
    request.match_info['ledger_name'],
    format="json",
    seq_no=seq_no,
    seq_to=seq_no
  )
  return web.Response(text=response)



# Expose genesis transaction for easy connection.
@ROUTES.get("/genesis")
async def genesis(request):
  with open(
    '/home/indy/.indy-cli/networks/sandbox/pool_transactions_genesis',
      'r') as content_file:
    genesis = content_file.read()
  return web.Response(text=genesis)


# Easily write dids for new identity owners
@ROUTES.post('/register')
async def register(request):
  global pool

  body = await request.json()
  if not body:
    return web.Response(
      text='Expected json request body',
      status=400
    )

  seed = body.get('seed')
  did = body.get('did')
  verkey = body.get('verkey')
  alias = body.get('alias')
  role = body.get('role', 'TRUST_ANCHOR')

  if seed:
    if not 0 <= len(seed) <= 32:
      return web.Response(
        text='Seed must be between 0 and 32 characters long.',
        status=400
      )
    # Pad with zeroes
    seed += '0' * (32 - len(seed))
  else:
    if not did or not verkey:
      return web.Response(
        text='Either seed the seed parameter or the did and verkey parameters must be provided.',
        status=400
      )

  if seed:
    wallet = Wallet(
      seed,
      seed + '-wallet'
    )
    async with _BaseAnchor(await wallet.create(), pool) as new_agent:
      did = new_agent.did
      verkey = new_agent.verkey

  print('\n\nRegister agent\n\n')
  await register_did(did, verkey, alias, role)

  return json_response({
    'seed': seed,
    'did': did,
    'verkey': verkey
  })


# Helper to register a DID and verkey on the ledger
async def register_did(did, verkey, alias=None, role=None):
  global trust_anchor
  print('\n\nGet Nym: ' + str(did) + '\n\n')
  if not json.loads(await trust_anchor.get_nym(did)):
    print('\n\nSend Nym: ' + str(did) + '/' + str(verkey) + '\n\n')
    await trust_anchor.send_nym(did, verkey, alias, role)


if __name__ == '__main__':
  APP.add_routes(ROUTES)
  APP.on_startup.append(boot)
  print('Running webserver...')
  web.run_app(APP, host='0.0.0.0', port=8000)
