// Ustvari tabele in napolni začetne podatke v Neon bazi.
// Zagon:  node --env-file=.env.local db/apply.mjs
import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';

const url = process.env.DATABASE_URL;
if (!url) { console.error('Manjka DATABASE_URL (nastavi v .env.local).'); process.exit(1); }
const sql = neon(url);

// 1) Shema — izvedi vsak stavek posebej
const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
  await sql.query(stmt);
}
console.log('✓ Tabele ustvarjene');

// 2) Nastavitve (kontakt) — upsert
const nast = {
  ime_podjetja: 'Bela linija',
  email: 'tisk@belalinija.si',
  telefon: '01 234 56 78',
  naslov: 'Glavna ulica 1, Vaše mesto',
  urnik: 'Pon–Pet 8–18, Sob 8–12'
};
for (const [k, v] of Object.entries(nast)) {
  await sql`insert into nastavitve (kljuc, vrednost) values (${k}, ${v})
            on conflict (kljuc) do nothing`;
}
console.log('✓ Nastavitve');

// 3) Cene — samo če je tabela prazna
const [{ count }] = await sql`select count(*)::int as count from cene`;
if (count === 0) {
  const cene = [
    ['tisk','Č/B kopija A4','od 0,08 €','/list',1],
    ['tisk','Barvna kopija A4','od 0,30 €','/list',2],
    ['tisk','Č/B kopija A3','od 0,15 €','/list',3],
    ['tisk','Barvna kopija A3','od 0,60 €','/list',4],
    ['tisk','Skeniranje','od 0,20 €','/stran',5],
    ['vezava','Spiralna vezava','od 3,50 €','',1],
    ['vezava','Termo vezava','od 5,00 €','',2],
    ['vezava','Trda vezava','od 18,00 €','',3],
    ['vezava','Trda + zlatotisk','od 25,00 €','',4],
    ['vezava','Izdelava isti dan','po dogovoru','',5],
    ['dodelava','Plastificiranje A4','od 1,00 €','/kos',1],
    ['dodelava','Plastificiranje A3','od 2,00 €','/kos',2],
    ['dodelava','Grafično oblikovanje','od 15,00 €','/ura',3],
    ['dodelava','Graviranje','po dogovoru','',4],
    ['dodelava','Tisk na foto papir','od 0,90 €','',5]
  ];
  for (const [kategorija, ime, cena, enota, s] of cene) {
    await sql`insert into cene (kategorija, ime, cena, enota, sort)
              values (${kategorija}, ${ime}, ${cena}, ${enota}, ${s})`;
  }
  console.log(`✓ Cene (${cene.length} postavk)`);
} else {
  console.log(`• Cene že obstajajo (${count}) — preskočeno`);
}

// 4) Vzorčna novica in akcija — samo če prazno
const [{ count: nn }] = await sql`select count(*)::int as count from novice`;
if (nn === 0) {
  await sql`insert into novice (naslov, vsebina) values
    ('Dobrodošli na prenovljeni strani', 'Odslej lahko naročila oddate hitreje, cene in obvestila pa so vedno ažurni.')`;
  console.log('✓ Vzorčna novica');
}
const [{ count: na }] = await sql`select count(*)::int as count from akcije`;
if (na === 0) {
  await sql`insert into akcije (naslov, opis, velja_do) values
    ('Študentski popust na vezavo', '10 % popusta na trdo vezavo ob predložitvi študentske izkaznice.', null)`;
  console.log('✓ Vzorčna akcija');
}

console.log('\nKončano. Baza je pripravljena.');
process.exit(0);
