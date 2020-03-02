require('dotenv').config({});
const debug = require('debug')('nightswatch:run');
const express = require('express');
const http = require('http');
const cors = require('cors');
const pino = require('pino')();
const pinoExpress = require('pino-express');
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const revProxy = require('./middlewares/rev-roxy');
const authenticateBuilder = require('./middlewares/authenticate');
const passport = require('passport');
const config = require('./conf');
const oidcRouter = require('./routers/oidc');
const healthchecks = require('./healthcheck');

const app = express();

async function prepareServer(app) {
  app.set('trust proxy', config.server.proxy);
  app.use(helmet());
  app.use(cors({}));
  app.use(pinoExpress(pino));
  app.use(cookieSession(config.cookie));
  app.use(passport.initialize());

  // mount oidc routes on path (DEFAULT/oidc)
  app.use(config.relying_party.oidc_base_path, oidcRouter);

  const authenticate = await authenticateBuilder({
    oidc: config.oidc,
    cookie: config.cookie,
  });

  config.relying_party.rules.forEach(({ route, methods = ['all'] }) => {
    methods.forEach(method => {
      app[method](route, authenticate);
    });
  });

  app.all(config.targets.path, revProxy(config.targets));
}

prepareServer(app).then(() => {
  if (config.server.http.enable) {
    const port = config.server.http.port;
    const server = http.createServer(
      { maxHeaderSize: config.server.max_header_size || 8192 },
      app
    );
    healthchecks(server);
    server.listen(port, function() {
      pino.info({
        server: { port },
        routing: config.targets,
      });
    });
  } else {
    debug('No server config found or enabled');
  }
});
