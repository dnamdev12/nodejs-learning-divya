// NJ-W1-06 — runs only when no route matched; hands a 404 to the error handler
import { HttpError } from '../utils/HttpError.js';

export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
