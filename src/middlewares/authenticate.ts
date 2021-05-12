import { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  IdTokenClaims,
  Issuer,
  Strategy,
  TokenSet,
  UserinfoResponse,
} from 'openid-client';
import passport from 'passport';
import options from '../config/options';
import sessionStore from '../utils/sessionStore';

export type SessionRequest = {
  oidc: string | undefined;
};

export type OidcRequest = {
  tokenset: TokenSet;
  userinfo: UserinfoResponse;
  idtoken: IdTokenClaims;
};

declare module 'http' {
  interface IncomingMessage {
    session: SessionRequest;
    oidc: OidcRequest | undefined;
  }
}

async function authenticate(): Promise<RequestHandler> {
  const issuer = await Issuer.discover(options.snapshot().oidc.issuerUri);
  const client = new issuer.FAPIClient({
    client_id: options.snapshot().oidc.client_id,
    client_secret: options.snapshot().oidc.client_secret,
  });

  passport.use(
    'openid',
    new Strategy(
      {
        client,
        passReqToCallback: true,
        usePKCE: false,
        params: {
          scope: options.snapshot().oidc.scopes,
          redirect_uri: options.snapshot().oidc.redirect_uri,
        },
      },
      function verifyCallback(req, tokenset, userinfo, done) {
        req.session.oidc = sessionStore.push<OidcRequest>(
          {
            tokenset,
            userinfo,
            idtoken: tokenset.claims(),
          },
          tokenset.expires_in || 0
        );
        done(null, { tokenset, userinfo });
      }
    )
  );
  const passportAuthorize = passport.authorize('openid', {
    successRedirect: '/',
  });

  return function(req: Request, res: Response, next: NextFunction) {
    const userSession = req.session.oidc
      ? sessionStore.find<OidcRequest>(req.session.oidc)
      : undefined;

    if (!userSession) {
      req.session.oidc = undefined;
      passportAuthorize(req, res, (...args: any[]) => {
        req.oidc = req.session.oidc
          ? sessionStore.find<OidcRequest>(req.session.oidc)
          : undefined;
        next(...args);
      });
      return;
    }
    req.oidc = userSession;
    next();
  };
}

export default authenticate;
