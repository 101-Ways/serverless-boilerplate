'use strict'

const http = require('./http')
const routes = require('./routes')
const swaggerRouter = require('./swagger-router')

exports.router = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false

  return swaggerRouter.route(event, routes)
    .then(data => callback(null, http.success(data)))
    .catch(err => errorHandler(err, callback))
}

const errorHandler = (err, callback) => {
  switch (err.status) {
    case 404:
      return callback(null, http.notFound())
    case 422:
      return callback(null, http.unprocessable(err.message))
    default:
      return callback(null, http.failure())
  }
}
