import ghii from '@ghii/ghii';
import packageJsonLoader from '@ghii/package-json-loader';
import yamlLoader from '@ghii/yaml-loader';
import { IssuerEndpoints } from '@iad-os/aemon-oidc-introspect';
import { PackageJson, PartialDeep } from 'type-fest';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Headers {
  prefix: string;
  proxy: Proxy;
  noProxy: string[];
}

export interface RelyingParty {
  on_success_redirect: string;
  on_fail_redirect: string;
  oidc_base_path: string;
  oidc_paths: OidcPaths;
  rules: Rule[];
}

const options = ghii<{
  mode: 'access-proxy'; //todo 'relying-party' | 'mixed';
  app: PartialDeep<PackageJson> & {
    dbName: string;
  };
  env: 'development' | 'production';
  oidc: {
    issuers: IssuerEndpoints[];
  };
  admissionControl?: {
    url: string;
    dryRun: { enabled: boolean; header: string };
  };
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
  headers: Headers;
  targets: Targets;
  storage: Storage;
  server: Server;
  //relying_party: RelyingParty;
}>()
  .section('mode', {
    defaults: 'access-proxy',
    validator: joi =>
      joi
        .string()
        .allow('access-proxy') //todo 'relying-party' | 'mixed')
        .required(),
  })
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
        issuers: joi.array().items(
          joi.object({
            client: joi.object({
              client_id: joi.string().required(),
              client_secret: joi.string(),
            }),
            introspection_endpoint: joi
              .string()
              .uri()
              .required(),
            issuer: joi
              .string()
              .uri()
              .required(),
          })
        ),
      }),
  })
  .section('admissionControl', {
    validator: joi =>
      joi.object({
        dryRun: {
          enabled: joi.boolean(),
          header: joi.string().case('lower'),
        },
        url: joi.string().uri(),
      }),
  })
  .section('logLevel', {
    defaults: 'info',
    validator: joi =>
      joi
        .string()
        .valid('debug', 'info', 'warn', 'error', 'silent')
        .required(),
  })
  .section('headers', {
    defaults: {
      prefix: 'X-AUTH',
    },
    validator: joi =>
      joi.object({
        prefix: joi.string(),
        proxy: joi
          .object({})
          .options({ allowUnknown: true })
          .required(),
        noProxy: joi.array().items(joi.string()),
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
  .loader(packageJsonLoader({ target: 'app' }));

process.env.CONFIG_FILE
  ? process.env.CONFIG_FILE.split('|').map(file =>
      options.loader(yamlLoader(file))
    )
  : options.loader(yamlLoader(__dirname, './config.defaults.yaml'));

export default options;
