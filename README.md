<div align="center">
	<img  src="./logo.png" alt="Night's Watch Logo">
	<hr>
	<h2>
		The OIDC Relying Party that guards the realms
	</h2>
	<hr>
</div>

- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Run Night's Watch](#run-nights-watch)
  - [Run with node](#run-with-node)
  - [🐳 Run with Docker](#%f0%9f%90%b3-run-with-docker)
  - [🐳 Run with Docker Compose](#%f0%9f%90%b3-run-with-docker-compose)
- [Configure Authorization Headers](#configure-authorization-headers)
  - [Example of: Adding a custom Header](#example-of-adding-a-custom-header)
  - [The Token Set claims](#the-token-set-claims)
  - [The UserInfo claims](#the-userinfo-claims)
  - [The IdToken claims](#the-idtoken-claims)

## Getting Started

## Configuration

The following is the default configuration; you can use it to create your own `Night's Watch` configuration.

```yaml
mode: access-proxy # only access-proxy
oidc:
  - issuer: https://issuer.castle_black.com
  introspection_endpoint: https://issuer.castle_black.com/introspect
    client:
      client_id: the_wall
      client_secret: the_key_of_the_wall

admissionControl:
  url: http://opa:8181/v1/data
  dryRun:
    enabled: true
    header: 'x-authorizer'

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
    stdTTL: 86400
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
    timeout: 2000

logLevel: error
headers:
  prefix: X-AUTH
  proxy:
    access-token: tokenset.access_token
    id-token: tokenset.id_token
    expires-at: tokenset.expires_at
    expires-in: tokenset.expires_in
    sub: idtoken.sub
    name: idtoken.name
    email: idtoken.email
    family-name: idtoken.family_name
    given-name: idtoken.given_name
  noProxy:
    - authorization
```

All of the options can be provided as ENVIRONMENT variables by applying this rule:

`replace('.', '__').toUpperCase()`

In order to set the HTTP headers prefixes that we're going to send to the upstream, we can use the config.yaml file:

```yaml
relying_party:
  headers:
    prefix: X-AUTH
```

A variable named `RELYING_PARTY__HEADERS__PREFIX` could also be set, instead.


The mandatory configuration part is the following:

With a _config.minimal.yaml_

```yaml
oidc:
  issuerUri: https://issuer.castle_black.com
  client_id: the_wall
  client_secret: J0n_Sn0w_is_Aeg0n_T@rg@ryen
  redirect_uri: https://north.7kingdoms.com/oidc/callback
cookie:
  keys:
    - you_know_nothing_jon_snow
targets:
  upstream: http://httpbin.org
```

and here is its alternative, through a _.env file or environment variables:_ 

```shell
OIDC__ISSUERURI=https://issuer.castle_black.com
OIDC__CLIENT_ID=the_wall
OIDC__CLIENT_SECRET=J0n_Sn0w_is_Aeg0n_T@rg@ryen
OIDC__REDIRECT_URI=https://north.7kingdoms.com/oidc/callback
COOKIE__KEYS_0=you_know_nothing_jon_snow
TARGET__UPSTREAM=http://httpbin.org
```

## Run Night's Watch

You can run Night's Watch in different scenarios:

[Run with node](#run-with-node)
[🐳 Run with Docker](#%f0%9f%90%b3-run-with-docker)
[🐳 Run with Docker Compose](#%f0%9f%90%b3-run-with-docker-compose)
⎈ Run in Kubernetes: (soon)

### Run with node

Night's Watch is developed using NodeJS 12; check your installed version with `node --version` or install it from the official website.

Once you have checked the node version, you can go ahead and clone the repository:

```shell
$ git clone https://github.com/iad-os/nightswatch.git
```

next, run `npm install` to download dependencies and, finally, finally `npm start` or `npm run start-pretty`, for a prettier console logging.

In order to pass environment variables, a `.env` file can be created in the checkout folder; otherwise, they can be passed with this npm start command:
`CONFIG_FILE=./recipes/simple/config.simple.yaml npm run start`.

It is also possible to use a .yaml configuration:

```shell
$ cp /src/config.default.yaml ./config.yaml
```

Use your own editor to configure Night's Watch the way you need it, then run it with `npm start` or `npm run start-pretty`.

If not overridden, the CONFIG_FILE is set to `./config.yaml` by default and Night's Watch will try to read your configuration from `config.yaml` in the current folder.

### 🐳 Run with Docker

The official Night's Watch docker image is available at Docker Hub [iad2os/nightswatch](https://) and can be executed with the following command:

```shell
$ docker run \
-e OIDC__ISSUERURI=https://issuer.castle_black.com \
-e OIDC__CLIENT_ID=the_wall \
-e OIDC__CLIENT_SECRET=J0n_Sn0w_is_Aeg0n_T@rg@ryen \
-e OIDC__REDIRECT_URI=https://north.7kingdoms.com/oidc/callback \
-e COOKIE__KEYS_0=you_know_nothing_jon_snow \
-e TARGET__UPSTREAM=http://httpbin.org \
-p 3000:3000 \
iad2os/nightswatch

```

a volume mount or a .env file can also be used modifying the `docker run` as follows:

(with volumes)

```shell
$ docker run \
-v /path/to/config.yaml:/app/config.yaml
-p 3000:3000 \
iad2os/nightswatch

```

(with .env)

```shell
$ docker run \
-env /path/to/.env
-p 3000:3000 \
iad2os/nightswatch

```

### 🐳 Run with Docker Compose

Let's start creating a docker compose file, in this example scenario we will make http://httpbin.org safe with the aid of the Night's Watch. This will come in handy later, while verifying that everything works as expected.

```yaml
version: '3.4'
services:
  nightswatch:
    image: iad2os/nightswatch
    volumes:
      - ./config-simple.yaml:/app/config.yaml
    environment:
      DEBUG: nightswatch:*
      CONFIG_FILE: ./config.yaml
    ports:
      - 3000:3000
    healthcheck:
      test:
        [
          'CMD',
          'wget',
          '--quiet',
          '--spider',
          'http://localhost:3000/healthcheck',
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
```

## Configure Authorization Headers

With Night's Watch you can easily customize the headers passed to the Resource Server (in other words, your application).

For each request, Night's Watch will add some headers that a resource server may consume to bind the identity and other details needed to handle such request.

Here is the default headers and its configuration:

```yaml
relying_party
  headers:
    prefix: X-AUTH
    proxy:
      access-token: tokenset.access_token
      id-token: tokenset.id_token
      expires-at: tokenset.expires_at
      expires-in: tokenset.expires_in
      sub: idtoken.sub
      name: idtoken.name
      email: idtoken.email
      family-name: idtoken.family_name
      given-name: idtoken.given_name
```

you can configure your own headers and decide what to send to the upstream, north of the Wall!

Every request comes with 3 objects:

- [The Token Set claims](#the-token-set-claims)
- [The UserInfo claims](#the-userinfo-claims)
- [The IdToken claims](#the-idtoken-claims)

here is a JSON example:

```json
{
  "tokenset": {
    "access_token": "theAccessToken",
    "expires_at": 1583084430,
    "refresh_expires_in": 0,
    "refresh_token": "theRefreshToken",
    "token_type": "bearer",
    "id_token": "oidcIdToken",
    "not-before-policy": 0,
    "session_state": "aRandomId",
    "scope": "openid offline_access email profile"
  },
  "userinfo": {
    "sub": "459697e5-6c58-45d8-88f2-2a4ea5b3157a",
    "email_verified": true,
    "name": "Jeor Mormont",
    "preferred_username": "The Old Bear",
    "given_name": "Jeor",
    "family_name": "Mormont",
    "email": "theoldbear@castle_black.com"
  },
  "idtoken": {
    "jti": "88ae774f-4121-4a9a-8584-2a8d13831130",
    "exp": 1583084430,
    "nbf": 0,
    "iat": 1583084370,
    "iss": "https://issuer.castle_black.com",
    "aud": "1min-access-token",
    "sub": "459697e5-6c58-45d8-88f2-2a4ea5b3157a",
    "typ": "ID",
    "azp": "1min-access-token",
    "auth_time": 1583084369,
    "session_state": "99bd9ca8-cd06-469c-90ea-4fddcc3bcdee",
    "acr": "1",
    "email_verified": true,
    "name": "Jeor Mormont",
    "preferred_username": "The Old Bear",
    "given_name": "Jeor",
    "family_name": "Mormont",
    "email": "theoldbear@castle_black.com"
  }
}
```

### Adding a custom Header (sample)

For instance, you could add a header named `X-AUTH-ROLES`, representing user roles.
using an environment variable:

```shell
RELYING_PARTY__HEADERS_PROXY_ROLES=idtoken.roles
```

using config.yaml

```yaml
relying_party
  headers:
    prefix: X-AUTH
    proxy:
      roles: idtoken.roles
```

⚠️ IdToken may differ between issuer; which claim to include can also be configured. Please refer to your IDP documentation.

### The Token Set claims

An object named tokenset will be available with the following properties:

```
access_token: <string>
token_type: <string>
id_token: <string>
refresh_token: <string>
expires_in: <number>
expires_at: <number> Access token expiration timestamp, formed by the number of seconds since the epoch (January 1, 1970 00:00:00 UTC).
session_state: <string>
other properties may be present and they'll be passthrough available on the TokenSet instance
```

This is an example of TokenSet object:

```yaml
tokenset
 access_token: theAccessToken
 expires_at: 1583084430
 refresh_expires_in: 0
 refresh_token: theRefreshToken
 token_type: bearer
 id_token: oidcIdToken
 not fore-policy: 0
 session_state: aRandomId
 scope: openid offline_access email profile
```

for more details, check the official TokenSet documentation at [panva/node-openid-client](https://github.com/panva/node-openid-client/blob/master/docs/README.md#class-tokenset).

### The UserInfo claims

The UserInfo object contains the claims defined by the OIDC standards, and this can change between OIDC providers. If you also control the OIDC provider, consult the documentation to configure what claims are included in the UserInfo endpoint.
More info about UserInfo and standard claims can be found at [OIDC Specs - User Info](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo)
[OIDC Specs - Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)

This is an UserInfo object example:

```yaml
userinfo:
  sub: 459697e5-6c58-45d8-88f2-2a4ea5b3157a
  email_verified": true
  name: Jeor Mormont
  preferred_username: The Old Bear
  given_name: Jeor
  family_name: Mormont
  email: theoldbear@castle_black.com
```

### The IdToken claims

Even though you have a serialized and JWT-signed id_token located at the `tokenset.id_token` level, the root-level `idtoken` object contains the same content but, indeed, as an object.
With this, it will be more convenient to handle claims in the headers..

Here is an example of `idtoken` object:

```yaml
idtoken:
  jti: 88ae774f-4121-4a9a-8584-2a8d13831130
  exp: 1583084430
  nbf: 0
  iat: 1583084370
  iss: https://issuer.castle_black.com
  sub: 459697e5-6c58-45d8-88f2-2a4ea5b3157a
  typ: ID
  azp: 1min-access-token
  auth_time: 1583084369
  session_state: 99bd9ca8-cd06-469c-90ea-4fddcc3bcdee
  acr: 1
  email_verified: true
  name: Jeor Mormont
  preferred_username: The Old Bear
  given_name: Jeor
  family_name: Mormont
  email: theoldbear@castle_black.com
```

Check out the official OIDC docs: [OIDC Specs](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
