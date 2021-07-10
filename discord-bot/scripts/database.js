const path = require('path');
const { AsyncNedb } = require('nedb-async')

const Datastore = AsyncNedb;

db = {};
db.groups = new Datastore({ filename: path.join(__dirname, '/../data/groups.db'), autoload: true });

module.exports = db;