/* LifePPF — assemblage des portraits dessinés à la main (art/perso/*.png) : calques empilés, peau et cheveux teintés selon la génétique. */
(function (L) {
  'use strict';
  const P = L.ART = { on: false, ready: false, loading: false, cat: {}, img: {}, parts: [] };
  // ordre d'empilement, du fond vers le devant
  P.ORDER = ['cheveux-arriere', 'corps', 'cou', 'visage', 'yeux', 'sourcils', 'nez', 'bouche', 'barbe', 'rides', 'cheveux-avant', 'lunettes'];
  P.NAMES = { 'cheveux-arriere': 'Cheveux arrière', corps: 'Corps', cou: 'Cou', visage: 'Visage', yeux: 'Yeux', sourcils: 'Sourcils', nez: 'Nez', bouche: 'Bouche', barbe: 'Barbe', rides: 'Rides', 'cheveux-avant': 'Cheveux avant', lunettes: 'Lunettes' };
  // les calques « fond » gris de ces parties prennent la couleur de la peau ou des cheveux
  const TINT = { visage: 'skin', cou: 'skin', 'cheveux-avant': 'hair', 'cheveux-arriere': 'hair', sourcils: 'hair', barbe: 'hair' };
  const BASE_GRAY = 208; // gris de référence du remplissage (#D0D0D0)
  let base = 'art/perso/';
  const cache = {}, tinted = {};
  let cacheN = 0;

  // « visage-fond-01 », « visage-01-fond », « bouche-contente-01 », « cou », « rides »…
  function parse(file) {
    const t = file.replace(/\.png$/i, '').toLowerCase().split('-');
    let num = 1, fond = false;
    if (/^\d+$/.test(t[t.length - 1])) num = parseInt(t.pop(), 10);
    const fi = t.indexOf('fond');
    if (fi >= 0) { fond = true; t.splice(fi, 1); }
    let part = t.join('-'), mood = '';
    if (t[0] === 'bouche') { part = 'bouche'; mood = t.slice(1).join('-') || 'neutre'; }
    return { part: part, mood: mood, num: num, fond: fond };
  }
  P.setup = function (manifest) {
    P.cat = {};
    if (!manifest || !manifest.files) return;
    base = manifest.base || base;
    manifest.files.forEach(function (f) {
      const x = parse(f);
      const c = P.cat[x.part] || (P.cat[x.part] = { nums: [], v: {} });
      if (c.nums.indexOf(x.num) < 0) c.nums.push(x.num);
      const v = c.v[x.num] || (c.v[x.num] = { moods: {} });
      const slot = x.part === 'bouche' ? (v.moods[x.mood] || (v.moods[x.mood] = {})) : v;
      slot[x.fond ? 'fond' : 'trait'] = base + f + '?v=' + (manifest.v || 1);
    });
    Object.keys(P.cat).forEach(function (k) { P.cat[k].nums.sort(function (a, b) { return a - b; }); });
    P.parts = P.ORDER.filter(function (k) { return P.cat[k]; }).concat(Object.keys(P.cat).filter(function (k) { return P.ORDER.indexOf(k) < 0; }));
  };
  P.count = function (part) { return P.cat[part] ? P.cat[part].nums.length : 0; };
  P.has = function () { return !!P.cat.visage; };

  // chargement de toutes les images (une seule fois)
  P.preload = function (done) {
    if (P.ready) { if (done) done(); return; }
    const urls = [];
    Object.keys(P.cat).forEach(function (k) {
      Object.keys(P.cat[k].v).forEach(function (n) {
        const v = P.cat[k].v[n];
        [v.trait, v.fond].forEach(function (u) { if (u) urls.push(u); });
        Object.keys(v.moods).forEach(function (m) { [v.moods[m].trait, v.moods[m].fond].forEach(function (u) { if (u) urls.push(u); }); });
      });
    });
    P.waiters = (P.waiters || []).concat(done ? [done] : []);
    if (P.loading) return;
    P.loading = true;
    let left = urls.length;
    const fin = function () { P.ready = true; P.loading = false; const w = P.waiters; P.waiters = []; w.forEach(function (f) { try { f(); } catch (e) { console.error(e); } }); };
    if (!left) return fin();
    urls.forEach(function (u) {
      const im = new Image();
      im.onload = im.onerror = function () { if (im.naturalWidth) P.img[u] = im; if (--left === 0) fin(); };
      im.src = u;
    });
  };

  function hx(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  // remplissage gris → couleur : le gris de base devient la couleur, plus foncé = ombre, plus clair = reflet
  function tint(u, color, S) {
    const k = u + color + S;
    if (tinted[k]) return tinted[k];
    const im = P.img[u];
    if (!im) return null;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    g.drawImage(im, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S), px = d.data, rgb = hx(color);
    for (let i = 0; i < px.length; i += 4) {
      if (!px[i + 3]) continue;
      const l = (px[i] + px[i + 1] + px[i + 2]) / 3 / BASE_GRAY;
      const hl = l > 1 ? (l - 1) * 2.2 : 0;
      for (let j = 0; j < 3; j++) px[i + j] = Math.min(255, rgb[j] * Math.min(l, 1) + (255 - rgb[j]) * hl);
    }
    g.putImageData(d, 0, 0);
    tinted[k] = cv;
    return cv;
  }

  function h32(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pickNum(part, r) { const c = P.cat[part]; return c && c.nums.length ? c.nums[Math.abs(r) % c.nums.length] : null; }
  function mix(a, b, t) { const x = hx(a), y = hx(b); return '#' + x.map(function (v, i) { const n = Math.round(v + (y[i] - v) * t); return (n < 16 ? '0' : '') + n.toString(16); }).join(''); }

  // choix des calques pour une personne (o.pick force un numéro, null = aucun)
  P.choose = function (o) {
    const look = o.look || {}, g = look.g || {}, seed = o.seed || 0;
    const r = function (k, salt) { return g[k] != null ? g[k] : h32(seed + salt); };
    const age = o.age == null ? 30 : o.age, sex = o.sex;
    const out = {
      'cheveux-arriere': pickNum('cheveux-arriere', r('h', 'h')),
      corps: pickNum('corps', r('b', 'b')),
      cou: pickNum('cou', 0),
      visage: pickNum('visage', r('f', 'f')),
      yeux: pickNum('yeux', r('e', 'e')),
      sourcils: pickNum('sourcils', r('s', 's')),
      nez: pickNum('nez', r('n', 'n')),
      bouche: pickNum('bouche', r('m', 'm')),
      barbe: sex === 'M' && age >= 18 && look.fr ? pickNum('barbe', r('br', 'br')) : null,
      rides: age >= 60 ? pickNum('rides', 0) : null,
      'cheveux-avant': pickNum('cheveux-avant', r('h', 'h')),
      lunettes: look.gl || (age >= 55 && look.eye === 2) ? pickNum('lunettes', r('l', 'l')) : null
    };
    // calvitie : comme les portraits en code
    if (sex === 'M' && age >= 52 && (look.hs === 0 || look.hs === 4)) { out['cheveux-avant'] = null; out['cheveux-arriere'] = null; }
    if (o.pick) Object.keys(o.pick).forEach(function (k) { if (o.pick[k] !== undefined) out[k] = o.pick[k]; });
    return out;
  };
  function moodKey(mood) { return mood < 35 ? ['triste', 'neutre', 'contente'] : mood > 62 ? ['contente', 'neutre', 'triste'] : ['neutre', 'contente', 'triste']; }
  function colors(o) {
    const look = o.look || {}, age = o.age || 0;
    let hair = o.hair || look.hair || '#3b2416', skin = o.skin || look.skin || '#e8b48a';
    if (!o.hair) { if (age >= 75) hair = '#ecebe6'; else if (age >= 58) hair = '#b3b0aa'; else if (age >= 46) hair = mix(hair, '#b3b0aa', 0.35); }
    if (o.sick) skin = mix(skin, '#a6d48f', 0.35);
    if (o.dead) skin = mix(skin, '#9a98a2', 0.5);
    return { skin: skin, hair: hair };
  }
  // dessine le portrait dans une image (renvoie une adresse data: réutilisable)
  P.render = function (o, S) {
    S = S || 192;
    const ch = P.choose(o), col = colors(o);
    const key = JSON.stringify([ch, col, Math.round((o.mood == null ? 55 : o.mood) / 10), S]);
    if (cache[key]) return cache[key];
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    P.ORDER.forEach(function (part) {
      const n = ch[part];
      if (n == null || !P.cat[part] || !P.cat[part].v[n]) return;
      let v = P.cat[part].v[n];
      if (part === 'bouche') { const ms = moodKey(o.mood == null ? 55 : o.mood); const m = ms.find(function (k) { return v.moods[k]; }) || Object.keys(v.moods)[0]; v = v.moods[m] || {}; }
      if (v.fond) {
        const t = TINT[part];
        const c = t ? tint(v.fond, col[t], S) : null;
        if (c) g.drawImage(c, 0, 0); else if (P.img[v.fond]) g.drawImage(P.img[v.fond], 0, 0, S, S);
      }
      if (v.trait && P.img[v.trait]) g.drawImage(P.img[v.trait], 0, 0, S, S);
    });
    const url = cv.toDataURL('image/png');
    if (++cacheN > 400) { Object.keys(cache).forEach(function (k) { delete cache[k]; }); cacheN = 0; }
    cache[key] = url;
    return url;
  };
  // utilisable dans la partie ? (activé dans l'atelier dev, dessins chargés, et pas pour les petits tant qu'il n'y a pas de version enfant)
  P.usable = function (o) { return P.on && P.ready && P.has() && !o.sp && (o.age == null || o.age >= (P.cat['visage-enfant'] ? 3 : 12)); };

  P.setup(window.LP_ART);
})(window.LP);
