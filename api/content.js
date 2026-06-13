// Javni endpoint — vrne vso vsebino za prikaz na strani (brez prijave).
import { sql } from './_db.js';

export default async function handler(req, res) {
  try {
    const nastavitve = await sql`select kljuc, vrednost from nastavitve`;
    const cene = await sql`select id, kategorija, ime, cena, enota, sort from cene order by kategorija, sort, id`;
    const novice = await sql`select id, naslov, vsebina, datum from novice where objavljeno = true order by datum desc, id desc limit 12`;
    const akcije = await sql`select id, naslov, opis, velja_do from akcije
      where aktivno = true and (velja_do is null or velja_do >= current_date)
      order by id desc`;
    const nast = Object.fromEntries(nastavitve.map(r => [r.kljuc, r.vrednost]));
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
    res.json({ nastavitve: nast, cene, novice, akcije });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
