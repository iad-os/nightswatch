const { createProxyMiddleware } = require('http-proxy-middleware');
const get = require('lodash.get');
const log = require('pino')({ level: 'debug' });
const map = require('lodash.map');
const debug = require('debug')('nightswatch:rev-proxy');
const { relying_party } = require('../conf');

/**
 *
 * @typedef {Object} Route
 * @property {String} path
 * @property {String} upstream
 *
 */

/**
 *
 * @typedef {Object} RewriteRule
 * @property {String} match
 * @property {String} rewrite
 *
 */

/**
 *
 * @param {Object} options
 * @param {String} options.path
 * @param {String} options.upstream
 * @param {Route[]} [options.routes]
 * @param {RewriteRule[]} [options.rewrite]
 */
function revProxy({ upstream, routes = [], rewrite = [] }) {
  const proxy_options = {
    target: upstream,
    pathRewrite: rewrite.reduce((acc, { match, rewrite }) => {
      acc[match] = rewrite;
      return acc;
    }, {}),
    // control logging
    logLevel: relying_party.logLevel || 'error',
    router: routes.reduce((acc, route) => {
      acc[route.path] = route.upstream;
      return acc;
    }, {}),
    onProxyReq(proxyReq, req, res) {
      const rpHeaders = proxyHeaders(proxyReq, req.oidc);
      rpHeaders.forEach(([name, value]) => {
        proxyReq.setHeader(name, value);
      });

      const { method, path, _headers: headers } = proxyReq;
      if (process.env.TRACE_REQ) {
        req.log = {
          method,
          path,
          headers,
          //body: req.body,
        };
      }
    },
  };

  function proxyHeaders(req, oidc) {
    const { prefix, proxy } = relying_party.headers;
    return map(proxy, function(value, name) {
      return [`${prefix}-${name}`, get(oidc, value, '')];
    });
  }
  debug(proxy_options);
  return createProxyMiddleware(proxy_options);
}
module.exports = revProxy;
