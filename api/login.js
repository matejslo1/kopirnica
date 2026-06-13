// Prijava administratorja — preveri geslo in vrne žeton.
import { checkPassword, createToken } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  const { geslo } = req.body || {};
  if (!checkPassword(geslo)) { res.status(401).json({ error: 'Napačno geslo' }); return; }
  res.json({ token: createToken({ admin: true }) });
}
