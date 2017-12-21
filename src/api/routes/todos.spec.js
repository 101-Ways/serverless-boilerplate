const chai = require('chai')
const expect = chai.expect
const todos = require('./todos')
const sinon = require('sinon')
const db = require('../db')

describe('Todos route', () => {
  let stub

  const data = {
    results: [],
    pagination: {}
  }

  describe('when calling get paged todos', () => {
    before(() => {
      stub = sinon.stub(db, 'getPaged').returns(Promise.resolve(data))
    })

    after(() => {
      stub.restore()
    })

    it('should call the database and get todos', () => {
      const qs = {
        page: 1,
        pageSize: 10
      }
      return todos.todosPaged(qs, {})
        .then(res => {
          expect(stub.calledOnce).to.equal(true)
          expect(stub.args[0][1].page).to.equal(qs.page)
          expect(stub.args[0][1].pageSize).to.equal(qs.pageSize)
        })
    })
  })
})
