// Preprosta, a varna avtentikacija za enega administratorja.
// Geslo je v okoljski spremenljivki ADMIN_PASSWORD (vidi ga samo strežnik).
// Po prijavi izdamo HMAC-podpisan žeton z rokom veljavnosti.
import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'nastavi-session-secret';

const b64u = (buf) => Buffer.from(buf).toString('base64url');

export function createToken(payload, hours = 12) {
  const body = { ...payload, exp: Date.now() + hours * 3600 * 1000 };
  const data = b64u(JSON.stringify(body));
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!body.exp || body.exp < Date.now()) return null;
    return body;
  } catch { return null; }
}

export function requireAuth(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  return verifyToken(token);
}

export function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real || !pw) return false;
  const a = Buffer.from(String(pw)), b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
