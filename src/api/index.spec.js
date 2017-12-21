const expect = require('chai').expect
const sinon = require('sinon')
const swaggerRouter = require('./swagger-router')
const carData = require('./')

describe('Routing', () => {
  let stub

  describe('when route found', () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        proxy: 'todos'
      }
    }

    const data = [
      { name: 'fakeMake1', url: 'foo/bar' },
      { name: 'fakeMake2', url: 'foo/bar/foo' }
    ]

    before(() => {
      stub = sinon.stub(swaggerRouter, 'route').returns(Promise.resolve(data))
    })

    after(() => {
      stub.restore()
    })

    it('should return a status code of 200', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(200)
        done()
      })
    })

    it('should return the required CORS headers', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        const expectedCORSheader = {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
        expect(res.headers).to.eql(expectedCORSheader)
        done()
      })
    })

    it('should return some data', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        const response = JSON.parse(res.body)
        expect(response).to.deep.equal(data)
        done()
      })
    })
  })

  describe('when route not found', () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        proxy: 'missing'
      }
    }

    it('should return a status code of 404', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(404)
        done()
      })
    })

    it('should return the required CORS headers', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        const expectedCORSheader = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        }
        expect(res.headers).to.eql(expectedCORSheader)
        done()
      })
    })
  })

  describe('when route throws error', () => {
    const event = {
      httpMethod: 'GET',
      pathParameters: {
        proxy: 'todos'
      }
    }

    before(() => {
      stub = sinon.stub(swaggerRouter, 'route').returns(Promise.resolve(new Error()))
    })

    after(() => {
      stub.restore()
    })

    it('should return a status code of 500', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        expect(res.statusCode).to.equal(500)
        done()
      })
    })

    it('should return the required CORS headers', done => {
      carData.router(event, {}, (err, res) => {
        expect(err).to.equal(null)
        const expectedCORSheader = {
          'Access-Control-Allow-Origin': '*'
        }
        expect(res.headers).to.eql(expectedCORSheader)
        done()
      })
    })
  })
})
