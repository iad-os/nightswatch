const express = require('express');
const passport = require('passport');
const { relying_party } = require('../conf');

const oidcRouter = express.Router();

const passportMiddleware = passport.authenticate('openid', {
  session: false,
  successRedirect: relying_party.on_success_redirect,
  failureRedirect: relying_party.on_fail_redirect,
});
// Accept the OpenID identifier and redirect the user to their OpenID
// provider for authentication.  When complete, the provider will redirect
// the user back to the application at:
//     /auth/openid/return
oidcRouter.post(`${relying_party.oidc_paths.login}`, passportMiddleware);

// The OpenID provider has redirected the user back to the application.
// Finish the authentication process by verifying the assertion.  If valid,
// the user will be logged in.  Otherwise, authentication has failed.
oidcRouter.get(`${relying_party.oidc_paths.callback}`, passportMiddleware);

module.exports = oidcRouter;
