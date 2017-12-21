'use strict'

const parse = event => {
  return new Promise((resolve, reject) => {
    const data = event.Records.map(record => {
      return JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())
    })
    resolve(data)
  })
}

const processEvent = eventsData => {
  console.log('processEvent', eventsData)
  return []
}

exports.handler = (event, context, callback) => {
  console.log('event', event)
  context.callbackWaitsForEmptyEventLoop = false

  return parse(event)
    .then(eventsData => processEvent(eventsData))
    .then(_ => {
      console.log('response after processEvent', JSON.stringify(_))
      callback()
    })
    .catch((err) => {
      console.log('err', err)
      return callback()
    })
}
