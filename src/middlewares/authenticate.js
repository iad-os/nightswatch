const ProxyMiddleware = require('http-proxy-middleware');
const log = require('pino')();
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
  const userCache = {};

  passport.use(
    'openid',
    new Strategy(
      { client, passReqToCallback: true, usePKCE: false },
      function verifyCallback(req, tokenset, userinfo, done) {
        //log.debug('verify callback', { tokenset, userinfo });
        req.session.oidc = sessionStore.push({ tokenset, userinfo });
        done(null, { tokenset, userinfo });
      }
    )
  );
  const passportAuthorize = passport.authorize('openid', {
    successRedirect: '/headers',
    scope: 'email openid profile offline_access',
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
