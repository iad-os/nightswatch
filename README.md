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

otherwise you can use a _.env file or environment variables_

```shell
OIDC__ISSUERURI=https://issuer.castle_black.com
OIDC__CLIENT_ID=the_wall
OIDC__CLIENT_SECRET=J0n_Sn0w_is_Aeg0n_T@rg@ryen
OIDC__REDIRECT_URI=https://north.7kingdoms.com/oidc/callback
COOKIE__KEYS_0=you_know_nothing_jon_snow
TARGET__UPSTREAM=http://httpbin.org
```

## Run with node

Night's Watch is developed using NodeJS 12, check your installed version with `node --version` or install it from the official website.

Once checked node version clone the repository:

```shell
$ git clone https://github.com/iad-os/nightswatch.git
```

then run `npm install` to download dependencies and finally `npm start` or instead `npm run start-pretty` for a pretty console logging.

In order to pass environment variable a `.env` file can be created or passing it in the run command:
`CONFIG_FILE=./recipes/simple/config.simple.yaml npm run start`, or with yaml configuration:

```shell
$ cp /src/config.default.yaml ./config.yaml
```

Use your preferred editor to configure Night's Watch on your need's, then run with `npm start` or instead `npm run start-pretty`.

If not overridden CONFIG_FILE is set to `./config.yaml` by default and Night's Watch will try to read your configuration from `config.yaml` in the current folder.

## 🐳 Run with Docker

The official docker image is available from Docker Hub [iad2os/nightswatch](https://) and can be executed with the following command:

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

a volume mount or a .env file can also be user modifying the docker run as follow

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

## 🐳 Run with Docker Compose

Let's start creating a docker compose file, in this example scenario we will secure with Night's Watch http://httpbin.org that will become handy when we'll verify if everything works as expected.

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
