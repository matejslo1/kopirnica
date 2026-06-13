// Admin — branje in shranjevanje nastavitev (kontakt). Zahteva prijavo.
import { sql } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req)) { res.status(401).json({ error: 'nedovoljeno' }); return; }
  try {
    if (req.method === 'GET') {
      const rows = await sql`select kljuc, vrednost from nastavitve`;
      return res.json(Object.fromEntries(rows.map(r => [r.kljuc, r.vrednost])));
    }
    if (req.method === 'PUT') {
      const obj = req.body || {};
      for (const [k, v] of Object.entries(obj)) {
        await sql`insert into nastavitve (kljuc, vrednost) values (${k}, ${String(v)})
          on conflict (kljuc) do update set vrednost = excluded.vrednost`;
      }
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) { res.status(500).json({ error: String(e) }); }
}
