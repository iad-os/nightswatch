const duration = require('parse-duration');
const yaml = require('js-yaml');
const fs = require('fs');
const set = require('lodash.set');
const get = require('lodash.get');
const merge = require('lodash.merge');
const debug = require('debug')('nightswatch:conf');

const defaultsConfig = yaml.safeLoad(
  fs.readFileSync('./src/config.defaults.yaml', 'utf8')
);
const userConf =
  fs.existsSync(process.env.CONFIG_FILE || './config.yaml') &&
  yaml.safeLoad(
    fs.readFileSync(process.env.CONFIG_FILE || './config.yaml', 'utf8')
  );

function configurator(...configurations) {
  const extConfs = {};

  /**
   *
   * @param {string} propPath property path cookie.maxAge
   */
  function envOverride(propPath) {
    const propENV = propPath.replace('.', '__').toUpperCase();
    if (process.env[propENV]) {
      set(extConfs, propPath, process.env[propENV]);
    }
  }
  function required(propPath) {
    if (!get(extConfs, propPath)) {
      throw Error(`${propPath} is required!`);
    }
  }

  function humanToMillis(propPath) {
    const humanValue = get(extConfs, propPath);
    if (humanValue) {
      set(extConfs, propPath, duration(humanValue));
    }
    return;
  }

  merge(extConfs, ...configurations);

  envOverride('oidc.issuerUri');
  required('oidc.issuerUri');
  envOverride('oidc.client_id');
  required('oidc.client_id');
  envOverride('oidc.client_secret');
  required('oidc.client_secret');
  envOverride('oidc.redirect_uri');
  envOverride('oidc.scopes');

  envOverride('cookie.name');
  envOverride('cookie.keys');
  envOverride('cookie.maxAge');
  humanToMillis('cookie.maxAge');
  required('oidc.client_secret');

  envOverride('targets.upstream');

  envOverride('storage.kind');
  envOverride('storage.specs.stdTTL');

  envOverride('server.port');
  envOverride('server.max_body_limit');
  envOverride('server.proxy');
  envOverride('server.max_header_size');
  envOverride('server.healthcheck.readiness');
  envOverride('server.healthcheck.liveness');
  envOverride('server.healthcheck.timeout');
  humanToMillis('server.healthcheck.timeout');

  envOverride('relying_party.on_success_redirect');
  envOverride('relying_party.on_fail_redirect');
  envOverride('relying_party.oidc_base_path');
  envOverride('relying_party.oidc_paths.login');
  envOverride('relying_party.oidc_paths.callback');
  envOverride('relying_party.headers.prefix');
  //TBC   envOverride('relying_party.headers.proxy');

  debug(extConfs);
  return extConfs;
}

module.exports = configurator(defaultsConfig, userConf);
