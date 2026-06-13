// Admin CRUD za akcije (zahteva prijavo).
import { sql } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req)) { res.status(401).json({ error: 'nedovoljeno' }); return; }
  try {
    if (req.method === 'GET') {
      const rows = await sql`select * from akcije order by id desc`;
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const { naslov, opis, velja_do = null, aktivno = true } = req.body || {};
      const [row] = await sql`insert into akcije (naslov, opis, velja_do, aktivno)
        values (${naslov}, ${opis}, ${velja_do || null}, ${aktivno}) returning *`;
      return res.json(row);
    }
    if (req.method === 'PUT') {
      const { id, naslov, opis, velja_do = null, aktivno } = req.body || {};
      const [row] = await sql`update akcije set naslov=${naslov}, opis=${opis},
        velja_do=${velja_do || null}, aktivno=${aktivno} where id=${id} returning *`;
      return res.json(row);
    }
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      await sql`delete from akcije where id=${id}`;
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) { res.status(500).json({ error: String(e) }); }
}
