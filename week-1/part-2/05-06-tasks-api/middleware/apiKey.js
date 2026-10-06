// NJ-W1-06 — rejects requests without a valid x-api-key header
import { timingSafeEqual } from 'node:crypto';
import { HttpError } from '../utils/HttpError.js';

export function requireApiKey(expectedKey) {
  const expected = Buffer.from(expectedKey);

  return (req, res, next) => {
    const provided = req.get('x-api-key');
    if (!provided) return next(new HttpError(401, 'Missing x-api-key header'));

    // timingSafeEqual takes the same time however many characters match,
    // so an attacker can't guess the key one character at a time
    const given = Buffer.from(provided);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return next(new HttpError(401, 'Invalid API key'));
    }
    next();
  };
}
