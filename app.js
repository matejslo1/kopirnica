// Javna stran — naloži vsebino iz baze (/api/content) in jo prikaže.
// Če API ni dosegljiv, ostane statična vsebina (varen fallback).
(function () {
  var KAT = {
    tisk:     { title: 'Tisk & kopiranje',  sub: 'Črno-belo in barvno do A3',
                icon: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/>' },
    vezava:   { title: 'Vezava nalog',      sub: 'Diplomske, magistrske, doktorske', featured: true, tag: 'Najbolj iskano',
                icon: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' },
    dodelava: { title: 'Dodelava & ostalo', sub: 'Zaščita, oblikovanje, darila',
                icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>' }
  };

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function datum(d){
    if(!d) return '';
    var x = new Date(d); if(isNaN(x)) return '';
    return x.getDate() + '. ' + (x.getMonth()+1) + '. ' + x.getFullYear();
  }

  fetch('/api/content').then(function(r){ return r.ok ? r.json() : Promise.reject(); }).then(function(data){
    if(data.nastavitve) renderNastavitve(data.nastavitve);
    if(data.cene && data.cene.length) renderCene(data.cene);
    renderNovice(data.novice || []);
    renderAkcije(data.akcije || []);
  }).catch(function(){ /* tiho — ostane statična vsebina */ });

  /* ----- KONTAKT ----- */
  function renderNastavitve(n){
    document.querySelectorAll('[data-field]').forEach(function(el){
      var key = el.getAttribute('data-field');
      if(n[key] == null) return;
      el.textContent = n[key];
      if(el.hasAttribute('data-tel')) el.setAttribute('href', 'tel:' + String(n[key]).replace(/\s+/g,''));
      if(key === 'email' && el.tagName === 'A') el.setAttribute('href', 'mailto:' + n[key]);
    });
    // Akcijski gumbi — posodobimo le povezave (besedilo ostane).
    if(n.telefon){
      var tel = 'tel:' + String(n.telefon).replace(/\s+/g,'');
      document.querySelectorAll('[data-callbtn]').forEach(function(el){ el.setAttribute('href', tel); });
    }
    if(n.email){
      document.querySelectorAll('[data-mailbtn]').forEach(function(el){ el.setAttribute('href', 'mailto:' + n.email); });
    }
    if(n.naslov){
      var maps = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(n.naslov);
      document.querySelectorAll('[data-mapbtn]').forEach(function(el){ el.setAttribute('href', maps); });
      var lbl = document.querySelector('.map .label');
      if(lbl) lbl.textContent = (n.ime_podjetja || 'Fotokopirnica Center Celje') + ' · ' + n.naslov;
    }
  }

  /* ----- CENE ----- */
  function renderCene(rows){
    var grid = document.getElementById('cenik-grid'); if(!grid) return;
    var byCat = {}; rows.forEach(function(r){ (byCat[r.kategorija] = byCat[r.kategorija] || []).push(r); });
    var html = '';
    Object.keys(KAT).forEach(function(cat){
      var meta = KAT[cat], items = byCat[cat] || [];
      if(!items.length) return;
      html += '<div class="pcard' + (meta.featured ? ' featured' : '') + '">';
      if(meta.tag) html += '<span class="tag">' + esc(meta.tag) + '</span>';
      html += '<div class="pi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' + meta.icon + '</svg></div>';
      html += '<h3>' + esc(meta.title) + '</h3><div class="sub">' + esc(meta.sub) + '</div>';
      items.forEach(function(it){
        var enota = it.enota ? '<small> ' + esc(it.enota) + '</small>' : '';
        html += '<div class="price-row"><span class="name">' + esc(it.ime) + '</span><span class="val">' + esc(it.cena) + enota + '</span></div>';
      });
      html += '</div>';
    });
    if(html) grid.innerHTML = html;
  }

  /* ----- NOVICE ----- */
  function renderNovice(novice){
    var sec = document.getElementById('novice'), list = document.getElementById('novice-list');
    var nav = document.querySelector('[data-nav-novice]');
    if(!sec || !list) return;
    if(!novice.length){ sec.hidden = true; if(nav) nav.hidden = true; return; }
    list.innerHTML = novice.map(function(n){
      return '<article class="novica">' +
        (n.datum ? '<div class="datum">' + esc(datum(n.datum)) + '</div>' : '') +
        '<h3>' + esc(n.naslov) + '</h3><p>' + esc(n.vsebina) + '</p></article>';
    }).join('');
    sec.hidden = false;
    if(nav) nav.hidden = false;
    sec.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('in'); });
  }

  /* ----- AKCIJE ----- */
  function renderAkcije(akcije){
    var bar = document.getElementById('akcijaBar'); if(!bar) return;
    if(!akcije.length){ bar.hidden = true; return; }
    var a = akcije[0];
    bar.innerHTML = '<b>' + esc(a.naslov) + '</b> — ' + esc(a.opis) +
      (a.velja_do ? ' <span class="vd">· velja do ' + esc(datum(a.velja_do)) + '</span>' : '');
    bar.hidden = false;
  }
})();
