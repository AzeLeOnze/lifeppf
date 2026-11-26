/* LifePPF — interface : écrans, portraits, journal, panneaux, modales, notifications. */
(function (L) {
  'use strict';
  const D = L.D, G = L.G, A = L.A;
  const UI = L.UI = {};
  const $ = L.$, esc = L.esc, clamp = L.clamp;
  const S = UI.state = { scr: 'title', tab: 'moi', sheet: false, view: null, jLife: null, cf: null, layer: '', iv: null, confirm: null, scroll: {} };

  // ---------- icônes ----------
  const IC = {
    moi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.6 4.2-7 8-7s7 2.4 8 7"/></svg>',
    proches: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="8.5" cy="9" r="3.3"/><circle cx="16.5" cy="10" r="2.7"/><path d="M2.5 20c.8-3.8 3.2-5.8 6-5.8s5.2 2 6 5.8M15 14.6c2.8-.4 5.2 1.3 6.2 5.4"/></svg>',
    carriere: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><rect x="3" y="7.5" width="18" height="12.5"/><path d="M9 7.5V4.5h6v3M3 13h18"/></svg>',
    biens: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7v9h-17z"/><path d="M9.5 20v-5.5h5V20"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
    dice: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"/><g fill="currentColor"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="16" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="8" cy="16" r="1.7"/></g></svg>'
  };

  // ---------- portraits (SVG dessinés en code) ----------
  function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function hx(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function mix(a, b, t) { const x = hx(a), y = hx(b); return '#' + x.map(function (v, i) { const n = Math.round(v + (y[i] - v) * t); return (n < 16 ? '0' : '') + n.toString(16); }).join(''); }
  const INKS = ['c', 'm', 'y', 'g', 'b'];
  const SHIRTS = ['#00e1ff', '#ff2d93', '#ffe600', '#5ff08c', '#8a7dff', '#f3f1ea', '#ff5a36', '#1d1d24'];
  const K = '#0b0b0d';
  function hairFront(hs, cx, cy, rx, ry, col) {
    const top = cy - ry;
    const s = ' fill="' + col + '" stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"';
    switch (hs) {
      case 1: return '<path d="M' + (cx - rx - 2) + ' ' + (cy + 4) + ' C' + (cx - rx - 4) + ' ' + (top - 12) + ' ' + (cx + rx + 4) + ' ' + (top - 12) + ' ' + (cx + rx + 2) + ' ' + (cy + 4) + ' C' + (cx + rx - 5) + ' ' + (top + 8) + ' ' + (cx - 2) + ' ' + (top + 14) + ' ' + (cx - rx - 2) + ' ' + (cy + 4) + 'Z"' + s + '/>';
      case 2: {
        let o = '';
        for (let i = 0; i <= 7; i++) { const a = Math.PI * (1.05 + i * 0.9 / 7); o += '<circle cx="' + (cx + Math.cos(a) * (rx + 1)).toFixed(1) + '" cy="' + (cy - 3 + Math.sin(a) * (ry + 1)).toFixed(1) + '" r="7.5"' + s + '/>'; }
        return o;
      }
      case 3: return '<circle cx="' + cx + '" cy="' + (top - 6) + '" r="8"' + s + '/><path d="M' + (cx - rx - 1) + ' ' + (cy - 2) + ' C' + (cx - rx - 2) + ' ' + (top - 8) + ' ' + (cx + rx + 2) + ' ' + (top - 8) + ' ' + (cx + rx + 1) + ' ' + (cy - 2) + ' C' + (cx + rx - 6) + ' ' + (top + 5) + ' ' + (cx - rx + 6) + ' ' + (top + 5) + ' ' + (cx - rx - 1) + ' ' + (cy - 2) + 'Z"' + s + '/>';
      case 4: {
        let d = 'M' + (cx - rx) + ' ' + (cy - 4);
        for (let i = 0; i <= 6; i++) { const x = cx - rx + (2 * rx) * i / 6; d += ' L' + (x - rx / 7).toFixed(1) + ' ' + (top + 4) + ' L' + x.toFixed(1) + ' ' + (top - 10 - (i % 2) * 4); }
        return '<path d="' + d + ' L' + (cx + rx) + ' ' + (cy - 4) + ' Q' + cx + ' ' + (top + 9) + ' ' + (cx - rx) + ' ' + (cy - 4) + 'Z"' + s + '/>';
      }
      case 5: return '<path d="M' + (cx - rx - 1) + ' ' + (cy + 2) + ' C' + (cx - rx - 5) + ' ' + (top - 12) + ' ' + (cx + rx + 7) + ' ' + (top - 8) + ' ' + (cx + rx + 1) + ' ' + (cy + 4) + ' C' + (cx + rx - 4) + ' ' + (top + 9) + ' ' + (cx - 3) + ' ' + (top + 15) + ' ' + (cx - rx - 1) + ' ' + (cy + 2) + 'Z"' + s + '/>';
      default: return '<path d="M' + (cx - rx - 1) + ' ' + (cy - 2) + ' C' + (cx - rx - 2) + ' ' + (top - 9) + ' ' + (cx + rx + 2) + ' ' + (top - 9) + ' ' + (cx + rx + 1) + ' ' + (cy - 2) + ' C' + (cx + rx - 6) + ' ' + (top + 4) + ' ' + (cx - rx + 8) + ' ' + (top + 3) + ' ' + (cx - rx - 1) + ' ' + (cy - 2) + 'Z"' + s + '/>';
    }
  }
  function human(o) {
    const look = o.look || D.look(), age = o.age || 0, sex = o.sex, mood = o.mood == null ? 55 : o.mood;
    const baby = age < 3, kid = age < 12;
    let hair = look.hair;
    if (age >= 75) hair = '#ecebe6'; else if (age >= 58) hair = '#b3b0aa'; else if (age >= 46) hair = mix(hair, '#b3b0aa', 0.35);
    let skin = look.skin;
    if (o.sick) skin = mix(skin, '#a6d48f', 0.35);
    if (o.dead) skin = mix(skin, '#9a98a2', 0.5);
    const cx = 50, cy = baby ? 56 : 50, rx = baby ? 25 : kid ? 23 : 22, ry = baby ? 23 : kid ? 25 : 27;
    const shirt = SHIRTS[(o.seed || 0) % SHIRTS.length];
    const sw = 2.4, out = [];
    const hs = look.hs;
    const bald = !kid && sex === 'M' && age >= 52 && (hs === 0 || hs === 4);
    out.push('<path d="M10 104 Q14 ' + (cy + ry + 4) + ' 50 ' + (cy + ry) + ' Q86 ' + (cy + ry + 4) + ' 90 104Z" fill="' + shirt + '" stroke="' + K + '" stroke-width="' + sw + '"/>');
    out.push('<rect x="44" y="' + (cy + ry - 9) + '" width="12" height="12" fill="' + skin + '" stroke="' + K + '" stroke-width="' + sw + '"/>');
    if (!baby && (hs === 1 || (hs === 3 && sex === 'F'))) out.push('<path d="M' + (cx - rx - 4) + ' ' + (cy - 6) + ' Q' + (cx - rx - 8) + ' ' + (cy + ry + 8) + ' ' + (cx - rx + 4) + ' ' + (cy + ry + 10) + ' L' + (cx + rx - 4) + ' ' + (cy + ry + 10) + ' Q' + (cx + rx + 8) + ' ' + (cy + ry + 8) + ' ' + (cx + rx + 4) + ' ' + (cy - 6) + 'Z" fill="' + hair + '" stroke="' + K + '" stroke-width="' + sw + '"/>');
    out.push('<circle cx="' + (cx - rx) + '" cy="' + (cy + 3) + '" r="5" fill="' + skin + '" stroke="' + K + '" stroke-width="' + sw + '"/><circle cx="' + (cx + rx) + '" cy="' + (cy + 3) + '" r="5" fill="' + skin + '" stroke="' + K + '" stroke-width="' + sw + '"/>');
    out.push('<ellipse cx="' + (cx - 2.5) + '" cy="' + (cy - 2) + '" rx="' + rx + '" ry="' + ry + '" fill="none" stroke="#00e1ff" stroke-width="2.2"/>');
    out.push('<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + skin + '" stroke="' + K + '" stroke-width="' + sw + '"/>');
    if (baby) out.push('<path d="M' + (cx - 3) + ' ' + (cy - ry + 2) + ' q2 -10 9 -7 q-7 1 -5 8" fill="none" stroke="' + hair + '" stroke-width="3.2" stroke-linecap="round"/>');
    else if (bald) out.push('<path d="M' + (cx - rx + 1) + ' ' + (cy - 2) + ' q2 -8 7 -10 M' + (cx + rx - 1) + ' ' + (cy - 2) + ' q-2 -8 -7 -10" fill="none" stroke="' + hair + '" stroke-width="4" stroke-linecap="round"/>');
    else out.push(hairFront(hs, cx, cy, rx, ry, hair));
    // barbe
    if (sex === 'M' && age >= 18 && look.fr) out.push('<path d="M' + (cx - rx + 3) + ' ' + (cy + 7) + ' Q' + cx + ' ' + (cy + ry + 9) + ' ' + (cx + rx - 3) + ' ' + (cy + 7) + ' Q' + cx + ' ' + (cy + ry - 3) + ' ' + (cx - rx + 3) + ' ' + (cy + 7) + 'Z" fill="' + hair + '" stroke="' + K + '" stroke-width="1.8"/>');
    const ey = cy + 1, dx = rx * 0.42;
    if (o.dead) out.push('<path d="M' + (cx - dx - 3) + ' ' + (ey - 3) + 'l6 6m0-6l-6 6M' + (cx + dx - 3) + ' ' + (ey - 3) + 'l6 6m0-6l-6 6" stroke="' + K + '" stroke-width="2.2"/>');
    else out.push('<ellipse cx="' + (cx - dx) + '" cy="' + ey + '" rx="2.6" ry="' + (baby ? 3.3 : 2.9) + '" fill="' + K + '"/><ellipse cx="' + (cx + dx) + '" cy="' + ey + '" rx="2.6" ry="' + (baby ? 3.3 : 2.9) + '" fill="' + K + '"/>');
    if (!baby) {
      const bt = mood < 30 ? 2.6 : mood > 72 ? -1.2 : 0;
      out.push('<path d="M' + (cx - dx - 5) + ' ' + (ey - 7 + bt * 0.3) + ' L' + (cx - dx + 4) + ' ' + (ey - 7 - bt) + ' M' + (cx + dx + 5) + ' ' + (ey - 7 + bt * 0.3) + ' L' + (cx + dx - 4) + ' ' + (ey - 7 - bt) + '" stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"/>');
    }
    const my = cy + ry * 0.5;
    if (baby && !o.dead) out.push('<ellipse cx="' + cx + '" cy="' + (my - 1) + '" rx="3.5" ry="2.8" fill="' + K + '"/>');
    else { const cv = clamp((mood - 50) / 50 * 6, -6, 6); out.push('<path d="M' + (cx - 7) + ' ' + my + ' Q' + cx + ' ' + (my + cv) + ' ' + (cx + 7) + ' ' + my + '" fill="none" stroke="' + K + '" stroke-width="' + sw + '" stroke-linecap="round"/>'); }
    if (!o.dead) out.push('<circle cx="' + (cx - rx * 0.6) + '" cy="' + (my - 4) + '" r="4" fill="#ff2d93" opacity=".35"/><circle cx="' + (cx + rx * 0.6) + '" cy="' + (my - 4) + '" r="4" fill="#ff2d93" opacity=".35"/>');
    if (age >= 62) out.push('<path d="M' + (cx - dx - 9) + ' ' + (ey + 2) + ' l-3 2 M' + (cx + dx + 9) + ' ' + (ey + 2) + ' l3 2 M' + (cx - 8) + ' ' + (cy - ry + 12) + ' h16" stroke="' + K + '" stroke-width="1.4" opacity=".6"/>');
    if (look.gl || (age >= 55 && look.eye === 2)) out.push('<g fill="none" stroke="' + K + '" stroke-width="2"><circle cx="' + (cx - dx) + '" cy="' + ey + '" r="6"/><circle cx="' + (cx + dx) + '" cy="' + ey + '" r="6"/><path d="M' + (cx - dx + 6) + ' ' + ey + 'h' + (2 * dx - 12) + '"/></g>');
    return out.join('');
  }
  function animal(sp, seed) {
    const furs = ['#d9a441', '#6a3e1f', '#2a2a2a', '#efd37a', '#b8b2a7', '#f3f1ea', '#c8682c'];
    const f = furs[seed % furs.length];
    const s = ' stroke="' + K + '" stroke-width="2.4" stroke-linejoin="round"';
    const eyes = '<circle cx="41" cy="52" r="3" fill="' + K + '"/><circle cx="59" cy="52" r="3" fill="' + K + '"/>';
    switch (sp) {
      case 'chat': return '<path d="M28 44 L30 18 L46 32Z M72 44 L70 18 L54 32Z" fill="' + f + '"' + s + '/><ellipse cx="50" cy="56" rx="26" ry="23" fill="' + f + '"' + s + '/>' + eyes + '<path d="M47 61 h6 l-3 3z" fill="#ff2d93"/><path d="M30 60h-14M30 64l-13 4M70 60h14M70 64l13 4" stroke="' + K + '" stroke-width="1.6"/>';
      case 'chien': case 'robochien': {
        const c = sp === 'robochien' ? '#9aa3ad' : f;
        return (sp === 'robochien' ? '<path d="M50 26V14" stroke="' + K + '" stroke-width="2.4"/><circle cx="50" cy="12" r="4" fill="#ff2d93"' + s + '/><rect x="25" y="28" width="50" height="48" fill="' + c + '"' + s + '/>' : '<ellipse cx="50" cy="54" rx="25" ry="25" fill="' + c + '"' + s + '/>') + '<ellipse cx="25" cy="52" rx="8" ry="17" fill="' + mix(c, '#000000', 0.3) + '"' + s + '/><ellipse cx="75" cy="52" rx="8" ry="17" fill="' + mix(c, '#000000', 0.3) + '"' + s + '/>' + (sp === 'robochien' ? '<rect x="37" y="47" width="8" height="6" fill="#00e1ff"/><rect x="55" y="47" width="8" height="6" fill="#00e1ff"/>' : eyes) + '<ellipse cx="50" cy="64" rx="6" ry="4.5" fill="' + K + '"/><path d="M50 69v6" stroke="' + K + '" stroke-width="2"/>';
      }
      case 'lapin': return '<ellipse cx="40" cy="24" rx="7" ry="20" fill="' + f + '"' + s + '/><ellipse cx="60" cy="24" rx="7" ry="20" fill="' + f + '"' + s + '/><ellipse cx="50" cy="60" rx="24" ry="22" fill="' + f + '"' + s + '/>' + eyes.replace(/cy="52"/g, 'cy="56"') + '<path d="M46 66h8l-4 3z" fill="#ff2d93"/>';
      case 'hamster': return '<circle cx="31" cy="36" r="7" fill="' + f + '"' + s + '/><circle cx="69" cy="36" r="7" fill="' + f + '"' + s + '/><ellipse cx="50" cy="58" rx="29" ry="25" fill="' + f + '"' + s + '/>' + eyes + '<circle cx="33" cy="64" r="7" fill="#ff2d93" opacity=".35"/><circle cx="67" cy="64" r="7" fill="#ff2d93" opacity=".35"/>';
      case 'poisson': return '<path d="M74 52 L92 36 L92 68Z" fill="#ff5a36"' + s + '/><ellipse cx="48" cy="52" rx="30" ry="20" fill="#ff8c2e"' + s + '/><circle cx="34" cy="48" r="3.5" fill="' + K + '"/><path d="M50 40q6 12 0 24" fill="none" stroke="' + K + '" stroke-width="1.8"/>';
      case 'perroquet': return '<ellipse cx="50" cy="56" rx="24" ry="26" fill="#5ff08c"' + s + '/><path d="M50 24 q8 -10 14 -4" fill="none" stroke="#ff2d93" stroke-width="5" stroke-linecap="round"/><circle cx="42" cy="50" r="3" fill="' + K + '"/><path d="M52 54 q16 2 10 16 q-6 -6 -12 -6z" fill="#ffe600"' + s + '/>';
      case 'tortue': return '<ellipse cx="50" cy="66" rx="34" ry="16" fill="#3f7d4b"' + s + '/><path d="M30 60 q20 -30 40 0" fill="#5ff08c"' + s + '/><circle cx="82" cy="58" r="9" fill="#a6d48f"' + s + '/><circle cx="84" cy="56" r="2" fill="' + K + '"/>';
      default: return '<circle cx="50" cy="55" r="25" fill="' + f + '"' + s + '/>' + eyes;
    }
  }
  UI.face = function (o) {
    const ART = L.ART;
    if (ART && ART.usable(o)) return '<img class="artface" alt="" src="' + ART.render(o) + '">';
    if (ART && ART.on && !ART.ready && !ART.loading && ART.has()) ART.preload(function () { UI.refresh(); });
    const inner = o.sp ? animal(o.sp, o.seed || 0) : human(o);
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + inner + '</svg>';
  };
  UI.pic = function (p, cls) {
    const seed = hash((p.first || '') + (p.id || 0) + (p.last || ''));
    const o = p.rel === 'pet' ? { sp: p.sp, seed: seed } : { look: p.look, age: p.age, sex: p.sex, mood: p.rq != null ? p.rq : 55, dead: !p.alive, seed: seed };
    return '<div class="pic ink-' + INKS[seed % INKS.length] + (cls ? ' ' + cls : '') + '">' + UI.face(o) + '</div>';
  };
  function mePic() {
    const l = G.L();
    return '<div class="pic ink-y">' + UI.face({ look: l.me.look, age: l.me.age, sex: l.me.sex, mood: l.st.b, sick: l.st.h < 20, dead: !!l.dead, seed: hash(l.me.first + l.me.last) }) + '</div>';
  }

  // ---------- petits morceaux ----------
  const SN = { h: 'Santé', b: 'Bonheur', c: 'Charisme', s: 'Social' };
  function sign(v) { return (v > 0 ? '+' : '−') + Math.abs(v); }
  function chips(d) {
    if (!d) return '';
    let o = '';
    ['h', 'b', 'c', 's'].forEach(function (k) { if (d[k]) o += '<span class="chip s-' + k + (d[k] < 0 ? ' neg' : '') + '">' + SN[k] + ' ' + sign(d[k]) + '</span>'; });
    if (d.m) o += '<span class="chip s-m' + (d.m < 0 ? ' neg' : '') + '">' + (d.m > 0 ? '+' : '−') + L.money(Math.abs(d.m)) + '</span>';
    if (d.sk) Object.keys(d.sk).forEach(function (k) { o += '<span class="chip s-sk">' + esc(D.skillName(k)) + ' ' + sign(d.sk[k]) + '</span>'; });
    if (d.rq) d.rq.forEach(function (x) { o += '<span class="chip s-rq' + (x[1] < 0 ? ' neg' : '') + '">' + esc(x[0]) + ' ' + sign(x[1]) + '</span>'; });
    return o ? '<div class="chips">' + o + '</div>' : '';
  }
  function ageTxt(a) { return a === 0 ? 'nouveau-né' : a === 1 ? '1 an' : a + ' ans'; }
  function sec(title, body, ink) { return body ? '<section class="sec ink-' + (ink || 'y') + '"><h3>' + title + '</h3>' + body + '</section>' : ''; }
  function skLevel(v) { return v >= 80 ? 'Expert' : v >= 60 ? 'Très bon' : v >= 40 ? 'Bon' : v >= 20 ? 'Correct' : 'Débutant'; }
  const CATN = { petit: 'Petit boulot', metier: 'Métier', diplome: 'Métier diplômé', star: 'Métier exposé' };
  function save() { G.saveLocal(); if (L.Sync) L.Sync.changed(); }

  // ---------- calque des modales ----------
  function openLayer(html, kind) {
    const ly = $('#layer');
    ly.innerHTML = html;
    ly.classList.add('on');
    S.layer = kind || 'free';
    const f = ly.querySelector('.modal');
    if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
  }
  function closeLayer() { const ly = $('#layer'); ly.classList.remove('on'); ly.innerHTML = ''; S.layer = ''; }
  UI.closeLayer = closeLayer;

  // ---------- notifications ----------
  function toast(title, html, d, cls) {
    const box = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast' + (cls ? ' ' + cls : '');
    el.innerHTML = '<b class="tt">' + (title || '') + '</b><p>' + (html || '') + '</p>' + chips(d);
    let timer = null;
    function kill() { clearTimeout(timer); el.classList.add('out'); setTimeout(function () { el.remove(); }, 260); }
    el.addEventListener('click', kill);
    box.prepend(el);
    while (box.children.length > (window.innerWidth < 760 ? 2 : 3)) box.lastChild.remove();
    timer = setTimeout(kill, cls === 'lvl' || cls === 'ach' ? 5200 : 4300);
    sfx({ good: 'good', big: 'good', bad: 'bad', love: 'love', money: 'money', ach: 'ach', lvl: 'lvl' }[cls]);
  }
  function sfx(n) { if (n && L.SND) L.SND.play(n); }
  function moodOf(a) { return a < 13 ? 'kid' : a < 60 ? 'adult' : 'old'; }
  const SLOW = function () { return !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  UI.toast = toast;
  function notes() {
    G.takeNotes().forEach(function (n) {
      if (n.k === 'lvl') toast('Niveau de compte ' + n.lvl + ' !', n.rw.length ? 'Débloqué : <b>' + n.rw.map(function (r) { return esc(r.n); }).join(', ') + '</b>' : 'Nouveau titre : ' + esc(D.title(n.lvl)), null, 'lvl');
      else if (n.k === 'ach') toast('Succès débloqué', '<b>' + esc(n.a.n) + '</b> · +' + n.a.xp + ' XP', null, 'ach');
    });
  }

  // ---------- écrans ----------
  function show(scr) {
    S.scr = scr;
    ['Title', 'Create', 'Game', 'Dead'].forEach(function (n) { $('#s' + n).hidden = n.toLowerCase() !== scr; });
  }
  const CBAR = '<div class="cbar" aria-hidden="true">' + '<i></i>'.repeat(10) + '</div>';

  UI.title = function () {
    closeLayer();
    const l = G.L(), a = G.A();
    let cont = '';
    if (l && !l.dead) cont = '<button class="btn" data-a="continue">Continuer<small>' + esc(l.me.first) + ' ' + esc(l.me.last) + ', ' + ageTxt(l.me.age) + '</small></button>';
    else if (l && l.dead) cont = '<button class="btn" data-a="continue">Avis de décès<small>' + esc(l.me.first) + ' ' + esc(l.me.last) + '</small></button>';
    $('#sTitle').innerHTML = CBAR + '<div class="tWrap"><div class="halfField"></div><div class="halfField c2"></div>' +
      '<h1 class="logo" aria-label="LifePPF"><span class="lw">LIFE</span><span class="lp"><i class="i1">P</i><i class="i2">P</i><i class="i3">F</i></span></h1>' +
      '<p class="tag"><span class="t1">Past</span><span class="t2">Present</span><span class="t3">Futur</span></p>' +
      '<p class="pitch">Une vie entière, une année à la fois. Tes choix d’enfant forgent ton caractère, et ton caractère écrit la suite.</p>' +
      '<div class="tBtns">' + cont + '<button class="btn' + (cont ? ' ghost' : '') + '" data-a="new">Nouvelle vie</button><button class="btn ghost" data-a="account">Compte<small>niveau ' + a.lvl + '</small></button></div>' +
      '<p class="credit">' + esc(L.CREDIT) + ' · <button class="vtap" data-a="devtap">v' + L.VERSION + '</button></p></div>';
    show('title');
  };

  // ---------- création ----------
  function nowYear() { return new Date().getFullYear(); }
  function yearRange() { const n = nowYear(); return [G.has('passe') ? 1950 : n, G.has('futur') ? 2100 : n]; }
  function newForm() {
    const sex = L.pick(['M', 'F']);
    return { first: D.firstName(sex, nowYear()), last: L.pick(D.LAST), sex: sex, city: L.pick(D.CITIES).n, year: nowYear(), skill: '', trait: '', wealth: '', fam: null, num: L.ri(1000, 9999) };
  }
  function famHtml(f) {
    if (!G.has('reroll')) return '';
    if (!f.fam) f.fam = G.rollFamily(f.year, G.has('richesse') && f.wealth ? f.wealth : null);
    const m = f.fam;
    const sibs = m.sibs.length ? m.sibs.map(function (s) { return esc(s.first) + ' (' + s.age + ')'; }).join(', ') : 'aucun';
    return '<div class="famBox"><h3>Ta future famille</h3><p>Mère : <b>' + esc(m.mom.first) + '</b>, ' + m.mom.age + ' ans, ' + esc(G.jobLabel(m.mom.job, 'F')) + '</p><p>Père : <b>' + esc(m.dad.first) + '</b>, ' + m.dad.age + ' ans, ' + esc(G.jobLabel(m.dad.job, 'M')) + '</p><p>Frères et sœurs : ' + sibs + '</p><p>Famille ' + esc(D.wealth(m.wealth).n) + '</p><button type="button" class="btn small" data-a="reroll" style="margin-top:8px">Relancer la famille</button></div>';
  }
  UI.create = function () {
    closeLayer();
    const f = S.cf || (S.cf = newForm());
    const r = yearRange();
    const yearField = r[0] === r[1] ? '<span><b>' + r[0] + '</b></span>' : '<input id="fYear" type="number" min="' + r[0] + '" max="' + r[1] + '" value="' + f.year + '" inputmode="numeric">';
    const locks = [!G.has('passe') && 'Passé (1950–2025) : niveau 3', !G.has('futur') && 'Futur (2027–2100) : niveau 5'].filter(Boolean).join(' · ');
    const cities = D.CITIES.slice().sort(function (a, b) { return a.n.localeCompare(b.n, 'fr'); }).map(function (c) { return '<option value="' + esc(c.n) + '"' + (c.n === f.city ? ' selected' : '') + '>' + esc(c.n) + ' · ' + D.SIZE[c.size].n + '</option>'; }).join('');
    const sexBtn = function (v, t) { return '<button type="button" data-a="sex" data-v="' + v + '" aria-pressed="' + (f.sex === v) + '">' + t + '</button>'; };
    let bonus = '';
    if (G.has('don')) bonus += '<label class="fld"><span>Don naturel</span><select id="fSkill"><option value="">Aucun</option>' + D.SKILLS.map(function (s) { return '<option value="' + s.id + '"' + (f.skill === s.id ? ' selected' : '') + '>' + esc(s.n) + ' (+15)</option>'; }).join('') + '</select></label>';
    if (G.has('temperament')) bonus += '<label class="fld"><span>Tempérament</span><select id="fTrait"><option value="">Au hasard de la vie</option>' + D.TRAIT_IDS.map(function (t) { return '<option value="' + t + '"' + (f.trait === t ? ' selected' : '') + '>' + esc(L.gs(D.TRAITS[t].n, f.sex)) + '</option>'; }).join('') + '</select></label>';
    if (G.has('richesse')) bonus += '<label class="fld"><span>Famille</span><select id="fWealth"><option value="">Au hasard</option>' + D.WEALTH.map(function (w) { return '<option value="' + w.id + '"' + (f.wealth === w.id ? ' selected' : '') + '>' + esc(L.cap(w.n)) + '</option>'; }).join('') + '</select></label>';
    $('#sCreate').innerHTML = '<div class="cWrap"><div class="cTop"><button class="back" data-a="home" aria-label="Retour">←</button>' + CBAR + '</div>' +
      '<form class="acte" id="cForm" onsubmit="return false"><span class="reg" style="top:10px;left:10px"></span><span class="reg" style="top:10px;right:10px"></span>' +
      '<div class="acteHead"><span class="rf">RÉPUBLIQUE FRANÇAISE · ÉTAT CIVIL</span><h2>Extrait d’acte de naissance</h2><span class="num">Acte n° ' + f.num + '/' + f.year + '</span></div>' +
      '<label class="fld"><span>Prénom</span><div class="row"><input id="fFirst" type="text" maxlength="24" autocomplete="off" value="' + esc(f.first) + '"><button type="button" class="dice" data-a="dice-first" aria-label="Prénom au hasard">' + IC.dice + '</button></div></label>' +
      '<label class="fld"><span>Nom</span><div class="row"><input id="fLast" type="text" maxlength="24" autocomplete="off" value="' + esc(f.last) + '"><button type="button" class="dice" data-a="dice-last" aria-label="Nom au hasard">' + IC.dice + '</button></div></label>' +
      '<fieldset class="fld"><legend>Genre</legend><div class="seg">' + sexBtn('M', 'Masculin') + sexBtn('F', 'Féminin') + sexBtn('X', 'Non-binaire') + '</div></fieldset>' +
      '<label class="fld"><span>Pays de naissance</span><select id="fCountry"><option>France</option><option disabled>Autres pays : bientôt</option></select></label>' +
      '<label class="fld"><span>Ville de naissance</span><select id="fCity">' + cities + '</select></label>' +
      '<div class="fld"><span>Année de naissance</span>' + yearField + (locks ? '<span class="note">' + locks + '</span>' : '') + '</div>' +
      bonus + famHtml(f) +
      '<div class="bornRow"><button type="button" class="btn born" data-a="born">Naître</button></div></form></div>';
    show('create');
  };
  function formInput(e) {
    const f = S.cf;
    if (!f) return;
    const t = e.target;
    if (t.id === 'fFirst') f.first = t.value;
    else if (t.id === 'fLast') f.last = t.value;
    else if (t.id === 'fCity') f.city = t.value;
    else if (t.id === 'fSkill') f.skill = t.value;
    else if (t.id === 'fTrait') f.trait = t.value;
    else if (t.id === 'fWealth') { f.wealth = t.value; f.fam = null; if (e.type === 'change') UI.create(); }
    else if (t.id === 'fYear') { f.year = parseInt(t.value, 10) || nowYear(); if (e.type === 'change') { const r = yearRange(); f.year = clamp(f.year, r[0], r[1]); f.fam = null; UI.create(); } }
  }

  // ---------- jeu ----------
  UI.enterGame = function () {
    closeLayer();
    show('game');
    if (L.SND && G.L()) L.SND.mood(moodOf(G.L().me.age));

    S.view = null; S.sheet = false; S.jLife = null;
    renderAll(true);
    UI.flush();
  };
  function renderAll(full) { renderTop(); renderSide(); renderJournal(full); renderPanel(); renderNav(); }
  UI.refresh = function () { if (S.scr === 'game' && G.L()) renderAll(false); };

  function renderTop() {
    const l = G.L(), a = G.A();
    const pct = Math.round(a.xp / G.xpNeed(a.lvl) * 100);
    $('#gTop').innerHTML = '<button class="mini-logo" data-a="home" aria-label="Écran titre">LIFE<i class="i1">P</i><i class="i2">P</i><i class="i3">F</i></button>' +
      '<span class="when"><b>' + l.year + '</b> · ' + ageTxt(l.me.age) + (l.gen > 1 ? ' · génération ' + l.gen : '') + '</span>' +
      '<div class="topR"><button class="lvChip" data-a="account" aria-label="Compte, niveau ' + a.lvl + '">Niv. ' + a.lvl + '<span class="xpm"><i style="width:' + pct + '%"></i></span></button><button class="iconBtn" data-a="menu" aria-label="Menu">' + IC.menu + '</button></div>';
  }
  function renderSide() {
    const l = G.L(), sex = l.me.sex;
    const stats = D.STATS.map(function (s) {
      const v = Math.round(l.st[s.k]);
      return '<div class="stat s-' + s.k + (v < 15 ? ' low' : '') + '"><span class="sl">' + s.n + '</span><b>' + v + '</b><div class="bar" role="meter" aria-label="' + s.n + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + v + '"><i style="width:' + v + '%"></i></div></div>';
    }).join('');
    const b = [];
    if (l.prison) b.push(['r', 'Prison · ' + l.prison + ' an' + (l.prison > 1 ? 's' : '')]);
    if (l.depr) b.push(['r', 'Dépression']);
    if (l.lonely) b.push(['b', 'Solitude profonde']);
    l.ill.forEach(function (i) { b.push(['g', D.ILLS[i.id].n]); });
    Object.keys(l.add).forEach(function (k) { b.push(['r', 'Accro : ' + G.ADD[k].toLowerCase()]); });
    if (l.chomage && !l.job) b.push(['y', 'Chômage']);
    if (l.casier) b.push(['b', 'Casier judiciaire']);
    const left = G.apLeft(), max = G.apMax();
    $('#gSide').innerHTML = mePic() +
      '<div class="who"><h2>' + esc(l.me.first) + ' <span>' + esc(l.me.last) + '</span></h2><p class="st">' + esc(G.status()) + ' · ' + ageTxt(l.me.age) + '</p></div>' +
      '<div class="money"><span>Argent</span><b class="' + (l.money < 0 ? 'neg' : '') + '">' + L.money(l.money) + '</b><em class="apc' + (left ? '' : ' out') + '" title="Actions restantes cette année"><b>' + left + '</b>/' + max + ' actions</em></div>' +
      '<div class="stats">' + stats + '</div>' +
      '<div class="badges">' + b.map(function (x) { return '<span class="badge ink-' + x[0] + '">' + esc(x[1]) + '</span>'; }).join('') + '</div>' +
      '<p class="side-extra">' + L.gx('Né', 'Née', sex) + ' à ' + esc(l.born) + (l.city !== l.born ? ' · vit à ' + esc(l.city) : '') + '<br>Famille ' + esc(D.wealth(l.wealth).n) + ' · ' + esc(D.home(l.home).n.toLowerCase()) + '</p>';
  }
  // dates du journal : jour de l'année → « 11 fév. »
  const MON = ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const MLEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function dayTxt(d) { let m = 0; while (m < 11 && d >= MLEN[m]) { d -= MLEN[m]; m++; } const n = d + 1; return (n === 1 ? '1er' : n) + ' ' + MON[m]; }
  function lineHtml(x, prev) {
    const dt = x.dt != null && (!prev || prev.dt !== x.dt) ? '<span class="dt">' + dayTxt(x.dt) + '</span>' : '';
    return '<li class="ln' + (x.k ? ' k-' + x.k : '') + '"><p>' + dt + x.t + '</p>' + chips(x.d) + '</li>';
  }
  function blockHtml(b, i, last) {
    const birth = i === 0 && b.a === 0;
    const age = birth ? '<b>' + L.gx('NÉ', 'NÉE', G.L().me.sex) + '</b>' : '<b>' + b.a + '</b><span>' + (b.a > 1 ? 'ans' : 'an') + '</span>';
    const lines = b.L.length ? b.L.map(function (x, j) { return lineHtml(x, b.L[j - 1]); }).join('') : '<li class="ln"><p class="empty">Une année tranquille. Rien à signaler.</p></li>';
    return '<article class="yb' + (last ? ' now' : '') + (birth ? ' birth' : '') + '"><div class="yAge">' + age + '<em>' + b.y + '</em></div><ul class="yL">' + lines + '</ul></article>';
  }
  function renderJournal(full) {
    const l = G.L(), list = $('#jList');
    const n0 = list.children.length;
    if (full || S.jLife !== l || n0 > l.log.length) {
      list.innerHTML = l.log.map(function (b, i) { return blockHtml(b, i, i === l.log.length - 1); }).join('');
      S.jLife = l;
    } else {
      if (n0 > 0) list.children[n0 - 1].outerHTML = blockHtml(l.log[n0 - 1], n0 - 1, n0 === l.log.length);
      for (let i = n0; i < l.log.length; i++) {
        if (i > 0 && list.children[i - 1]) list.children[i - 1].classList.remove('now');
        list.insertAdjacentHTML('beforeend', blockHtml(l.log[i], i, i === l.log.length - 1));
      }
    }
    const m = $('#gMain');
    const bottom = function () { m.scrollTop = m.scrollHeight; };
    bottom();
    requestAnimationFrame(bottom);
    setTimeout(bottom, 60);
  }
  function renderNav() {
    const btn = function (v, t) { return '<button class="nb' + (S.sheet && S.tab === v ? ' on' : '') + '" data-a="navtab" data-v="' + v + '">' + IC[v] + '<span>' + t + '</span></button>'; };
    const busy = !!G.pending();
    $('#gNav').innerHTML = btn('moi', 'Moi') + btn('proches', 'Proches') + '<button class="ageBtn" data-a="age" aria-label="Passer un an"' + (busy ? ' disabled' : '') + '><span>+1<br>an</span></button>' + btn('carriere', 'Carrière') + btn('biens', 'Biens');
  }

  // ---------- panneau ----------
  const TABS = [['moi', 'Moi'], ['proches', 'Proches'], ['carriere', 'Carrière'], ['biens', 'Biens']];
  function renderPanel() {
    const p = $('#gPanel');
    const old = $('#pBody');
    const key = S.tab + (S.view ? ':' + S.view.t + S.view.id : '');
    if (old && S.scroll._key === key) S.scroll[key] = old.scrollTop;
    p.classList.toggle('open', S.sheet);
    p.innerHTML = '<div class="pHead"><nav class="tabs" role="tablist">' + TABS.map(function (t) { return '<button class="tab' + (S.tab === t[0] ? ' on' : '') + '" role="tab" aria-selected="' + (S.tab === t[0]) + '" data-a="tab" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</nav><button class="closeSheet" data-a="sheet-close" aria-label="Fermer le panneau">✕</button></div><div class="pBody" id="pBody">' + panelBody() + '</div>';
    const nb = $('#pBody');
    nb.scrollTop = S.scroll[key] || 0;
    S.scroll._key = key;
    nb.addEventListener('scroll', function () { S.scroll[key] = nb.scrollTop; }, { passive: true });
  }
  function panelBody() {
    const l = G.L();
    if (l.dead) return '<p class="hint">Cette vie est terminée.</p>';
    if (S.view && S.view.t === 'person') { const p = G.byId(S.view.id); if (p) return personView(p); S.view = null; }
    if (S.view && S.view.t === 'job') return jobView(S.view.id);
    if (S.tab === 'proches') return panelProches();
    if (S.tab === 'carriere') return panelCarriere();
    if (S.tab === 'biens') return panelBiens();
    return panelMoi();
  }
  function actBtn(attrs, label, desc, why, meta, cls) {
    return '<button class="act' + (why ? ' off' : '') + (cls ? ' ' + cls : '') + '" ' + attrs + (why ? ' disabled' : '') + '><span class="an">' + label + '</span>' + (desc ? '<span class="ad">' + desc + '</span>' : '') + '<span class="am">' + esc(why || meta || '') + '</span></button>';
  }
  function actList(kind, cat, p, only) {
    const out = A.lists[kind].filter(function (d) { return (!cat || d.cat === cat) && (!only || only(d)); }).map(function (d) {
      const why = A.why(d, p);
      if (why === null) return '';
      const cost = A.cost(d, p);
      const meta = d.pick ? 'Choisir ›' : cost ? L.money(cost) : '';
      return actBtn('data-a="act" data-k="' + kind + '" data-id="' + d.id + '"' + (p ? ' data-p="' + p.id + '"' : ''), A.label(d, p), A.desc(d, p), why, meta);
    }).join('');
    return out ? '<div class="list">' + out + '</div>' : '';
  }

  // Moi
  function traitCard(t, sex) { const d = D.TRAITS[t]; return '<div class="trait ink-' + d.ink + '"><b>' + esc(L.gs(d.n, sex)) + '</b><small>' + esc(d.d) + '</small></div>'; }
  function panelMoi() {
    const l = G.L(), a = l.me.age, sex = l.me.sex;
    let h = '';
    if (l.traits.length) h += sec('Ton caractère', '<div class="traits">' + l.traits.map(function (t) { return traitCard(t, sex); }).join('') + '</div>', 'm');
    else {
      const td = G.tendencies();
      const max = Math.max(10, td.reduce(function (m, x) { return Math.max(m, x.v); }, 0));
      h += sec('Ton caractère <small>se forge jusqu’à 18 ans</small>', td.length ? '<div class="tend">' + td.map(function (x) { const d = D.TRAITS[x.t]; return '<span>' + esc(L.gs(d.n, sex)) + '</span><div class="mbar ink-' + d.ink + '"><i style="width:' + Math.round(Math.min(100, x.v / max * 100)) + '%"></i></div>'; }).join('') + '</div><p class="hint" style="margin-top:8px">Tendances actuelles. Partager, mentir, étudier, faire le clown : chaque choix compte.</p>' : '<p class="hint">Trop tôt pour le dire. Chaque choix de ton enfance va compter.</p>', 'm');
    }
    let sante = actList('self', 'sante');
    if (a >= 12) sante += '<p class="hint" style="margin:12px 0 6px">Régime alimentaire (effet chaque année)</p><div class="diet">' + [['malbouffe', 'Malbouffe'], ['equilibre', 'Équilibré'], ['sain', 'Healthy']].map(function (x) { return '<button data-a="diet" data-v="' + x[0] + '" aria-pressed="' + (l.diet === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>';
    h += sec('Santé & bien-être', sante, 'g');
    if (a >= 6) {
      const sk = D.SKILLS.map(function (s) {
        const v = l.sk[s.id], why = A.trainWhy(s.id);
        return '<div class="sk"><span class="skn">' + esc(s.n) + '</span><div class="skb"><i style="width:' + v + '%"></i></div><span class="skv">' + Math.round(v) + '/100 · ' + skLevel(v) + '</span><button data-a="train" data-id="' + s.id + '"' + (why ? ' disabled' : '') + ' aria-label="S’entraîner : ' + esc(s.n) + '">' + (why === 'Déjà fait cette année' ? 'Fait' : why ? '—' : a >= 18 ? '150 €' : '+') + '</button></div>';
      }).join('');
      const lim = A.trainLimit(), used = A.trainedCount();
      const rule = a >= 18 ? 'Adulte : cours du soir à 150 € la séance, autant que tu veux (une par compétence et par an).'
        : 'Bonheur <b>' + Math.round(l.st.b) + '</b> : ' + (lim ? '<b>' + used + '/' + lim + '</b> séance' + (lim > 1 ? 's' : '') + ' cette année.' : 'pas d’entraînement possible cette année.') + ' Il faut 50 de bonheur pour 1 séance, 70 pour 2, 90 pour 3.';
      h += sec('Compétences <small>indispensables pour ton CV</small>', '<p class="hint">' + rule + '</p><div class="skills">' + sk + '</div>', 'y');
      const iw = A.intsWhy();
      const ints = D.INTERESTS.filter(function (it) { return !it.new || l.year >= it.new || l.ints.indexOf(it.id) >= 0; }).map(function (it) {
        const on = l.ints.indexOf(it.id) >= 0;
        const dis = !!iw || (!on && l.ints.length >= 2);
        return '<button class="ib' + (on ? ' on' : '') + '" data-a="interest" data-id="' + it.id + '" aria-pressed="' + on + '"' + (dis ? ' disabled' : '') + '>' + esc(it.n) + '</button>';
      }).join('');
      h += sec('Centres d’intérêt <small>2 maximum · 1 changement par an</small>', '<p class="hint">' + (l.ints.length ? 'Tu peux en parler avec ta famille et tes amis (onglet Proches).' : 'Choisis ce qui te passionne : tu pourras en parler avec tes proches.') + (iw === 'Un changement par an' ? ' Déjà changé cette année.' : '') + '</p><div class="ints">' + ints + '</div>', 'c');
    }
    h += sec('Sorties', actList('self', 'sortie'), 'c');
    h += sec('Loisirs', actList('self', 'loisir'), 'b');
    h += sec('Amour', actList('self', 'amour'), 'm');
    h += sec('Tentations', actList('self', 'risque'), 'r');
    if (l.lonely) h = '<p class="hint" style="color:var(--r)">Solitude profonde : la plupart des loisirs et du travail sont bloqués. Parle à tes proches (onglet Proches) ou vois un psy pour t’en sortir.</p>' + h;
    return h;
  }

  // Proches
  const REL_ORDER = { mere: 0, pere: 1, par: 1, gp: 3, sib: 2 };
  function personRow(p) {
    const done = p.alive && G.isDone('p' + p.id);
    const meta = p.alive ? L.relName(p) + ' · ' + ageTxt(p.age) + (p.nt && p.rel !== 'pet' ? ' · ' + L.gs(p.nt, p.sex) : '') : L.relName(p) + (p.dy ? ' · † ' + p.dy : '');
    return '<button class="pr' + (p.alive ? '' : ' dead') + (done ? ' done' : '') + '" data-a="person" data-p="' + p.id + '">' + UI.pic(p) + '<span class="pn">' + esc(p.first) + ' ' + esc(p.last || '') + '</span><span class="pm">' + esc(meta) + '</span><span class="rq">' + (p.alive ? (done ? '' : 'Lien') + '<span class="mbar"><i style="width:' + Math.round(p.rq) + '%"></i></span>' : '') + '</span></button>';
  }
  function panelProches() {
    const l = G.L();
    let h = sec('Tous ensemble', actList('fam') + '<div class="list" style="margin-top:6px">' + actBtn('data-a="tree"', 'Arbre généalogique', 'Grands-parents, parents, fratrie, enfants', '', 'Voir ›') + '</div>', 'c');
    const groups = [
      ['Famille', function (p) { return REL_ORDER[p.rel] != null; }, 'c'],
      ['Couple', function (p) { return p.rel === 'part'; }, 'm'],
      ['Enfants', function (p) { return p.rel === 'enf'; }, 'y'],
      ['Amis', function (p) { return p.rel === 'ami'; }, 'c'],
      ['Animaux', function (p) { return p.rel === 'pet'; }, 'g'],
      ['Travail', function (p) { return p.rel === 'boss' || p.rel === 'coll'; }, 'y'],
      ['Ennemis', function (p) { return p.rel === 'enn'; }, 'r'],
      ['Ex', function (p) { return p.rel === 'ex'; }, 'b']
    ];
    let any = false;
    groups.forEach(function (g) {
      const ps = l.people.filter(function (p) { return p.alive && g[1](p); }).sort(function (a, b) { return ((REL_ORDER[a.rel] || 0) - (REL_ORDER[b.rel] || 0)) || b.age - a.age; });
      if (!ps.length) return;
      any = true;
      h += sec(g[0] + ' <small>' + ps.length + '</small>', '<div class="list">' + ps.map(personRow).join('') + '</div>', g[2]);
    });
    if (!any) h += '<p class="empty">Personne autour de toi. Il est temps de se faire des amis.</p>';
    const dead = l.people.filter(function (p) { return !p.alive && p.rel !== 'gone'; });
    if (dead.length) h += '<details class="more"><summary>Disparus (' + dead.length + ')</summary><div class="list">' + dead.map(personRow).join('') + '</div></details>';
    h += '<p class="hint" style="margin-top:14px">Une interaction par personne et par an. Sans contact, les liens s’usent et ta jauge Social baisse.</p>';
    return h;
  }
  function personView(p) {
    const sex = p.sex;
    let h = '<button class="subBack" data-a="back">← Proches</button>';
    const job = p.job ? G.jobLabel(p.job, sex) : '';
    h += '<div class="pHero">' + UI.pic(p) + '<div><h3>' + esc(p.first) + ' ' + esc(p.last || '') + '</h3><p>' + esc(L.relName(p)) + ' · ' + ageTxt(p.age) + (p.alive ? '' : ' · ' + L.gx('décédé', 'décédée', sex)) + '</p>' + (p.rel !== 'pet' ? '<p>' + esc(L.gs(p.nt, sex)) + (job ? ' · ' + esc(job) : '') + '</p>' : '') + '</div></div>';
    if (!p.alive) return h + '<p class="hint">Parti' + (sex === 'F' ? 'e' : '') + ' en ' + (p.dy || '?') + '. Tu penses encore à ' + (sex === 'F' ? 'elle' : 'lui') + ' parfois.</p>';
    h += '<div class="card ink-c" style="margin-bottom:18px"><span class="mono" style="font-size:.82rem;color:var(--dim)">Relation</span><div class="bigNum"><b>' + Math.round(p.rq) + '</b><span>/100</span></div><div class="mbar"><i style="width:' + Math.round(p.rq) + '%"></i></div></div>';
    if (p.rel === 'enf' && p.kx && p.age < 18) h += kidCard(p);
    const done = G.isDone('p' + p.id);
    if (done) return h + sec('Interactions', '<p class="hint">Tu as déjà partagé un moment avec ' + esc(p.first) + ' cette année. Rendez-vous l’an prochain.</p>' + actList('p', null, p, function (d) { return d.free; }), 'c');
    h += sec('Interactions <small>une par an</small>', actList('p', null, p) || '<p class="empty">Rien à faire ensemble pour l’instant.</p>', 'c');
    return h;
  }

  function kidCard(p) {
    const sex = p.sex, kx = p.kx;
    const cl = p.club && D.CLUBS.find(function (x) { return x.id === p.club; });
    const top = Object.keys(kx.sk).filter(function (k) { return kx.sk[k] >= 3; }).sort(function (a, b) { return kx.sk[b] - kx.sk[a]; }).slice(0, 3).map(D.skillName);
    const tr = G.kidTraits(p).map(function (t) { return L.gs(D.TRAITS[t].n, sex); });
    return '<div class="card ink-y" style="margin-bottom:18px"><span class="mono" style="font-size:.82rem;color:var(--dim)">Éducation</span><dl class="kv">' +
      '<dt>Style</dt><dd>' + esc(D.eduStyle(p.ed).n) + '</dd>' +
      '<dt>Activité</dt><dd>' + esc(cl ? cl.n : 'Aucune') + '</dd>' +
      (p.age >= 6 && p.kg != null ? '<dt>Moyenne</dt><dd>' + L.dec(p.kg) + '/20</dd>' : '') +
      '<dt>Points forts</dt><dd>' + esc(top.length ? top.join(', ') : 'À découvrir') + '</dd>' +
      '<dt>Caractère</dt><dd>' + esc(tr.length ? tr.join(', ') : 'Se forge encore') + '</dd></dl>' +
      '<p class="hint" style="margin:8px 0 0">Ce que tu lui transmets compte : si un jour tu continues ta lignée avec ' + (sex === 'F' ? 'elle' : 'lui') + ', ' + (sex === 'F' ? 'elle' : 'il') + ' en héritera.</p></div>';
  }

  // Carrière
  function offerRow(id) {
    const d = D.job(id), l = G.L();
    const ok = G.canApply(id);
    const why = A.applyWhy(id);
    const sal = G.salary({ id: id, lvl: 0, yrs: 0, raise: 1 });
    const st = why === 'Déjà postulé cette année' ? 'Postulé' : why === 'C’est ton poste actuel' ? 'Ton poste' : ok ? 'Voir ›' : 'Profil incomplet';
    return '<button class="act' + (ok ? '' : ' off') + '" data-a="job" data-id="' + id + '"><span class="an">' + esc(L.gs(d.n, l.me.sex)) + '</span><span class="ad">' + L.money(sal) + ' par an · ' + CATN[d.cat] + '</span><span class="am">' + st + '</span></button>';
  }
  function panelCarriere() {
    const l = G.L(), a = l.me.age, e = l.edu, sex = l.me.sex;
    let h = '';
    if (a < 3) return sec('Carrière', '<p class="hint">Ta seule carrière pour l’instant : dormir, manger et fixer le plafond. Tu excelles.</p>', 'y');
    if (G.inSchool()) {
      const mat = e.st === 'mat';
      let card = '<div class="card ink-y" style="margin-bottom:10px"><span class="mono" style="font-size:.82rem;color:var(--dim)">' + esc(e.st === 'cap' ? 'Formation professionnelle' : D.STAGE[e.st] || '') + '</span><div style="font-size:1.3rem;font-weight:850;font-stretch:85%">' + esc(G.className()) + '</div>';
      if (!mat) card += '<div class="bigNum"><b>' + L.dec(e.g) + '</b><span>/20 · ' + esc(G.appreciation(e.g)) + '</span></div><p class="hint" style="margin:0">Moyenne de l’année en cours. Elle bouge avec tes efforts.</p>';
      else card += '<p class="hint" style="margin:6px 0 0">Pâte à modeler, chansons et siestes. Pas encore de notes.</p>';
      card += '</div>';
      h += sec(e.st === 'cap' ? 'CAP' : 'École', card + actList('school'), 'y');
      if (a >= 6 && a < 18) {
        const cw = A.clubWhy();
        const clubs = D.CLUBS.map(function (c) {
          const on = e.clubs.indexOf(c.id) >= 0;
          const full = !on && e.clubs.length >= 2;
          const why = cw || (full ? '2 clubs maximum' : '');
          return actBtn('data-a="club" data-id="' + c.id + '"', esc(c.n), Object.keys(c.sk).map(D.skillName).join(', ') + ' · ' + L.money(c.cost) + ' par an', why, on ? 'Quitter' : 'Rejoindre', on ? 'on' : '');
        }).join('');
        h += sec('Clubs <small>2 maximum · 1 changement par an</small>', '<div class="list">' + clubs + '</div>', 'c');
      }
      if (a >= 16) h += actBtn('data-a="stopschool"', 'Arrêter l’école', 'Tu entres dans la vie active', '', 'Définitif', 'danger');
    } else if (e.st === 'sup' && e.sup) {
      const f = D.sup(e.sup.id);
      const card = '<div class="card ink-y" style="margin-bottom:10px"><span class="mono" style="font-size:.82rem;color:var(--dim)">Études supérieures · ' + esc(D.DEG_LVL[f.lvl]) + '</span><div style="font-size:1.25rem;font-weight:850;font-stretch:85%">' + esc(f.n) + '</div><p class="hint" style="margin:2px 0 0">Année ' + e.sup.y + ' sur ' + f.yrs + '</p><div class="bigNum"><b>' + L.dec(e.sup.g) + '</b><span>/20 de moyenne</span></div></div>';
      h += sec('Études', card + actList('sup') + actBtn('data-a="stopschool"', 'Abandonner les études', 'Tu gardes tes diplômes déjà obtenus', '', 'Définitif', 'danger'), 'y');
    } else if (a >= 17 && !l.queue.length) {
      h += sec('Études', '<p class="hint">' + (G.hasBac() ? 'Tu peux reprendre des études à tout âge.' : 'Sans le bac, seuls les CAP sont accessibles.') + '</p>' + actBtn('data-a="study"', 'Reprendre des études', 'Parcoursup', l.prison ? 'En prison' : '', 'Ouvrir ›'), 'y');
    }
    if (l.dip.length) h += sec('Diplômes', '<div class="list">' + l.dip.slice().reverse().map(function (d) { return '<div class="act" style="cursor:default"><span class="an">' + esc(d.n) + '</span><span class="ad">' + esc(D.DEG_LVL[d.lvl] || '') + (d.m ? ' · mention ' + esc(d.m) : '') + '</span><span class="am">' + d.y + '</span></div>'; }).join('') + '</div>', 'g');
    if (l.job) {
      const j = l.job, d = D.job(j.id);
      const card = '<div class="card ink-y" style="margin-bottom:10px"><span class="mono" style="font-size:.82rem;color:var(--dim)">' + CATN[d.cat] + ' · échelon ' + (j.lvl + 1) + '/' + d.lv.length + '</span><div style="font-size:1.3rem;font-weight:850;font-stretch:85%">' + esc(G.jobTitle()) + '</div><div class="bigNum"><b>' + L.money(G.salary()) + '</b><span>par an</span></div><dl class="kv"><dt>Ancienneté</dt><dd>' + L.plural(j.yrs, 'an') + '</dd><dt>Performance</dt><dd><div class="mbar ink-' + (j.perf < 30 ? 'r' : j.perf > 70 ? 'g' : 'y') + '"><i style="width:' + Math.round(j.perf) + '%"></i></div></dd></dl></div>';
      let more = actBtn('data-a="quitjob"', 'Démissionner', '', '', 'Quitter', 'danger');
      if (a >= 62) more = actBtn('data-a="retire"', 'Partir à la retraite', 'Pension : la moitié de ton salaire', '', 'Partir') + more;
      h += sec('Travail', card + actList('work') + '<div class="list" style="margin-top:6px">' + more + '</div>', 'y');
    } else if (l.retired) h += sec('Retraite', '<p class="hint">Pension : <b>' + L.money(l.pension) + '</b> par an. Profite.</p>', 'g');
    else if (l.chomage) h += sec('Chômage', '<p class="hint">Allocation : ' + L.money(l.chomage.amt) + ' par an, encore ' + L.plural(l.chomage.y, 'an') + '. France Travail t’encourage à postuler.</p>', 'r');
    if (a >= 14 && !l.retired && !l.prison) {
      const offers = G.offers();
      h += sec(l.job ? 'Changer de travail' : 'Offres d’emploi', '<p class="hint">Les petits boulots n’exigent rien. Les autres demandent diplômes, compétences ou charisme.</p><div class="list">' + offers.map(offerRow).join('') + '</div>', 'm');
    }
    if (a >= 14) h += actBtn('data-a="cv"', 'Mon CV', 'Diplômes, expériences, compétences', '', 'Voir ›');
    return h;
  }
  function jobView(id) {
    const d = D.job(id), l = G.L(), sex = l.me.sex;
    if (!d) { S.view = null; return panelCarriere(); }
    const reqs = G.reqs(id), why = A.applyWhy(id);
    const sal = G.salary({ id: id, lvl: 0, yrs: 0, raise: 1 });
    let h = '<button class="subBack" data-a="back">← Offres</button>';
    h += '<div class="card ink-m" style="margin-bottom:16px"><span class="mono" style="font-size:.82rem;color:var(--dim)">' + CATN[d.cat] + (d.pt ? ' · compatible études' : '') + '</span><div style="font-size:1.45rem;font-weight:900;font-stretch:80%">' + esc(L.gs(d.n, sex)) + '</div><div class="bigNum"><b>' + L.money(sal) + '</b><span>par an au départ</span></div><p class="hint" style="margin:6px 0 0">Évolution possible :</p><ol class="lvls">' + d.lv.map(function (t) { return '<li>' + esc(L.gs(t, sex)) + '</li>'; }).join('') + '</ol></div>';
    h += sec('Exigences', '<ul class="req">' + reqs.map(function (r) { return '<li class="' + (r.ok ? '' : 'no') + '">' + esc(r.l) + '</li>'; }).join('') + '</ul>', 'm');
    h += why ? '<p class="hint">' + esc(why === 'Profil incomplet' ? 'Ton profil ne remplit pas encore toutes les exigences.' : why) + '</p>' : '<button class="btn" data-a="apply" data-id="' + id + '">' + (d.cat === 'petit' ? 'Postuler' : 'Postuler · entretien') + '</button>';
    return h;
  }

  // Biens
  function panelBiens() {
    const l = G.L(), a = l.me.age;
    let h = '';
    const bud = l.budget;
    let money = '<div class="card ink-y"><div class="bigNum"><b' + (l.money < 0 ? ' style="color:var(--r)"' : '') + '>' + L.money(l.money) + '</b></div>';
    if (bud && (bud.inc || bud.exp)) money += '<dl class="kv"><dt>L’an dernier</dt><dd><span style="color:var(--g)">+' + L.money(bud.inc) + '</span> · <span style="color:var(--r)">−' + L.money(bud.exp) + '</span></dd></dl>';
    money += '</div>';
    h += sec('Argent', money, 'y');
    // logement
    const cur = D.home(l.home);
    let home = '<div class="card ink-c" style="margin-bottom:10px"><span class="mono" style="font-size:.82rem;color:var(--dim)">' + esc(l.city) + '</span><div style="font-size:1.2rem;font-weight:850;font-stretch:85%">' + esc(cur.n) + '</div>' + (l.loan ? '<p class="hint" style="margin:4px 0 0">Prêt immobilier : ' + L.money(l.loan.pay) + ' par an, encore ' + l.loan.y + ' ans.</p>' : '') + '</div>';
    if (a >= 16) {
      home += '<div class="list">' + D.HOMES.filter(function (x) { return x.id !== l.home; }).map(function (x) {
        const why = A.moveWhy(x.id) || (G.isDone('move') ? 'Un déménagement par an' : '');
        const cost = G.homeCost(x.id);
        const meta = x.id === 'parents' ? 'Gratuit' : x.own ? L.money(cost) : L.money(cost) + '/an';
        return actBtn('data-a="move" data-id="' + x.id + '"', esc(x.n), x.own ? 'Achat (apport de 10 % + prêt sur 20 ans si besoin)' : x.id === 'parents' ? '' : 'Loyer + vie courante, à l’année', why, meta);
      }).join('') + actBtn('data-a="city"', 'Déménager dans une autre ville', 'Les salaires et les loyers changent selon la ville', A.cityWhy(), 'Choisir ›') + '</div>';
    } else home += '<p class="hint">Tu vis chez tes parents. Tu pourras déménager à 18 ans (ou dès 16 ans avec un emploi).</p>';
    h += sec('Logement', home, 'c');
    // permis
    const pw = A.permisWhy();
    if (l.permis) h += sec('Permis de conduire', '<p class="hint">Obtenu. Tu peux conduire voitures et motos.</p>', 'g');
    else if (pw !== null) h += sec('Permis de conduire', '<div class="list">' + actBtn('data-a="permis"', 'Passer le permis', 'Code + conduite. Tes parents paient parfois.', pw, '1 800 €') + '</div>', 'g');
    // biens possédés
    if (l.items.length) h += sec('Tes biens', '<div class="list">' + l.items.map(function (it, i) { const d = D.item(it.id); return actBtn('data-a="sell" data-i="' + i + '"', esc(D.itemName(d, it.y) || d.id), 'Acheté en ' + it.y + (d.sub ? ' · abonnement d’un an' : ''), d.sub ? 'En cours' : '', 'Vendre'); }).join('') + '</div>', 'g');
    // boutique
    const shop = D.ITEMS.map(function (d) {
      const why = A.buyWhy(d.id);
      if (why === null) return '';
      const fx = [];
      if (d.yb && d.yb.h) fx.push('santé'); if (d.yb && d.yb.s) fx.push('social'); if (d.yb && d.yb.c) fx.push('charisme'); if (d.yb && d.yb.sk) fx.push(Object.keys(d.yb.sk).map(D.skillName).join(', ').toLowerCase());
      return actBtn('data-a="buy" data-id="' + d.id + '"', esc(D.itemName(d, l.year)), 'Bonheur à l’achat' + (fx.length ? ' · bonus : ' + fx.join(', ') : '') + (d.up ? ' · entretien ' + L.money(d.up) + '/an' : ''), why, L.money(d.price));
    }).join('');
    h += sec('Boutique', '<div class="list">' + shop + '</div>', 'm');
    const pets = D.PETS.map(function (p) { const why = A.petWhy(p.id); if (why === null) return ''; return actBtn('data-a="adopt" data-id="' + p.id + '"', esc(p.n), 'Vit ' + p.life[0] + ' à ' + p.life[1] + ' ans', why, L.money(p.price)); }).join('');
    h += sec('Animalerie', '<div class="list">' + pets + '</div>', 'g');
    if (a >= 25) h += sec('Adoption', '<div class="list">' + actBtn('data-a="adoptkid"', 'Adopter un enfant', 'Démarche longue, pas toujours acceptée', A.adoptChildWhy(), '6 000 €') + '</div>', 'c');
    return h;
  }

  // ---------- modales ----------
  function optHtml(o, i, extra) {
    return '<button class="opt' + (o.alt ? ' alt' : '') + (o.face ? ' face' : '') + '" ' + extra + (o.dis ? ' disabled' : '') + '>' + (o.face ? UI.pic(o.face) : '<span class="ol">' + (o.alt ? '·' : String.fromCharCode(65 + (i % 26))) + '</span>') + '<span class="ot">' + o.l + '</span>' + (o.sub ? '<span class="os">' + o.sub + '</span>' : '') + '</button>';
  }
  function showQ(q) {
    const l = G.L();
    const v = G.view(q);
    if (!v) { l.queue.shift(); return UI.flush(); }
    let traits = '';
    if (v.traits) traits = '<div class="tlist">' + v.traits.map(function (t) { return '<div class="trait ink-' + t.ink + '"><b>' + esc(t.n) + '</b><small>' + esc(t.d) + '</small></div>'; }).join('') + '</div>';
    const opts = v.opts.map(function (o, i) { return optHtml(o, i, 'data-a="qopt" data-id="' + esc(String(o.id)) + '"'); }).join('');
    const face = v.face ? '<div class="qFace">' + UI.pic(v.face) + '</div>' : '';
    const inp = v.input ? '<div class="qIn"><label for="qIn">' + esc(v.input.label || '') + '</label><div class="row"><input id="qIn" type="text" maxlength="24" autocomplete="off" value="' + esc(v.input.v || '') + '"><button type="button" class="dice" data-a="qdice" data-s="' + esc(v.input.sex || 'M') + '" aria-label="Autre idée de prénom">' + IC.dice + '</button></div></div>' : '';
    openLayer('<div class="modal ink-' + (v.ink || 'y') + '"><div class="mKick"><span>' + esc(v.kicker || '') + '</span><span>' + l.year + '</span></div><div class="mIn">' + face + '<h2>' + v.title + '</h2>' + (v.text ? '<p class="txt">' + v.text + '</p>' : '') + traits + inp + (v.q ? '<p class="qq">' + v.q + '</p>' : '') + '</div><div class="opts">' + opts + '</div></div>', 'q');
    if (v.input) { const i = $('#qIn'); if (i) { i.focus({ preventScroll: true }); i.select(); } }
    renderNav();
  }
  function showResult(res, ink, help) {
    openLayer('<div class="modal ink-' + (ink || 'y') + '"><div class="mKick"><span>' + esc(String(res.title || 'Résultat').toUpperCase()) + '</span><span>' + G.L().year + '</span></div><div class="mIn">' + (res.pick ? '<p class="qq">Ton choix : ' + res.pick + '</p>' : '') + '</div><div class="res"><p>' + res.t + '</p>' + chips(res.d) + '</div>' + (help || '') + '<div class="mFoot"><button class="btn" data-a="next">Continuer</button></div></div>', 'q');
  }
  UI.flush = function () {
    const l = G.L();
    if (!l) return;
    if (l.dead) { closeLayer(); save(); UI.dead(); return; }
    const q = G.pending();
    if (!q) { if (S.layer === 'q') closeLayer(); UI.refresh(); notes(); save(); return; }
    UI.refresh();
    if (q.k === 'qte') return runQte(q);
    showQ(q);
  };
  const HELP = '<p class="help">Dans la vraie vie, si tu traverses des idées noires, tu n’es pas seul·e : appelle le <b>3114</b> (gratuit, 24 h/24, 7 j/7).</p>';
  UI.HELP = HELP;
  function runQte(q) {
    const l = G.L();
    const root = $('#layer');
    root.classList.add('on');
    S.layer = 'q';
    const done = function (ok) {
      const res = G.qteDone(ok);
      UI.refresh();
      notes();
      if (G.L().dead) { closeLayer(); save(); UI.dead(); return; }
      if (res) { res.title = q.t === 'hosp' ? 'Urgences' : 'Idées noires'; showResult(res, 'g', q.t === 'noir' ? HELP : ''); }
      else UI.flush();
      save();
    };
    if (q.t === 'hosp') L.QTE.hosp(root, l.me.age, done);
    else L.QTE.noir(root, G.helpers().map(helperName), l.me.sex, done);
  }
  function helperName(p) {
    if (p.rel === 'mere') return 'Maman';
    if (p.rel === 'pere') return 'Papa';
    if (p.rel === 'gp') return p.sex === 'F' ? 'Mamie' : 'Papi';
    return p.first;
  }
  function openPick(kind, id, pid, opts, sub) {
    const d = A.get(kind, id);
    const p = pid ? G.byId(Number(pid)) : null;
    if (!d || A.why(d, p) !== '') return;
    if (!opts) opts = d.pick(G.ctx(p ? { x: p } : {}), p);
    const desc = sub != null ? sub : d.d ? A.desc(d, p) : '';
    const list = opts.length ? opts.map(function (o, i) { return optHtml({ l: esc(o.l), sub: o.sub ? esc(o.sub) : '', dis: o.dis, face: o.face }, i, 'data-a="pickopt" data-k="' + kind + '" data-id="' + id + '" data-p="' + (pid || '') + '" data-v="' + esc(String(o.v)) + '"'); }).join('') : '<p class="hint" style="padding:0 18px">Aucune option pour l’instant.</p>';
    openLayer('<div class="modal ink-' + ({ p: 'c', self: 'm' }[kind] || 'y') + '"><div class="mKick"><span>' + (p ? esc(p.first).toUpperCase() : 'CHOISIS') + '</span></div><div class="mIn"><h2>' + A.label(d, p) + '</h2>' + (desc ? '<p class="txt">' + desc + '</p>' : '') + '</div><div class="opts">' + list + '</div><div class="mFoot"><button class="btn ghost small" data-a="close">Annuler</button></div></div>');
  }
  // cinéma et festival : affiches animées, séance, verdict tamponné
  const VERDICT = { fan: ['ADORÉ', 'g'], ok: ['BIEN AIMÉ', 'c'], meh: ['BOF', 'y'], bad: ['DÉTESTÉ', 'r'] };
  // cinéma, jeux vidéo, livres : trois choix en affiches, une petite animation, un verdict
  const stars = function (n) { return '★'.repeat(n) + '☆'.repeat(5 - n); };
  const MEDIA = {
    cine: { act: 'cinema', list: function () { return A.cine; }, offers: function () { return A.cineOffers(); }, genres: function () { return D.GENRES; }, ink: 'y', cls: '', marquee: 'À L’AFFICHE',
      kick: function () { return 'CINÉMA · ' + G.L().city.toUpperCase(); }, txt: 'Trois films ce soir. Le genre que tu choisis forge ton caractère… si tu accroches.', no: 'Rester à la maison', vk: 'CINÉMA',
      meta: function (f) { return Math.floor(f.dur / 60) + ' h ' + String(f.dur % 60).padStart(2, '0') + '<br>' + stars(f.st); },
      play: function (f, g) { return '<div class="screen"><div class="leader"><i class="hand"></i><b class="cd">3</b></div><p class="nowp">« ' + esc(f.t) + ' »</p></div>'; }, snd: 'projector' },
    jv: { act: 'jv', list: function () { return A.jeux; }, offers: function () { return A.jvOffers(); }, genres: function () { return D.VG_GENRES; }, ink: 'c', cls: 'game', marquee: 'INSERT COIN',
      kick: function () { return 'TA LUDOTHÈQUE'; }, txt: 'Trois jeux sur l’étagère. Le genre que tu choisis forge ton caractère… si tu accroches.', no: 'Éteindre la console', vk: 'JEU VIDÉO',
      meta: function (f) { return f.n + ' joueur' + (f.n > 1 ? 's' : '') + '<br>' + stars(f.st); },
      play: function (f) { return '<div class="crt"><div class="crtIn"><p class="ld">CHARGEMENT…</p><div class="pbar"><i></i></div><p class="ps">PRESS START</p><p class="nowp">' + esc(f.t).toUpperCase() + '</p></div></div>'; }, snd: 'boot' },
    livre: { act: 'lire', list: function () { return A.livres; }, offers: function () { return A.bookOffers(); }, genres: function () { return D.BOOK_GENRES; }, ink: 'g', cls: 'book', marquee: 'LIBRAIRIE',
      kick: function () { return 'TA BIBLIOTHÈQUE'; }, txt: 'Trois livres t’attendent. Le genre que tu choisis forge ton caractère… si tu accroches.', no: 'Pas envie de lire', vk: 'LECTURE',
      meta: function (f) { return f.pages + ' pages<br>' + stars(f.st); },
      play: function (f) { return '<div class="bookAnim"><div class="bk"><i class="pg l"></i><i class="pg r"></i><i class="fl f1"></i><i class="fl f2"></i><i class="fl f3"></i></div><p class="nowp">« ' + esc(f.t) + ' »</p></div>'; }, snd: 'page' }
  };
  function mediaModal(kind) {
    const M = MEDIA[kind], d = A.get('self', M.act);
    if (!d || A.why(d) !== '') return;
    const list = M.offers(), G0 = M.genres();
    sfx('page');
    const posters = list.map(function (f, i) {
      const g = G0[f.g];
      return '<button class="poster ' + M.cls + ' ink-' + g.ink + '" style="--i:' + i + '" data-a="mediapick" data-m="' + kind + '" data-i="' + i + '"><span class="pg">' + esc(g.n) + '</span><span class="pt">' + esc(f.t) + '</span><span class="pm">' + M.meta(f) + '</span></button>';
    }).join('');
    const cost = A.cost(d);
    openLayer('<div class="modal ink-' + M.ink + ' cine"><div class="mKick"><span>' + esc(M.kick()) + '</span><span>' + (cost ? L.money(cost) : 'gratuit') + '</span></div><div class="marquee"><span>' + M.marquee + '</span></div><div class="mIn"><p class="txt">' + M.txt + '</p></div><div class="posters">' + posters + '</div><div class="mFoot"><button class="btn ghost small" data-a="close">' + M.no + '</button></div></div>');
  }
  function mediaPick(kind, i) {
    const M = MEDIA[kind], f = M.list()[i];
    const box = $('#layer .modal');
    if (!f || !box) return;
    const res = A.run('self', M.act, null, i);
    if (!res) return;
    S.layer = 'q';
    save();
    const g = M.genres()[f.g];
    box.innerHTML = '<div class="mKick"><span>' + M.vk + ' · ' + esc(g.n).toUpperCase() + '</span><span>' + G.L().year + '</span></div>' + M.play(f, g);
    sfx(M.snd);
    const slow = SLOW();
    let n = 3;
    const cd = box.querySelector('.cd');
    const iv = cd ? setInterval(function () { n--; if (n > 0) cd.textContent = n; else clearInterval(iv); }, slow ? 700 : 80) : 0;
    setTimeout(function () { clearInterval(iv); showVerdict(box, res, M.vk + ' · ' + g.n.toUpperCase()); }, slow ? 2200 : 250);
  }
  function cineModal() { mediaModal('cine'); }
  function festModal() {
    const d = A.get('self', 'festival');
    if (!d || A.why(d) !== '') return;
    const list = A.festOffers(), m = G.L().money;
    sfx('page');
    const posters = list.map(function (f, i) {
      return '<button class="poster gig ink-' + (f.kind === 'dj' ? 'm' : 'c') + '" style="--i:' + i + '" data-a="festpick" data-i="' + i + '"' + (m < f.cost ? ' disabled' : '') + '><span class="pg">' + (f.kind === 'dj' ? 'Concert' : 'Festival') + ' · ' + esc(f.st) + '</span><span class="pt">' + esc(f.n) + '</span>' + (f.line ? '<span class="pl">avec ' + esc(f.line.join(' + ')) + '</span>' : '') + '<span class="pm">' + (m < f.cost ? 'Trop cher · ' : '') + L.money(f.cost) + '</span></button>';
    }).join('');
    openLayer('<div class="modal ink-m cine"><div class="mKick"><span>CE WEEK-END</span><span>' + L.money(m) + '</span></div><div class="marquee"><span>LIVE · LIVE · LIVE</span></div><div class="mIn"><p class="txt">Trois affiches collées sur le mur de la ville. Laquelle te fait vibrer ?</p></div><div class="posters">' + posters + '</div><div class="mFoot"><button class="btn ghost small" data-a="close">Pas ce week-end</button></div></div>');
  }
  function showVerdict(box, res, kick) {
    const v = VERDICT[res.tier] || VERDICT.ok;
    box.innerHTML = '<div class="mKick"><span>' + esc(kick) + '</span><span>' + G.L().year + '</span></div><div class="res stampRes"><span class="stamp ink-' + v[1] + '">' + v[0] + '</span><p>' + res.t + '</p>' + chips(res.d) + '</div><div class="mFoot"><button class="btn" data-a="next">Continuer</button></div>';
    sfx(res.tier === 'bad' ? 'bad' : res.tier === 'fan' ? 'ach' : res.tier === 'meh' ? 'tap' : 'good');
    UI.refresh();
    notes();
  }
  // ---------- arbre généalogique ----------
  function treeNode(p, me) {
    const l = G.L();
    const sub = me ? 'Toi · ' + ageTxt(p.age) : L.relName(p) + ' · ' + (p.alive ? ageTxt(p.age) : '† ' + (p.dy || '?'));
    return '<div class="tn' + (p.alive ? '' : ' dead') + (me ? ' me' : '') + '"' + (me || !p.id ? '' : ' data-a="treeperson" data-p="' + p.id + '" role="button" tabindex="0"') + '>' + (me ? mePic() : UI.pic(p)) + '<b>' + esc(p.first) + '</b><small>' + esc(sub) + '</small></div>';
  }
  function treeModal() {
    const l = G.L();
    const known = l.people.filter(function (p) { return p.rel !== 'gone'; });
    const of = function (rels) { return known.filter(function (p) { return rels.indexOf(p.rel) >= 0; }).sort(function (a, b) { return b.age - a.age; }); };
    const gps = of(['gp']);
    const side = function (s) { return gps.filter(function (p) { return p.side === s; }); };
    const other = gps.filter(function (p) { return p.side !== 'p' && p.side !== 'm'; });
    const row = function (label, nodes, cls) { return nodes ? '<div class="trow' + (cls ? ' ' + cls : '') + '"><span class="tlab">' + label + '</span><div class="tnodes">' + nodes + '</div></div>' : ''; };
    const nodes = function (arr) { return arr.map(function (p) { return treeNode(p); }).join(''); };
    let gpHtml = '';
    if (side('p').length || side('m').length) gpHtml = (side('p').length ? '<div class="tgroup"><em>Côté ' + (G.alive('pere')[0] || known.find(function (p) { return p.rel === 'pere'; }) ? 'paternel' : 'père') + '</em>' + nodes(side('p')) + '</div>' : '') + (side('m').length ? '<div class="tgroup"><em>Côté maternel</em>' + nodes(side('m')) + '</div>' : '');
    gpHtml += nodes(other);
    const me = { first: l.me.first, last: l.me.last, age: l.me.age, sex: l.me.sex, look: l.me.look, alive: !l.dead };
    const sibs = of(['sib']);
    const older = sibs.filter(function (p) { return p.age > l.me.age; }), younger = sibs.filter(function (p) { return p.age <= l.me.age; });
    const part = G.partner();
    const meRow = nodes(older) + treeNode(me, true) + (part ? '<span class="tlink">♥</span>' + treeNode(part) : '') + nodes(younger);
    const kids = of(['enf']);
    const gk = l.stats.grandkids || 0;
    const body = row('Grands-parents', gpHtml) + row('Parents', nodes(of(['mere', 'pere', 'par']))) + row(part ? 'Toi, ton couple, ta fratrie' : 'Toi et ta fratrie', meRow, 'mine') + row('Enfants', kids.length ? nodes(kids) : '') + (gk ? row('Petits-enfants', '<div class="tn ghost"><b>+' + gk + '</b><small>petit' + (gk > 1 ? 's' : '') + '-enfant' + (gk > 1 ? 's' : '') + '</small></div>') : '');
    openLayer('<div class="modal ink-g tree"><div class="mKick"><span>ARBRE GÉNÉALOGIQUE</span><span>' + (l.gen > 1 ? 'GÉNÉRATION ' + l.gen : esc(l.me.last).toUpperCase()) + '</span></div><div class="mIn"><h2>La famille ' + esc(l.me.last) + '</h2><p class="txt">Touche un proche pour ouvrir sa fiche. Les disparus restent dans l’arbre.</p></div><div class="treeBox">' + body + '</div><div class="mFoot"><button class="btn" data-a="close">Fermer</button></div></div>');
  }

  // ---------- atelier dev : tester les dessins, petites triches ----------
  S.dev = S.dev || { pick: {}, skin: null, hair: null, mood: 70, age: 30, sex: 'M', beard: false, view: 'lab', seed: 1, fam: null };
  const OPTIONAL = { 'cheveux-arriere': 1, barbe: 1, rides: 1, 'cheveux-avant': 1, lunettes: 1 };
  const WANTED = ['visage', 'cou', 'corps', 'yeux', 'sourcils', 'nez', 'bouche', 'cheveux-avant', 'cheveux-arriere', 'barbe', 'rides', 'lunettes'];
  function devPerson(seed, extra) {
    const dv = S.dev;
    const look = D.look();
    look.fr = dv.beard;
    return Object.assign({ look: look, age: dv.age, sex: dv.sex, mood: dv.mood, seed: seed }, extra || {});
  }
  function labPerson() {
    const dv = S.dev;
    if (!dv.base) dv.base = devPerson(dv.seed);
    const o = Object.assign({}, dv.base, { age: dv.age, sex: dv.sex, mood: dv.mood, pick: dv.pick, skin: dv.skin || dv.base.look.skin, hair: dv.hair || null });
    o.look = Object.assign({}, dv.base.look, { fr: dv.beard, hs: 1 });
    return o;
  }
  function artImg(o, S2, cls) { return '<img class="artface' + (cls ? ' ' + cls : '') + '" alt="" src="' + L.ART.render(o, S2) + '">'; }
  function devModal() {
    const ART = L.ART, dv = S.dev, inGame = S.scr === 'game' && G.L() && !G.L().dead;
    if (!ART || !ART.has()) {
      openLayer('<div class="modal ink-m dev"><div class="mKick"><span>ATELIER DEV</span></div><div class="mIn"><h2>Aucun dessin trouvé</h2><p class="txt">Lance <b>python art/sync-perso.py</b> pour copier tes dessins dans le jeu, puis recharge.</p></div><div class="mFoot"><button class="btn" data-a="close">Fermer</button></div></div>');
      return;
    }
    if (!ART.ready) { openLayer('<div class="modal ink-m dev"><div class="mKick"><span>ATELIER DEV</span></div><div class="mIn"><h2>Chargement des dessins…</h2></div></div>'); ART.preload(devModal); return; }
    const o = labPerson(), ch = ART.choose(o);
    const tabs = [['lab', 'Portrait'], ['fam', 'Famille'], ['crowd', 'Foule'], ['inv', 'Inventaire']].concat(inGame ? [['cheat', 'Triches']] : []);
    let body = '';
    if (dv.view === 'lab') {
      const rows = ART.parts.map(function (part) {
        const nums = ART.cat[part].nums, cur = ch[part];
        const lab = cur == null ? 'aucun' : (nums.indexOf(cur) + 1) + ' / ' + nums.length;
        return '<div class="dRow"><span>' + esc(ART.NAMES[part] || part) + '</span><button data-a="devp" data-part="' + part + '" data-d="-1" aria-label="Précédent">‹</button><b>' + lab + '</b><button data-a="devp" data-part="' + part + '" data-d="1" aria-label="Suivant">›</button></div>';
      }).join('');
      const sw = function (list, act, cur) { return '<div class="swatches">' + list.map(function (c) { return '<button class="sw' + (c === cur ? ' on' : '') + '" style="background:' + c + '" data-a="' + act + '" data-v="' + c + '" aria-label="' + c + '"></button>'; }).join('') + '</div>'; };
      const seg = function (act, cur, opts) { return '<div class="seg2">' + opts.map(function (x) { return '<button data-a="' + act + '" data-v="' + x[0] + '" aria-pressed="' + (String(cur) === String(x[0])) + '">' + x[1] + '</button>'; }).join('') + '</div>'; };
      body = '<div class="dPrev">' + artImg(o, 320, 'big') + '<div class="dMini"><div class="pic ink-y">' + artImg(o, 192) + '</div><div class="pic ink-c sm">' + artImg(o, 192) + '</div><small>Taille réelle dans le jeu</small></div></div>' +
        '<div class="dCtl">' + rows +
        '<p class="qq">Peau</p>' + sw(D.SKINS, 'devskin', o.skin) +
        '<p class="qq">Cheveux</p>' + sw(D.HAIRS, 'devhair', dv.hair || o.look.hair) +
        '<p class="qq">Humeur (bouche)</p>' + seg('devmood', dv.mood, [[20, 'Triste'], [50, 'Neutre'], [80, 'Contente']]) +
        '<p class="qq">Âge</p>' + seg('devage', dv.age, [[14, 'Ado'], [30, 'Adulte'], [65, 'Âgé'], [80, 'Très âgé']]) +
        '<p class="qq">Genre et barbe</p>' + seg('devsex', dv.sex, [['M', 'Homme'], ['F', 'Femme']]) + seg('devbeard', dv.beard ? 1 : 0, [[1, 'Avec barbe'], [0, 'Sans barbe']]) +
        '<div class="dBtns"><button class="btn small" data-a="devrand">Au hasard</button><button class="btn small ghost" data-a="devreset">Choix automatiques</button></div></div>';
    } else if (dv.view === 'fam') {
      if (!dv.fam) devFamily();
      const f = dv.fam;
      const card = function (p, t) { return '<div class="dCard"><div class="pic ink-' + INKS[p.seed % INKS.length] + '">' + artImg(p, 192) + '</div><small>' + t + '</small></div>'; };
      body = '<p class="hint">Deux parents au hasard et leurs enfants : la peau se mélange, les cheveux foncés dominent, chaque trait du visage vient de l’un des deux parents.</p><div class="dFam"><div class="dLine">' + card(f.a, 'Parent 1') + '<span class="tlink">♥</span>' + card(f.b, 'Parent 2') + '</div><div class="dLine">' + f.kids.map(function (k, i) { return card(k, 'Enfant ' + (i + 1)); }).join('') + '</div></div><div class="dBtns"><button class="btn small" data-a="devfam">Nouvelle famille</button></div>';
    } else if (dv.view === 'crowd') {
      if (!dv.crowd) devCrowd();
      body = '<p class="hint">Des inconnus tirés au hasard, comme dans la partie (âges, humeurs, peau, cheveux).</p><div class="dCrowd">' + dv.crowd.map(function (p) { return '<div class="pic ink-' + INKS[p.seed % INKS.length] + '">' + artImg(p, 192) + '</div>'; }).join('') + '</div><div class="dBtns"><button class="btn small" data-a="devcrowd">Autre foule</button></div>';
    } else if (dv.view === 'inv') {
      body = '<p class="hint">Ce que le jeu a trouvé dans <b>art/perso/</b>. Plus il y a de variantes, moins les gens se ressemblent.</p><div class="dInv">' + WANTED.concat(ART.parts.filter(function (p) { return WANTED.indexOf(p) < 0; })).map(function (part) {
        const n = ART.count(part);
        let extra = '';
        if (part === 'bouche' && n) { const moods = {}; Object.keys(ART.cat.bouche.v).forEach(function (k) { Object.keys(ART.cat.bouche.v[k].moods).forEach(function (m) { moods[m] = 1; }); }); extra = ' · ' + ['contente', 'neutre', 'triste'].map(function (m) { return (moods[m] ? '✓ ' : '✗ ') + m; }).join(', '); }
        return '<div class="' + (n ? 'on' : 'off') + '"><b>' + esc(ART.NAMES[part] || part) + '</b><span>' + (n ? n + ' variante' + (n > 1 ? 's' : '') : (OPTIONAL[part] ? 'aucune (facultatif)' : 'manquant')) + extra + '</span></div>';
      }).join('') + '</div><p class="hint" style="margin-top:10px">Pas encore de version bébé et enfant : dans la partie, les moins de 12 ans gardent les portraits actuels. Ajoute <b>visage-enfant-01</b> pour les activer dès 3 ans.</p>';
    } else if (dv.view === 'cheat') {
      body = '<p class="hint">Raccourcis pour tester. Ils modifient ta partie en cours.</p><div class="opts" style="padding:0">' +
        [['money', '+10 000 €'], ['stats', 'Jauges au maximum'], ['ap', 'Recharger les actions de l’année'], ['age5', 'Avancer de 5 ans (choix automatiques)'], ['lvl', 'Niveau de compte +1'], ['items', 'Recevoir une console et un PC gaming']].map(function (x, i) { return '<button class="opt" data-a="devcheat" data-v="' + x[0] + '"><span class="ol">' + String.fromCharCode(65 + i) + '</span><span class="ot">' + x[1] + '</span></button>'; }).join('') + '</div>';
    }
    openLayer('<div class="modal ink-m dev"><div class="mKick"><span>ATELIER DEV · PORTRAITS DESSINÉS</span><span>' + ART.parts.length + ' parties</span></div>' +
      '<nav class="dTabs">' + tabs.map(function (t) { return '<button data-a="devview" data-v="' + t[0] + '" aria-pressed="' + (dv.view === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</nav>' +
      '<div class="mIn">' + body + '</div>' +
      '<div class="mFoot"><button class="opt dToggle" data-a="devart" aria-pressed="' + !!ART.on + '"><span class="ol">' + (ART.on ? '✓' : '·') + '</span><span class="ot">Portraits dessinés dans la partie : ' + (ART.on ? 'activés' : 'désactivés') + '</span><span class="os">Expérimental · 12 ans et plus</span></button><button class="btn" data-a="close">Fermer</button></div></div>');
  }
  function devFamily() {
    const a = devPerson(L.ri(1, 1e6), { sex: 'F', age: 34 }), b = devPerson(L.ri(1, 1e6), { sex: 'M', age: 36 });
    a.look = D.look(); b.look = L.chance(0.6) ? D.lookNear(a.look, 1) : D.look(); b.look.fr = L.chance(0.5);
    const kids = [0, 1, 2].map(function () { const sex = L.chance(0.5) ? 'M' : 'F'; return { look: D.look(a.look, b.look), age: L.ri(13, 17), sex: sex, mood: L.ri(30, 90), seed: L.ri(1, 1e6) }; });
    S.dev.fam = { a: a, b: b, kids: kids };
  }
  function devCrowd() {
    S.dev.crowd = [];
    for (let i = 0; i < 18; i++) { const sex = L.chance(0.5) ? 'M' : 'F'; const lk = D.look(); S.dev.crowd.push({ look: lk, age: L.ri(14, 90), sex: sex, mood: L.ri(10, 95), seed: L.ri(1, 1e6) }); }
  }
  L.dev = function () { const o = G.A().opts; o.dev = 1; save(); devModal(); return 'Atelier dev ouvert'; };

  function festPick(i) {
    const f = A.fest[i];
    const box = $('#layer .modal');
    if (!f || !box) return;
    const res = A.run('self', 'festival', null, i);
    if (!res) return;
    S.layer = 'q';
    save();
    let bars = '';
    for (let k = 0; k < 14; k++) bars += '<i style="--d:' + (0.25 + Math.random() * 0.5).toFixed(2) + 's;--h:' + (30 + Math.random() * 70).toFixed(0) + '%"></i>';
    box.innerHTML = '<div class="mKick"><span>' + (f.kind === 'dj' ? 'CONCERT' : 'FESTIVAL') + ' · ' + esc(f.st).toUpperCase() + '</span><span>' + G.L().year + '</span></div><div class="stage"><i class="lbeam b1"></i><i class="lbeam b2"></i><i class="lbeam b3"></i><div class="eq">' + bars + '</div><p class="nowp">' + esc(f.n) + '</p></div>';
    sfx('crowd');
    setTimeout(function () { showVerdict(box, res, (f.kind === 'dj' ? 'CONCERT · ' : 'FESTIVAL · ') + f.n.toUpperCase()); }, SLOW() ? 2300 : 250);
  }
  function afterAct(res) {
    UI.refresh();
    if (res) toast(res.title || '', res.t, res.d, res.k);
    notes();
    const l = G.L();
    if (res && l && !l.dead && G.apLeft() === 0 && S.apWarned !== l.year) {
      S.apWarned = l.year;
      toast('Fin de l’année', 'Tu as utilisé tes ' + G.apMax() + ' actions. Appuie sur <b>+1 an</b> pour continuer.', null, 'warn');
    }
    UI.flush();
  }
  function doAct(kind, id, pid, arg) {
    if (arg != null && /^\d+$/.test(String(arg))) arg = Number(arg);
    const res = A.run(kind, id, pid ? Number(pid) : null, arg);
    if (S.layer !== 'q') closeLayer();
    afterAct(res);
  }
  function confirmBox(title, text, yes, fn) {
    S.confirm = fn;
    openLayer('<div class="modal ink-r"><div class="mKick"><span>CONFIRMATION</span></div><div class="mIn"><h2>' + title + '</h2><p class="txt">' + text + '</p></div><div class="mFoot"><button class="btn ghost small" data-a="close">Annuler</button><button class="btn danger small" data-a="yes">' + yes + '</button></div></div>');
  }
  // entretien d'embauche
  function interview(id) {
    const d = D.job(id), sex = G.L().me.sex;
    S.iv = { id: id, qs: A.interview(), ans: [], i: 0, name: L.gs(d.n, sex) };
    ivStep();
  }
  function ivStep() {
    const iv = S.iv;
    if (iv.i >= iv.qs.length) {
      const res = A.apply(iv.id, iv.ans);
      S.iv = null;
      if (!res) { closeLayer(); return; }
      if (res.ok) S.view = null;
      UI.refresh();
      notes();
      showResult({ t: res.t, d: res.d, title: res.title }, res.ok ? 'g' : 'r');
      return;
    }
    const q = iv.qs[iv.i];
    const c = G.ctx();
    openLayer('<div class="modal ink-m"><div class="mKick"><span>ENTRETIEN · ' + esc(iv.name).toUpperCase() + '</span><span>' + (iv.i + 1) + '/' + iv.qs.length + '</span></div><div class="mIn"><h2>« ' + esc(q.q) + ' »</h2><p class="qq">Ta réponse</p></div><div class="opts">' + q.a.map(function (a, j) { return optHtml({ l: L.T(a.l, c) }, j, 'data-a="iv" data-j="' + j + '"'); }).join('') + '</div></div>', 'q');
  }
  function ivAnswer(j) {
    const iv = S.iv;
    if (!iv) return;
    const a = iv.qs[iv.i].a[j];
    if (!a) return;
    iv.ans.push(a);
    iv.i++;
    openLayer('<div class="modal ink-m"><div class="mKick"><span>ENTRETIEN</span><span>' + iv.i + '/' + iv.qs.length + '</span></div><div class="mIn"><p class="qq">Le recruteur</p></div><div class="res"><p>' + esc(a.r) + '</p></div><div class="mFoot"><button class="btn" data-a="ivnext">' + (iv.i >= iv.qs.length ? 'Connaître la réponse' : 'Question suivante') + '</button></div></div>', 'q');
  }
  function cvModal() {
    const l = G.L(), sex = l.me.sex;
    const traits = l.traits.length ? l.traits.map(function (t) { return L.gs(D.TRAITS[t].n, sex); }).join(', ') : 'En construction';
    const dips = l.dip.length ? l.dip.slice().reverse().map(function (d) { return '<li><b>' + d.y + '</b> ' + esc(d.n) + (d.m ? ', mention ' + esc(d.m) : '') + '</li>'; }).join('') : '<li>Aucun pour l’instant</li>';
    const exp = l.cv.length ? l.cv.slice().reverse().map(function (x) { return '<li><b>' + x.from + '–' + (x.to || 'auj.') + '</b> ' + esc(G.jobLabel(x.id, sex, x === l.cv[l.cv.length - 1] && l.job ? l.job.lvl : x.lvl)) + '</li>'; }).join('') : '<li>Pas encore d’expérience</li>';
    const sk = D.SKILLS.map(function (s) { return [s.n, l.sk[s.id]]; }).sort(function (a, b) { return b[1] - a[1]; }).map(function (x) { const n = Math.round(x[1] / 20); return '<li><span>' + esc(x[0]) + '</span><span class="dots">' + '■'.repeat(n) + '□'.repeat(5 - n) + '</span></li>'; }).join('');
    openLayer('<div class="modal ink-c"><div class="mKick"><span>CURRICULUM VITÆ</span><span>' + l.year + '</span></div><div class="cv"><h2>' + esc(l.me.first) + ' ' + esc(l.me.last).toUpperCase() + '</h2><p class="cvm">' + ageTxt(l.me.age) + ' · ' + esc(l.city) + (l.permis ? ' · permis B' : '') + (l.casier ? ' · casier judiciaire' : '') + '</p><h3>Profil</h3><p>' + esc(traits) + ' · charisme ' + Math.round(l.st.c) + '/100 · santé ' + Math.round(l.st.h) + '/100</p><h3>Formation</h3><ul>' + dips + '</ul><h3>Expérience</h3><ul>' + exp + '</ul><h3>Compétences</h3><ul class="cvsk">' + sk + '</ul></div><div class="mFoot"><button class="btn" data-a="close">Fermer</button></div></div>');
  }
  function menuModal() {
    const inGame = S.scr === 'game' && G.L() && !G.L().dead;
    const o = G.A().opts;
    openLayer('<div class="modal ink-c"><div class="mKick"><span>MENU</span><button class="vtap" data-a="devtap">v' + L.VERSION + '</button></div><div class="mIn"><h2>Pause</h2><p class="txt">Ta partie est sauvegardée automatiquement.</p></div><div class="opts">' +
      '<button class="opt" data-a="home"><span class="ol">←</span><span class="ot">Écran titre</span></button>' +
      '<button class="opt" data-a="account"><span class="ol">★</span><span class="ot">Compte, succès et cimetière</span></button>' +
      (o.dev ? '<button class="opt" data-a="dev"><span class="ol">⚙</span><span class="ot">Atelier dev</span><span class="os">Tester tes dessins de personnages, triches</span></button>' : '') +
      '<p class="qq optHead">Son</p>' +
      '<button class="opt" data-a="snd" data-v="sfx" aria-pressed="' + !!o.sfx + '"><span class="ol">♪</span><span class="ot">Bruitages : ' + (o.sfx ? 'activés' : 'coupés') + '</span><span class="os">Tampons, clics, sirènes de succès</span></button>' +
      '<button class="opt" data-a="snd" data-v="mus" aria-pressed="' + !!o.mus + '"><span class="ol">♫</span><span class="ot">Musique d’ambiance : ' + (o.mus ? 'activée' : 'coupée') + '</span><span class="os">Lo-fi d’imprimerie, qui change avec ton âge</span></button>' +
      '<div class="volRow"><span>Volume</span><button class="btn small ghost" data-a="vol" data-v="-1" aria-label="Moins fort">−</button><b>' + Math.round(o.vol * 10) + '/10</b><button class="btn small ghost" data-a="vol" data-v="1" aria-label="Plus fort">+</button></div>' +
      '<p class="qq optHead">Affichage</p>' +
      '<button class="opt" data-a="fs" data-v="1"><span class="ol">A+</span><span class="ot">Agrandir le texte</span></button>' +
      '<button class="opt" data-a="fs" data-v="-1"><span class="ol">A−</span><span class="ot">Réduire le texte</span></button>' +
      (inGame ? '<button class="opt alt" data-a="quitlife"><span class="ol">✕</span><span class="ot">Abandonner cette vie</span><span class="os">Elle n’ira pas au cimetière et ne rapporte rien de plus</span></button>' : '') +
      '</div><div class="mFoot"><button class="btn small" data-a="close">Reprendre</button></div></div>');
  }
  function accountModal() {
    const a = G.A(), need = G.xpNeed(a.lvl);
    const next = D.REWARDS.find(function (r) { return r.lvl > a.lvl; });
    const rw = D.REWARDS.map(function (r) { const ok = a.lvl >= r.lvl; return '<div class="' + (ok ? 'on' : 'off') + '"><b>Niv. ' + r.lvl + ' · ' + esc(r.n) + '</b>' + esc(r.d) + '</div>'; }).join('');
    const got = D.ACH.filter(function (x) { return a.ach[x.id]; }).length;
    const ach = D.ACH.map(function (x) { const ok = !!a.ach[x.id]; return '<div class="' + (ok ? 'on' : 'off') + '"><b>' + esc(x.n) + '</b>' + esc(x.d) + ' · ' + x.xp + ' XP</div>'; }).join('');
    const grave = a.lives.length ? a.lives.map(function (v) { return '<div class="' + (v.legend ? 'gold' : '') + '"><b>' + esc(v.n) + '</b><span>' + v.age + ' ans · ' + esc(v.job || 'sans métier') + ' · ' + L.money(v.money) + '</span><em>' + v.by + '–' + v.dy + '<br>+' + (v.xp || 0) + ' XP</em></div>'; }).join('') : '<p class="empty">Personne pour l’instant. Profite.</p>';
    openLayer('<div class="modal ink-y"><div class="mKick"><span>COMPTE</span><span>' + a.born + ' vie' + (a.born > 1 ? 's' : '') + '</span></div><div class="mIn">' +
      '<div class="lvBig"><span class="n">' + a.lvl + '</span><div style="flex:1;min-width:0"><b style="font-size:1.2rem;font-stretch:85%">' + esc(D.title(a.lvl)) + '</b><div class="mbar" style="margin:6px 0"><i style="width:' + Math.round(a.xp / need * 100) + '%"></i></div><span class="mono" style="font-size:.82rem;color:var(--dim)">' + a.xp + ' / ' + need + ' XP · +3,5 % par niveau</span></div></div>' +
      (next ? '<p class="hint" style="margin-top:10px">Prochaine récompense au niveau ' + next.lvl + ' : <b>' + esc(next.n) + '</b>.</p>' : '') +
      '<p class="hint">L’XP se gagne en vivant : chaque année, diplômes, promotions, mariages, enfants, succès, et un bonus à la mort selon l’âge atteint.</p>' +
      '<section class="sec ink-y"><h3>Récompenses</h3><div class="achs">' + rw + '</div></section>' +
      '<section class="sec ink-c"><h3>Succès <small>' + got + '/' + D.ACH.length + '</small></h3><div class="achs">' + ach + '</div></section>' +
      '<section class="sec ink-m"><h3>Cimetière</h3><div class="grave">' + grave + '</div></section>' +
      '</div><div class="mFoot"><button class="btn" data-a="close">Fermer</button></div></div>');
  }
  function cityModal() {
    const l = G.L();
    const list = D.CITIES.slice().sort(function (a, b) { return a.n.localeCompare(b.n, 'fr'); }).map(function (c, i) { return optHtml({ l: esc(c.n), sub: esc(L.cap(D.SIZE[c.size].n)) + ' · salaires ×' + L.dec(D.SIZE[c.size].sal, 2) + ' · loyers ×' + L.dec(D.SIZE[c.size].rent, 2), dis: c.n === l.city }, i, 'data-a="citypick" data-v="' + esc(c.n) + '"'); }).join('');
    openLayer('<div class="modal ink-c"><div class="mKick"><span>DÉMÉNAGEMENT</span></div><div class="mIn"><h2>Choisis ta nouvelle ville</h2><p class="txt">Ton travail ne te suivra pas, sauf si tu es une star.</p></div><div class="opts">' + list + '</div><div class="mFoot"><button class="btn ghost small" data-a="close">Annuler</button></div></div>');
  }

  // ---------- décès ----------
  const EPI = {
    drole: 'A fait rire tout le monde, jusqu’au bout.', bienveillant: 'Avait toujours un mot gentil pour chacun.', egoiste: 'A gardé le dernier biscuit. Pour toujours.',
    charismatique: 'Illuminait chaque pièce où [il|elle] entrait.', timide: '[Discret|Discrète], mais jamais [oublié|oubliée].', ambitieux: 'Visait toujours plus haut. Même là-haut.',
    nonchalant: 'Ne s’est jamais [pressé|pressée]. Même pour ça.', rebelle: 'N’a jamais suivi les règles.', discipline: 'Toujours à l’heure, même au dernier rendez-vous.',
    colerique: 'Râlait souvent, mais avec passion.', calme: 'Zen jusqu’au dernier souffle.', curieux: 'Voulait savoir ce qu’il y a après. Maintenant, [il|elle] sait.',
    creatif: 'A peint sa vie en couleurs vives.', honnete: 'N’a jamais menti. Enfin, presque.', menteur: 'Jurait qu’[il|elle] reviendrait.'
  };
  UI.dead = function () {
    closeLayer();
    sfx('knell');
    const l = G.L(), d = l.dead, a = G.A(), sex = l.me.sex;
    if (!d) return UI.enterGame();
    const c = G.ctx();
    const epi = L.T(l.traits.length ? EPI[l.traits[0]] : 'Une vie trop courte pour être résumée.', c);
    const cause = d.cause === 'depression' ? L.gx('Parti', 'Partie', sex) + ' à ' + d.age + ' ans, des suites d’une dépression.' : L.gx('Mort', 'Morte', sex) + ' à ' + d.age + ' ans, ' + (D.CAUSES[d.cause] || D.CAUSES.maladie).replace('entouré·e', L.gx('entouré', 'entourée', sex)) + '.';
    const job = l.job ? G.jobTitle() : l.cv.length ? G.jobLabel(l.cv[l.cv.length - 1].id, sex, l.cv[l.cv.length - 1].lvl) : (l.retired ? 'Retraité' + (sex === 'F' ? 'e' : '') : 'Aucun');
    const bestDip = l.dip.slice().sort(function (x, y) { return y.lvl - x.lvl; })[0];
    const kids = l.people.filter(function (p) { return p.rel === 'enf'; }).length;
    const friends = G.alive('ami').length;
    const part = l.people.find(function (p) { return p.rel === 'part'; });
    const heirs = G.heirs();
    $('#sDead').innerHTML = '<div class="dWrap">' + CBAR +
      '<article class="avis" style="margin-top:18px"><span class="reg" style="top:10px;left:10px"></span><span class="reg" style="top:10px;right:10px"></span>' +
      '<p class="kick">AVIS DE DÉCÈS · ' + esc(l.city).toUpperCase() + '</p><h1>' + esc(l.me.first) + ' <span>' + esc(l.me.last) + '</span></h1>' +
      '<p class="dates">' + l.me.by + ' — ' + d.year + '</p><p class="cause">' + esc(cause) + '</p><blockquote>« ' + epi + ' »</blockquote>' +
      '<dl><dt>Métier</dt><dd>' + esc(job) + '</dd><dt>Diplôme</dt><dd>' + esc(bestDip ? bestDip.n : 'Aucun') + '</dd><dt>Famille</dt><dd>' + (part ? esc(L.relName(part)) + ' ' + esc(part.first) + ' · ' : '') + L.plural(kids, 'enfant') + '</dd><dt>Amis</dt><dd>' + friends + '</dd><dt>Fortune</dt><dd>' + L.money(l.money) + '</dd><dt>Caractère</dt><dd>' + esc(l.traits.map(function (t) { return L.gs(D.TRAITS[t].n, sex); }).join(', ') || 'Pas encore forgé') + '</dd></dl></article>' +
      (d.cause === 'depression' ? HELP.replace('class="help"', 'class="help" style="margin:18px 0 0"') : '') +
      '<div class="dXp"><div class="bigNum"><b>+' + (l.xpLife || 0) + '</b><span>XP pour ton compte</span></div><button class="lvChip" data-a="account">Niveau ' + a.lvl + ' · ' + esc(D.title(a.lvl)) + '</button></div>' +
      (heirs.length ? '<section class="heirs"><h3>Continuer avec un enfant</h3><div class="list">' + heirs.map(function (p) { return '<button class="pr" data-a="heir" data-p="' + p.id + '">' + UI.pic(p) + '<span class="pn">' + esc(p.first) + ' ' + esc(p.last) + '</span><span class="pm">' + esc(L.relName(p)) + ' · ' + ageTxt(p.age) + '</span><span class="rq">Jouer ›</span></button>'; }).join('') + '</div><p class="hint" style="margin-top:8px">Ton enfant hérite de ta fortune (moins 20 % de droits de succession, partagée entre frères et sœurs).</p></section>' : '') +
      '<div class="dBtns"><button class="btn" data-a="new">Nouvelle vie</button><button class="btn ghost" data-a="home">Écran titre</button></div></div>';
    show('dead');
    notes();
  };

  // ---------- actions ----------
  function setSheet(open, tab) {
    if (tab) { if (S.tab !== tab) S.view = null; S.tab = tab; }
    S.sheet = open;
    renderPanel();
    renderNav();
  }
  function ageUp() {
    const l = G.L();
    if (!l || l.dead) return;
    if (G.pending()) { UI.flush(); return; }
    if (!G.ageUp()) return;
    sfx('stamp');
    if (L.SND) L.SND.mood(moodOf(l.me.age));
    S.view = null;
    if (S.sheet) S.sheet = false;
    renderAll(false);
    UI.flush();
  }
  const H = {
    continue: function () { const l = G.L(); if (!l) return UI.title(); if (l.dead) return UI.dead(); UI.enterGame(); },
    new: function () { S.cf = null; UI.create(); },
    home: function () { closeLayer(); save(); UI.title(); },
    account: function () { accountModal(); },
    menu: function () { menuModal(); },
    close: function () { closeLayer(); if (G.L() && G.pending()) UI.flush(); },
    'dice-first': function () { const f = S.cf; f.first = D.firstName(f.sex === 'X' ? L.pick(['M', 'F']) : f.sex, f.year); UI.create(); },
    'dice-last': function () { S.cf.last = L.pick(D.LAST); UI.create(); },
    sex: function (ds) { S.cf.sex = ds.v; UI.create(); },
    reroll: function () { const f = S.cf; f.fam = G.rollFamily(f.year, G.has('richesse') && f.wealth ? f.wealth : null); UI.create(); },
    born: function () {
      const f = S.cf;
      const clean = function (s) { return String(s || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24); };
      const r = yearRange();
      const year = clamp(parseInt(f.year, 10) || nowYear(), r[0], r[1]);
      const first = L.cap(clean(f.first) || D.firstName(f.sex === 'F' ? 'F' : 'M', year));
      const last = L.cap(clean(f.last) || L.pick(D.LAST));
      if (f.fam && f.year !== year) f.fam = null;
      G.newLife({ first: first, last: last, sex: f.sex, city: f.city, year: year, skill: f.skill, trait: f.trait, wealth: f.wealth, fam: G.has('reroll') ? f.fam : null });
      S.cf = null; S.tab = 'moi';
      save();
      notes();
      UI.enterGame();
    },
    age: ageUp,
    tab: function (ds) { if (S.tab !== ds.v) S.view = null; S.tab = ds.v; renderPanel(); renderNav(); },
    navtab: function (ds) { if (S.sheet && S.tab === ds.v && !S.view) setSheet(false); else setSheet(true, ds.v); },
    'sheet-close': function () { setSheet(false); },
    act: function (ds) {
      const d = A.get(ds.k, ds.id);
      if (!d) return;
      if (d.ui === 'cine') return cineModal();
      if (d.ui === 'jv' || d.ui === 'livre') return mediaModal(d.ui);
      if (d.ui === 'fest') return festModal();
      if (d.pick) return openPick(ds.k, ds.id, ds.p);
      doAct(ds.k, ds.id, ds.p);
    },
    pickopt: function (ds) {
      const d = A.get(ds.k, ds.id);
      if (d && d.next) { const o = d.next(ds.v); if (o) return openPick(ds.k, ds.id, ds.p, o, 'Choisis un profil.'); }
      doAct(ds.k, ds.id, ds.p, ds.v);
    },
    mediapick: function (ds) { mediaPick(ds.m, Number(ds.i)); },
    tree: function () { treeModal(); },
    treeperson: function (ds) { closeLayer(); S.view = { t: 'person', id: Number(ds.p) }; S.tab = 'proches'; S.sheet = true; renderPanel(); renderNav(); },
    devtap: function () { S.devTaps = (S.devTaps || 0) + 1; if (S.devTaps >= 5) { S.devTaps = 0; L.dev(); toast('Mode dev', 'Atelier dev débloqué : il est aussi dans le menu.'); } },
    dev: function () { devModal(); },
    devview: function (ds) { S.dev.view = ds.v; devModal(); },
    devp: function (ds) {
      const ART = L.ART, part = ds.part, cur = ART.choose(labPerson())[part];
      const list = (OPTIONAL[part] ? [null] : []).concat(ART.cat[part].nums);
      let i = list.indexOf(cur);
      i = (i + Number(ds.d) + list.length) % list.length;
      S.dev.pick[part] = list[i];
      devModal();
    },
    devskin: function (ds) { S.dev.skin = ds.v; devModal(); },
    devhair: function (ds) { S.dev.hair = ds.v; devModal(); },
    devmood: function (ds) { S.dev.mood = Number(ds.v); devModal(); },
    devage: function (ds) { S.dev.age = Number(ds.v); devModal(); },
    devsex: function (ds) { S.dev.sex = ds.v; devModal(); },
    devbeard: function (ds) { S.dev.beard = ds.v === '1'; devModal(); },
    devrand: function () {
      const dv = S.dev, ART = L.ART;
      dv.base = devPerson(L.ri(1, 1e6)); dv.skin = null; dv.hair = null; dv.mood = L.pick([20, 50, 80]); dv.beard = L.chance(0.3);
      dv.pick = {};
      ART.parts.forEach(function (p) { const nums = ART.cat[p].nums; dv.pick[p] = OPTIONAL[p] && p !== 'cheveux-avant' && L.chance(0.5) ? null : L.pick(nums); });
      devModal();
    },
    devreset: function () { S.dev.pick = {}; S.dev.skin = null; S.dev.hair = null; devModal(); },
    devfam: function () { devFamily(); devModal(); },
    devcrowd: function () { devCrowd(); devModal(); },
    devart: function () {
      const o = G.A().opts;
      o.art = o.art ? 0 : 1;
      L.ART.on = !!o.art;
      save();
      if (L.ART.on) L.ART.preload(function () { UI.refresh(); devModal(); }); else { UI.refresh(); devModal(); }
    },
    devcheat: function (ds) {
      const l = G.L();
      if (!l || l.dead) return;
      if (ds.v === 'money') l.money += 10000;
      else if (ds.v === 'stats') ['h', 'b', 'c', 's'].forEach(function (k) { l.st[k] = 100; });
      else if (ds.v === 'ap') l.ap = 0;
      else if (ds.v === 'lvl') { const a = G.A(); G.gainXP(G.xpNeed(a.lvl) - a.xp); notes(); }
      else if (ds.v === 'items') ['console', 'pcgaming'].forEach(function (id) { if (!G.owns(id) && D.itemName(D.item(id), l.year)) l.items.push({ id: id, y: l.year }); });
      else if (ds.v === 'age5') { G.autoplay(5); if (G.L().dead) { closeLayer(); save(); UI.dead(); return; } }
      save();
      UI.refresh();
      toast('Triche appliquée', esc({ money: '+10 000 €', stats: 'Jauges à 100', ap: 'Actions rechargées', lvl: 'Niveau +1', items: 'Console et PC gaming ajoutés', age5: '5 ans plus tard…' }[ds.v] || ''));
    },
    festpick: function (ds) { festPick(Number(ds.i)); },
    interest: function (ds) { afterAct(A.toggleInterest(ds.id)); },
    qdice: function (ds) { const i = $('#qIn'); if (i) { i.value = D.firstName(ds.s === 'F' ? 'F' : 'M', G.L().year); i.focus(); } },
    snd: function (ds) { const o = G.A().opts; o[ds.v] = o[ds.v] ? 0 : 1; if (L.SND) { L.SND.unlock(); L.SND.set(o); } save(); menuModal(); },
    vol: function (ds) { const o = G.A().opts; o.vol = clamp(Math.round((o.vol + Number(ds.v) * 0.1) * 10) / 10, 0, 1); if (L.SND) L.SND.set(o); sfx('tap'); save(); menuModal(); },
    person: function (ds) { S.view = { t: 'person', id: Number(ds.p) }; S.tab = 'proches'; renderPanel(); },
    back: function () { S.view = null; renderPanel(); },
    train: function (ds) { afterAct(A.train(ds.id)); },
    diet: function (ds) { const l = G.L(); l.diet = ds.v; renderPanel(); toast('Régime alimentaire', { malbouffe: 'Malbouffe : frites, sodas, bonheur immédiat. Ta santé, elle, fera la grimace chaque année.', equilibre: 'Équilibré : un peu de tout, ni trop, ni trop peu.', sain: 'Healthy : brocolis, quinoa, smoothies verts. Ta santé te remerciera chaque année.' }[ds.v]); save(); },
    club: function (ds) { afterAct(A.club(ds.id)); },
    stopschool: function () {
      const sup = G.L().edu.st === 'sup';
      confirmBox(sup ? 'Abandonner les études ?' : 'Arrêter l’école ?', sup ? 'Tu gardes tes diplômes déjà obtenus, mais pas celui en cours.' : 'Tu quittes l’école sans le diplôme en cours. Tu pourras reprendre des études plus tard.', 'Arrêter', function () { afterAct(A.stopSchool()); });
    },
    study: function () { if (A.studyAgain()) UI.flush(); },
    job: function (ds) { S.view = { t: 'job', id: ds.id }; renderPanel(); const b = $('#pBody'); if (b) b.scrollTop = 0; },
    apply: function (ds) {
      const d = D.job(ds.id);
      if (!d || A.applyWhy(ds.id)) return;
      if (d.cat === 'petit') { const res = A.apply(ds.id, []); if (res && res.ok) S.view = null; UI.refresh(); notes(); showResult({ t: res.t, d: res.d, title: res.title }, res.ok ? 'g' : 'r'); return; }
      interview(ds.id);
    },
    iv: function (ds) { ivAnswer(Number(ds.j)); },
    ivnext: function () { ivStep(); },
    cv: function () { cvModal(); },
    quitjob: function () { confirmBox('Démissionner ?', 'Tu quittes ton poste de ' + esc(G.jobTitle()) + '. Pas de chômage après une démission.', 'Démissionner', function () { afterAct(A.quit()); }); },
    retire: function () { afterAct(A.retire()); },
    buy: function (ds) { afterAct(A.buy(ds.id)); },
    sell: function (ds) { if (G.apLeft() <= 0) return toast('Plus de temps', 'Tu as utilisé toutes tes actions de l’année.'); G.spend(); const res = G.sell(Number(ds.i)); if (res) { res.title = 'Vente'; G.afterAction(); } afterAct(res); },
    adopt: function (ds) { afterAct(A.adopt(ds.id)); },
    adoptkid: function () { afterAct(A.adoptChild()); },
    move: function (ds) { afterAct(A.move(ds.id)); },
    permis: function () { afterAct(A.permis()); },
    city: function () { if (!A.cityWhy()) cityModal(); },
    citypick: function (ds) { closeLayer(); afterAct(A.moveCity(ds.v)); },
    qopt: function (ds) {
      const q = G.pending();
      if (!q) return UI.flush();
      const ink = (G.view(q) || {}).ink;
      const inp = $('#qIn');
      const res = G.answer(ds.id, inp ? inp.value : undefined);
      UI.refresh();
      notes();
      if (res && res.t) showResult(res, ink); else UI.flush();
    },
    next: function () { UI.flush(); },
    heir: function (ds) { if (G.continueAs(Number(ds.p))) { save(); notes(); S.tab = 'moi'; UI.enterGame(); } },
    quitlife: function () { confirmBox('Abandonner cette vie ?', 'Elle disparaît pour de bon : pas d’avis de décès, pas de cimetière. Ton compte garde son niveau et l’XP déjà gagnée.', 'Abandonner', function () { G.endLife(); save(); UI.title(); }); },
    yes: function () { const fn = S.confirm; S.confirm = null; closeLayer(); if (fn) fn(); },
    fs: function (ds) { const o = G.A().opts; o.fs = clamp((o.fs || 16) + Number(ds.v), 14, 21); UI.applyFs(); save(); }
  };
  UI.applyFs = function () { document.documentElement.style.setProperty('--fs', (G.A().opts.fs || 16) + 'px'); };

  UI.init = function () {
    if (L.SND) L.SND.set(G.A().opts);
    if (L.ART) { L.ART.on = !!G.A().opts.art; if (L.ART.on && L.ART.has()) L.ART.preload(function () { UI.refresh(); }); }

    document.addEventListener('pointerdown', function () { if (L.SND) L.SND.unlock(); }, true);
    document.addEventListener('keydown', function () { if (L.SND) L.SND.unlock(); }, true);
    document.addEventListener('click', function (ev) {
      const t = ev.target.closest('[data-a]');
      if (!t || t.disabled) return;
      const fn = H[t.dataset.a];
      if (!fn) return;
      ev.preventDefault();
      if (t.dataset.a !== 'age' && t.dataset.a !== 'vol') sfx('tap');
      try { fn(t.dataset, t); } catch (e) { console.error(e); toast('Oups', 'Quelque chose s’est mal passé. Ta partie est sauvegardée.'); }
    });
    const cr = $('#sCreate');
    cr.addEventListener('input', formInput);
    cr.addEventListener('change', formInput);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target && e.target.id === 'qIn') { e.preventDefault(); const b = $('#layer .opt[data-a="qopt"]'); if (b) b.click(); return; }
      if (e.key === 'Escape' && S.layer === 'free') { closeLayer(); return; }
      if (e.key === 'Escape' && S.sheet) { setSheet(false); }
    });
    UI.applyFs();
  };
  UI.reload = function () {
    if (S.scr === 'game' && G.L() && !G.L().dead) UI.enterGame();
    else if (S.scr === 'dead' && G.L() && G.L().dead) UI.dead();
    else if (S.scr === 'title') UI.title();
  };
})(window.LP);
