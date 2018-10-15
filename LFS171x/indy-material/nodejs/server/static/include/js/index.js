function fetch_validator_status (callb) {
  var oReq = new XMLHttpRequest()
  oReq.addEventListener('load', function (evt) {
    callb(oReq.response, evt)
  })
  oReq.addEventListener('error', function (evt) {
    callb(null, evt)
  })
  oReq.responseType = 'json'
  oReq.open('GET', './status')
  oReq.send()
}

fetch_validator_status(function (status) {
  var panel = document.querySelector('.panel-node-status')
  var load = panel && panel.querySelector('.loading')
  var err = panel && panel.querySelector('.error')
  if (load) load.style.display = 'none'

  if (!Array.isArray(status)) {
    if (err) err.style.display = null
    return
  }

  if (!panel) return
  var tpl = panel.querySelector('.node-status.template')
  if (!tpl) return

  for (var idx = 0; idx < status.length; idx++) {
    var node = status[idx],
        info = node.Node_info;
    var div = tpl.cloneNode(true)
    tpl.parentNode.appendChild(div)
    div.querySelector('.nodeval-name').innerText = info.Name
    div.querySelector('.nodeval-did').innerText = info.did
    var state = node.state
    if (!state) state = 'unknown'
    if (!node.enabled) state += ' (disabled)'
    div.querySelector('.nodeval-state').innerText = state
    div.querySelector('.nodeval-indyver').innerText = node.software['indy-node']

    var upt = info.Metrics.uptime,
      upt_s = upt % 60,
      upt_m = Math.floor(upt % 3600 / 60),
      upt_h = Math.floor(upt % 86400 / 3600),
      upt_d = Math.floor(upt / 86400),
      upt_parts = []
    if (upt_d) { upt_parts.push('' + upt_d + ' days') }
    if (upt_h || upt_parts.length) { upt_parts.push('' + upt_h + ' hours') }
    if (upt_m || upt_parts.length) { upt_parts.push('' + upt_m + ' minutes') }
    upt_parts.push('' + upt_s + ' seconds')
    div.querySelector('.nodeval-uptime').innerText = upt_parts.join(', ')

    var unreach = div.querySelector('.node-unreach')
    if (node.Pool_info.Unreachable_nodes_count) {
      div.querySelector('.nodeval-unreach').innerText = node.Pool_info.Unreachable_nodes.join(', ')
    } else {
      unreach.style.display = 'none'
    }

    var txns = [],
      tx_avgs = info.Metrics['average-per-second'],
      tx_counts = info.Metrics['transaction-count']
    txns.push('' + tx_counts.config + ' config')
    txns.push('' + tx_counts.ledger + ' ledger')
    txns.push('' + tx_counts.pool + ' pool')
    txns.push('' + tx_avgs['read-transactions'] + '/s read')
    txns.push('' + tx_avgs['write-transactions'] + '/s write')
    div.querySelector('.nodeval-txns').innerText = txns.join(', ')

    div.classList.remove('template')
  }
})

$(function () {
  // override forms to submit json
  $('form').submit(function (event) {
    const form = this
    event.preventDefault()

    // serialize data as json
    const data = {}
    $(form).serializeArray().forEach(input => {
      if (input.value) data[input.name] = input.value
    })

    $(form).find('button[type=submit]').toggleClass('loading')

    $.ajax({
      method: 'POST',
      url: $(form).attr('action'),
      data: JSON.stringify(data),
      contentType: 'application/json'
    }).done(function (response) {
      $(form).find('button[type=submit]').toggleClass('loading')
      $('#seed').text(response.seed)
      $('#did').text(response.did)
      $('#verkey').text(response.verkey)
      $('.register-result').show().css('display', 'block')
    })
  })
})
