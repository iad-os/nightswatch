const NodeCache = require('node-cache');
const shortId = require('shortid');
const config = require('./conf');
const userCache = new NodeCache({
  stdTTL: config.storage.specs.stdTTL,
  checkperiod: 120,
  deleteOnExpire: true,
});

function save(id, session, ttl = config.storage.specs.stdTTL) {
  userCache.set(id, session, ttl);
  return id;
}
function push(session, ttl) {
  return save(shortId(), session, ttl);
}
function find(id) {
  return id ? userCache.get(id) : undefined;
}
module.exports = { save, push, find };
