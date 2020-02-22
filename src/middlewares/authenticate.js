const ProxyMiddleware = require('http-proxy-middleware');
const log = require('pino')({ level: 'debug' });
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');

const config = require('../conf');
const sessionStore = require('../sessionStore');

/**
 *
 *
 * @param {object} options
 * @param {object} options.oidc
 * @param {object} options.cookie
 * @returns
 */
async function authenticate(options) {
  const { oidc, cookie: cookieSettings } = options;
  const issuer = await Issuer.discover(oidc.issuerUri);
  const client = new issuer.FAPIClient({
    client_id: oidc.client_id,
    client_secret: oidc.client_secret,
  });

  passport.use(
    'openid',
    new Strategy(
      {
        client,
        passReqToCallback: true,
        usePKCE: false,
        params: {
          scope: config.oidc.scopes,
          redirect_uri: config.oidc.redirect_uri,
        },
      },
      function verifyCallback(req, tokenset, userinfo, done) {
        req.session.oidc = sessionStore.push(
          {
            tokenset,
            userinfo,
            profile: tokenset.claims(),
          },
          tokenset.ext_expires_in
        );
        done(null, { tokenset, userinfo });
      }
    )
  );
  const passportAuthorize = passport.authorize('openid', {
    successRedirect: '/headers',
  });

  return function(req, res, next) {
    const userSession = sessionStore.find(req.session.oidc);

    if (!userSession) {
      req.session.oidc = undefined;
      passportAuthorize(req, res, next);
      return;
    }

    req.oidc = userSession;
    next();
  };
}
module.exports = authenticate;
