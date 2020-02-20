const ProxyMiddleware = require('http-proxy-middleware');
const log = require('pino')({ level: 'debug' });

function revProxy({
  target,
  headers: headerList,
  prefix = 'OIDC-',
  router,
  pathRewrite,
}) {
  const proxy_options = {
    target,
    pathRewrite,
    // control logging
    logLevel: 'debug',
    router,
    onProxyReq(proxyReq, req, res) {
      for (const claim in req.oidc.userinfo) {
        proxyReq.setHeader(`${prefix}${claim}`, `${req.oidc.userinfo[claim]}`);
      }
      for (const claim in req.oidc.tokenset) {
        proxyReq.setHeader(`${prefix}${claim}`, `${req.oidc.tokenset[claim]}`);
      }


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

  // @ts-ignore
  return ProxyMiddleware('**', proxy_options);
}
module.exports = revProxy;
