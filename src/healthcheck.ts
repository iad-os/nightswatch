import { createTerminus } from '@godaddy/terminus';
import debugLib from 'debug';
const debug = debugLib('nightswatch:healtcheck');

import options from './config/options';

async function onSignal() {
  debug('server is starting cleanup');
  return {};
}

async function onShutdown() {
  debug('cleanup finished, server is shutting down');
}

function healthCheck() {
  debug('preforming healthcheck');
  return Promise
    .resolve
    // optionally include a resolve value to be included as
    // info in the health check response
    ();
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function enableHealthchecks(server: any): void {
  createTerminus(server, {
    // health check options
    healthChecks: {
      [options.snapshot().server.healthchecks.readiness]: healthCheck, // a function returning a promise indicating service health,
      [options.snapshot().server.healthchecks.liveness]: healthCheck,
    },
    // cleanup options
    timeout: options.snapshot().server.healthchecks.timeout || 1000, // [optional = 1000] number of milliseconds before forceful exiting
    //signal, // [optional = 'SIGTERM'] what signal to listen for relative to shutdown
    //signals, // [optional = []] array of signals to listen for relative to shutdown
    //beforeShutdown, // [optional] called before the HTTP server starts its shutdown
    onSignal, // [optional] cleanup function, returning a promise (used to be onSigterm)
    onShutdown, // [optional] called right before exiting
    //onSendFailureDuringShutdown, // [optional] called before sending each 503 during shutdowns

    // both
    //logger, // [optional] logger function to be called with errors
  });
}

export default enableHealthchecks;
