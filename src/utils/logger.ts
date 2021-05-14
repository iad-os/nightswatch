import { RequestHandler } from 'express';
import pino from 'pino';
import opts from '../config/options';

export const options = {
  level: process.env.LOG_LEVEL || opts.snapshot().logLevel,
  prettyPrint: process.env.PRETTY_PRINT === 'true',
};

const logger = pino(options);

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level');
}

export const loggerMiddleware: RequestHandler = (req, res, next) => {
  req.log = logger;
  next();
};

export default logger;
