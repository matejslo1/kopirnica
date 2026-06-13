// Admin CRUD za novice (zahteva prijavo).
import { sql } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req)) { res.status(401).json({ error: 'nedovoljeno' }); return; }
  try {
    if (req.method === 'GET') {
      const rows = await sql`select * from novice order by datum desc, id desc`;
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const { naslov, vsebina, datum = null, objavljeno = true } = req.body || {};
      const [row] = await sql`insert into novice (naslov, vsebina, datum, objavljeno)
        values (${naslov}, ${vsebina}, ${datum || new Date().toISOString().slice(0,10)}, ${objavljeno})
        returning *`;
      return res.json(row);
    }
    if (req.method === 'PUT') {
      const { id, naslov, vsebina, datum, objavljeno } = req.body || {};
      const [row] = await sql`update novice set naslov=${naslov}, vsebina=${vsebina},
        datum=${datum}, objavljeno=${objavljeno} where id=${id} returning *`;
      return res.json(row);
    }
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      await sql`delete from novice where id=${id}`;
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) { res.status(500).json({ error: String(e) }); }
}
