import { Response, Request, NextFunction } from 'express';
import httpStatus from 'http-status';
import opts from '../config/options';
import ErrorResponse from './ErrorResponse';
import logger from './logger';

const IS_DEVELOPMENT = opts.snapshot().env === 'development';
export function errorResponseMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { statusCode, error } =
    err instanceof ErrorResponse
      ? { statusCode: err.statusCode, error: err.error }
      : { statusCode: httpStatus.INTERNAL_SERVER_ERROR, error: undefined };
  res.err = err;
  res.status(statusCode).json({
    message: err.message,
    stack: IS_DEVELOPMENT ? err.stack : undefined,
    error: IS_DEVELOPMENT ? error : undefined,
  });
  logger.error(err);
  return next(err);
}

export function defaultMiddleware(
  req: Request,
  res: Response,
  next: (err?: Error) => void
): void {
  next(new ErrorResponse(httpStatus.NOT_FOUND, 'not found'));
}
