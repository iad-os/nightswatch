require('dotenv').config({});
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

const {
  target,
  router,
  pathRewrite,
} = require(`${__dirname}/../routing_rules`);

const app = express();

async function prepareServer(app) {
  app.set('trust proxy', config.server.proxy);
  app.use(helmet());
  app.use(cors({}));
  app.use(pinoExpress(pino));
  app.use(cookieSession(config.cookie));
  app.use(passport.initialize());

  app.use(config.relying_party.oidc_base_path, oidcRouter);

  const authenticate = await authenticateBuilder({
    oidc: config.oidc,
    cookie: config.cookie,
  });

  app.all(
    '/**',
    authenticate,
    revProxy({
      target: target,
      router,
      pathRewrite,
    })
  );
}

prepareServer(app).then(() => {
  const port = config.server.port;
  const server = http.createServer(
    { maxHeaderSize: config.server.max_header_size || 8192 },
    app
  );
  healthchecks(server);
  server.listen(port, function() {
    pino.info({
      server: { port },
      //headers_injected: require(`${__dirname}/../header_inject`),
      routing: require(`${__dirname}/../routing_rules`),
    });
  });
});
