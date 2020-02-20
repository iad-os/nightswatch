require('dotenv').config({});
const express = require('express');
const cors = require('cors');
const pino = require('pino')();
const pinoExpress = require('pino-express');
const cookieSession = require('cookie-session');

const revProxy = require('./middlewares/rev-roxy');
const authenticateBuidler = require('./middlewares/authenticate');
const passport = require('passport');
const config = require('./conf');

const {
  target,
  router,
  pathRewrite,
} = require(`${__dirname}/../routing_rules`);

const app = express();

prepareServer(app).then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, function() {
    pino.info({
      server: { port },
      //headers_injected: require(`${__dirname}/../header_inject`),
      routing: require(`${__dirname}/../routing_rules`),
    });
  });
});

async function prepareServer(app) {
  app.use(pinoExpress(pino));

  app.use(cors({}));
  app.use(cookieSession(config.cookie));
  app.use(passport.initialize());

  const authenticate = await authenticateBuidler({
    oidc: config.oidc,
    cookie: config.cookie,
  });

  // Accept the OpenID identifier and redirect the user to their OpenID
  // provider for authentication.  When complete, the provider will redirect
  // the user back to the application at:
  //     /auth/openid/return
  app.post(
    '/oidc/login',
    passport.authenticate('openid', {
      session: false,
      successRedirect: '/headers',
      failureRedirect: '/login',
    })
  );

  // The OpenID provider has redirected the user back to the application.
  // Finish the authentication process by verifying the assertion.  If valid,
  // the user will be logged in.  Otherwise, authentication has failed.
  app.get(
    '/oidc/callback',
    passport.authenticate('openid', {
      successRedirect: '/headers',
      failureRedirect: '/login',
      session: false,
    })
  );

  app.use(authenticate);

  app.use(
    revProxy({
      target: target,
      headers: require(`${__dirname}/../header_inject`),
      router,
      pathRewrite,
    })
  );
}
