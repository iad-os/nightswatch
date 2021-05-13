import { Request, Response } from 'express';
import { ClientRequest } from 'http';
import {
  createProxyMiddleware,
  Options,
  RequestHandler,
} from 'http-proxy-middleware';
import get from 'lodash.get';
import map from 'lodash.map';
import options, { Targets } from '../config/options';

import debugLib from 'debug';
const debug = debugLib('nightswatch:rev-proxy');

function revProxy({ upstream, routes, rewrite }: Targets): RequestHandler {
  const proxy_options: Options = {
    followRedirects: false,
    target: upstream,
    changeOrigin: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pathRewrite: rewrite.reduce((acc: any, { match, rewrite }) => {
      acc[match] = rewrite;
      return acc;
    }, {}),
    // control logging
    logLevel: 'debug',

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //router: routes.reduce((acc: any, route) => {
    //  acc[route.path] = route.upstream;
    //  return acc;
    //}, {}),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onProxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
      const rpHeaders = proxyHeaders(req);
      rpHeaders.forEach(([name, value]) => {
        proxyReq.setHeader(name, value);
      });

      /* const { method, path, headers } = proxyReq;
      if (process.env.TRACE_REQ) {
        req.log = {
          method,
          path,
          headers,
          //body: req.body,
        };
      }*/
    },
  };

  function proxyHeaders(req: Request) {
    const { prefix, proxy } = options.snapshot().relying_party.headers;
    return map(proxy, function(value, name) {
      return [`${prefix}-${name}`, get(req.oidc, value, '')];
    });
  }

  debug(proxy_options);

  return createProxyMiddleware(proxy_options);
}

export default revProxy;
