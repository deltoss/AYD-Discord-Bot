const path = require('path');
const { AsyncNedb } = require('nedb-async')

const Datastore = AsyncNedb;
const dbPath = process.env.DB_PATH ?? '/../data/groups.db'

db = {};
db.groups = new Datastore({ filename: path.join(__dirname, dbPath), autoload: true });

module.exports = db;