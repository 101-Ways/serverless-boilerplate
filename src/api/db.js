const dbConn = process.env.DB
const dbClient = require('dbClient')
let cachedDb

function getDb () {
  if (!cachedDb) {
    return dbClient.connect(dbConn)
      .then(db => {
        cachedDb = db
        return db
      })
  } else {
    return Promise.resolve(cachedDb)
  }
}

exports.getPaged = (collection, pageInfo, sort, query) => {
  //Implement Db gets
  return []
}

exports.emptyCache = () => {
  cachedDb = null
}
