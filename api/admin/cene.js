// Admin CRUD za cene (zahteva prijavo).
import { sql } from '../_db.js';
import { requireAuth } from '../_auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req)) { res.status(401).json({ error: 'nedovoljeno' }); return; }
  try {
    if (req.method === 'GET') {
      const rows = await sql`select * from cene order by kategorija, sort, id`;
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const { kategorija, ime, cena, enota = '', sort = 0 } = req.body || {};
      const [row] = await sql`insert into cene (kategorija, ime, cena, enota, sort)
        values (${kategorija}, ${ime}, ${cena}, ${enota}, ${sort}) returning *`;
      return res.json(row);
    }
    if (req.method === 'PUT') {
      const { id, kategorija, ime, cena, enota = '', sort = 0 } = req.body || {};
      const [row] = await sql`update cene set kategorija=${kategorija}, ime=${ime},
        cena=${cena}, enota=${enota}, sort=${sort} where id=${id} returning *`;
      return res.json(row);
    }
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      await sql`delete from cene where id=${id}`;
      return res.json({ ok: true });
    }
    res.status(405).json({ error: 'method' });
  } catch (e) { res.status(500).json({ error: String(e) }); }
}
