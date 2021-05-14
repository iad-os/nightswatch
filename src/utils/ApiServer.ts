import { createTerminus, TerminusOptions } from '@godaddy/terminus';
import http, { RequestListener, Server, ServerOptions } from 'http';
import { isNumber } from 'lodash';
import { AddressInfo } from 'net';
import log from './logger';

export type ServerConfigs = {
  requestListener: RequestListener;
  serverOptions?: ServerOptions;
  port?: number | string;
  delayShutdown?: number;
};

/**
 * Normalize a port into a number, string, or false.
 */
export function normalizePort(portValue?: string | number): number {
  if (!portValue) {
    return 3000;
  }

  const portTest = isNumber(portValue) ? portValue : parseInt(portValue, 10);

  if (portTest >= 0 && portTest <= 65535) {
    // port number
    return portTest;
  }

  throw new Error(`TCP Port is not valid ${portValue}`);
}

export function connectTerminus(
  server: http.Server,
  eventsHandlers: {
    onSignal?: () => Promise<unknown>;
    onShutdown?: () => Promise<unknown>;
    beforeShutdown?: () => Promise<unknown>;
  }
): void {
  const { onSignal, onShutdown, beforeShutdown } = eventsHandlers;
  const terminusOptions: TerminusOptions = {
    // health check options
    healthChecks: {
      '/healthcheck': async () => {
        log.trace('healthchecks received');
      },
      //verbatim: true,
    },

    // cleanup options
    timeout: 1000,

    // signal, // [optional = 'SIGTERM'] what signal to listen for relative to shutdown
    // signals, // [optional = []] array of signals to listen for relative to shutdown
    // beforeShutdown, // [optional] called before the HTTP server starts its shutdown
    beforeShutdown,
    onSignal,
    onShutdown,

    // onSendFailureDuringShutdown, // [optional] called before sending each 503 during shutdowns
    // both
    logger: log.debug.bind(log),
  };

  createTerminus(server, terminusOptions);
}

export async function listen({
  listeningPort,
  server,
}: {
  listeningPort: string | number;
  server: Server;
}): Promise<{
  addr: string | AddressInfo;
  bind: string;
}> {
  return new Promise((resolve, reject) => {
    server.on('error', function onError(error: NodeJS.ErrnoException) {
      if (error) {
        if (error.syscall !== 'listen') {
          reject(error);
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
          case 'EADDRINUSE':
            log.error(`${listeningPort} is already in use`);
            reject(error);
            process.exit(1);
        }
      }
    });
    server.on('listening', () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const addr = server.address()!;
      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      log.info(`📻 Listening on ${bind}`);
      resolve({ addr, bind });
    });
    server.listen(listeningPort);
  });
}
