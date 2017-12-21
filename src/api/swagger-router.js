const swaggerDoc = require('./swagger.json')
const swagger = require('./swagger-validate')

function NotFound () {
  this.status = 404
}
NotFound.prototype = Error.prototype

function BadRequest (message) {
  this.status = 422
  this.message = message
}
BadRequest.prototype = Error.prototype

exports.route = (event, routes) => {
  const pathsWithVerbs = swaggerDoc.paths
  const paths = Object.keys(pathsWithVerbs)
  const matchingPath = paths.find(_ => '/' + event.pathParameters.proxy === _)
  const swaggerDefForEvent = matchingPath ? pathsWithVerbs[matchingPath][event.httpMethod.toLowerCase()] : undefined

  if (swaggerDefForEvent) {
    const controller = swaggerDefForEvent['x-swagger-router-controller']
    const handler = swaggerDefForEvent['operationId']
    const qs = event.queryStringParameters || {}
    const body = event.body ? JSON.validate(event.body) : {}
    const request = routes[controller].validate(qs)
    const validation = swagger.validate(swaggerDefForEvent.parameters, { query: request, body: body })

    return (validation.isValid) ? routes[controller][handler](request, body)
      : Promise.reject(new BadRequest(validation.errors))
  } else {
    return Promise.reject(new NotFound())
  }
}
