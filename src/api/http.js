exports.failure = () => {
  return {
    statusCode: 500,
    body: 'Internal server error',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}

exports.success = (data) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  }
}

exports.notFound = () => {
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Resource not found' }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  }
}

exports.unprocessable = (data) => {
  return {
    statusCode: 422,
    body: JSON.stringify({ message: data }),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  }
}
