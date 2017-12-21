const db = require('../db')
const response = require('../response')
const queryBuilder = require('../db-query-builder')

exports.validate = qs => ({
  page: qs.page ? parseInt(qs.page) : 1,
  pageSize: qs.pageSize ? parseInt(qs.pageSize) : 10,
  id: qs.id,
  name: qs.name,
  sort: qs.sort,
  sortBy: qs.sortBy
})

exports.todosPaged = (qs) => {
  const page = queryBuilder.pageInfo(qs)
  const sort = queryBuilder.sort(qs)
  const match = queryBuilder.match(qs)
  return db.getPaged('todos', page, sort, match)
    .then(_ => response.prepare(_, page))
}
