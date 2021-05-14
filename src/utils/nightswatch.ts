import { EventEmitter } from 'events';
import 'express-async-errors';
import http, { RequestListener, Server, ServerOptions } from 'http';
import { connectTerminus, listen, normalizePort } from '../utils/ApiServer';

export type ServerConfigs = {
  requestListener: RequestListener;
  serverOptions?: ServerOptions;
  port?: number | string;
  delayShutdown?: number;
};
export class Nightswatch extends EventEmitter {
  private port?: number | string;
  readonly server: Server;
  constructor({
    requestListener,
    port,
    delayShutdown,
    serverOptions = {},
  }: ServerConfigs) {
    super();
    this.port = port;
    this.server = http.createServer(serverOptions, requestListener);

    connectTerminus(this.server, {
      onSignal: async () => this.emit('signal'),
      onShutdown: async () => this.emit('shutdown'),
      beforeShutdown() {
        // given your readiness probes run every 5 second
        // may be worth using a bigger number so you won't
        // run into any race conditions
        return new Promise<void>(resolve => {
          delayShutdown ? setTimeout(resolve, delayShutdown) : resolve();
        });
      },
    });
  }
  async start({
    port,
  }: {
    port: string | number | undefined;
  }): Promise<{ listeningPort: number | string }> {
    const listeningPort = normalizePort(port);
    await listen({ listeningPort, server: this.server });
    return { listeningPort };
  }
  async stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.server.listening) {
        this.server.close(err => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
