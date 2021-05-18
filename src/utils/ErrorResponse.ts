/**
 * Generic Response Interface used by errors middleware
 */
export default class ErrorResponse extends Error {
  statusCode: number;

  error?: { [key: string]: unknown };

  constructor(
    statusCode: number,
    message?: string | undefined,
    error?: { [key: string]: unknown }
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}
