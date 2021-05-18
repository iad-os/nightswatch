import jorahPolicyMiddleware, {
  OpaMiddlewareOptions,
} from '@iad-os/jorah-policy-middleware';
import axios from 'axios';
import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import ErrorResponse from '../utils/ErrorResponse';
import logger from '../utils/logger';
import opts from './options';

const _default: OpaMiddlewareOptions = {
  doPost: async (req, url, data, options) => {
    return await axios.create().post(url, data, options);
  },
  onDecision: (req, res, next) => {
    req.policyEvaluation.decision?.result?.allow
      ? next()
      : next(new ErrorResponse(httpStatus.FORBIDDEN, `OPA-POLICY - FORBIDDEN`));
  },
  decisionPath: req => {
    return `/${req.path.split('/')[1]}`;
  },
  required: {
    uid: req => req.uid,
  },
  toPolicyEvaluationRequest: (req, required) => ({
    input: {
      ...required,
      req: {
        method: req.method,
        params: req.params,
      },
    },
  }),
  logger: (req, level, msg, payload) => logger[level](msg, payload),
};

const jorah = (options?: OpaMiddlewareOptions): RequestHandler => {
  const config = opts.snapshot().admissionControl;
  if (config) {
    return jorahPolicyMiddleware(config, _default)(options || {});
  }
  return async function(req, res, next) {
    next();
  };
};

export default jorah;
