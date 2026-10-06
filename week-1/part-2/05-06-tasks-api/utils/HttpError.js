// An Error that carries an HTTP status code.
// Throw it anywhere in a route; the central error handler turns it into a response.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    // 4xx messages are safe to show the client; 5xx details stay on the server
    this.expose = status < 500;
  }
}
