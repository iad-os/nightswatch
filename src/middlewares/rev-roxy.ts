import debugLib from 'debug';
import { Request } from 'express';
import {
  createProxyMiddleware,
  Options,
  RequestHandler,
} from 'http-proxy-middleware';
import { toString } from 'lodash';
import get from 'lodash.get';
import map from 'lodash.map';
import options, { Targets } from '../config/options';

const debug = debugLib('nightswatch:rev-proxy');

function revProxy({ upstream, routes, rewrite }: Targets): RequestHandler {
  const proxy_options: Options = {
    followRedirects: false,
    changeOrigin: true,
    target: upstream,
    pathRewrite: rewrite.reduce((acc, { match, rewrite }) => {
      acc[match] = rewrite;
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as any),
    // control logging
    logLevel: 'debug',

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router: routes.reduce((acc: any, route) => {
      acc[route.path] = route.upstream;
      return acc;
    }, {}),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onProxyReq: (proxyReq, req, res) => {
      options
        .snapshot()
        .headers.noProxy?.map(key => proxyReq.removeHeader(key));
      proxyReq.removeHeader;
      const rpHeaders = proxyHeaders(req);
      rpHeaders.forEach(([name, value]) => {
        proxyReq.setHeader(name, value);
      });
    },
  };

  function proxyHeaders(req: Request) {
    const { prefix, proxy } = options.snapshot().headers;
    const headers = map(proxy, function(value, name) {
      return [`${prefix}-${name}`, toString(get(req.uid, value, ''))];
    });
    return headers;
  }

  debug(proxy_options);

  return createProxyMiddleware(proxy_options);
}

export default revProxy;
