import express, { Express } from 'express';
import http from 'http';
import cors from 'cors';
import pinoExpress from 'express-pino-logger';
import cookieSession from 'cookie-session';
import helmet from 'helmet';
import revProxy from './middlewares/rev-roxy';
import authenticateBuilder from './middlewares/authenticate';
import passport from 'passport';
import options from './config/options';
import oidcRouter from './routers/oidc';
import healthchecks from './healthcheck';
import logger, { options as pinoOpts } from './utils/logger';

import debugLib from 'debug';
const debug = debugLib('nightswatch:run');

const app = express();
prepareServer(app).then(() => {
  if (options.snapshot().server.http.enable) {
    const port = options.snapshot().server.http.port;
    const server = http.createServer(
      { maxHeaderSize: options.snapshot().server.max_header_size || 8192 },
      app
    );
    healthchecks(server);
    server.listen(port, function() {
      logger.info({
        server: { port },
        routing: options.snapshot().targets,
      });
    });
  } else {
    debug('No server config found or enabled');
  }
});

async function prepareServer(app: Express) {
  app.set('trust proxy', options.snapshot().server.proxy);
  app.use(helmet());
  app.use(cors({ credentials: true }));
  app.use(pinoExpress(pinoOpts));
  app.use(cookieSession(options.snapshot().cookie));
  app.use(passport.initialize());

  // mount oidc routes on path (DEFAULT/oidc)
  app.use(options.snapshot().relying_party.oidc_base_path, oidcRouter);

  const authenticate = await authenticateBuilder();

  options
    .snapshot()
    .relying_party.rules.forEach(({ route, methods = ['all'] }) => {
      methods.forEach(method => {
        (<any>app)[method](route, authenticate);
      });
    });

  app.all(
    options.snapshot().targets.path,
    revProxy(options.snapshot().targets)
  );
}
