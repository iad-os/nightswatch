import dotenv from 'dotenv';
dotenv.config();

import options from './config/options';
import logger from './utils/logger';

(async () => {
  try {
    await options.waitForFirstSnapshot({ timeout: 10000 }, __dirname, './main');
    logger.debug({ options: options.snapshot() }, 'CONFIG-SNAPSHOT - OK');
  } catch (err) {
    logger.error(err, 'CONFIG-SNAPSHOT - KO');
  }
})();
