from datetime import datetime
import json
import logging
import os
import shutil
import yaml

from aiohttp import web

from .anchor import (
  AnchorHandle,
  NotReadyException,
  INDY_ROLE_TYPES,
  INDY_TXN_TYPES,
)

logging.basicConfig(level=os.getenv('LOG_LEVEL', logging.INFO))
LOGGER = logging.getLogger(__name__)


PATHS = {
  'python': shutil.which('python3'),
}

os.chdir(os.path.dirname(__file__))

APP = web.Application()
ROUTES = web.RouteTableDef()
TRUST_ANCHOR = AnchorHandle()


@ROUTES.get('/')
async def index(request):
  return web.FileResponse('static/index.html')

@ROUTES.get('/favicon.ico')
async def favicon(request):
  return web.FileResponse('static/favicon.ico')

ROUTES.static('/include', './static/include')


def json_response(data, status=200, **kwargs):
  # FIXME - use aiohttp-cors
  kwargs['headers'] = {'Access-Control-Allow-Origin': '*'}
  kwargs['text'] = json.dumps(data, indent=2, sort_keys=True)
  if 'content_type' not in kwargs:
    kwargs['content_type'] = 'application/json'
  return web.Response(status=status, **kwargs)


def not_ready():
  return web.json_response(data={"detail": "Not ready"}, status=503)


@ROUTES.get("/status")
async def status(request):
  try:
    response = await TRUST_ANCHOR.validator_info()
  except NotReadyException:
    return not_ready()
  return json_response(response)


@ROUTES.get("/status/text")
async def status_text(request):
  try:
    response = await TRUST_ANCHOR.validator_info()
  except NotReadyException:
    return not_ready()

  text = []
  for node in response:
    id = node["Node_info"]["Name"]
    text.append(id)
    text.append("")
    text.append(yaml.dump(node))
    text.append("")

  return web.Response(text="\n".join(text))


@ROUTES.get("/ledger/{ledger_name}")
async def ledger_json(request):
  #response = read_ledger(request.match_info['ledger_name'], format="json")
  #return web.Response(text=response)

  if not TRUST_ANCHOR.ready:
    return not_ready()

  page = int(request.query.get('page', 1))
  page_size = int(request.query.get('page_size', 100))
  start = (page - 1) * page_size + 1
  end = start + page_size - 1

  rows = await TRUST_ANCHOR.get_txn_range(request.match_info["ledger_name"], start, end)
  last_modified = None
  results = []
  for row in rows:
    last_modified = max(last_modified, row[1]) if last_modified else row[1]
    results.append(json.loads(row[2]))
  latest = await TRUST_ANCHOR.get_latest_seqno(request.match_info["ledger_name"])
  if not results:
    data = {
      "detail": "Invalid page."
    }
    response = json_response(data, status=404)
  else:
    data = {
      "total": latest,
      "page_size": page_size,
      "page": page,
      "first_index": start,
      "last_index": start + len(results) - 1,
      "results": results,
    }
    response = json_response(data)
    response.charset = "utf-8"
    response.last_modified = last_modified
  return response


@ROUTES.get("/ledger/{ledger_name}/text")
async def ledger_text(request):
  if not TRUST_ANCHOR.ready:
    return not_ready()

  response = web.StreamResponse()
  response.content_type = "text/plain"
  response.charset = "utf-8"
  await response.prepare(request)

  rows = await TRUST_ANCHOR.get_txn_range(request.match_info["ledger_name"])

  first = True
  for seq_no, added, row in rows:
    text = []
    if not first:
      text.append("")
    first = False
    row = json.loads(row)
    txn = row["txn"]
    data = txn["data"]
    metadata = txn["metadata"]

    type_name = INDY_TXN_TYPES.get(txn['type'], txn['type'])
    text.append("[" + str(seq_no) + "]  TYPE: " + type_name)

    ident = metadata.get('from')
    if ident != None:
      text.append("FROM: " + ident)

    if type_name == "NYM":
      text.append("DEST: " + data['dest'])

      role = data.get('role')
      if role != None:
        role_name = INDY_ROLE_TYPES.get(role, role)
        text.append("ROLE: " + role_name)

      verkey = data.get('verkey')
      if verkey != None:
        text.append("VERKEY: " + verkey)

    txnTime = txn.get('txnTime')
    if txnTime != None:
      ftime = datetime.fromtimestamp(txnTime).strftime('%Y-%m-%d %H:%M:%S')
      text.append("TIME: " + ftime)

    reqId = metadata.get('reqId')
    if reqId != None:
      text.append("REQ ID: " + str(reqId))

    refNo = data.get('ref')
    if refNo != None:
      text.append("REF: " + str(refNo))

    txnId = row['txnMetadata'].get('txnId')
    if txnId != None:
      text.append("TXN ID: " + txnId)

    if type_name == "SCHEMA" or type_name == "CLAIM_DEF" or type_name == "NODE":
      data = data.get('data')
      text.append("DATA:")
      text.append(json.dumps(data, indent=4))

    sig = data.get('signature')
    if sig != None:
      text.append("SIGNATURE: " + sig)

    sig_type = data.get('signature_type')
    if sig_type != None:
      text.append("SIGNATURE TYPE: " + sig_type)

    text.append("")
    await response.write("\n".join(text).encode("utf-8"))

  await response.write_eof()
  return response


@ROUTES.get("/ledger/{ledger_name}/{sequence_number:\d+}")
async def ledger_seq(request):
  seq_no = int(request.match_info['sequence_number'])
  ledger = request.match_info['ledger_name']
  try:
    data = await TRUST_ANCHOR.get_txn(ledger, seq_no)
    if not data:
      return web.Response(status=404)
  except NotReadyException:
    return not_ready()
  return json_response(json.loads(data[2]))


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
  if not TRUST_ANCHOR.ready:
    return not_ready()

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

  if not did or not verkey:
    did, verkey = await TRUST_ANCHOR.seed_to_did(seed)

  try:
    await TRUST_ANCHOR.register_did(did, verkey, alias, role)
  except NotReadyException:
    return not_ready()

  return json_response({
    'seed': seed,
    'did': did,
    'verkey': verkey
  })


async def boot(app):
  LOGGER.info('Creating trust anchor...')
  init = app['anchor_init'] = app.loop.create_task(TRUST_ANCHOR.open())
  init.add_done_callback(lambda _task: LOGGER.info('--- Trust anchor initialized ---'))


if __name__ == '__main__':
  APP.add_routes(ROUTES)
  APP.on_startup.append(boot)
  LOGGER.info('Running webserver...')
  web.run_app(APP, host='0.0.0.0', port=8000)
