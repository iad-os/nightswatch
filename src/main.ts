import waitOn from 'wait-on';
import nightswatch from './config/nightswatch';
import options from './config/options';
import log from './utils/logger';
(async () => {
  try {
    log.info('🔍 Running engineCheck ...');
    await engineCheck({});
    log.info('✅ Running engineCheck OK');
    await start();
    log.info('✅ Application started');
  } catch (err) {
    log.error({ err }, '💥 BAD things happened');
  }
})();
//import { name, version, description, repository } from 'package.json';
//log.info('App Boot info', { name, version, description, repository });
export async function start(): Promise<void> {
  // const {} = process.env;
  try {
    // await something
    // once here, all resources are available
    process.on('SIGINT', async () => {
      stop();
    });

    process.on('SIGTERM', async () => {
      stop();
    });
    await nightswatch.start({ port: 3000 });

    nightswatch.on('shutdown', () => {
      process.exit(0);
    });
    nightswatch.on('signal', () => {
      options.takeSnapshot();
    });
  } catch (err) {
    log.debug('💥 ops', err);
    throw err;
  }
  // eslint-disable-next-line global-require
}

async function stop(): Promise<void> {
  await nightswatch.stop();
  process.exit();
}
export async function engineCheck(options: {
  waitOpts?: waitOn.WaitOnOptions;
  envs?: { [name: string]: string };
}): Promise<void> {
  try {
    const { waitOpts, envs = process.env } = options;
    if (envs.ENV !== 'DEVELOPMENT' && waitOpts) waitOn(waitOpts);
  } catch (err) {
    log.error(err);
    throw err;
  }
}
export default {
  start,
  stop,
  engineCheck,
};
