const chai = require('chai')
const expect = chai.expect
const response = require('./response')

describe('Response', () => {
  it('should prepare results from DB with page info added', () => {
    const dbResult = {
      items: [1, 2, 3],
      total: 10
    }
    const pageInfo = {
      page: 1,
      pageSize: 3
    }
    const actual = response.prepare(dbResult, pageInfo)
    expect(actual).to.eql({ results: [1, 2, 3], pagination: { total: 10, page: 1, pageSize: 3 } })
  })
})
