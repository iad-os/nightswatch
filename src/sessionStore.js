const NodeCache = require('node-cache');
const shortId = require('shortid');
const userCache = new NodeCache({ stdTTL: 24 * 3600, checkperiod: 120 });

function save(id, session) {
  userCache.set(id, session);
  return id;
}
function push(session) {
  return save(shortId(), session);
}
function find(id) {
  return id ? userCache.get(id) : undefined;
}
module.exports = { save, push, find };
