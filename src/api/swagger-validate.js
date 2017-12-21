const R = require('ramda')
const Ajv = require('ajv')
const ajv = Ajv({ allErrors: true, removeAdditional: 'all' })
const types = ['header', 'path', 'query', 'body']

exports.validate = (parameters, obj) => {
  const schema = Schema(parameters, obj)
  const validate = ajv.compile(schema)
  const isValid = validate(obj)

  return {
    isValid: isValid,
    errors: validate.errors || []
  }
}

function Schema (parameters, data) {
  const schema = {
    title: 'HTTP parameters',
    type: 'object',
    additionalProperties: false,
    properties: types.reduce(buildProperties, {})
  }

  if (!parameters || !parameters.length) {
    return schema
  }

  return parameters
    .reduce(buildParameters, schema)
}

function buildProperties (acc, key) {
  const schema = {
    title: `HTTP ${key}`,
    type: 'object',
    additionalProperties: false,
    properties: {}
  }

  acc[key] = schema
  return acc
}

function buildParameters (acc, param) {
  const item = acc.properties[param.in]

  if (param.required) {
    item.required = item.required || []
    item.required.push(param.name)
  }

  item.properties[param.name] = R.omit(['name', 'in', 'required'], param)
  return acc
}
