const R = require('ramda')

exports.pageInfo = qs => ({
  page: qs.page,
  pageSize: qs.pageSize
})

exports.sort = qs => {
  const sortKey = qs.sortBy || 'name'
  const sortType = qs.sort === 'desc' ? -1 : 1
  let sorter = {}
  sorter[sortKey] = sortType
  return sorter
}

exports.match = qs => {
  let matcher = qs
  return R.pickBy(_ => _ !== undefined, R.omit(['display', 'pageSize', 'page', 'sort', 'sortBy'], matcher))
}
