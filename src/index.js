
const express = require('express');
const cors = require('cors');
const pino = require('pino')();
const pinoExpress = require('pino-express');
const cookieSession = require('cookie-session');
const helmet = require('helmet');
const revProxy = require('./middlewares/rev-roxy');
const authenticateBuidler = require('./middlewares/authenticate');
const passport = require('passport');
const config = require('./conf');
const oidcRouter = require('./routers/oidc');

const {
  target,
  router,
  pathRewrite,
} = require(`${__dirname}/../routing_rules`);

const app = express();

prepareServer(app).then(() => {
  const port = config.server.port;
  app.listen(port, function() {
    pino.info({
      server: { port },
      //headers_injected: require(`${__dirname}/../header_inject`),
      routing: require(`${__dirname}/../routing_rules`),
    });
  });
});

async function prepareServer(app) {
  app.set('trust proxy', config.server.proxy);
  app.use(helmet());
  app.use(cors({}));
  app.use(pinoExpress(pino));
  app.use(cookieSession(config.cookie));
  app.use(passport.initialize());

  app.use(`${config.relying_party.oidc_base_path}`, oidcRouter);

  const authenticate = await authenticateBuidler({
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
