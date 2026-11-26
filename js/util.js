/* LifePPF — outils communs : espace de noms LP, hasard, nombres, grammaire, gabarits de texte. */
window.LP = window.LP || {};
(function (L) {
  'use strict';

  L.VERSION = '0.3.0';
  L.CREDIT = "un jeu d'Aze Le Onze";

  // ---------- hasard (remplaçable pour les tests) ----------
  let R = Math.random;
  L.setRandom = function (fn) { R = fn || Math.random; };
  L.r = function () { return R(); };
  L.rand = function (a, b) { return a + (b - a) * R(); };
  L.ri = function (a, b) { return Math.floor(a + (b - a + 1) * R()); };
  L.chance = function (p) { return R() < p; };
  L.pick = function (arr) { return arr && arr.length ? arr[Math.floor(R() * arr.length) % arr.length] : undefined; };
  L.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  L.wpick = function (arr, wf) {
    let tot = 0;
    const ws = arr.map(function (x) { const v = Math.max(0, wf ? wf(x) : (x.w || 1)); tot += v; return v; });
    if (tot <= 0) return null;
    let r = R() * tot;
    for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  };
  L.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  };

  // ---------- texte ----------
  L.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  L.cap = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  // met une majuscule au premier vrai caractère, même derrière des balises
  L.capHtml = function (s) { return String(s).replace(/^((?:\s|<[^>]+>)*)([^\s<])/, function (m, tags, ch) { return tags + ch.toUpperCase(); }); };

  // nombres à la française : 12 500 / 1,25 M
  L.fmt = function (n) {
    n = Math.round(n);
    const neg = n < 0;
    const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + s;
  };
  L.money = function (n) {
    const a = Math.abs(n);
    if (a >= 1e9) return (n < 0 ? '−' : '') + (a / 1e9).toFixed(2).replace('.', ',') + ' Md€';
    if (a >= 1e6) return (n < 0 ? '−' : '') + (a / 1e6).toFixed(2).replace('.', ',') + ' M€';
    return L.fmt(n) + ' €';
  };
  L.dec = function (n, d) { return Number(n).toFixed(d == null ? 1 : d).replace('.', ','); };
  L.plural = function (n, one, many) { return n + ' ' + (Math.abs(n) >= 2 ? (many || one + 's') : one); };

  // ---------- grammaire : genre du joueur (M, F ou X = écriture inclusive) ----------
  const RULES = [['teur', 'trice', '·rice'], ['eux', 'euse', '·se'], ['eur', 'euse', '·se'], ['er', 'ère', '·ère'], ['if', 'ive', '·ve'], ['on', 'onne', '·ne'], ['en', 'enne', '·ne'], ['el', 'elle', '·le'], ['et', 'ette', '·te'], ['x', 'se', '·se'], ['c', 'que', '·que']];
  function inclWord(a, b) {
    if (a === b) return a;
    if (!a) return '·' + b;
    if (b.indexOf(a) === 0) return a + '·' + b.slice(a.length);
    for (let i = 0; i < RULES.length; i++) {
      const r = RULES[i];
      if (a.slice(-r[0].length) === r[0] && b.slice(-r[1].length) === r[1]) return a + r[2];
    }
    return a + '·' + b;
  }
  L.incl = function (a, b) {
    const wa = a.split(' '), wb = b.split(' ');
    if (wa.length === wb.length && wa.length > 1) return wa.map(function (w, i) { return inclWord(w, wb[i]); }).join(' ');
    return inclWord(a, b);
  };
  L.gx = function (a, b, sex) { return sex === 'F' ? b : sex === 'X' ? L.incl(a, b) : a; };
  // « Boulanger|Boulangère » → selon le genre
  L.gs = function (str, sex) {
    if (!str) return '';
    const i = str.indexOf('|');
    return i < 0 ? str : L.gx(str.slice(0, i), str.slice(i + 1), sex);
  };

  // lien de parenté vu par le joueur
  L.lien = function (p) {
    const F = p.sex === 'F';
    switch (p.rel) {
      case 'mere': return 'ta mère';
      case 'pere': return 'ton père';
      case 'par': return 'ton parent';
      case 'sib': return F ? 'ta sœur' : 'ton frère';
      case 'gp': return F ? 'ta mamie' : 'ton papi';
      case 'ami': return p.bff ? (F ? 'ta meilleure amie' : 'ton meilleur ami') : (F ? 'ton amie' : 'ton ami');
      case 'part':
        if (p.st === 'marie') return F ? 'ta femme' : 'ton mari';
        if (p.st === 'fiance') return F ? 'ta fiancée' : 'ton fiancé';
        return p.age < 26 ? (F ? 'ta copine' : 'ton copain') : (F ? 'ta compagne' : 'ton compagnon');
      case 'ex': return 'ton ex';
      case 'enf': return F ? 'ta fille' : 'ton fils';
      case 'enn': return F ? 'ton ennemie' : 'ton ennemi';
      case 'coll': return F ? 'ta collègue' : 'ton collègue';
      case 'boss': return F ? 'ta patronne' : 'ton patron';
      case 'pet': return p.spn || 'ton animal';
      case 'old': return F ? 'ton ancienne amie' : 'ton ancien ami';
      default: return '';
    }
  };
  L.relName = function (p) { return L.cap(L.lien(p).replace(/^(ton|ta|tes) /, '')); };

  /* Gabarits de texte.
   *  [né|née]        → selon le genre du joueur
   *  {e}             → '', 'e' ou '·e'
   *  {prenom} {nom} {ville}
   *  {mere}          → « ta mère <b>Sophie</b> »   ({Mere} avec majuscule)
   *  {mere.n}        → « <b>Sophie</b> »   .il → il/elle   .e → ''/'e'   .lien → « ta mère »   .full → prénom nom
   *  {mere:son|sa}   → selon le genre de la personne
   *  {x}             → variable c.v.x (déjà sûre)
   */
  L.T = function (s, c) {
    if (typeof s === 'function') s = s(c);
    if (!s) return '';
    c = c || {};
    const me = c.me || { sex: 'M', first: '', last: '' };
    s = s.replace(/\[([^\[\]|]*)\|([^\[\]]*)\]/g, function (m, a, b) { return L.gx(a, b, me.sex); });
    s = s.replace(/\{([A-Za-z0-9]+)(?:\.([a-z]+))?(?::([^{}|]*)\|([^{}]*))?\}/g, function (m, key, prop, a, b) {
      const k = key.charAt(0).toLowerCase() + key.slice(1);
      const C = key !== k;
      let out;
      if (k === 'e') out = L.gx('', 'e', me.sex);
      else if (k === 'prenom') out = '<b>' + L.esc(me.first) + '</b>';
      else if (k === 'nom') out = L.esc(me.last);
      else if (k === 'ville') out = L.esc(c.life ? c.life.city : '');
      else if (k === 'an') out = String(c.life ? c.life.year : '');
      else if (c.v && Object.prototype.hasOwnProperty.call(c.v, k)) out = String(c.v[k]);
      else {
        const p = c.r && c.r[k];
        if (!p) return '';
        if (a !== undefined) out = p.sex === 'F' ? b : a;
        else if (prop === 'n') out = '<b>' + L.esc(p.first) + '</b>';
        else if (prop === 'il') out = p.sex === 'F' ? 'elle' : 'il';
        else if (prop === 'e') out = p.sex === 'F' ? 'e' : '';
        else if (prop === 'lien') out = L.lien(p);
        else if (prop === 'full') out = '<b>' + L.esc(p.first + ' ' + p.last) + '</b>';
        else { const li = L.lien(p); out = (li ? li + ' ' : '') + '<b>' + L.esc(p.first) + '</b>'; }
      }
      return C ? L.capHtml(out) : out;
    });
    return L.capHtml(s.trim());
  };

  // ---------- DOM ----------
  L.$ = function (sel, root) { return (root || document).querySelector(sel); };
  L.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
})(window.LP);
