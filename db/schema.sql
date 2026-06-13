-- Bela linija — shema baze (Neon Postgres)

create table if not exists nastavitve (
  kljuc    text primary key,
  vrednost text not null default ''
);

create table if not exists cene (
  id         serial primary key,
  kategorija text not null,
  ime        text not null,
  cena       text not null,
  enota      text not null default '',
  sort       int  not null default 0
);

create table if not exists novice (
  id         serial primary key,
  naslov     text not null,
  vsebina    text not null,
  datum      date not null default current_date,
  objavljeno boolean not null default true,
  ustvarjeno timestamptz not null default now()
);

create table if not exists akcije (
  id         serial primary key,
  naslov     text not null,
  opis       text not null,
  velja_do   date,
  aktivno    boolean not null default true,
  ustvarjeno timestamptz not null default now()
);
