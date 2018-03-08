const AWS = require('aws-sdk')
const kinesis = new AWS.Kinesis({ region: 'eu-west-1' })

exports.writeToStream = (stream, payload) => {
  return new Promise((resolve, reject) => {
    if (!stream) resolve()

    const message = {
      Data: JSON.stringify(payload),
      PartitionKey: 'sensor-' + Math.floor(Math.random() * 100000),
      StreamName: stream
    }

    kinesis.putRecord(message, (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}
