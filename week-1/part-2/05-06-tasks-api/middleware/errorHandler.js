// NJ-W1-06 — central error handler: every error becomes { success: false, message }
// Express recognises an error handler by its 4 arguments, so `next` must stay in the signature.
export function errorHandler(err, req, res, next) {
  // Response already started streaming: let Express close the connection
  if (res.headersSent) return next(err);

  // HttpError and express.json() errors carry a status; anything else is a bug -> 500
  let status = err.status ?? err.statusCode ?? 500;
  if (status < 400 || status > 599) status = 500;

  let message = err.expose ? err.message : 'Internal Server Error';
  if (err.type === 'entity.parse.failed') message = 'Malformed JSON in request body';

  if (status >= 500) console.error(err);

  res.status(status).json({ success: false, message });
}
