import ghii from '@ghii/ghii';
import packageJsonLoader from '@ghii/package-json-loader';
import yamlLoader from '@ghii/yaml-loader';
import { PackageJson, PartialDeep } from 'type-fest';
import logger from '../utils/logger';

export interface Oidc {
  scopes: string;
  issuerUri: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface Targets {
  path: string;
  upstream: string;
  routes: { path: string; upstream: string }[];
  rewrite: { match: string; rewrite: string }[];
}

export interface Specs {
  stdTTL: number;
}

export interface Storage {
  kind: string;
  specs: Specs;
}

export interface Http {
  enable: boolean;
  port: number;
}

export interface Https {
  enable: boolean;
  port: number;
}

export interface Healthchecks {
  readiness: string;
  liveness: string;
  timeout: number;
}

export interface Server {
  http: Http;
  https: Https;
  max_header_size: number;
  proxy: string[];
  healthchecks: Healthchecks;
  max_body_limit: string;
}

export interface OidcPaths {
  login: string;
  callback: string;
}

export interface Rule {
  route: string;
  methods: string[];
}

export interface Proxy {
  'access-token': string;
  'id-token': string;
  'expires-at': string;
  'expires-in': string;
  sub: string;
  name: string;
  email: string;
  'family-name': string;
  'given-name': string;
}

export interface Headers {
  prefix: string;
  proxy: Proxy;
}

export interface RelyingParty {
  on_success_redirect: string;
  on_fail_redirect: string;
  oidc_base_path: string;
  oidc_paths: OidcPaths;
  rules: Rule[];
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  headers: Headers;
}

const options = ghii<{
  app: PartialDeep<PackageJson> & {
    dbName: string;
  };
  env: 'development' | 'production';
  oidc: Oidc;
  cookie: CookieSessionInterfaces.CookieSessionOptions;
  targets: Targets;
  storage: Storage;
  server: Server;
  relying_party: RelyingParty;
}>()
  .section('app', {
    defaults: {
      name: 'files-api',
      dbName: 'meApi',
    },
    validator: joi =>
      joi
        .object({
          name: joi.string(),
          dbName: joi.string(),
        })
        .options({ allowUnknown: true }),
  })
  .section('env', {
    validator: joi => joi.string().allow('development', 'production'),
    defaults: 'production',
  })
  .section('oidc', {
    validator: joi =>
      joi.object({
        scopes: joi.string().required(),
        issuerUri: joi.string().required(),
        client_id: joi.string().required(),
        client_secret: joi.string(),
        redirect_uri: joi.string().required(),
      }),
    defaults: {
      scopes: 'openid profile email offline_access',
      issuerUri: process.env.OIDC__ISSUERURI,
      client_id: process.env.OIDC__CLIENTID,
      client_secret: process.env.OIDC__CLIENT_SECRET || undefined,
      redirect_uri: process.env.OIDC__REDIRECT_URI,
    },
  })
  .section('cookie', {
    validator: joi =>
      joi.object({
        name: joi.string().required(),
        keys: joi
          .array()
          .items(joi.string().required())
          .min(1),
        maxAge: joi.number().required(),
      }),
  })
  .section('targets', {
    validator: joi =>
      joi.object({
        path: joi.string().required(),
        upstream: joi
          .string()
          .uri()
          .required(),
        routes: joi.array().items(
          joi.object({
            path: joi.string().required(),
            upstream: joi
              .string()
              .uri()
              .required(),
          })
        ),
        rewrite: joi.array().items(
          joi.object({
            match: joi.string().required(),
            rewrite: joi.string().required(),
          })
        ),
      }),
  })
  .section('storage', {
    validator: joi =>
      joi.object({
        kind: joi.string().required(),
        specs: joi
          .object({
            stdTTL: joi.number().required(),
          })
          .required(),
      }),
  })
  .section('server', {
    validator: joi =>
      joi.object({
        http: joi.object({
          enable: joi.boolean().required(),
          port: joi.number().required(),
        }),
        https: joi.object({
          enable: joi.boolean().required(),
          port: joi.number().required(),
        }),
        max_header_size: joi.number().required(),
        max_body_limit: joi.string(),
        proxy: joi.array().items(
          joi
            .string()
            .valid('loopback', 'linklocal', 'uniquelocal')
            .required()
        ),
        healthchecks: joi.object({
          readiness: joi.string().required(),
          liveness: joi.string().required(),
          timeout: joi.number(),
        }),
      }),
  })
  .section('relying_party', {
    validator: joi =>
      joi.object({
        on_success_redirect: joi.string().required(),
        on_fail_redirect: joi.string().required(),
        oidc_base_path: joi.string().required(),
        oidc_paths: joi
          .object({
            login: joi.string().required(),
            callback: joi.string().required(),
          })
          .required(),
        rules: joi
          .array()
          .items(
            joi
              .object({
                route: joi.string().required(),
                methods: joi
                  .array()
                  .items(joi.string().required())
                  .min(1),
              })
              .required()
          )
          .min(1),
        logLevel: joi
          .string()
          .valid('debug', 'info', 'warn', 'error', 'silent')
          .required(),
        headers: joi
          .object({
            prefix: joi.string().required(),
            proxy: joi
              .object({
                'access-token': joi.string().required(),
                'id-token': joi.string().required(),
                'expires-at': joi.string().required(),
                'expires-in': joi.string().required(),
                sub: joi.string().required(),
                name: joi.string().required(),
                email: joi.string().required(),
                'family-name': joi.string().required(),
                'given-name': joi.string().required(),
              })
              .required(),
          })
          .required(),
      }),
  })
  .loader(packageJsonLoader({ target: 'app' }));

process.env.CONFIG_FILE
  ? process.env.CONFIG_FILE.split('|').map(file =>
      options.loader(yamlLoader(file))
    )
  : options.loader(yamlLoader(__dirname, './config.defaults.yaml'));

export default options;
