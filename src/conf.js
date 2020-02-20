const parse = require('parse-duration');
module.exports = {
  oidc: {
    issuerUri: process.env.OIDC_ISSUERURI,
    client_id: process.env.OIDC_CLIENTID,
    client_secret: process.env.OIDC_CLIENTSECRET,
  },
  cookie: {
    name: process.env.COOKIE_NAME,
    keys: [process.env.COOKIE_KEY],

    // Cookie Options
    maxAge: parse(process.env.COOKIE_MAXAGE || '24h'), // 24 hours
  },
};
