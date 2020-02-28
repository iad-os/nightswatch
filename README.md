<div align="center">
	<img  src="./logo.png" alt="Night's Watch Logo">
	<hr>
	<h2>
		The OIDC Relying Party that guards the realms
	</h2>
	<hr>
</div>

## Features

## Getting Started

## Configuration

The following content is the default configuration and can be used to create your own `Night's Watch` configuration.

```yaml
oidc:
  issuerUri: https://issuer.castle_black.com
  client_id: the_wall
  client_secret: the_key_of_the_wall
  redirect_uri: https://north.7kingdoms.com/oidc/callback
  scopes: openid profile email offline_access

# https://github.com/expressjs/cookie-session
cookie:
  name: nightswatch
  keys:
    - you_know_nothing_jon_snow
  maxAge: 24h
targets:
  path: /**
  upstream: http://httpbin.org
  routes: []
  #  - path: /_dev
  #    upstream: http://httpbin.org
  rewrite: []
  #  - match: ^/_dev
  #    rewrite: '/headers'

storage:
  kind: InMemory
  specs:
    stdTTL: 24h
server:
  # max_body_limit: 100k
  http:
    enable: true
    port: 3000
  # to be implemented
  https:
    enable: false
    port: 3001
  max_header_size: 8192
  proxy:
    # http://expressjs.com/en/guide/behind-proxies.html
    # loopback - 127.0.0.1/8, ::1/128
    # linklocal - 169.254.0.0/16, fe80::/10
    # uniquelocal - 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7
    - loopback
    - linklocal
    - uniquelocal
    # add your own reverse proxy ip or a network
    # - x.x.x.x/x
  healthchecks:
    readiness: /healthcheck/ready
    liveness: /healthcheck
    timeout: 2s
relying_party:
  on_success_redirect: /
  on_fail_redirect: /
  oidc_base_path: /oidc
  oidc_paths:
    login: /login
    callback: /callback
  rules:
    - route: /**
      methods:
        - all
  logLevel: error
  headers:
    prefix: X-AUTH
    proxy:
      access-token: tokenset.access_token
      id-token: tokenset.id_token
      expires-at: tokenset.expires_at
      expires-in: tokenset.expires_in
      sub: profile.sub
      name: profile.name
      email: profile.email
      family-name: profile.family_name
      given-name: profile.given_name
```

All of the options can be provided as ENVIRONMENT variables following this rule:

`replace('.', '__').toUpperCase()`

to set the headers prefix passed to the upstream that is configurable through config.yaml

```yaml
relying_party:
  headers:
    prefix: X-AUTH
```

a variable named `RELYING_PARTY__HEADERS__PREFIX` should be set.

The only required configuration or variables are:

With a *config.minimal.yaml*

```yaml
oidc:
  issuerUri: https://issuer.castle_black.com
  client_id: the_wall
  client_secret: J0n_Sn0w_is_Aeg0n T@rg@ryen
  redirect_uri: https://north.7kingdoms.com/oidc/callback
cookie:
  keys:
    - you_know_nothing_jon_snow
targets:
  upstream: http://httpbin.org
```

otherwise you can use a *.env file or environment variables*

```shell
OIDC__ISSUERURI=https://issuer.castle_black.com
OIDC__CLIENT_ID=the_wall
OIDC__CLIENT_SECRET=J0n_Sn0w_is_Aeg0n T@rg@ryen
OIDC__REDIRECT_URI=https://north.7kingdoms.com/oidc/callback
COOKIE__KEYS_0=you_know_nothing_jon_snow
TARGET__UPSTREAM=http://httpbin.org
```
