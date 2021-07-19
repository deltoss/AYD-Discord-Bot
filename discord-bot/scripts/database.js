const path = require('path');
const { AsyncNedb } = require('nedb-async')

const Datastore = AsyncNedb;
let dbPath = process.env.DB_PATH ?? '/data/groups.db'

if (dbPath.startsWith('.'))
  dbPath = path.join(`${__dirname}/..`, dbPath) // Make it relative to the root project directory

db = {};
db.groups = new Datastore({ filename: dbPath, autoload: true });

module.exports = db;