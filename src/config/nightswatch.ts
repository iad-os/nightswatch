import { Nightswatch } from './../utils/nightswatch';
import express, { Express } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import opts from './options';
import aemonOidcIntrospect from '@iad-os/aemon-oidc-introspect';
import logger, { options } from '../utils/logger';
import axios from 'axios';
import pinoExpress from 'express-pino-logger';
import revProxy from '../middlewares/rev-roxy';
import jorah from './jorah';

const expressApp = express()
  .set('trust proxy', opts.snapshot().server.proxy)
  .use(helmet())
  .use(cors({ credentials: true }))
  // check docs https://github.com/expressjs/cors#configuration-options
  .use(compression())
  .use(pinoExpress(options));

instrumentByMode(expressApp);

expressApp.use((req, res, next) => {
  const { active, subject, expires } = req.uid;
  req.log.info({ active, subject, expires }, '✅ Authenticated user');
  next();
});

expressApp.all(opts.snapshot().targets.path, revProxy(opts.snapshot().targets));

export default new Nightswatch({
  requestListener: expressApp,
  delayShutdown: 10,
  port: 3000,
  serverOptions: {},
});

function instrumentByMode(expressApp: Express) {
  logger.info('Selected mode', opts.snapshot().mode);
  switch (opts.snapshot().mode) {
    case 'access-proxy':
      expressApp
        .use(
          aemonOidcIntrospect({
            issuers: opts.snapshot().oidc.issuers,
            extractToken: req => {
              // Bearer token example (Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c)
              const authorization = req.headers['authorization'];
              if (!authorization) return;
              const [, token] = authorization.split(' ');
              return token;
            },
            doPost: async (_req, url, queryString, options) => {
              return await axios.create().post(url, queryString, options);
            },
            logger: (req, level, msg, payload) => logger[level](msg, payload),
          })
        )
        .use(jorah({}));
      break;

    default:
      break;
  }
}
