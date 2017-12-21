exports.prepare = (dbResults, pageInfo) => ({
  results: dbResults.items,
  pagination: {
    total: dbResults.total,
    page: pageInfo.page,
    pageSize: pageInfo.pageSize
  }
})
