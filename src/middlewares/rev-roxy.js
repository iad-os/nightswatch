const ProxyMiddleware = require('http-proxy-middleware');
const get = require('lodash.get');
const log = require('pino')({ level: 'debug' });
const map = require('lodash.map');
const { relying_party } = require('../conf');
function revProxy({ target, router, pathRewrite }) {
  const proxy_options = {
    target,
    pathRewrite,
    // control logging
    logLevel: 'info',
    router,
    onProxyReq(proxyReq, req, res) {
      const rpHeaders = proxyHeaders(proxyReq, req.oidc);
      log.debug('proxy headers', rpHeaders);
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
      return [`${prefix}-${name}`, get(oidc, value,'')];
    });
  }

  // @ts-ignore
  return ProxyMiddleware('**', proxy_options);
}
module.exports = revProxy;
