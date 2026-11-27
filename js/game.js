/* LifePPF — moteur de vie : état, création, année qui passe, école, métiers, argent, santé, mort. Aucun accès au DOM. */
(function (L) {
  'use strict';
  const D = L.D;
  const G = L.G = {};
  const KEY = 'lifeppf.save.v1';
  const clamp = L.clamp;
  let S = null;
  let notes = [];
  const fns = [];

  G.on = function (fn) { fns.push(fn); };
  G.emit = function (ev, d) { fns.forEach(function (fn) { try { fn(ev, d); } catch (e) { console.error(e); } }); };

  // ---------- sauvegarde ----------
  const OPTS = { fs: 17, motion: 1, sfx: 1, mus: 1, vol: 0.7, mvol: 0.45 };
  function newAccount() { return { xp: 0, lvl: 1, ach: {}, lives: [], opts: Object.assign({}, OPTS), born: 0 }; }
  G.init = function (save) {
    S = save && save.account ? save : { account: newAccount(), life: null, savedAt: 0 };
    const a = S.account;
    a.ach = a.ach || {}; a.lives = a.lives || []; a.opts = Object.assign({}, OPTS, a.opts || {});
    a.xp = a.xp || 0; a.lvl = a.lvl || 1; a.born = a.born || 0;
  };
  G.S = function () { return S; };
  G.L = function () { return S && S.life; };
  G.A = function () { return S.account; };
  G.exportSave = function () { S.savedAt = Date.now(); return JSON.parse(JSON.stringify(S)); };
  G.importSave = function (s) { G.init(s); G.emit('load'); };
  G.saveLocal = function () { try { S.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } };
  G.loadLocal = function () { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } };
  G.note = function (n) { notes.push(n); };
  G.takeNotes = function () { const n = notes; notes = []; return n; };

  // ---------- compte : XP, niveaux, succès ----------
  G.xpNeed = function (lvl) { return Math.round(150 * Math.pow(1.035, lvl - 1)); };
  G.gainXP = function (n) {
    const a = S.account;
    n = Math.round(n);
    if (n <= 0) return;
    a.xp += n;
    if (S.life) S.life.xpLife = (S.life.xpLife || 0) + n;
    while (a.xp >= G.xpNeed(a.lvl)) {
      a.xp -= G.xpNeed(a.lvl);
      a.lvl++;
      G.note({ k: 'lvl', lvl: a.lvl, rw: D.REWARDS.filter(function (r) { return r.lvl === a.lvl; }) });
    }
  };
  G.has = function (id) { const r = D.REWARDS.find(function (x) { return x.id === id; }); return !!r && S.account.lvl >= r.lvl; };
  G.ach = function (id) {
    const a = S.account;
    if (a.ach[id]) return false;
    const d = D.ach(id);
    if (!d) return false;
    a.ach[id] = S.life ? S.life.year : 1;
    G.note({ k: 'ach', a: d });
    G.gainXP(d.xp);
    return true;
  };
  G.luck = function (p) { return clamp(p + (G.has('etoile') ? 0.05 : 0), 0, 0.99); };

  // ---------- personnes ----------
  function mk(o) {
    const l = S.life;
    const sex = o.sex || (L.chance(0.5) ? 'M' : 'F');
    const age = o.age || 0;
    const p = {
      id: ++l.nid, rel: o.rel, sex: sex,
      first: o.first || D.firstName(sex, l.year - age),
      last: o.last || L.pick(D.LAST),
      age: age, rq: o.rq != null ? o.rq : L.ri(40, 65), alive: true,
      look: o.look || D.look(), nt: o.nt || L.pick(D.NPC_TRAITS), job: o.job || null, met: l.me.age
    };
    if (o.extra) Object.assign(p, o.extra);
    l.people.push(p);
    return p;
  }
  G.mk = mk;
  G.tmp = function (kind) {
    const l = S.life, a = l.me.age;
    let age;
    if (kind === 'peer') age = clamp(a + L.ri(-1, 1), 2, 110);
    else if (kind === 'crush') age = a < 18 ? clamp(a + L.ri(-1, 1), 10, 17) : clamp(a + L.ri(-5, 5), 18, 100);
    else if (kind === 'kid') age = L.ri(5, 12);
    else if (kind === 'old') age = L.ri(66, 92);
    else age = L.ri(24, 60);
    const sex = kind === 'crush' ? G.loveSex() : L.chance(0.5) ? 'M' : 'F';
    return { id: 0, tmp: 1, rel: '', sex: sex, first: D.firstName(sex, l.year - age), last: L.pick(D.LAST), age: age, rq: L.ri(35, 60), alive: true, look: D.look(), nt: L.pick(D.NPC_TRAITS), met: a };
  };
  G.keep = function (p, rel, rq) {
    const l = S.life;
    if (p.tmp) { delete p.tmp; p.id = ++l.nid; l.people.push(p); }
    p.rel = rel;
    if (rq != null) p.rq = rq;
    p.met = l.me.age;
    p.seen = l.year;
    if (rel === 'ami' && G.alive('ami').length >= 8) G.ach('populaire');
    if (rel === 'enn' && G.alive('enn').length >= 4) G.ach('ennemis');
    return p;
  };
  // orientation : le sexe des personnes rencontrées en amour
  G.loveSex = function () {
    const l = S.life, me = l ? l.me.sex : 'M', ori = l && l.ori;
    const any = L.chance(0.5) ? 'M' : 'F';
    if (!ori || ori === 'bi' || me === 'X') return any;
    if (ori === 'homo') return me;
    return me === 'F' ? 'M' : 'F';
  };
  G.byId = function (id) { return S.life.people.find(function (p) { return p.id === id; }); };
  G.alive = function (rel) {
    const rels = rel ? (Array.isArray(rel) ? rel : [rel]) : null;
    return S.life.people.filter(function (p) { return p.alive && (!rels || rels.indexOf(p.rel) >= 0); });
  };
  G.partner = function () { return G.alive('part')[0] || null; };
  G.parents = function () { return G.alive(['mere', 'pere', 'par']); };
  G.FAM = ['mere', 'pere', 'par', 'sib', 'gp'];
  G.cat = function (p) { return G.FAM.indexOf(p.rel) >= 0 ? 'fam' : p.rel; };

  const ROLES = {
    mere: function () { return L.pick(G.alive('mere')); },
    pere: function () { return L.pick(G.alive('pere')); },
    par: function () { return L.pick(G.parents()); },
    sib: function () { return L.pick(G.alive('sib')); },
    sibY: function () { return L.pick(G.alive('sib').filter(function (p) { return p.age < S.life.me.age; })); },
    sibO: function () { return L.pick(G.alive('sib').filter(function (p) { return p.age > S.life.me.age; })); },
    gp: function () { return L.pick(G.alive('gp')); },
    ami: function () { return L.pick(G.alive('ami')); },
    part: function () { return G.partner(); },
    enf: function () { return L.pick(G.alive('enf')); },
    enfK: function () { return L.pick(G.alive('enf').filter(function (p) { return p.age >= 3 && p.age <= 12; })); },
    enfT: function () { return L.pick(G.alive('enf').filter(function (p) { return p.age >= 13 && p.age <= 19; })); },
    enfA: function () { return L.pick(G.alive('enf').filter(function (p) { return p.age >= 24; })); },
    coll: function () { return L.pick(G.alive('coll')); },
    boss: function () { return G.alive('boss')[0]; },
    enn: function () { return L.pick(G.alive('enn')); },
    pet: function () { return L.pick(G.alive('pet')); },
    ex: function () { return L.pick(G.alive('ex')); }
  };
  G.role = function (name) { const f = ROLES[name]; return f ? f() || null : null; };
  G.ctx = function (roles) { const l = S.life; return { me: l.me, life: l, r: roles || {}, v: {} }; };

  // ---------- traits ----------
  G.is = function (t) {
    const l = S.life;
    if (!l) return false;
    if (l.traits && l.traits.length) return l.traits.indexOf(t) >= 0;
    const o = D.TRAITS[t] && D.TRAITS[t].opp;
    return l.tr[t] >= 6 && l.tr[t] > (o ? l.tr[o] : 0) + 2;
  };
  G.trait = function (t, v) {
    const l = S.life;
    if (!l || !(t in l.tr)) return;
    if (l.traits.length) return; // le caractère est forgé
    l.tr[t] = Math.max(0, l.tr[t] + v);
  };
  function traitScore(l, t) { const o = D.TRAITS[t].opp; return l.tr[t] - (o ? l.tr[o] * 0.6 : 0); }
  G.tendencies = function () {
    const l = S.life;
    return D.TRAIT_IDS.map(function (t) { return { t: t, v: traitScore(l, t) }; })
      .filter(function (x) { return x.v > 0.5; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 4);
  };
  G.fixTraits = function () {
    const l = S.life;
    const list = D.TRAIT_IDS.map(function (t) { return { t: t, v: traitScore(l, t) }; }).sort(function (a, b) { return b.v - a.v; });
    const out = [];
    list.forEach(function (x) {
      if (out.length >= 3 || x.v < 4) return;
      if (out.some(function (y) { return D.TRAITS[y].opp === x.t; })) return;
      out.push(x.t);
    });
    if (!out.length) out.push(list[0].v > 0 ? list[0].t : L.pick(D.TRAIT_IDS));
    l.traits = out;
    return out;
  };

  // ---------- effets ----------
  function modStat(k, v) {
    if (v > 0) {
      if (k === 'b' && G.is('nonchalant')) v *= 1.15;
      if (k === 's' && G.is('drole')) v *= 1.25;
      if (k === 's' && G.is('timide')) v *= 0.75;
      if (k === 'c' && G.is('charismatique')) v *= 1.2;
    } else if (v < 0) {
      if (k === 'b' && G.is('calme')) v *= 0.8;
      if (k === 'b' && G.is('colerique')) v *= 1.1;
    }
    return v;
  }
  G.rel = function (p, v) {
    if (v > 0) {
      if (G.is('bienveillant')) v *= 1.3;
      if (G.is('egoiste')) v *= 0.75;
    }
    const before = p.rq;
    p.rq = clamp(p.rq + v, 0, 100);
    p.seen = S.life.year;
    return Math.round(p.rq - before);
  };
  G.skill = function (id, v) {
    const l = S.life;
    const cur = l.sk[id] || 0;
    if (v > 0) {
      if (G.is('curieux')) v *= 1.3;
      if (G.is('creatif') && (id === 'art' || id === 'musique')) v *= 1.25;
      v *= Math.max(0.15, 1 - cur / 125);
      if (l.me.age >= 25) v *= 0.8;
    }
    l.sk[id] = clamp(cur + v, 0, 100);
    return l.sk[id] - cur;
  };
  // au-delà de 17/20, chaque point se gagne beaucoup plus difficilement
  function gUp(g, v) { return v <= 0 ? v : v * (g < 15 ? 1 : g < 17 ? 0.6 : g < 18.5 ? 0.25 : 0.1); }
  G.soften = function (g) { return g <= 17 ? g : 17 + (g - 17) * 0.4; };
  G.grade = function (v) {
    const e = S.life.edu;
    if (e.st === 'sup' && e.sup) e.sup.g = clamp(e.sup.g + gUp(e.sup.g, v), 0, 20);
    else if (G.inSchool()) e.g = clamp(e.g + gUp(e.g, v), 0, 20);
  };
  // applique des effets ; renvoie les écarts réels (pour les pastilles)
  G.fx = function (fx, c) {
    const l = S.life, d = {};
    if (!fx || !l) return d;
    c = c || G.ctx();
    if (typeof fx === 'function') fx = fx(c) || {};
    ['h', 'b', 'c', 's'].forEach(function (k) {
      if (!fx[k]) return;
      const before = l.st[k];
      l.st[k] = clamp(before + modStat(k, fx[k]), 0, 100);
      const dd = Math.round(l.st[k] - before);
      if (dd) d[k] = dd;
    });
    if (fx.m) { l.money += Math.round(fx.m); d.m = Math.round(fx.m); }
    if (fx.sk) Object.keys(fx.sk).forEach(function (k) { const dd = G.skill(k, fx.sk[k]); if (Math.abs(dd) >= 0.5) { d.sk = d.sk || {}; d.sk[k] = Math.round(dd); } });
    if (fx.tr) Object.keys(fx.tr).forEach(function (k) { G.trait(k, fx.tr[k]); });
    if (fx.rq) Object.keys(fx.rq).forEach(function (role) {
      const p = c.r[role];
      if (!p || p.tmp) return;
      const dd = G.rel(p, fx.rq[role]);
      if (dd) { d.rq = d.rq || []; d.rq.push([p.first, dd]); }
    });
    if (fx.rq0) Object.keys(fx.rq0).forEach(function (role) {
      const p = c.r[role];
      if (!p || p.tmp) return;
      const before = p.rq;
      p.rq = clamp(p.rq + fx.rq0[role], 0, 100); p.seen = l.year;
      const dd = Math.round(p.rq - before);
      if (dd) { d.rq = d.rq || []; d.rq.push([p.first, dd]); }
    });
    if (fx.g) G.grade(fx.g);
    if (fx.perf && l.job) l.job.perf = clamp(l.job.perf + fx.perf, 0, 100);
    if (fx.ill) G.sick(fx.ill);
    if (fx.flag) l.flags[fx.flag] = (l.flags[fx.flag] || 0) + 1;
    if (fx.acts) l.acts += fx.acts;
    if (fx.ach) G.ach(fx.ach);
    if (fx.xp) G.gainXP(fx.xp);
    if (fx.fn) fx.fn(c);
    return d;
  };

  // ---------- journal ----------
  G.block = function () { const l = S.life; return l.log[l.log.length - 1]; };
  G.log = function (html, d, kind) {
    const b = G.block();
    if (!b || !html) return;
    const line = { t: html };
    if (S.life.clock != null) line.dt = S.life.clock;
    if (d && Object.keys(d).length) line.d = d;
    if (kind) line.k = kind;
    b.L.push(line);
  };
  G.say = function (text, fx, c, kind) {
    c = c || G.ctx();
    const d = G.fx(fx, c);
    const t = L.T(text, c);
    G.log(t, d, kind);
    return { t: t, d: d };
  };
  // ---------- temps de l'année : nombre d'actions et dates du journal ----------
  G.apMax = function (a) { a = a == null ? S.life.me.age : a; return a < 6 ? 8 : a < 16 ? 15 : a < 30 ? 22 : 28; };
  G.apLeft = function () { const l = S.life; return l ? Math.max(0, G.apMax() - (l.ap || 0)) : 0; };
  // une action prend un créneau de l'année : sa date tombe au hasard dans ce créneau, toujours après la précédente
  G.spend = function () {
    const l = S.life;
    if (!l || G.apLeft() <= 0) return false;
    const N = G.apMax(), k = l.ap || 0;
    const a = Math.floor(k * 365 / N), b = Math.max(a + 1, Math.floor((k + 1) * 365 / N));
    let day = L.ri(a, b - 1);
    if (l.clock != null && day <= l.clock) day = Math.min(364, l.clock + 1);
    l.clock = day;
    l.ap = k + 1;
    return true;
  };
  G.msg = function (title, text, kicker, ink) { S.life.queue.push({ k: 'msg', title: title, text: text, kicker: kicker || '', ink: ink || 'y' }); };

  // ---------- création ----------
  function survives(age) {
    if (age < 70) return L.chance(0.95);
    if (age < 80) return L.chance(0.8);
    if (age < 90) return L.chance(0.5);
    if (age < 100) return L.chance(0.18);
    return L.chance(0.02);
  }
  function parentAge() {
    const b = L.wpick([[19, 22, 10], [23, 27, 25], [28, 32, 33], [33, 37, 22], [38, 45, 10]], function (x) { return x[2]; });
    return L.ri(b[0], b[1]);
  }
  function parentJob(w, year) {
    if (L.chance(0.06)) return 'chomage';
    if (L.chance(0.06)) return 'foyer';
    const list = w.jobs.filter(function (id) { const j = D.job(id); return j && (!j.yr || (year >= j.yr[0] && year <= j.yr[1])); });
    return L.pick(list) || 'facteur';
  }
  G.jobLabel = function (id, sex, lvl) {
    if (id === 'chomage') return 'sans emploi';
    if (id === 'foyer') return L.gx('père au foyer', 'mère au foyer', sex);
    if (id === 'retraite') return L.gx('retraité', 'retraitée', sex);
    const j = D.job(id);
    if (!j) return '';
    const t = j.lv ? j.lv[Math.min(lvl != null ? lvl : 1, j.lv.length - 1)] : j.n;
    return L.gs(t, sex);
  };
  G.rollFamily = function (year, wid) {
    const w = wid ? D.wealth(wid) : L.wpick(D.WEALTH);
    const ma = parentAge();
    const pa = clamp(ma + L.ri(-3, 6), 19, 45);
    const young = Math.min(ma, pa);
    const maxOld = Math.max(0, Math.floor((young - 19) / 1.6));
    let n = L.wpick([0, 1, 2, 3, 4, 5, 6, 7, 8], function (k) { return [30, 32, 20, 9, 4, 2, 1.2, 0.5, 0.3][k]; });
    if (young <= 21) n = L.chance(0.15) ? 1 : 0;
    n = Math.min(n, maxOld);
    const ages = [];
    const pool = [];
    for (let a = 1; a <= young - 19; a++) pool.push(a);
    L.shuffle(pool).slice(0, n).sort(function (a, b) { return b - a; }).forEach(function (a) { ages.push(a); });
    const sibs = ages.map(function (a) { const sex = L.chance(0.5) ? 'M' : 'F'; return { sex: sex, age: a, first: D.firstName(sex, year - a) }; });
    const gps = [];
    [['p', pa], ['m', ma]].forEach(function (side) {
      const gpa = side[1] + L.ri(20, 38), gma = side[1] + L.ri(19, 36);
      if (survives(gpa)) gps.push({ side: side[0], sex: 'M', age: gpa, first: D.firstName('M', year - gpa) });
      if (survives(gma)) gps.push({ side: side[0], sex: 'F', age: gma, first: D.firstName('F', year - gma) });
    });
    return {
      wealth: w.id,
      mom: { first: D.firstName('F', year - ma), age: ma, job: parentJob(w, year) },
      dad: { first: D.firstName('M', year - pa), age: pa, job: parentJob(w, year) },
      sibs: sibs, gps: gps, mlast: L.pick(D.LAST)
    };
  };

  function baseLife(o) {
    const l = {
      v: 1, gen: o.gen || 1, nid: 0,
      me: { first: o.first, last: o.last, sex: o.sex, age: o.age || 0, by: o.year - (o.age || 0), bd: o.bd || birthday(), look: o.look || D.look() },
      city: o.city, born: o.city, country: 'France', year: o.year,
      st: { h: 50, b: 50, c: 50, s: 50 },
      money: 0, people: [], log: [], tr: {}, traits: [], sk: {},
      edu: { st: 'none', i: 0, g: 12, clubs: [], fil: null, sup: null, cap: null, rep: 0, warn: 0 },
      dip: [], job: null, cv: [], home: 'parents', items: [], ill: [], add: {}, diet: 'equilibre',
      flags: {}, evLast: {}, done: {}, acts: 0, ap: 0, clock: null, yr: {},
      ori: null, oriAge: L.ri(12, 14), ints: [], preg: null, anec: {},
      mots: {}, motQ: {}, motEv: {}, intEv: {}, cold: [], gun: 0,
 lonely: 0, depr: 0, casier: 0, prison: 0,
      queue: [], dead: null, wealth: o.wealth || 'moyenne', offers: null, xpLife: 0,
      novel: null, yt: null, permis: 0, loan: null, chomage: null, retired: 0, pension: 0, travels: [],
      stats: { mar: 0, kids: 0, jobs: 0, grandkids: 0 }, budget: null, cnt: {}
    };
    D.SKILLS.forEach(function (s) { l.sk[s.id] = 0; });
    D.TRAIT_IDS.forEach(function (t) { l.tr[t] = 0; });
    return l;
  }
  function lc(s) { return s && !/^[A-ZÀ-Ý]{2}/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function birthday() { const d = L.ri(1, 28); return (d === 1 ? '1er' : d) + ' ' + L.pick(MONTHS); }

  // petit avantage de départ dans les compétences du métier des parents
  function inherit(jobs) {
    const out = {};
    jobs.forEach(function (id) {
      const j = id && D.job(id);
      if (!j || !j.req || !j.req.sk) return;
      Object.keys(j.req.sk).forEach(function (k) { if (L.chance(0.6)) out[k] = Math.max(out[k] || 0, L.ri(3, 7)); });
    });
    return out;
  }
  G.inherit = inherit;
  G.newLife = function (o) {
    const year = o.year || new Date().getFullYear();
    const fam = o.fam || G.rollFamily(year, G.has('richesse') ? o.wealth : null);
    const l = baseLife({ first: o.first, last: o.last, sex: o.sex, city: o.city, year: year, wealth: fam.wealth });
    S.life = l;
    // famille
    // génétique : un couple qui se ressemble souvent, des grands-parents assortis, des enfants qui mélangent les deux
    const mLook = D.look(), pLook = L.chance(0.65) ? D.lookNear(mLook, 1) : D.look();
    const mom = mk({ rel: 'mere', sex: 'F', first: fam.mom.first, last: fam.mlast, age: fam.mom.age, rq: L.ri(68, 90), job: fam.mom.job, look: mLook });
    const dad = mk({ rel: 'pere', sex: 'M', first: fam.dad.first, last: o.last, age: fam.dad.age, rq: L.ri(62, 88), job: fam.dad.job, look: pLook });
    l.me.look = D.look(mom.look, dad.look);
    fam.sibs.forEach(function (s) { mk({ rel: 'sib', sex: s.sex, first: s.first, last: o.last, age: s.age, rq: L.ri(45, 75), look: D.look(mom.look, dad.look) }); });
    fam.gps.forEach(function (g) { mk({ rel: 'gp', sex: g.sex, first: g.first, last: g.side === 'p' ? o.last : fam.mlast, age: g.age, rq: L.ri(55, 85), look: D.lookNear(g.side === 'p' ? dad.look : mom.look, 1), extra: { side: g.side } }); });
    // dons hérités : les compétences du métier des parents
    const gifts = inherit([mom.job, dad.job]);
    // bonus du compte
    if (G.has('genes')) l.st.h += 6;
    if (G.has('charme')) l.st.c += 6;
    if (G.has('sage')) l.st.b += 6;
    Object.keys(gifts).forEach(function (k) { l.sk[k] = gifts[k]; });
    if (o.skill && G.has('don')) l.sk[o.skill] = Math.max(l.sk[o.skill], 15);
    if (o.trait && G.has('temperament')) l.tr[o.trait] = 12;
    // naissance
    l.log.push({ a: 0, y: year, L: [] });
    const city = D.city(o.city);
    const c = G.ctx({ mere: mom, pere: dad });
    c.v = {
      jm: L.esc(lc(G.jobLabel(mom.job, 'F'))), jp: L.esc(lc(G.jobLabel(dad.job, 'M'))),
      am: mom.age, ap: dad.age, w: D.wealth(fam.wealth).n, size: D.SIZE[city.size].n, bd: l.me.bd, an: year
    };
    G.say('Tu es [né|née] le {bd} {an} à {ville} ({size}), dans une famille {w}.', null, c, 'big');
    G.say('{Mere} ({am} ans, {jm}) et {pere} ({ap} ans, {jp}) te regardent comme le plus beau bébé du monde. Objectivement, tu es un peu [fripé|fripée].', null, c);
    const sibs = G.alive('sib');
    if (sibs.length) {
      const names = sibs.map(function (s) { return '<b>' + L.esc(s.first) + '</b> (' + s.age + ' an' + (s.age > 1 ? 's' : '') + ')'; }).join(', ');
      G.log(L.T(sibs.length === 1 ? 'Tu as ' + (sibs[0].sex === 'F' ? 'une grande sœur' : 'un grand frère') + ' : ' + names + '.' : 'Tu arrives dans une fratrie de ' + (sibs.length + 1) + ' : ' + names + '.', c));
      if (sibs.length >= 6) G.ach('fratrie');
    } else G.log(L.T('Tu es [enfant unique|enfant unique], pour l’instant.', c));
    const gk = Object.keys(gifts);
    if (gk.length) G.log(L.T('Côté gènes : la peau de ' + (L.chance(0.5) ? '{mere.n}' : '{pere.n}') + ', le menton de ' + (L.chance(0.5) ? '{mere.n}' : '{pere.n}') + ', et peut-être un petit don pour ' + gk.map(function (k) { return D.skillName(k).toLowerCase(); }).join(', ') + '.', c));
    const gps = G.alive('gp');
    if (gps.length) G.log(L.T('Côté grands-parents : ' + gps.map(function (g) { return (g.sex === 'F' ? 'mamie ' : 'papi ') + '<b>' + L.esc(g.first) + '</b>'; }).join(', ') + '.', c));
    takeMots(l, o.mots);
    S.account.born++;
    G.emit('life');
    return l;
  };

  // ---------- statuts ----------
  G.inSchool = function () { const s = S.life.edu.st; return s === 'mat' || s === 'prim' || s === 'col' || s === 'lyc' || s === 'cap'; };
  G.isStudent = function () { return G.inSchool() || S.life.edu.st === 'sup'; };
  G.className = function () {
    const e = S.life.edu;
    if (e.st === 'cap' && e.cap) return D.sup(e.cap.id).n + ' · année ' + e.cap.y + '/2';
    if (e.st === 'sup' && e.sup) return D.sup(e.sup.id).n + ' · année ' + e.sup.y + '/' + D.sup(e.sup.id).yrs;
    if (e.st === 'mat' || e.st === 'prim' || e.st === 'col' || e.st === 'lyc') {
      let n = D.CLASSES[e.i];
      if (e.i >= 12 && e.fil && e.fil.indexOf('pro-') === 0) n += ' pro';
      return n;
    }
    return '';
  };
  G.hasDeg = function (id) { return S.life.dip.some(function (d) { return d.id === id; }); };
  G.degLvl = function () { return S.life.dip.reduce(function (m, d) { return Math.max(m, d.lvl); }, -1); };
  G.hasBac = function () { return S.life.dip.some(function (d) { return d.lvl === 2 && d.bac; }); };
  G.degName = function (id) {
    if (D.BAC[id]) return D.BAC[id].n;
    const s = D.sup(id);
    return s ? s.n : id;
  };
  G.status = function () {
    const l = S.life, a = l.me.age, sex = l.me.sex;
    if (l.dead) return 'Décédé' + L.gx('', 'e', sex);
    if (l.prison) return 'En prison';
    if (l.job) return G.jobLabel(l.job.id, sex, l.job.lvl);
    if (l.retired) return L.gx('Retraité', 'Retraitée', sex);
    if (l.edu.st === 'sup' || l.edu.st === 'cap') return L.gx('Étudiant', 'Étudiante', sex);
    if (G.inSchool()) return G.className();
    if (a < 3) return 'Bébé';
    if (l.chomage) return 'Au chômage';
    return a < 18 ? 'Déscolarisé' + L.gx('', 'e', sex) : 'Sans emploi';
  };

  // ---------- maladies, addictions ----------
  G.sick = function (id) {
    const l = S.life;
    if (!D.ILLS[id] || l.ill.some(function (i) { return i.id === id; })) return false;
    l.ill.push({ id: id, y: 0 });
    return true;
  };
  G.addict = function (id, p) {
    const l = S.life;
    if (l.add[id]) return false;
    if (L.chance(p == null ? 1 : p)) { l.add[id] = 1; return true; }
    return false;
  };
  const ADD = { tabac: 'Tabac', alcool: 'Alcool', jeu: 'Jeux d’argent' };
  G.ADD = ADD;

  // ---------- police ----------
  // lvl : 1 = petit délit, 2 = délit, 3 = crime ; motif : clé de D.CRIMES ; vic : la victime (personne ou { tmp })
  G.arrest = function (lvl, motif, vic) {
    const l = S.life, a = l.me.age;
    const c = G.ctx({ par: G.role('par') });
    const cr = D.CRIMES[motif];
    const grave = cr && cr.grave;
    G.ach('police');
    if (a < 13 && !grave) return G.say('La police te ramène chez tes parents. Tu es [privé|privée] de dessert jusqu’à nouvel ordre.', { b: -3, rq: { par: -5 } }, c, 'bad');
    // petit délit, première fois : réglé sur place, sans procès
    if (!grave && !l.casier && (lvl <= 1 || a < 18)) {
      if (a < 18) {
        l.edu.warn++;
        return G.say('Convocation chez le juge des enfants. Travaux d’intérêt général : tu repeins un abribus pendant tout l’été.', { b: -5, s: -2, rq: { par: -6 } }, c, 'bad');
      }
      return G.say('Amende forfaitaire : 135 €. Le policier te souhaite une bonne journée. Il est sincère.', { m: -135, b: -2 }, c, 'bad');
    }
    G.proces(motif || (lvl >= 3 ? 'violence' : 'vol'), vic);
    return null;
  };
  // garde à vue → avocat → interrogatoire (3 questions) → verdict
  G.proces = function (m, vic) {
    const l = S.life;
    const set = D.INTERRO[m] || D.INTERRO.violence;
    const qs = L.shuffle(set.map(function (x, i) { return i; })).slice(0, 3);
    let y = null;
    if (vic) y = vic.id && !vic.tmp ? vic.id : { tmp: typeof vic.tmp === 'object' ? vic.tmp : { first: vic.first, last: vic.last, sex: vic.sex, age: vic.age } };
    l.queue.unshift({ k: 'q', t: 'proces', m: m, s: 'garde', i: 0, qs: qs, pts: 0, law: 0, aveu: 0, ev: L.rand(0.3, 1), jg: L.pick(D.JUGES), js: L.pick(['severe', 'normal', 'normal', 'clement']), y: y });
  };
  function procCtx(q) {
    const c = G.ctx();
    if (q.y) c.r.y = typeof q.y === 'object' ? q.y.tmp : G.byId(q.y);
    if (!c.r.y) c.r.y = { first: 'la victime', last: '', sex: 'F' };
    return c;
  }
  // derrière les barreaux
  G.jail = function (n, perpet) {
    const l = S.life;
    l.prison = perpet ? 99 : n;
    l.perpet = perpet ? 1 : 0;
    l.casier = 1; l.served = 0; l.pc = 0; l.appel = 0;
    if (l.job) G.loseJob('prison');
    G.ach('prison');
    if (perpet) G.ach('perpet');
    const part = G.partner();
    if (part && (perpet || n >= 3) && L.chance(perpet ? 0.8 : 0.45)) {
      G.breakup(part, true);
      G.say('{X.n} ne t’attendra pas. Une lettre de rupture arrive au parloir.', { b: -8 }, G.ctx({ x: part }), 'bad');
    }
  };
  // tuer quelqu'un : la personne disparaît de ta vie
  G.kill = function (p) {
    if (!p || p.tmp) return;
    p.alive = false; p.dy = S.life.year; p.killed = 1;
  };

  // ---------- amour, enfants, animaux ----------
  G.date = function (p) {
    const l = S.life;
    G.keep(p, 'part', Math.max(p.tmp ? 0 : p.rq, L.ri(58, 72)));
    p.st = 'date';
    p.since = l.year;
    G.ach('premieramour');
    return p;
  };
  G.breakup = function (p, byThem) {
    const l = S.life;
    const wasMarried = p.st === 'marie';
    p.rel = 'ex'; p.st = null; p.cohab = 0;
    p.rq = clamp(p.rq - 25, 0, 100);
    if (wasMarried && l.money > 0) { const half = Math.round(l.money / 2); l.money -= half; return half; }
    return 0;
  };
  G.haveChild = function (other) {
    const l = S.life;
    const sex = L.chance(0.5) ? 'M' : 'F';
    const taken = l.people.filter(function (q) { return q.rel === 'enf' || q.rel === 'sib'; }).map(function (q) { return q.first; }).concat([l.me.first]);
    let first = D.firstName(sex, l.year);
    for (let t = 0; t < 10 && taken.indexOf(first) >= 0; t++) first = D.firstName(sex, l.year);
    const ch = mk({ rel: 'enf', sex: sex, first: first, last: l.me.last, age: 0, rq: L.ri(80, 95), look: D.look(l.me.look, other ? other.look : D.look()), extra: { op: other ? other.id : 0, ed: 'douce', kx: { sk: {}, tr: {} } } });
    // dons : les points forts des deux parents
    const kx = ch.kx;
    D.SKILLS.forEach(function (s) { if (l.sk[s.id] >= 45 && L.chance(0.5)) kx.sk[s.id] = L.ri(3, 7); });
    const gifts = inherit([other && other.job, l.job && l.job.id]);
    Object.keys(gifts).forEach(function (k) { kx.sk[k] = Math.max(kx.sk[k] || 0, gifts[k]); });
    l.stats.kids++;
    G.ach('parent');
    if (G.alive('enf').length >= 4) G.ach('tribu');
    G.gainXP(30);
    return ch;
  };
  G.adopt = function (petId, name) {
    const l = S.life, d = D.pet(petId);
    const p = mk({ rel: 'pet', sex: L.chance(0.5) ? 'M' : 'F', first: name || L.pick(d.names), last: '', age: petId === 'tortue' || petId === 'perroquet' ? L.ri(1, 8) : 0, rq: 75, extra: { sp: petId, spn: d.spn, life: L.ri(d.life[0], d.life[1]) } });
    if (G.alive('pet').length >= 3) G.ach('animaux');
    return p;
  };

  // ---------- métiers ----------
  G.salary = function (j) {
    const l = S.life;
    j = j || l.job;
    if (!j) return 0;
    const d = D.job(j.id);
    let s = d.sal * D.LV_MULT[Math.min(j.lvl, D.LV_MULT.length - 1)] * (1 + 0.02 * Math.min(j.yrs, 40)) * (j.raise || 1) * D.SIZE[D.city(l.city).size].sal;
    if (d.cat === 'star') s *= 1 + j.lvl * 0.7;
    return Math.round(s / 10) * 10;
  };
  G.jobTitle = function () { const l = S.life; return l.job ? G.jobLabel(l.job.id, l.me.sex, l.job.lvl) : ''; };
  G.reqs = function (id) {
    const l = S.life, j = D.job(id), r = j.req || {}, out = [];
    const a = l.me.age;
    out.push({ l: 'Âge : de ' + r.age[0] + ' à ' + r.age[1] + ' ans', ok: a >= r.age[0] && a <= r.age[1] });
    if (r.deg) out.push({ l: 'Diplôme : ' + r.deg.map(G.degName).join(' ou '), ok: r.deg.some(G.hasDeg) });
    if (r.lvl) out.push({ l: 'Niveau ' + D.DEG_LVL[r.lvl] + ' minimum', ok: G.degLvl() >= r.lvl });
    if (r.sk) Object.keys(r.sk).forEach(function (k) { out.push({ l: D.skillName(k) + ' : ' + r.sk[k] + ' minimum', ok: l.sk[k] >= r.sk[k] }); });
    const cha = Math.max(r.cha || 0, j.vis ? 8 : 0);
    if (cha) out.push({ l: 'Charisme : ' + cha + ' minimum' + (j.vis ? ' (métier exposé)' : ''), ok: l.st.c >= cha });
    if (r.h) out.push({ l: 'Santé : ' + r.h + ' minimum', ok: l.st.h >= r.h });
    if (r.clean) out.push({ l: 'Casier judiciaire vierge', ok: !l.casier });
    if (r.permis) out.push({ l: 'Permis de conduire', ok: !!l.permis });
    return out;
  };
  G.canApply = function (id) { return G.reqs(id).every(function (x) { return x.ok; }); };
  G.offers = function () {
    const l = S.life;
    if (l.offers && l.offers.y === l.year) return l.offers.list;
    const a = l.me.age;
    const pool = D.JOBS.filter(function (j) { return (!j.yr || (l.year >= j.yr[0] && l.year <= j.yr[1])) && a >= j.req.age[0] && a <= j.req.age[1]; });
    const list = pool.filter(function (j) { return j.cat === 'petit' || j.always; }).map(function (j) { return j.id; });
    if (a >= 17) {
      const others = L.shuffle(pool.filter(function (j) { return j.cat !== 'petit' && (!j.rare || L.chance(0.2)); }));
      const chosen = [];
      others.filter(function (j) { return j.req.deg && j.req.deg.some(G.hasDeg); }).slice(0, 4).forEach(function (j) { chosen.push(j.id); });
      others.forEach(function (j) { if (chosen.length < 11 && chosen.indexOf(j.id) < 0) chosen.push(j.id); });
      chosen.forEach(function (id) { if (list.indexOf(id) < 0) list.push(id); });

    }
    l.offers = { y: l.year, list: list };
    return list;
  };
  G.hireChance = function (id, score) {
    const l = S.life, j = D.job(id);
    if (j.cat === 'petit') return clamp(0.85 + (score || 0), 0.4, 0.97);
    let p = 0.45;
    const sk = j.req.sk || {};
    const ks = Object.keys(sk);
    if (ks.length) p += clamp(ks.reduce(function (m, k) { return m + l.sk[k] - sk[k]; }, 0) / ks.length / 100, -0.1, 0.2);
    p += (l.st.c - 50) / 400;
    if (j.req.cha) p += clamp((l.st.c - j.req.cha) / 200, 0, 0.15);
    const best = l.dip.filter(function (d) { return j.req.deg && j.req.deg.indexOf(d.id) >= 0; })[0];
    if (best && best.m) p += 0.05;
    p += Math.min(0.1, l.cv.reduce(function (s, x) { return s + ((x.to || l.year) - x.from); }, 0) * 0.008);
    if (G.is('charismatique')) p += 0.08;
    if (G.is('timide')) p -= 0.06;
    if (G.is('ambitieux')) p += 0.04;
    if (j.cat === 'star') p -= 0.12;
    if (l.casier) p -= 0.1;
    p += score || 0;
    return clamp(p, 0.05, 0.95);
  };
  G.hire = function (id, raise) {
    const l = S.life, d = D.job(id);
    if (l.job) G.endJob('change');
    l.job = { id: id, lvl: 0, yrs: 0, ly: 0, perf: 50, raise: raise || 1, since: l.year, pt: d.pt ? 1 : 0 };
    l.cv.push({ id: id, from: l.year, to: null, lvl: 0 });
    l.chomage = null;
    l.stats.jobs++;
    const boss = mk({ rel: 'boss', age: L.ri(32, 60), rq: L.ri(40, 55) });
    boss.seen = l.year;
    const n = L.ri(1, 3);
    for (let i = 0; i < n; i++) { const p = mk({ rel: 'coll', age: clamp(l.me.age + L.ri(-8, 15), 16, 66), rq: L.ri(35, 55) }); p.seen = l.year; }
    G.ach('premierjob');
    G.gainXP(10);
    G.emit('job');
  };
  G.endJob = function (why) {
    const l = S.life;
    if (!l.job) return;
    const cv = l.cv[l.cv.length - 1];
    if (cv) { cv.to = l.year; cv.lvl = l.job.lvl; }
    l.lastSal = G.salary();
    l.people.forEach(function (p) {
      if (!p.alive || (p.rel !== 'coll' && p.rel !== 'boss')) return;
      if (p.rel === 'coll' && p.rq >= 62) { p.rel = 'ami'; return; }
      p.rel = 'gone';
    });
    l.job = null;
  };
  G.loseJob = function (why) {
    const l = S.life;
    const sal = G.salary();
    G.endJob(why);
    if (why === 'fired' || why === 'eco') { l.chomage = { y: 2, amt: Math.round(sal * 0.57 / 10) * 10 }; G.ach('vire'); }
  };
  G.promote = function () {
    const l = S.life, j = l.job, d = D.job(j.id);
    if (!j || j.lvl >= d.lv.length - 1) return false;
    j.lvl++; j.ly = 0;
    G.ach('promo');
    G.gainXP(20);
    if (j.lvl === d.lv.length - 1) {
      G.ach('sommet');
      if (d.cat === 'star') G.ach('star');
      if (d.id === 'politique') G.ach('president');
    }
    if (d.id === 'astronaute' && j.lvl >= 1) G.ach('astronaute');
    return true;
  };
  G.retire = function () {
    const l = S.life;
    const sal = l.job ? G.salary() : (l.lastSal || 0);
    if (l.job) G.endJob('retraite');
    l.retired = 1;
    l.pension = Math.max(11400, Math.round(sal * 0.5 / 10) * 10);
    G.ach('retraite');
  };

  // ---------- l'année qui passe ----------
  G.ageUp = function () {
    const l = S.life;
    if (!l || l.dead || G.pending()) return false;
    yearSocial(l);
    l.me.age++;
    l.year++;
    const a = l.me.age;
    l.clock = null; l.ap = 0;
    l.log.push({ a: a, y: l.year, L: [] });
    l.done = {}; l.acts = 0; l.offers = null;
    l.pf = l.yf || {}; l.yf = {};
    l.yr = { inc: 0, exp: 0, inL: [], exL: [] };
    if (l.prison > 0) prisonYear(l);
    peopleYear(l);
    birthYear(l);
    eduYear(l);
    jobYear(l);
    moneyYear(l);
    healthYear(l);
    itemYear(l);
    statsYear(l);
    mindYear(l);
    if (a === 18) { G.fixTraits(); l.queue.push({ k: 'traits' }); }
    milestones(l);
    if (!l.ori && a >= (l.oriAge || 13) && !l.queue.some(function (q) { return q.t === 'ori'; })) l.queue.push({ k: 'q', t: 'ori' });
    if (L.EV) L.EV.yearly(l);
    if (L.M) L.M.yearly(l);
    intYear(l);
    crimeYear(l);
    l.queue.push({ k: 'checks', y: 1 });
    G.gainXP(5 + (a % 10 === 0 ? 10 : 0));
    G.emit('year');
    return true;
  };

  function yearSocial(l) {
    if (l.me.age < 3) return;
    const friends = G.alive('ami').filter(function (p) { return p.rq >= 50; }).length;
    let ds = -3 + Math.min(9, l.acts * 1.6) + Math.min(5, friends) + (l.job || G.isStudent() ? 2 : 0) + (G.partner() ? 2 : 0);
    if (l.home === 'parents' && G.parents().length) ds += 1.5;
    if (G.alive('enf').some(function (p) { return p.age < 18; })) ds += 1.5;
    if (l.acts === 0 && l.me.age >= 6) ds -= 3;
    if (G.is('timide')) ds -= 1;
    if (G.is('drole')) ds += 1;
    if (l.prison) ds -= 3;
    l.st.s = clamp(l.st.s + ds, 0, 100);
    l.lastActs = l.acts;
  }

  function prisonYear(l) {
    l.served = (l.served || 0) + 1;
    if (l.perpet) {
      if (l.served >= 18 && (l.pc || 0) >= 3 && L.chance(0.3)) { l.prison = 0; l.perpet = 0; return G.say('Libération conditionnelle après ' + l.served + ' ans ! Ta bonne conduite a fini par payer. Le monde a beaucoup changé.', { b: 12 }, null, 'good'); }
      return G.say('Réclusion à perpétuité, année ' + l.served + '. Les jours se ressemblent tous.', { b: -2 }, null, 'bad');
    }
    l.prison--;
    if (l.prison > 0) G.say('Encore ' + l.prison + ' an' + (l.prison > 1 ? 's' : '') + ' derrière les barreaux. Tu comptes les jours sur le mur.', { b: -3 }, null, 'bad');
    else G.say('Tu sors de prison. L’air libre a un goût de liberté… et de pot d’échappement.', { b: 8 }, null, 'good');
  }

  function mortality(age) {
    if (age < 1) return 0.002;
    if (age < 40) return 0.0006;
    return Math.min(0.75, 0.00005 * Math.exp(0.09 * age));
  }
  const GRIEF = { mere: 14, pere: 14, par: 14, sib: 10, gp: 6, ami: 6, part: 18, enf: 25, pet: 5, ex: 2, coll: 2, boss: 1, enn: 0 };
  const DEATH_TXT = {
    gp: ['{X} s’est {x:éteint|éteinte} à {age} ans. {X.il} t’a laissé une boîte de biscuits remplie de boutons de couture.', '{X} est {x:mort|morte} à {age} ans, dans son fauteuil préféré, devant un jeu télévisé.'],
    mere: ['{X} est morte à {age} ans. La maison n’a plus la même odeur.'],
    pere: ['{X} est mort à {age} ans. Tu retrouves ses vieilles blagues notées dans un carnet.'],
    par: ['{X} est {x:mort|morte} à {age} ans.'],
    sib: ['{X} est {x:mort|morte} à {age} ans. Tu repenses à vos bêtises d’enfance.'],
    ami: ['{X} est {x:mort|morte} à {age} ans. Tu gardes son dernier message sans jamais l’effacer.'],
    part: ['{X} est {x:mort|morte} à {age} ans. Une moitié de toi est partie avec {x:lui|elle}.'],
    enf: ['{X} est {x:mort|morte} à {age} ans. Aucun parent ne devrait vivre ça.'],
    pet: ['{X.n}, {x.lien}, est {x:mort|morte} à {age} ans. Tu lui creuses une petite tombe au fond du jardin.'],
    enn: ['{X} est {x:mort|morte} à {age} ans. Tu ressens… un vide étrange.'],
    other: ['{X} est {x:mort|morte} à {age} ans.']
  };
  function npcDies(l, p) {
    p.alive = false; p.dy = l.year;
    const c = G.ctx({ x: p });
    c.v = { age: p.age };
    const base = GRIEF[p.rel] != null ? GRIEF[p.rel] : 2;
    const g = base * (0.4 + p.rq / 100);
    const txt = L.pick(DEATH_TXT[p.rel] || DEATH_TXT.other);
    G.say(txt, { b: -g, s: p.rel === 'part' ? -4 : -1 }, c, 'bad');
    if ((p.rel === 'mere' || p.rel === 'pere' || p.rel === 'par') && !G.parents().length) {
      const w = D.wealth(l.wealth);
      const sibs = G.alive('sib').length;
      const amt = Math.round(w.inherit * L.rand(0.6, 1.4) / (sibs + 1) / 100) * 100;
      if (amt > 0) G.say('Héritage : tu reçois {amt}.', { m: amt }, (function () { const cc = G.ctx(); cc.v = { amt: L.money(amt) }; return cc; })(), 'good');
    }
  }
  function peopleYear(l) {
    const a = l.me.age, ended = l.year - 1;
    l.people.slice().forEach(function (p) {
      if (!p.alive || p.rel === 'gone') return;
      p.age++;
      if (p.rel === 'pet') {
        if (p.age >= p.life) { npcDies(l, p); return; }
      } else if (L.chance(mortality(p.age))) { npcDies(l, p); return; }
      // usure des relations
      if (p.seen !== ended && p.seen !== l.year) {
        let dec = { mere: 2, pere: 2, par: 2, sib: 2.5, gp: 2, enf: 1.5, part: 3.5, ami: 4.5, coll: 3, boss: 2, pet: 1, ex: 2, old: 0, enn: -2 }[p.rel];
        if (dec == null) dec = 2;
        if (G.is('egoiste') && dec > 0) dec *= 1.5;
        if (G.is('bienveillant') && dec > 0) dec *= 0.7;
        p.rq = clamp(p.rq - dec * L.rand(0.6, 1.4), 0, 100);
      }
      const c = G.ctx({ x: p });
      if (p.rel === 'ami' && p.rq < 12 && L.chance(0.5)) {
        p.rel = 'old';
        G.say('{X.n} ne répond plus à tes messages. Votre amitié s’est éteinte en silence.', { s: -4, b: -2 }, c, 'bad');
      } else if (p.rel === 'enn' && p.rq > 45 && L.chance(0.3)) {
        p.rel = 'old';
        G.say('Ta rivalité avec {x.n} s’est évaporée. Vous vous croisez sans vous voir.', null, c);
      } else if (p.rel === 'part') {
        if (p.rq < 18 && L.chance(0.4)) {
          const half = G.breakup(p, true);
          G.say(half ? '{X.n} demande le divorce et repart avec la moitié de tes économies : ' + L.money(half) + '.' : '{X.n} te quitte. Tes amis t’apportent de la glace.', { b: -10 }, c, 'bad');
        } else if (a >= 16 && L.chance(p.rq < 40 ? 0.07 : 0.02)) {
          l.queue.push({ k: 'ev', id: 'trompe', r: { part: p.id, x: { tmp: G.tmp('adult') } }, v: {} });
        }
      } else if (p.rel === 'enf' && p.age < 18 && p.kx) {
        kidYear(l, p);
      } else if (p.rel === 'enf' && p.age === 18) {
        p.job = kidJob(l, p);
        c.v = { j: L.esc(G.jobLabel(p.job, p.sex, 0).toLowerCase()) };
        G.say('{X.n} fête ses 18 ans et quitte la maison avec trois cartons et ton grille-pain. Son rêve : devenir {j}.', { b: 1 }, c);
      }
    });
    // un petit frère, une petite sœur ?
    const mere = G.alive('mere')[0], pere = G.alive('pere')[0];
    const sibs = G.alive('sib').length;
    if (mere && pere && mere.age <= 43 && a <= 16 && sibs < 8 && !l.flags.divorce) {
      const p = mere.age < 33 ? 0.11 : mere.age < 38 ? 0.06 : 0.025;
      if (L.chance(p)) {
        const s = mk({ rel: 'sib', last: l.me.last, age: 0, rq: L.ri(50, 75), look: D.look(mere.look, pere.look) });
        G.say('{Mere} a accouché ! Bienvenue à {x:ton petit frère|ta petite sœur} {x.n}.', { b: a >= 12 ? 1 : 3 }, G.ctx({ mere: mere, x: s }), 'fam');
        if (G.alive('sib').length >= 6) G.ach('fratrie');
      }
    }
    // petits-enfants
    const grown = G.alive('enf').filter(function (p) { return p.age >= 24 && p.age <= 45; });
    if (grown.length && L.chance(0.07 * grown.length)) {
      const p = L.pick(grown);
      l.stats.grandkids++;
      G.say('{X} t’annonce que tu vas être [grand-père|grand-mère] ! Tu as déjà acheté trois doudous.', { b: 6 }, G.ctx({ x: p }), 'fam');
    }
  }

  // ---------- centres d'intérêt : une découverte de temps en temps (chacune 2 fois par vie au plus) ----------
  function intYear(l) {
    const a = l.me.age;
    if (a < 6 || !D.INT_EV || l.prison || l.queue.some(function (q) { return q.t === 'intev'; }) || !L.chance(0.13)) return;
    l.intEv = l.intEv || {};
    const cands = D.INTERESTS.filter(function (it) {
      const e = D.INT_EV[it.id];
      return e && a >= e.a && (l.intEv[it.id] || 0) < 2 && l.ints.indexOf(it.id) < 0 && (!it.new || l.year >= it.new) && (!e.need || G.role(e.need));
    });
    const it = L.pick(cands);
    if (!it) return;
    l.intEv[it.id] = (l.intEv[it.id] || 0) + 1;
    const e = D.INT_EV[it.id], r = {};
    if (e.need) r[e.need] = G.role(e.need).id;
    l.queue.push({ k: 'q', t: 'intev', id: it.id, r: r });
  }
  // ---------- affaires non résolues, cavale, arme cachée ----------
  function crimeYear(l) {
    if (l.prison || l.me.age < 13) return;
    if (l.fugitif && L.chance(0.3)) {
      const n = (l.fugitif > 1 ? l.fugitif : 1) + 3;
      l.fugitif = 0;
      G.say('Fin de la cavale : la police te retrouve dans un camping, déguisé{e} en touriste. Retour en prison, avec un bonus.', { b: -10 }, null, 'bad');
      G.jail(n);
      return;
    }
    if (l.gun && l.me.age >= 18 && L.chance(0.03)) {
      l.gun = 0;
      G.say('Contrôle de police surprise : ils trouvent ton arme.', { b: -3 }, null, 'bad');
      G.arrest(2, 'arme');
      return;
    }
    l.cold = (l.cold || []).filter(function (x) {
      if (l.year - x.y > 8) { G.say('Huit ans plus tard, l’enquête sur la mort de ' + L.esc(x.vn) + ' est classée sans suite. Tu respires, enfin.', { b: 3 }, null, ''); return false; }
      if (L.chance(x.p || 0.12)) {
        G.say('L’enquête sur la mort de ' + L.esc(x.vn) + ' rebondit : un témoin a parlé. La police frappe à ta porte à 6 h du matin.', { b: -8 }, null, 'bad');
        G.arrest(3, x.m, x.vic);
        return false;
      }
      return true;
    });
  }

  // ---------- tes enfants : éducation, notes, avenir ----------
  function kidYear(l, p) {
    const st = D.eduStyle(p.ed), kx = p.kx, a = p.age;
    if (a >= 3) Object.keys(st.tr).forEach(function (t) { kx.tr[t] = (kx.tr[t] || 0) + st.tr[t] * L.rand(0.6, 1.2); });
    if (a >= 4) Object.keys(st.sk).forEach(function (k) { kx.sk[k] = (kx.sk[k] || 0) + st.sk[k] * L.rand(0.6, 1.3); });
    if (p.club && a >= 5) {
      const cl = D.CLUBS.find(function (x) { return x.id === p.club; });
      if (cl) {
        Object.keys(cl.sk).forEach(function (k) { kx.sk[k] = (kx.sk[k] || 0) + cl.sk[k] * 0.6; });
        l.money -= cl.cost; l.yr.exp += cl.cost; l.yr.exL.push('activités des enfants');
      }
    }
    if (st.rq) p.rq = clamp(p.rq + st.rq, 0, 100);
    if (a >= 6) {
      const acad = ((kx.sk.logique || 0) + (kx.sk.langues || 0) + (kx.sk.sciences || 0)) / 3;
      const target = G.soften(10.5 + acad / 4 + (st.g || 0) * 2 + (kx.tr.discipline || 0) / 10 - (kx.tr.rebelle || 0) / 12);
      p.kg = clamp((p.kg != null ? p.kg : 11) * 0.6 + target * 0.4 + L.rand(-1, 1), 3, 19.5);
    }
    if (a === 6 || a === 11 || a === 15) {
      const c = G.ctx({ x: p });
      c.v = { s: a === 6 ? 'entre au CP' : a === 11 ? 'entre au collège' : 'entre au lycée', n: p.kg != null ? L.dec(p.kg) : '' };
      G.say('{X.n} {s}.' + (a > 6 ? ' Sa moyenne : <b>{n}/20</b>.' : ''), null, c, 'fam');
    }
  }
  // à 18 ans, l'enfant choisit un métier qui colle à ses points forts
  function kidJob(l, p) {
    const kx = p.kx;
    if (!kx) return parentJob(D.wealth(l.wealth), l.year);
    const top = Object.keys(kx.sk).sort(function (a, b) { return kx.sk[b] - kx.sk[a]; })[0];
    const fits = top && kx.sk[top] >= 6 ? D.JOBS.filter(function (j) { return j.cat !== 'petit' && j.req && j.req.sk && j.req.sk[top] && (!j.yr || (l.year >= j.yr[0] && l.year <= j.yr[1])); }) : [];
    if (fits.length && L.chance(0.75)) return L.pick(fits).id;
    return parentJob(D.wealth(l.wealth), l.year);
  }
  G.kidTraits = function (p) {
    const tr = (p.kx && p.kx.tr) || {};
    return Object.keys(tr).filter(function (t) { return tr[t] >= 3; }).sort(function (a, b) { return tr[b] - tr[a]; }).slice(0, 3);
  };
  // un bébé demandé l'an dernier arrive
  function birthYear(l) {
    if (!l.preg || l.year <= l.preg.y) return;
    const other = G.byId(l.preg.pid);
    l.preg = null;
    const ch = G.haveChild(other);
    l.queue.push({ k: 'q', t: 'bebenom', id: ch.id });
  }
  // les objets possédés ont leurs petites histoires (chaque phrase une seule fois par vie)
  function itemYear(l) {
    if (!D.ITEM_FX || !l.items.length || l.prison) return;
    let n = L.chance(0.4) ? 1 : 0;
    if (l.items.length >= 4 && L.chance(0.25)) n++;
    const owned = L.shuffle(l.items.map(function (x) { return x.id; }).filter(function (id, i, arr) { return arr.indexOf(id) === i; }));
    for (let i = 0; i < owned.length && n > 0; i++) {
      const fx = D.ITEM_FX[owned[i]];
      if (!fx || !fx.an) continue;
      const used = l.anec[owned[i]] || (l.anec[owned[i]] = []);
      const left = fx.an.map(function (t, j) { return j; }).filter(function (j) { return used.indexOf(j) < 0; });
      if (!left.length) continue;
      const j = L.pick(left);
      used.push(j);
      G.say(fx.an[j], { b: L.chance(0.5) ? 1 : 0 }, null, 'item');
      n--;
    }
  }

  // ---------- école ----------
  function baseGrade(l) {
    const sk = l.sk, e = l.edu;
    let acad = (sk.logique + sk.langues + sk.sciences) / 3;
    if (e.fil && D.BAC[e.fil]) {
      const ks = Object.keys(D.BAC[e.fil].sk);
      acad = (acad + ks.reduce(function (s, k) { return s + sk[k]; }, 0) / ks.length) / 2;
    }
    let g = 10.3 + acad * 0.075;
    if (G.is('discipline')) g += 1.2;
    if (G.is('ambitieux')) g += 0.8;
    if (G.is('curieux')) g += 0.5;
    if (G.is('timide')) g += 0.3;
    if (G.is('rebelle')) g -= 1;
    if (G.is('nonchalant')) g -= 0.8;
    if (l.st.b < 25) g -= 1;
    if (l.st.h < 25) g -= 1;
    if (l.lonely) g -= 1;
    return clamp(g, 2, 19);
  }
  G.baseGrade = function () { return baseGrade(S.life); };
  function newGrade(l, fin) { return G.soften(clamp(fin * 0.55 + baseGrade(l) * 0.45 + L.rand(-0.8, 0.8), 0, 20)); }
  G.appreciation = function (g) {
    if (g >= 17) return 'Félicitations du conseil de classe';
    if (g >= 15) return 'Compliments';
    if (g >= 13) return 'Encouragements';
    if (g >= 10) return 'Peut mieux faire';
    if (g >= 7.5) return 'Avertissement travail';
    return 'Le prof a juste écrit « ??? » en rouge';
  };
  function mention(n) { return n >= 18 ? 'très bien, félicitations du jury' : n >= 16 ? 'très bien' : n >= 14 ? 'bien' : n >= 12 ? 'assez bien' : ''; }
  function clubYear(l) {
    const e = l.edu;
    if (!e.clubs.length) return;
    e.clubs.forEach(function (id) {
      const cl = D.CLUBS.find(function (x) { return x.id === id; });
      if (!cl) return;
      const fx = { sk: {} };
      Object.keys(cl.sk).forEach(function (k) { fx.sk[k] = cl.sk[k] * L.rand(0.8, 1.2); });
      if (cl.s) fx.s = cl.s;
      if (cl.c) fx.c = cl.c;
      if (cl.tr) fx.tr = cl.tr;
      G.fx(fx);
    });
    if (l.me.age >= 18) e.clubs = [];
  }
  function schoolSkills(l, st) {
    const S2 = {
      mat: { art: 1, sport: 1, langues: 1, logique: 0.8 },
      prim: { logique: 2.5, langues: 2.5, sciences: 1.5, art: 1, sport: 1, musique: 0.6 },
      col: { logique: 3, langues: 3, sciences: 3, info: 1, sport: 1, art: 0.5 },
      lyc: { logique: 1.5, langues: 1.5, sciences: 1.5 }
    }[st];
    const sk = Object.assign({}, S2 || {});
    if (st === 'lyc' && l.edu.fil && D.BAC[l.edu.fil]) Object.keys(D.BAC[l.edu.fil].sk).forEach(function (k) { sk[k] = (sk[k] || 0) + D.BAC[l.edu.fil].sk[k]; });
    Object.keys(sk).forEach(function (k) { G.skill(k, sk[k] * L.rand(0.8, 1.2)); });
  }
  function eduYear(l) {
    const e = l.edu, a = l.me.age;
    if (l.prison) return;
    if (G.inSchool() && a < 18) clubYear(l);
    if (a === 3 && e.st === 'none') {
      e.st = 'mat'; e.i = 0; e.g = 12;
      G.say('Premier jour de maternelle. Tu pleures, puis tu découvres la pâte à modeler. Tu ne pleures plus.', { s: 3, b: 2 }, null, 'school');
      return;
    }
    if (e.st === 'mat' || e.st === 'prim' || e.st === 'col' || e.st === 'lyc') return schoolYear(l);
    if (e.st === 'cap') return capYear(l);
    if (e.st === 'sup') return supYear(l);
    if (e.st === 'cesure') { e.st = 'fini'; l.queue.push({ k: 'q', t: 'sup', tried: [] }); G.say('Fin de ton année de césure. Retour sur Parcoursup !', null, null, 'school'); }
  }
  function schoolYear(l) {
    const e = l.edu;
    const st = D.stageOf(e.i);
    schoolSkills(l, st);
    const cls = D.CLASSES[e.i];
    if (e.i < 3) {
      e.i++;
      if (e.i === 3) { e.st = 'prim'; e.g = newGrade(l, 12); G.say('Tu entres en CP. Les lettres deviennent des mots. Tu lis « PIZZA » sur une affiche et tu te sens [puissant|puissante].', { b: 2 }, null, 'school'); }
      return;
    }
    const fin = clamp(e.g + L.rand(-1.2, 1.2), 0, 20);
    e.last = fin;
    const c = G.ctx();
    c.v = { cls: cls, n: L.dec(fin), ap: G.appreciation(fin) };
    G.say('Bulletin de {cls} : <b>{n}/20</b>. Appréciation : « {ap} ».', { b: fin >= 15 ? 3 : fin < 8 ? -3 : 0 }, c, 'school');
    if (e.i === 11) { brevet(l, fin); l.queue.push({ k: 'q', t: 'orient3', fin: fin }); return; }
    if (e.i === 14) { bac(l, fin); return; }
    if (e.i === 12 && !(e.fil && e.fil.indexOf('pro-') === 0)) { l.queue.push({ k: 'q', t: 'orient2', fin: fin }); return; }
    if (fin < 7.5 && e.i >= 4 && L.chance(0.6)) {
      e.rep++;
      G.ach('redouble');
      G.say('Le conseil de classe a tranché : tu redoubles ta {cls}.', { b: -6, s: -2 }, c, 'bad');
      e.g = clamp(fin + 2.5, 0, 20);
      return;
    }
    e.i++;
    if (e.i === 8) { e.st = 'col'; G.say('Entrée au collège. Ton cartable pèse 9 kilos et tu te perds trois fois pour trouver la salle de techno.', { s: 1 }, null, 'school'); }
    e.g = newGrade(l, fin);
  }
  function brevet(l, fin) {
    const note = clamp(fin + L.rand(-1.5, 2), 0, 20);
    const c = G.ctx();
    if (note >= 10) {
      const m = mention(note);
      l.dip.push({ id: 'brevet', n: 'Diplôme national du brevet', lvl: 0, y: l.year, m: m, note: note });
      c.v = { n: L.dec(note), m: m ? ', mention ' + m : '' };
      G.say('Brevet obtenu avec <b>{n}/20</b>{m}. Ta famille encadre le diplôme à côté de la photo du chat.', { b: 4 }, c, 'good');
      G.ach('brevet');
    } else {
      c.v = { n: L.dec(note) };
      G.say('Brevet raté ({n}/20). Ce n’est pas grave : personne ne te le demandera jamais.', { b: -3 }, c, 'bad');
    }
  }
  function bac(l, fin) {
    const e = l.edu;
    let note = clamp(fin + L.rand(-1.5, 1.8) + (l.flags.revBac === l.year - 1 ? 0.8 : 0), 0, 20);
    const c = G.ctx();
    if (note >= 8 && note < 10) {
      const ok = L.chance(G.luck(0.5 + l.sk.eloquence / 250));
      c.v = { n: L.dec(note) };
      G.say(ok ? 'Bac : {n}/20 à l’écrit, oral de rattrapage… et tu passes de justesse !' : 'Bac : {n}/20 à l’écrit, oral de rattrapage… raté.', null, c, ok ? 'good' : 'bad');
      if (ok) note = 10;
    }
    if (note >= 10) {
      const m = mention(note);
      const fil = e.fil || 'lettres';
      l.dip.push({ id: fil.indexOf('pro-') === 0 ? fil : 'bac', bac: 1, n: D.BAC[fil] ? D.BAC[fil].n : 'Baccalauréat', lvl: 2, y: l.year, m: m, note: note, fil: fil });
      e.st = 'bac';
      G.ach('bac');
      if (note >= 16) G.ach('bac-tb');
      G.gainXP(20);
      c.v = { n: L.dec(note), m: m ? 'mention ' + m : 'sans mention' };
      G.say('Résultats du bac : [ADMIS|ADMISE] avec <b>{n}/20</b>, {m} !', { b: 8 + (m ? 3 : 0) }, c, 'big');
      G.msg(L.T('[Admis|Admise] !', c), L.T('Bac obtenu avec <b>{n}/20</b>, {m}. Place à Parcoursup : choisis la suite.', c), 'BACCALAURÉAT ' + l.year, 'y');
      l.queue.push({ k: 'q', t: 'sup', tried: [] });
    } else {
      c.v = { n: L.dec(note) };
      G.say('Résultats du bac : recalé{e} avec {n}/20.', { b: -8 }, c, 'bad');
      l.queue.push({ k: 'q', t: 'bacfail' });
    }
  }
  function capYear(l) {
    const e = l.edu, f = D.sup(e.cap.id);
    Object.keys(f.sk).forEach(function (k) { G.skill(k, f.sk[k] * L.rand(0.8, 1.2)); });
    if (e.cap.y >= 2) {
      const ok = L.chance(clamp(0.8 + (e.g - 10) * 0.04, 0.3, 0.98));
      const c = G.ctx(); c.v = { n: f.n };
      if (ok) {
        l.dip.push({ id: f.id, n: f.n, lvl: 1, y: l.year, m: '' });
        e.st = 'fini';
        G.say('Tu obtiens ton <b>{n}</b> ! Tu es prêt{e} à travailler.', { b: 6 }, c, 'good');
        G.gainXP(20);
      } else {
        G.say('Tu rates l’examen de ton {n}. Une année de plus.', { b: -5 }, c, 'bad');
      }
      return;
    }
    e.cap.y++;
    e.g = newGrade(l, e.g);
  }
  function supYear(l) {
    const e = l.edu, s = e.sup, f = D.sup(s.id);
    const c = G.ctx();
    c.v = { n: f.n, y: s.y };
    // frais
    if (f.fee) {
      const par = G.parents().length ? D.wealth(l.wealth).help : 0;
      const fee = Math.round(f.fee * (1 - par));
      if (fee > 0) { l.money -= fee; l.yr.exp += fee; l.yr.exL.push('frais de scolarité'); }
    }
    Object.keys(f.sk).forEach(function (k) { G.skill(k, f.sk[k] * L.rand(0.8, 1.2)); });
    let pass = 0.55 + (s.g - 10) * 0.09;
    if (G.is('discipline')) pass += 0.06;
    if (G.is('ambitieux')) pass += 0.04;
    if (G.is('nonchalant')) pass -= 0.05;
    pass = clamp(pass, 0.08, 0.98);
    if (L.chance(pass)) {
      if (s.y >= f.yrs) return graduate(l, f, s);
      G.say('Année {y} de {n} validée.', { b: 3 }, c, 'school');
      s.y++;
    } else {
      s.fails++;
      if (s.fails >= 2) {
        e.st = 'fini'; e.sup = null;
        G.say('Deuxième échec : tu es [exclu|exclue] de ta formation ({n}).', { b: -8 }, c, 'bad');
        return;
      }
      G.say('Tu rates ton année {y} de {n}. Redoublement.', { b: -5 }, c, 'bad');
    }
    s.g = G.soften(clamp(s.g * 0.5 + (baseGrade(l) - 0.5) * 0.5 + L.rand(-1, 1), 0, 20));
  }
  function graduate(l, f, s) {
    const e = l.edu;
    const m = mention(s.g + 1.5);
    l.dip.push({ id: f.id, n: f.n, lvl: f.lvl, y: l.year, m: m });
    e.sup = null;
    e.st = 'fini';
    G.gainXP(25 + f.lvl * 8);
    if (f.lvl >= 5) G.ach('bac5');
    if (f.id === 'medecine' || f.id === 'pharma' || f.id === 'veto') G.ach('doc');
    const c = G.ctx(); c.v = { n: f.n, m: m ? ' avec la mention ' + m : '' };
    G.say('Diplômé{e} ! Tu obtiens : <b>{n}</b>{m}.', { b: 10 }, c, 'big');
    G.msg(L.T('Diplômé{e} !', c), L.T('<b>{n}</b>{m}. Ton CV vient de prendre du poids.', c), 'REMISE DES DIPLÔMES', 'c');
    if (f.next) l.queue.push({ k: 'q', t: 'master', id: f.next });
  }

  // ---------- questions (orientation, Parcoursup…) ----------
  function supChance(f) {
    const l = S.life;
    const bacD = l.dip.filter(function (d) { return d.bac; })[0];
    const prof = bacD ? bacD.fil : null;
    if (f.lvl > 1 && !bacD) return { p: 0, why: 'Il faut le bac' };
    if (f.yr && (l.year < f.yr[0] || l.year > f.yr[1])) return { p: 0, why: 'N’existe pas encore' };
    if (f.req && f.req.length && f.req.indexOf(prof) < 0) return { p: 0, why: 'Bac non adapté' };
    if (f.min) { for (const k in f.min) if (l.sk[k] < f.min[k]) return { p: 0, why: D.skillName(k) + ' ' + f.min[k] + ' requis' }; }
    if (f.minH && l.st.h < f.minH) return { p: 0, why: 'Santé ' + f.minH + ' requise' };
    if (f.clean && l.casier) return { p: 0, why: 'Casier judiciaire' };
    if (!f.sel) return { p: 0.97 };
    const note = bacD ? bacD.note : 10;
    let p = 0.62 + (note - f.sel) * 0.13;
    if (G.is('ambitieux')) p += 0.03;
    if (l.me.age > 25) p -= 0.05;
    return { p: clamp(G.luck(p), 0.03, 0.97) };
  }
  G.supChance = supChance;
  function cleanName(s) { return L.cap(String(s || '').replace(/[<>{}\[\]|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24)); }
  const LAWYERS = ['Maître Dupuis', 'Maître Benali', 'Maître Garnier', 'Maître Lefort', 'Maître Nguyen', 'Maître Rossi'];
  const Q = {
    // ---------- le procès ----------
    proces: {
      view: function (q, l) {
        const cr = D.CRIMES[q.m] || D.CRIMES.violence, c = procCtx(q), minor = l.me.age < 18;
        if (q.s === 'garde') {
          const evT = q.ev > 0.75 ? 'Les preuves contre toi sont <b>accablantes</b>.' : q.ev > 0.5 ? 'Le dossier contient des <b>indices sérieux</b>.' : 'Le dossier est <b>plutôt mince</b>.';
          const m = l.money;
          return {
            kicker: 'GARDE À VUE', title: 'Au commissariat', ink: 'r',
            text: L.T('Tu es [placé|placée] en garde à vue pour <b>' + cr.n + '</b>. ' + evT + ' Avant l’interrogatoire, tu as droit à un avocat.', c),
            opts: [
              { id: 'l0', l: 'Avocat commis d’office', sub: 'Gratuit. Il a quatorze dossiers aujourd’hui.' },
              { id: 'l1', l: 'Avocat expérimenté', sub: L.money(2500) + ' · une défense solide', dis: m < 2500 },
              { id: 'l2', l: 'Ténor du barreau', sub: L.money(15000) + ' · le meilleur de la ville', dis: m < 15000 }
            ]
          };
        }
        if (q.s === 'interro') {
          const set = D.INTERRO[q.m] || D.INTERRO.violence, it = set[q.qs[q.i]];
          return {
            kicker: 'INTERROGATOIRE · ' + (q.i + 1) + '/' + q.qs.length, title: L.T(it.q, c), ink: 'r',
            text: 'L’enquêteur te fixe sans cligner des yeux. ' + (q.law === 2 ? 'Ton avocat te fait un signe discret : réfléchis bien.' : q.law ? 'Ton avocat prend des notes à côté de toi.' : 'Ton avocat commis d’office cherche ton nom dans son dossier.'),
            opts: it.a.map(function (a, j) { return { id: 'a' + j, l: L.T(a.l, c) }; })
          };
        }
        const F = /^(Martine|Sylvie|Nadia|Catherine)/.test(q.jg);
        const sev = { severe: 'connu' + (F ? 'e' : '') + ' pour sa sévérité légendaire', normal: 'qui a l’air fatigué' + (F ? 'e' : ''), clement: 'qui a la réputation d’être compréhensi' + (F ? 've' : 'f') }[q.js];
        const plea = ['Ton avocat commis d’office plaide trois minutes en cherchant ton prénom.', 'Ton avocat plaide avec conviction pendant vingt minutes.', 'Ton ténor du barreau fait pleurer la salle, et même le greffier.'][q.law];
        return { kicker: minor ? 'TRIBUNAL POUR ENFANTS' : (cr.grave ? 'COUR D’ASSISES' : 'TRIBUNAL CORRECTIONNEL'), title: 'Le verdict', ink: 'r', text: 'Tu te présentes devant ' + (F ? 'la juge ' : 'le juge ') + '<b>' + L.esc(q.jg) + '</b>, ' + sev + '. ' + plea + (q.aveu ? ' Tu as avoué pendant l’interrogatoire.' : ''), opts: [{ id: 'ok', l: 'Se lever pour entendre le verdict' }] };
      },
      answer: function (q, id, l) {
        const c = procCtx(q), cr = D.CRIMES[q.m] || D.CRIMES.violence;
        if (q.s === 'garde') {
          const law = Number(String(id).slice(1)) || 0, cost = [0, 2500, 15000][law];
          if (cost && l.money < cost) return null;
          l.money -= cost; q.law = law; q.s = 'interro'; q.lw = L.pick(LAWYERS);
          const t = ['{lw} arrive en retard, une tache de café sur la cravate : « On va improviser. »', '{lw} arrive avec un épais dossier et te serre la main : « On va s’en sortir. »', '{lw} entre dans la pièce. Les policiers se redressent. L’enquêteur avale sa salive.'][law];
          c.v.lw = '<b>' + L.esc(q.lw) + '</b>';
          return { t: L.T(t, c), d: cost ? { m: -cost } : {}, title: 'Ton avocat' };
        }
        if (q.s === 'interro') {
          const set = D.INTERRO[q.m] || D.INTERRO.violence, it = set[q.qs[q.i]];
          const a = it.a[Number(String(id).slice(1))];
          if (!a) return null;
          q.pts += typeof a.d === 'function' ? a.d() : a.d;
          if (a.aveu) q.aveu = 1;
          q.i++;
          if (q.i >= q.qs.length) q.s = 'verdict';
          return { t: L.T(a.r, c), d: {}, title: 'L’enquêteur' };
        }
        // verdict
        l.queue.shift();
        const minor = l.me.age < 18;
        let mult = 1 + q.pts - [0, 0.2, 0.4][q.law] + (l.casier ? 0.3 : 0) + { severe: 0.25, normal: 0, clement: -0.2 }[q.js] + L.rand(-0.1, 0.1);
        mult = Math.max(0.2, mult);
        const F = /^(Martine|Sylvie|Nadia|Catherine)/.test(q.jg);
        c.v.j = (F ? 'La juge ' : 'Le juge ') + '<b>' + L.esc(q.jg) + '</b>';
        c.v.cr = cr.n;
        // relaxe si le dossier est mince et que tu n'as rien avoué
        if (!q.aveu && q.ev < 0.65 && L.chance(clamp((0.65 - q.ev) * 1.3 + q.law * 0.08 - q.pts * 0.6, 0, 0.75))) {
          G.ach('relaxe');
          return G.say('{j} prononce ta <b>relaxe</b> pour {cr} : les preuves sont insuffisantes. Tu sors libre du tribunal, sous les yeux furieux de l’enquêteur.', { b: 8 }, c, 'good');
        }
        l.casier = 1;
        if (!cr.y) {
          const fine = Math.round(cr.fine * mult / 10) * 10;
          return G.say('{j} te condamne pour {cr} : <b>' + L.money(fine) + ' d’amende</b>' + (mult > 1.3 ? ' et des travaux d’intérêt général' : '') + '. Ton casier judiciaire s’allonge.', { m: -fine, b: -5 }, c, 'bad');
        }
        let years = cr.y * mult * (minor ? 0.5 : 1);
        if (years < 1) {
          const months = Math.max(2, Math.round(years * 12));
          return G.say('{j} te condamne pour {cr} à <b>' + months + ' mois de prison avec sursis</b>' + (cr.fine ? ' et ' + L.money(cr.fine) + ' d’amende' : '') + '. Au moindre écart, c’est la cellule.', { m: -(cr.fine || 0), b: -6 }, c, 'bad');
        }
        const perpet = years > 30 && !minor;
        const n = perpet ? 99 : Math.max(1, Math.round(years));
        G.jail(n, perpet);
        const where = minor ? ' en établissement pour mineurs' : '';
        return G.say(perpet ? '{j} te condamne pour {cr} à la <b>réclusion criminelle à perpétuité</b>. La salle retient son souffle.' : '{j} te condamne pour {cr} à <b>' + n + ' an' + (n > 1 ? 's' : '') + ' de prison ferme</b>' + where + '.', { b: -14, s: -8 }, c, 'bad');
      }
    },
    // ---------- découverte d'un centre d'intérêt ----------
    intev: {
      view: function (q, l) {
        const it = D.interest(q.id), e = D.INT_EV[q.id];
        if (!it || !e) return null;
        const c = G.ctx();
        Object.keys(q.r || {}).forEach(function (k) { c.r[k] = G.byId(q.r[k]); });
        const opts = l.ints.length < 2 ? [{ id: 'yes', l: 'Oui, c’est une révélation !', sub: 'Nouveau centre d’intérêt : ' + it.n }]
          : l.ints.map(function (x) { const o = D.interest(x); return { id: 'r:' + x, l: 'Oui, à la place de : ' + o.n, sub: 'Tu abandonnes ' + o.n }; });
        opts.push({ id: 'no', l: 'Non, pas pour moi', alt: 1 });
        return { kicker: 'CENTRE D’INTÉRÊT', title: it.n, ink: 'c', text: L.T(e.t, c), q: L.T(e.q, c), opts: opts };
      },
      answer: function (q, id, l) {
        const it = D.interest(q.id);
        l.queue.shift();
        if (!it || id === 'no') return G.say('Tu passes ton chemin. ' + (it ? it.n : 'Ce truc') + ', ce sera peut-être pour une autre fois.', null, null, '');
        if (String(id).indexOf('r:') === 0) l.ints = l.ints.filter(function (x) { return x !== String(id).slice(2); });
        if (l.ints.length >= 2 || l.ints.indexOf(it.id) >= 0) return null;
        l.ints.push(it.id);
        return G.say('Nouveau centre d’intérêt : <b>' + it.n + '</b> ! Tu en parles déjà à tout le monde.', { b: 3 }, null, 'good');
      }
    },
    ori: {
      view: function (q, l) {
        const pron = { M: 'il', F: 'elle', X: 'iel' }[l.me.sex] || 'il';
        return {
          kicker: 'ADOLESCENCE · ' + l.me.age + ' ANS', title: 'Qui fait battre ton cœur ?', ink: 'm',
          text: L.T('{prenom} se questionne sur son orientation sexuelle. Qu’' + pron + ' préfère ?', G.ctx()),
          opts: [
            { id: 'het', l: 'Hétérosexualité', sub: 'Attirance pour l’autre genre.' },
            { id: 'homo', l: 'Homosexualité', sub: 'Attirance pour le même genre.' },
            { id: 'bi', l: 'Bisexualité', sub: 'Attirance pour tous les genres.' }
          ]
        };
      },
      answer: function (q, id, l) {
        if (['het', 'homo', 'bi'].indexOf(id) < 0) return null;
        l.queue.shift();
        l.ori = id;
        const n = { het: 'hétérosexualité', homo: 'homosexualité', bi: 'bisexualité' }[id];
        // si le couple actuel ne correspond pas à l'orientation trouvée, l'histoire s'arrête
        const p = G.partner();
        if (p && l.me.sex !== 'X' && p.sex !== 'X' && ((id === 'het' && p.sex === l.me.sex) || (id === 'homo' && p.sex !== l.me.sex))) {
          G.breakup(p);
          return G.say('Tu y vois plus clair : <b>' + n + '</b>. Tu comprends que ton histoire avec {x.n} ne te correspond pas. Vous vous séparez en douceur.', { b: -2 }, G.ctx({ x: p }), 'love');
        }
        return G.say('Tu y vois plus clair : <b>' + n + '</b>. Ton cœur a trouvé sa boussole. Il reste les devoirs de maths.', { b: 2 }, null, 'love');
      }
    },
    bebenom: {
      view: function (q, l) {
        const ch = G.byId(q.id);
        if (!ch) return null;
        const other = G.byId(ch.op);
        return {
          kicker: 'NAISSANCE · ' + l.year, title: ch.sex === 'F' ? 'C’est une fille !' : 'C’est un garçon !', ink: 'm', face: ch,
          text: 'Bienvenue au monde ! ' + (other ? 'Avec ' + L.esc(other.first) + ', vous choisissez' : 'Tu choisis') + ' son prénom.' + (L.M && L.M.babyName(l) ? ' Tu avais déjà une idée depuis longtemps…' : ''),
          input: { v: (L.M && L.M.babyName(l)) || ch.first, sex: ch.sex, label: 'Prénom' },
          opts: [{ id: 'ok', l: 'Valider ce prénom' }]
        };
      },
      answer: function (q, id, l, val) {
        const ch = G.byId(q.id);
        l.queue.shift();
        if (!ch) return null;
        ch.first = cleanName(val) || ch.first;
        l.queue.unshift({ k: 'q', t: 'bebeedu', id: ch.id });
        const other = G.byId(ch.op);
        return G.say('Naissance ! Bienvenue à {x:ton fils|ta fille} {x.n}. Tu ne dormiras plus jamais une nuit complète.', { b: 10, rq: other && other.alive ? { y: 8 } : null }, G.ctx({ x: ch, y: other }), 'love');
      }
    },
    bebeedu: {
      view: function (q) {
        const ch = G.byId(q.id);
        if (!ch) return null;
        return {
          kicker: 'ÉDUCATION', title: 'Comment élever ' + L.esc(ch.first) + ' ?', ink: 'c', face: ch,
          text: 'Ton style d’éducation forge son caractère et ses talents, année après année. Tu pourras le changer plus tard.',
          opts: D.EDU_STYLES.map(function (s) { return { id: s.id, l: s.n, sub: s.d }; })
        };
      },
      answer: function (q, id, l) {
        const ch = G.byId(q.id);
        if (!D.EDU_STYLES.some(function (s) { return s.id === id; })) return null;
        l.queue.shift();
        if (!ch) return null;
        ch.ed = id;
        const c = G.ctx({ x: ch }); c.v = { s: D.eduStyle(id).n.toLowerCase() };
        return G.say('Pour {x.n}, ce sera une éducation <b>{s}</b>.', null, c, 'fam');
      }
    },
    orient3: {
      view: function (q, l) {
        const ok = q.fin >= 9.5;
        return {
          kicker: 'ORIENTATION · FIN DE 3e', title: 'Et après le collège ?', ink: 'c',
          text: 'Le conseil de classe se réunit. Ta moyenne de 3e : <b>' + L.dec(q.fin) + '/20</b>.',
          opts: [
            { id: 'gt', l: 'Lycée général et technologique', sub: ok ? 'Bac général ou techno en 3 ans. La voie vers les longues études.' : 'Le conseil de classe ne te le propose pas (il faut 9,5 de moyenne).', dis: !ok },
            { id: 'pro', l: 'Lycée professionnel', sub: 'Un bac pro en 3 ans : cuisine, mécanique, électricité, commerce ou bâtiment.' },
            { id: 'cap', l: 'CAP en 2 ans', sub: 'Un métier vite : cuisine, coiffure, boulangerie, mécanique, électricité, plomberie.' },
            { id: 'stop', l: 'Arrêter l’école', sub: l.me.age >= 16 ? 'Direction la vie active.' : 'Impossible avant 16 ans.', dis: l.me.age < 16 }
          ]
        };
      },
      answer: function (q, id, l) {
        const e = l.edu;
        l.queue.shift();
        if (id === 'gt') { e.st = 'lyc'; e.i = 12; e.fil = null; e.g = newGrade(l, q.fin); return G.say('Direction le lycée général et technologique. Seconde, nous voilà.', { b: 2 }, null, 'school'); }
        if (id === 'pro') { l.queue.unshift({ k: 'q', t: 'prochoice', fin: q.fin }); return null; }
        if (id === 'cap') { l.queue.unshift({ k: 'q', t: 'capchoice', fin: q.fin }); return null; }
        e.st = 'fini';
        return G.say('Tu quittes l’école. Les cartables, c’est fini.', { b: 3 }, null, 'school');
      }
    },
    prochoice: {
      view: function () {
        return {
          kicker: 'LYCÉE PROFESSIONNEL', title: 'Quel bac pro ?', ink: 'c', text: 'Trois ans pour apprendre un vrai métier, avec des stages en entreprise.',
          opts: ['pro-cuisine', 'pro-meca', 'pro-elec', 'pro-commerce', 'pro-batiment'].map(function (id) { return { id: id, l: D.BAC[id].n }; })
        };
      },
      answer: function (q, id, l) {
        const e = l.edu;
        l.queue.shift();
        e.st = 'lyc'; e.i = 12; e.fil = id; e.g = newGrade(l, q.fin + 0.8);
        const c = G.ctx(); c.v = { n: D.BAC[id].n };
        return G.say('Tu entres au lycée pro : {n}.', { b: 2 }, c, 'school');
      }
    },
    capchoice: {
      view: function () {
        return { kicker: 'CAP', title: 'Quel CAP ?', ink: 'c', text: 'Deux ans, beaucoup de pratique, un diplôme de métier à la clé.', opts: D.CAPS.map(function (x) { return { id: x.id, l: x.n }; }) };
      },
      answer: function (q, id, l) {
        const e = l.edu;
        l.queue.shift();
        e.st = 'cap'; e.cap = { id: id, y: 1 }; e.g = newGrade(l, q.fin + 1);
        const c = G.ctx(); c.v = { n: D.sup(id).n };
        return G.say('Tu commences ton {n}.', { b: 2 }, c, 'school');
      }
    },
    orient2: {
      view: function (q) {
        const H = {
          sci: 'Pour : ingénieur, médecine, pilote, archi, informatique',
          bio: 'Pour : médecine, pharmacie, véto, infirmier, biologie',
          num: 'Pour : informatique, ingénieur, jeu vidéo',
          eco: 'Pour : commerce, finance, droit, compta',
          lettres: 'Pour : lettres, droit, journalisme, enseignement',
          art: 'Pour : Beaux-Arts, archi, cinéma, design',
          sti2d: 'Pour : BUT, BTS, écoles d’ingénieurs techniques',
          stmg: 'Pour : BTS commerce, compta, BUT',
          st2s: 'Pour : infirmier, social, psychologie'
        };
        return {
          kicker: 'ORIENTATION · FIN DE SECONDE', title: 'Choisis tes spécialités', ink: 'c',
          text: 'Ta moyenne de seconde : <b>' + L.dec(q.fin) + '/20</b>. Ce choix ouvre (ou ferme) des portes après le bac.',
          opts: Object.keys(H).map(function (id) { return { id: id, l: D.BAC[id].n, sub: H[id] }; })
        };
      },
      answer: function (q, id, l) {
        const e = l.edu;
        l.queue.shift();
        e.fil = id; e.i = 13; e.g = newGrade(l, q.fin);
        const c = G.ctx(); c.v = { n: D.BAC[id].n };
        return G.say('Première, voie choisie : {n}.', { b: 1 }, c, 'school');
      }
    },
    bacfail: {
      view: function () {
        return { kicker: 'BACCALAURÉAT', title: 'Recalé·e au bac', ink: 'r', text: 'Ce n’est pas la fin du monde. Que fais-tu ?', opts: [{ id: 'redo', l: 'Redoubler la terminale', sub: 'Une deuxième chance l’an prochain.' }, { id: 'stop', l: 'Arrêter les études', sub: 'Direction la vie active, sans le bac.' }] };
      },
      answer: function (q, id, l) {
        const e = l.edu;
        l.queue.shift();
        if (id === 'redo') { e.st = 'lyc'; e.i = 14; e.rep++; e.g = clamp(e.last + 2, 0, 20); G.ach('redouble'); return G.say('Tu retentes ta terminale. Cette fois, c’est la bonne.', null, null, 'school'); }
        e.st = 'fini';
        return G.say('Tu tournes la page du lycée.', null, null, 'school');
      }
    },
    master: {
      view: function (q) {
        const f = D.sup(q.id);
        const p = supChance(f).p;
        return { kicker: 'POURSUITE D’ÉTUDES', title: 'Continuer en master ?', ink: 'c', text: 'Ta licence est en poche. Tu peux tenter : <b>' + L.esc(f.n) + '</b> (' + f.yrs + ' ans).', opts: [{ id: 'yes', l: 'Candidater au ' + f.n, sub: 'Admission : ' + Math.round(p * 100) + ' %' }, { id: 'no', l: 'S’arrêter là', sub: 'Entrer dans la vie active avec ta licence.' }] };
      },
      answer: function (q, id, l) {
        const e = l.edu, f = D.sup(q.id);
        l.queue.shift();
        if (id === 'yes' && L.chance(supChance(f).p)) {
          e.st = 'sup'; e.sup = { id: f.id, y: 1, g: clamp(baseGrade(l), 8, 16), fails: 0 };
          const c = G.ctx(); c.v = { n: f.n };
          return G.say('Admis{e} en {n} !', { b: 5 }, c, 'good');
        }
        e.st = 'fini';
        return G.say(id === 'yes' ? 'Ta candidature en master est refusée. Tu entres dans la vie active.' : 'Tu t’arrêtes après la licence.', id === 'yes' ? { b: -3 } : null, null, 'school');
      }
    },
    sup: {
      view: function (q, l) {
        const list = D.SUP.filter(function (f) { return !f.hidden; }).map(function (f) {
          const ch = supChance(f);
          const tried = q.tried.indexOf(f.id) >= 0;
          const fee = f.fee ? L.money(f.fee) + '/an' : 'gratuit';
          return { id: f.id, l: f.n, sub: tried ? 'Refusé' : ch.p ? f.yrs + ' an' + (f.yrs > 1 ? 's' : '') + ' · ' + fee + ' · admission ' + Math.round(ch.p * 100) + ' %' : ch.why, dis: tried || !ch.p, p: ch.p };
        }).sort(function (a, b) { return (b.dis ? 0 : 1) - (a.dis ? 0 : 1); });
        const left = 3 - q.tried.length;
        const opts = left > 0 ? list : [];
        opts.push({ id: 'cesure', l: 'Année de césure', sub: 'Souffler un an et retenter Parcoursup.', alt: 1 });
        opts.push({ id: 'travail', l: l.me.age >= 19 ? 'Annuler' : 'Entrer dans la vie active', sub: 'Pas d’études supérieures pour l’instant.', alt: 1 });
        return { kicker: 'PARCOURSUP', title: left > 0 ? 'Fais tes vœux' : 'Plus de vœux possibles', ink: 'y', text: left > 0 ? 'Choisis une formation. Il te reste <b>' + left + ' vœu' + (left > 1 ? 'x' : '') + '</b>.' : 'Tous tes vœux ont été refusés. Tu peux souffler un an ou commencer à travailler.', opts: opts };
      },
      answer: function (q, id, l) {
        const e = l.edu;
        if (id === 'cesure') { l.queue.shift(); e.st = 'cesure'; return G.say('Année de césure. Tu vas « te trouver ». Tu commences par trouver le canapé.', { b: 3 }, null, 'school'); }
        if (id === 'travail') { l.queue.shift(); if (e.st !== 'sup') e.st = 'fini'; return null; }
        const f = D.sup(id);
        if (!f || q.tried.indexOf(id) >= 0) return null;
        const ch = supChance(f);
        q.tried.push(id);
        const c = G.ctx(); c.v = { n: f.n };
        if (ch.p && L.chance(ch.p)) {
          l.queue.shift();
          if (f.lvl === 1) { e.st = 'cap'; e.cap = { id: f.id, y: 1 }; e.g = 12; }
          else { e.st = 'sup'; e.sup = { id: f.id, y: 1, g: clamp(baseGrade(l), 8, 16), fails: 0 }; }
          return G.say('Parcoursup : tu es [accepté|acceptée] en <b>{n}</b> !', { b: 7 }, c, 'good');
        }
        return G.say('Parcoursup : refusé en {n}.', { b: -2 }, c, 'bad');
      }
    }
  };

  G.Q = Q;
  // ---------- file d'attente (modales) ----------
  function runChecks(l, yearly) {
    if (l.dead) return;
    if (l.st.h < 5) { l.queue.unshift({ k: 'qte', t: 'hosp' }); return; }
    if (l.st.b <= 8 && l.me.age >= 12 && !l.depr) {
      l.depr = 1;
      G.say('Tu sombres dans la dépression. Tout paraît gris, même les jours de soleil.', null, null, 'warn');
    }
    if (yearly && l.me.age >= 12) {
      let p = 0;
      if (l.depr) p = Math.min(0.85, 0.3 + 0.15 * (l.depr - 1));
      if (l.lonely >= 4) p = Math.max(p, 0.9);
      if (p && L.chance(p)) l.queue.unshift({ k: 'qte', t: 'noir' });
    }
  }
  G.pending = function () {
    const l = S && S.life;
    if (!l || l.dead) return null;
    while (l.queue.length) {
      const q = l.queue[0];
      if (q.k === 'checks') { l.queue.shift(); runChecks(l, q.y); continue; }
      if (q.k === 'ev' && !(L.EV && L.EV.get(q.id))) { l.queue.shift(); continue; }
      if (q.k === 'q' && !Q[q.t]) { l.queue.shift(); continue; }
      return q;
    }
    return null;
  };
  G.afterAction = function () {
    const l = S.life;
    if (l && !l.dead && !l.queue.some(function (q) { return q.k === 'checks'; })) l.queue.push({ k: 'checks' });
  };
  G.view = function (q) {
    const l = S.life;
    if (q.k === 'ev') return L.EV.view(q);
    if (q.k === 'q') return Q[q.t].view(q, l);
    if (q.k === 'msg') return { kicker: q.kicker, title: q.title, text: q.text, ink: q.ink, opts: [{ id: 'ok', l: 'Continuer' }] };
    if (q.k === 'traits') {
      const sex = l.me.sex;
      return {
        kicker: '18 ANS · MAJORITÉ', title: 'Ton caractère est forgé', ink: 'm',
        text: 'Dix-huit ans de choix, de bêtises et de goûters partagés (ou pas) ont fait de toi quelqu’un de :',
        traits: l.traits.map(function (t) { return { n: L.gs(D.TRAITS[t].n, sex), d: D.TRAITS[t].d, ink: D.TRAITS[t].ink }; }),
        opts: [{ id: 'ok', l: 'Assumer qui je suis' }]
      };
    }
    return null;
  };
  G.answer = function (id, val) {
    const l = S.life;
    const q = G.pending();
    if (!q) return null;
    if (q.k === 'ev') return L.EV.resolve(q, id);
    if (q.k === 'q') return Q[q.t].answer(q, id, l, val) || null;
    l.queue.shift();
    return null;
  };

  // ---------- QTE ----------
  G.helpers = function () {
    return G.alive(['mere', 'pere', 'par', 'sib', 'gp', 'enf', 'part', 'ami', 'pet']).filter(function (p) { return p.rq >= 40 && (p.rel === 'pet' || p.age >= 6); })
      .sort(function (a, b) { return b.rq - a.rq; }).slice(0, 8);
  };
  G.qteDone = function (ok) {
    const l = S.life;
    const q = l.queue[0];
    if (!q || q.k !== 'qte') return null;
    l.queue.shift();
    if (q.t === 'hosp') {
      if (ok) {
        l.st.h = L.ri(22, 32);
        l.ill = l.ill.filter(function (i) { return !D.ILLS[i.id].hosp; });
        if (l.me.age >= 90) G.ach('miracle');
        return G.say('Les médecins te ramènent à la vie. Tu sors de l’hôpital avec une liste de médicaments longue comme le bras.', { b: -2 }, null, 'good');
      }
      const serious = l.ill.some(function (i) { return D.ILLS[i.id].hosp; });
      G.die(serious ? 'maladie' : l.me.age >= 75 ? 'vieillesse' : 'hopital');
      return null;
    }
    if (q.t === 'noir') {
      if (ok) {
        l.st.b = 20; l.depr = 0; l.lonely = 0;
        l.st.s = Math.max(l.st.s, 18);
        l.flags.suivi = l.year;
        G.ach('survivant');
        return G.say('Tu tiens bon. Les gens qui t’aiment étaient là, et tu acceptes enfin de te faire aider. Les idées noires reculent.', null, null, 'good');
      }
      G.die('depression');
      return null;
    }
    return null;
  };

  // ---------- mort et héritage ----------
  G.die = function (cause, txt) {
    const l = S.life;
    if (l.dead) return;
    l.dead = { cause: cause, age: l.me.age, year: l.year, txt: txt || '' };
    l.queue = [];
    const c = G.ctx();
    c.v = { cause: L.esc(txt || D.CAUSES[cause] || D.CAUSES.maladie).replace('entouré·e', L.gx('entouré', 'entourée', l.me.sex)), age: l.me.age };
    G.log(L.T('Tu meurs à {age} ans, {cause}.', c), null, 'dead');
    G.gainXP(Math.round(l.me.age * 1.5));
    if (l.money >= 1e6) G.ach('millionnaire');
    const kids = l.people.filter(function (p) { return p.rel === 'enf'; }).length;
    S.account.lives.unshift({
      n: l.me.first + ' ' + l.me.last, sex: l.me.sex, by: l.me.by, dy: l.year, age: l.me.age, cause: cause,
      job: l.job ? G.jobTitle() : (l.cv.length ? G.jobLabel(l.cv[l.cv.length - 1].id, l.me.sex, l.cv[l.cv.length - 1].lvl) : ''),
      money: Math.round(l.money), kids: kids, gen: l.gen, city: l.born, xp: l.xpLife,
      traits: l.traits.map(function (t) { return L.gs(D.TRAITS[t].n, l.me.sex); }), legend: G.has('legende') ? 1 : 0
    });
    S.account.lives = S.account.lives.slice(0, 40);
    G.stashMots(l);
    G.emit('dead');
  };
  G.heirs = function () { return S.life.people.filter(function (p) { return p.alive && p.rel === 'enf'; }); };
  G.continueAs = function (childId, mots) {
    const old = S.life;
    const ch = old.people.find(function (p) { return p.id === childId && p.alive; });
    if (!ch) return null;
    const heirs = G.heirs();
    const share = Math.max(0, Math.round(Math.max(0, old.money) * 0.8 / Math.max(1, heirs.length)));
    const l = baseLife({ first: ch.first, last: ch.last, sex: ch.sex, city: old.city, year: old.year, age: ch.age, look: ch.look, gen: old.gen + 1, wealth: old.money > 500000 ? 'riche' : old.money > 100000 ? 'aisee' : old.money > 15000 ? 'moyenne' : 'modeste' });
    l.born = old.city;
    S.life = l;
    takeMots(l, mots);
    // le parent disparu
    const om = old.me;
    const rel = om.sex === 'F' ? 'mere' : om.sex === 'M' ? 'pere' : 'par';
    const dp = mk({ rel: rel, sex: om.sex === 'X' ? 'M' : om.sex, first: om.first, last: om.last, age: om.age, rq: ch.rq, look: om.look });
    dp.alive = false; dp.dy = old.year;
    const other = old.people.find(function (p) { return p.id === ch.op; });
    if (other && other.alive) mk({ rel: other.sex === 'F' ? 'mere' : 'pere', sex: other.sex, first: other.first, last: other.last, age: other.age, rq: L.ri(50, 85), look: other.look });
    heirs.forEach(function (s) { if (s.id !== ch.id) mk({ rel: 'sib', sex: s.sex, first: s.first, last: s.last, age: s.age, rq: L.ri(40, 75), look: s.look }); });
    old.people.filter(function (p) { return p.alive && (p.rel === 'mere' || p.rel === 'pere' || p.rel === 'par'); })
      .forEach(function (g) { mk({ rel: 'gp', sex: g.sex, first: g.first, last: g.last, age: g.age, rq: L.ri(55, 85), look: g.look }); });
    // portrait de départ
    const a = ch.age;
    l.st = { h: L.ri(50, 70), b: L.ri(30, 45), c: L.ri(40, 60), s: L.ri(40, 60) };
    // ce que ton éducation lui a transmis
    const kx = ch.kx || { sk: {}, tr: {} };
    D.SKILLS.forEach(function (s) { l.sk[s.id] = clamp(L.ri(0, Math.min(35, a * 1.6)) + (kx.sk[s.id] || 0) * 1.4, 0, 85); });
    if (a >= 18) {
      const kt = G.kidTraits(ch).filter(function (t, i, arr) { return !arr.slice(0, i).some(function (x) { return D.TRAITS[x].opp === t; }); });
      l.traits = kt.length ? kt.slice(0, 3) : L.shuffle(D.TRAIT_IDS).reduce(function (acc, t) { if (acc.length < 2 && !acc.some(function (x) { return D.TRAITS[x].opp === t; })) acc.push(t); return acc; }, []);
    } else D.TRAIT_IDS.forEach(function (t) { l.tr[t] = Math.round((kx.tr[t] || 0) * 0.8) + L.ri(0, Math.floor(a / 4)); });
    if (a >= 12) l.queue.push({ k: 'q', t: 'ori' });

    // école selon l'âge
    if (a >= 3 && a < 18) { l.edu.i = Math.min(14, a - 3); l.edu.st = D.stageOf(l.edu.i); l.edu.g = L.ri(9, 15); if (l.edu.i >= 13) l.edu.fil = L.pick(['sci', 'eco', 'lettres', 'bio']); }
    else if (a >= 18) {
      l.edu.st = 'fini';
      if (L.chance(0.8)) l.dip.push({ id: 'bac', bac: 1, n: D.BAC.eco.n, lvl: 2, y: old.year - (a - 18), m: '', note: L.ri(10, 15), fil: 'eco' });
      if (a >= 22 && ch.job && D.job(ch.job)) { l.job = { id: ch.job, lvl: Math.min(2, Math.floor((a - 22) / 6)), yrs: a - 22, ly: 1, perf: 55, raise: 1, since: old.year - (a - 22), pt: 0 }; l.cv.push({ id: ch.job, from: l.job.since, to: null, lvl: l.job.lvl }); l.home = 'studio'; }
    }
    l.money = share;
    l.log.push({ a: a, y: l.year, L: [] });
    const c = G.ctx({ x: dp });
    c.v = { age: a, h: L.money(share), g: l.gen };
    G.say('Génération {g}. Tu reprends le flambeau : {prenom}, {age} ans. Tu viens de perdre {x}.', null, c, 'big');
    if (share > 0) G.say('Héritage (après 20 % de droits de succession) : <b>{h}</b>.', null, c, 'good');
    if (l.gen >= 3) G.ach('dynastie');
    G.emit('life');
    return l;
  };
  G.endLife = function () { if (S.life) G.stashMots(S.life); S.life = null; G.emit('life'); };
  // tes phrases à toi : gardées de côté à la fin d'une vie, reprises dans la suivante si tu le veux
  G.stashMots = function (l) { if (l && L.M && L.M.count(l)) S.account.lastMots = JSON.parse(JSON.stringify(l.mots)); };
  G.lastMotsCount = function () { const m = S.account.lastMots; return m && L.M ? L.M.count({ mots: m }) : 0; };
  function takeMots(l, mots) {
    if (!mots || !L.M) return;
    l.mots = JSON.parse(JSON.stringify(mots));
    L.M.PROMPTS.forEach(function (p) { if (L.M.has(l, p.slot)) l.motQ[p.id] = 1; });
  }

  // ---------- emploi : l'année ----------
  function jobYear(l) {
    const a = l.me.age;
    if (l.retired) { l.money += l.pension; l.yr.inc += l.pension; l.yr.inL.push('retraite'); return; }
    if (l.chomage) {
      if (!l.job) { l.money += l.chomage.amt; l.yr.inc += l.chomage.amt; l.yr.inL.push('chômage'); }
      l.chomage.y--;
      if (l.chomage.y <= 0) l.chomage = null;
    }
    if (a >= 65 && !l.job && !l.retired) {
      G.retire();
      G.say('Tu touches désormais ta pension de retraite : {p} par an.', null, (function () { const c = G.ctx(); c.v = { p: L.money(l.pension) }; return c; })(), 'good');
      return;
    }
    const j = l.job;
    if (!j) return;
    const d = D.job(j.id);
    const sal = G.salary();
    l.money += sal; l.yr.inc += sal; l.yr.inL.push('salaire');
    j.yrs++; j.ly++;
    // performance
    let dp = (50 - j.perf) * 0.15 + L.rand(-6, 6);
    const req = d.req.sk || {};
    const ks = Object.keys(req);
    if (ks.length) dp += clamp(ks.reduce(function (s, k) { return s + l.sk[k] - req[k]; }, 0) / ks.length * 0.2, -6, 8);
    if (G.is('discipline')) dp += 5;
    if (G.is('ambitieux')) dp += 4;
    if (G.is('nonchalant')) dp -= 4;
    if (G.is('rebelle')) dp -= 2;
    if (G.is('creatif') && (d.cat === 'star' || ['archi', 'designer', 'gamedesign', 'realisateur', 'chef'].indexOf(d.id) >= 0)) dp += 4;
    if (l.st.b < 25) dp -= 5;
    if (l.st.h < 25) dp -= 5;
    if (l.lonely) dp -= 8;
    j.perf = clamp(j.perf + dp, 0, 100);
    const c = G.ctx({ boss: G.role('boss') });
    if (j.perf < 18 && L.chance(j.perf < 8 ? 0.8 : 0.4)) {
      const t = G.jobTitle();
      G.loseJob('fired');
      c.v = { t: L.esc(t) };
      G.say('Licencié{e} ! Ton poste de {t} t’échappe : performances jugées « catastrophiques ». France Travail t’attend.', { b: -10 }, c, 'bad');
      return;
    }
    if (L.chance(0.012) && d.cat !== 'star') {
      G.loseJob('eco');
      G.say('Licenciement économique : ton entreprise « se restructure ». Tu touches le chômage pendant 2 ans.', { b: -7 }, c, 'bad');
      return;
    }
    if (j.perf >= 82 && j.ly >= 2 && L.chance(0.25) && G.promote()) {
      c.v = { t: L.esc(G.jobTitle()) };
      G.say('Promotion surprise ! Tu deviens <b>{t}</b>.', { b: 6 }, c, 'good');
    }
    if (a >= 67 && d.cat !== 'star') {
      G.retire();
      c.v = { p: L.money(l.pension) };
      G.say('À 67 ans, on te pousse doucement vers la sortie : retraite ! Pension : {p} par an.', { b: 5 }, c, 'good');
    }
  }

  // ---------- argent : l'année ----------
  function moneyYear(l) {
    const a = l.me.age, y = l.yr;
    // argent de poche
    if (a >= 6 && a < 18 && l.home === 'parents') {
      const par = G.parents().length ? G.parents() : G.alive('gp');
      if (par.length) {
        const w = D.wealth(l.wealth);
        const rq = par.reduce(function (s, p) { return s + p.rq; }, 0) / par.length;
        const pm = Math.round(w.pocket * (a / 12) * (0.6 + rq / 120) / 10) * 10;
        if (pm > 0) { l.money += pm; y.inc += pm; y.inL.push('argent de poche'); }
      }
    }
    if (a === 18 && G.has('livret')) { l.money += 2000; y.inc += 2000; y.inL.push('livret A'); }
    // plus de parents pour héberger un mineur ou un adulte : il faut un toit
    if (l.home === 'parents' && a >= 18 && !G.parents().length && !(a < 25 && G.alive('gp').length)) {
      l.home = 'studio';
      G.say('Plus personne pour t’héberger : tu loues un studio.', null, null, 'warn');
    }
    if (l.home !== 'parents' && !l.prison) {
      const h = D.home(l.home);
      const part = G.partner();
      const cohab = part && part.cohab;
      let rent = h.own ? h.cost : h.cost * D.SIZE[D.city(l.city).size].rent;
      if (cohab) rent *= 0.55;
      const apl = !h.own && (l.budget ? l.budget.inc : 0) < 16000 && y.inc < 16000;
      if (apl) rent *= 0.6;
      const living = D.LIVING * (cohab ? 0.7 : 1);
      const tot = Math.round(rent + living);
      l.money -= tot; y.exp += tot; y.exL.push(h.own ? 'charges et vie courante' : 'loyer et vie courante');
    }
    // enfants à charge
    const kids = G.alive('enf').filter(function (p) { return p.age < 18; }).length;
    if (kids) { const k = Math.round(kids * 2600 * (G.partner() ? 0.6 : 1)); l.money -= k; y.exp += k; y.exL.push('enfants'); }
    // entretien des objets
    let up = 0;
    l.items.forEach(function (it) { const d = D.item(it.id); if (d && d.up) up += d.up; });
    if (up) { l.money -= up; y.exp += up; y.exL.push('entretien'); }
    // prêt immobilier
    if (l.loan) {
      l.money -= l.loan.pay; y.exp += l.loan.pay; y.exL.push('prêt immobilier');
      l.loan.y--;
      if (l.loan.y <= 0) { l.loan = null; G.say('Ton prêt immobilier est entièrement remboursé ! La maison est vraiment à toi.', { b: 6 }, null, 'good'); }
    }
    // addiction au jeu
    if (l.add.jeu) { const loss = Math.round(Math.max(300, Math.max(0, l.money) * 0.12)); l.money -= loss; y.exp += loss; y.exL.push('jeux d’argent'); }
    // intérêts des dettes
    if (l.money < 0) {
      const it = Math.min(3000, Math.round(-l.money * 0.05));
      l.money -= it; y.exp += it; y.exL.push('intérêts');
      if (l.money < -20000) G.ach('dette');
    }
    // surendettement : la Banque de France étale les dettes, on déménage moins cher
    if (l.money < -15000 && a >= 18) {
      const down = { villa: 'achat-maison', 'achat-maison': 't3', 'achat-appart': 'studio', maison: 't3', t3: 'studio', studio: 'coloc', coloc: 'coloc', crous: 'crous' };
      let sold = 0;
      const h = D.home(l.home);
      if (h.own) { sold = Math.round(h.buy * D.SIZE[D.city(l.city).size].rent * (l.loan ? 0.35 : 0.9)); l.loan = null; }
      const next = G.parents().length && a < 30 ? 'parents' : (down[l.home] || 'coloc');
      const before = l.money;
      l.money = Math.round((l.money + sold) * 0.5);
      if (l.money > 0) l.money = Math.round(l.money * 0.8);
      if (l.home !== 'parents') l.home = next;
      const c = G.ctx(); c.v = { d: L.money(-before) };
      G.say('Surendettement ({d}) : la Banque de France étale et réduit tes dettes. ' + (h.own ? 'Ton logement est vendu. ' : '') + 'Tu dois te serrer la ceinture et déménager moins cher.', { b: -8 }, c, 'bad');
    }
    // influence : revenus des vidéos
    if (l.yt) {
      if (l.yt.subs >= 10000) { const r = Math.round(l.yt.subs * 0.06); l.money += r; y.inc += r; y.inL.push('vidéos'); }
      if (l.yt.last !== l.year - 1) l.yt.subs = Math.round(l.yt.subs * 0.9);
    }
    l.budget = { inc: y.inc, exp: y.exp, inL: y.inL.slice(), exL: y.exL.slice() };
    if ((y.inc || y.exp) && a >= 14) {
      const parts = [];
      if (y.inc) parts.push('<span class="pos">+' + L.money(y.inc) + '</span> (' + uniq(y.inL).join(', ') + ')');
      if (y.exp) parts.push('<span class="neg">−' + L.money(y.exp) + '</span> (' + uniq(y.exL).join(', ') + ')');
      G.log('Budget de l’année : ' + parts.join(' · ') + '.', null, 'money');
    }
    if (l.money >= 1e6) G.ach('millionnaire');
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  // ---------- santé : l'année ----------
  const ILL_POOL = [
    { id: 'rhume', w: 30, a: [0, 120] }, { id: 'poux', w: 12, a: [3, 11] }, { id: 'varicelle', w: 8, a: [1, 11], once: 1 },
    { id: 'angine', w: 10, a: [2, 120] }, { id: 'gastro', w: 12, a: [0, 120] }, { id: 'grippe', w: 10, a: [3, 120] },
    { id: 'carie', w: 8, a: [4, 120] }, { id: 'allergie', w: 4, a: [6, 120] }, { id: 'migraine', w: 4, a: [12, 120] },
    { id: 'maldos', w: 6, a: [28, 120] }, { id: 'appendicite', w: 1.5, a: [6, 60] }, { id: 'hypertension', w: 4, a: [45, 120] },
    { id: 'diabete', w: 2.5, a: [42, 120] }, { id: 'arthrose', w: 5, a: [60, 120] }, { id: 'cancer', w: 1.6, a: [40, 120] },
    { id: 'covid', w: 25, a: [0, 120], yr: [2020, 2023] }
  ];
  function healthYear(l) {
    const a = l.me.age;
    // maladies en cours
    l.ill = l.ill.filter(function (i) {
      const d = D.ILLS[i.id];
      i.y++;
      G.fx({ h: -d.sev * L.rand(0.6, 1.1), b: -d.sev * 0.3 });
      if (L.chance(d.auto)) { G.say('Guérison : ' + d.n.toLowerCase() + ', c’est fini.', { b: 1 }, null, 'good'); return false; }
      return true;
    });
    // nouvelles maladies
    let p = a < 12 ? 0.4 : a < 50 ? 0.2 : a < 70 ? 0.32 : 0.45;
    if (l.st.h < 30) p *= 1.5;
    if (L.chance(p)) {
      const pool = ILL_POOL.filter(function (x) {
        return a >= x.a[0] && a <= x.a[1] && (!x.yr || (l.year >= x.yr[0] && l.year <= x.yr[1])) && !(x.once && l.flags['ill:' + x.id]) && !l.ill.some(function (i) { return i.id === x.id; });
      });
      const x = L.wpick(pool, function (x) {
        let w = x.w;
        if (x.id === 'cancer') w *= (l.add.tabac ? 4 : 1) * (1 + (a - 40) / 20);
        if (x.id === 'diabete' && l.diet === 'malbouffe') w *= 3;
        if (x.id === 'hypertension' && l.add.alcool) w *= 2;
        return w;
      });
      if (x) {
        G.sick(x.id);
        l.flags['ill:' + x.id] = 1;
        const d = D.ILLS[x.id];
        G.say('Tu tombes malade : <b>' + d.n.toLowerCase() + '</b>.' + (d.hosp ? ' C’est sérieux : il faut voir un médecin.' : ''), { h: -Math.min(4, d.sev) }, null, 'bad');
      }
    }
  }

  // ---------- jauges : l'année ----------
  function statsYear(l) {
    const a = l.me.age, st = l.st;
    // santé
    const target = a < 35 ? 72 : 72 - (a - 35) * 1.05;
    let dh = (target - st.h) * 0.08;
    if (a >= 55) dh -= 0.04 * Math.pow(a - 55, 1.5) * L.rand(0.7, 1.3);
    if (a >= 12) dh += { malbouffe: -2.5, equilibre: 0, sain: 2 }[l.diet] || 0;
    if (l.add.tabac) dh -= 3.5;
    if (l.add.alcool) dh -= 4;
    if (l.job) {
      const d = D.job(l.job.id);
      let stress = (d.stress || 0) * 0.9;
      if (G.is('ambitieux')) stress *= 1.3;
      if (G.is('calme')) stress *= 0.7;
      if (l.pf.hard) stress += 1.5;
      dh -= stress;
      if ((d.stress || 0) >= 2 && l.pf.hard && st.h < 40 && L.chance(0.25) && G.sick('burnout')) G.say('Burn-out : ton corps dit stop. Arrêt maladie.', { b: -6 }, null, 'bad');
    }
    // effets annuels des objets
    l.items.forEach(function (it) {
      const d = D.item(it.id);
      if (d && d.yb) { const fx = {}; Object.keys(d.yb).forEach(function (k) { fx[k] = d.yb[k]; }); G.fx(fx); }
    });
    // les abonnements d'un an s'arrêtent
    l.items = l.items.filter(function (it) { const d = D.item(it.id); return d && !d.sub; });
    const pets = G.alive('pet').length;
    // bonheur
    let db = (50 - st.b) * 0.05;
    if (st.h > 48 && L.chance(0.55)) db += L.rand(1, 3);
    if (st.h < 25) db -= 3;
    if (st.s <= 6) db -= 4; else if (st.s < 20) db -= 1.5;
    if (l.money < 0) db -= 3;
    const part = G.partner();
    if (part && part.rq >= 70) db += 2;
    if (part && part.st === 'marie') db += 1;
    if (G.is('nonchalant')) db += 1;
    if (l.depr) db -= 2;
    if (pets) db += Math.min(3, pets);
    if (l.add.alcool) db -= 1;
    if (l.home === 'parents' && a >= 26) db -= 1;
    if (l.home !== 'parents') db += D.home(l.home).b * 0.3;
    // charisme
    let dc = (50 - st.c) * 0.03;
    if (a >= 12 && a <= 15) dc -= L.rand(0, 3);
    if (G.is('charismatique')) dc += 1.5;
    if (G.is('drole')) dc += 0.6;
    if (G.is('timide')) dc -= 0.6;
    if (st.h > 60) dc += 0.3;
    if (st.h < 20) dc -= 1;
    if (a > 70) dc -= 0.4;
    st.h = clamp(st.h + dh, 0, 100);
    st.b = clamp(st.b + db, 0, 100);
    st.c = clamp(st.c + dc, 0, 100);
    // les petits sont protégés par leurs parents
    if (a < 12) { st.b = Math.max(st.b, 14); st.h = Math.max(st.h, 10); }
  }

  // ---------- solitude, dépression ----------
  function mindYear(l) {
    const a = l.me.age;
    if (a >= 8 && l.st.s > 6 && l.st.s < 22 && !l.lonely) G.say('Tu te sens un peu [seul|seule]. Parle à tes proches, sors, appelle un ami : ta jauge Social baisse.', null, null, 'warn');
    if (a >= 10 && l.st.s <= 6) {
      l.lonely++;
      if (l.lonely === 1) G.say('Une solitude profonde s’installe. Tu n’as plus envie de voir personne, et plus personne ne vient.', { b: -4 }, null, 'warn');
      else if (l.lonely === 2) {
        if (l.job) { G.sick('burnout'); l.job.perf = clamp(l.job.perf - 25, 0, 100); G.say('Burn-out. Seul{e} face à tout, tu craques au travail.', { h: -6, b: -6 }, null, 'bad'); }
        else G.say('La solitude te ronge. Les journées se ressemblent toutes.', { b: -6 }, null, 'bad');
      } else if (l.lonely === 3 && a >= 12) {
        l.st.b = Math.min(l.st.b, 8);
        G.say('La solitude a tourné à la dépression.', null, null, 'bad');
      }
    } else if (l.lonely > 0) {
      l.lonely = 0;
      G.say('Tu sors de ta solitude. Ça fait du bien de revoir du monde.', { b: 3 }, null, 'good');
    }
    if (l.depr) {
      if (l.st.b >= 25) { l.depr = 0; G.say('La dépression s’éloigne. Tu respires à nouveau.', null, null, 'good'); }
      else l.depr++;
    }
  }

  // ---------- étapes de vie ----------
  function milestones(l) {
    const a = l.me.age;
    if (a === 1) G.ach('an1');
    if (a === 16) G.say('16 ans ! Tu peux travailler (petits boulots) et quitter l’école si tu veux.', null, null, 'school');
    if (a === 17 && l.year >= 2024) G.say('Depuis 2024, on peut passer le permis à 17 ans. Le volant t’attend.', null);
    if (a === 18) G.say('Tu es [majeur|majeure] ! Tu peux voter, signer des contrats et regretter tes choix en toute légalité.', { b: 2 }, null, 'big');
    if (a === 30 && l.home === 'parents') { G.ach('tanguy'); G.say('30 ans et toujours dans ta chambre d’ado. Tes posters ont jauni.', { b: -2 }); }
    if (a === 80) G.ach('octo');
    if (a === 100) { G.ach('centenaire'); G.say('100 ans ! Le maire t’envoie une boîte de chocolats et un certificat. Tu as déjà oublié pourquoi.', { b: 6 }, null, 'big'); }
  }

  // ---------- actions du quotidien (utilisées par l'interface) ----------
  G.mark = function (key) { S.life.done[key] = 1; };
  G.isDone = function (key) { return !!S.life.done[key]; };
  G.owns = function (id) { return S.life.items.some(function (x) { return x.id === id; }); };
  G.buy = function (id) {
    const l = S.life, d = D.item(id);
    const name = D.itemName(d, l.year);
    l.money -= d.price;
    if (!d.once) l.items.push({ id: id, y: l.year });
    const c = G.ctx(); c.v = { n: L.esc(name), p: L.money(d.price) };
    const b = d.b;
    if (id === 'mars') { G.ach('mars'); return G.say('Tu achètes {n} ({p}). Rendez-vous sur la planète rouge !', { b: d.b, c: 2 }, c, 'big'); }
    return G.say('Tu achètes : <b>{n}</b> ({p}).', { b: b }, c, 'money');
  };
  G.sell = function (idx) {
    const l = S.life, it = l.items[idx];
    if (!it) return null;
    const d = D.item(it.id);
    const age = l.year - it.y;
    const val = Math.round(d.price * (d.id === 'banane' ? L.rand(0.2, 3) : Math.max(0.15, 0.6 - age * 0.06)));
    l.items.splice(idx, 1);
    const c = G.ctx(); c.v = { n: L.esc(D.itemName(d, it.y) || d.id), p: L.money(val) };
    return G.say('Tu revends {n} pour {p}.', { m: val, b: -1 }, c, 'money');
  };
  G.move = function (id) {
    const l = S.life, h = D.home(id);
    const c = G.ctx(); c.v = { n: L.esc(h.n.toLowerCase()) };
    if (h.own) {
      const price = Math.round(h.buy * D.SIZE[D.city(l.city).size].rent);
      const down = Math.round(price * 0.1);
      if (l.money >= price) { l.money -= price; c.v.p = L.money(price); l.home = id; G.ach('proprio'); return G.say('Tu achètes : {n}, cash, pour {p}. Les clés sont à toi.', { b: h.b + 4 }, c, 'big'); }
      l.money -= down;
      l.loan = { y: 20, pay: Math.round((price - down) * 0.075) };
      l.home = id;
      G.ach('proprio');
      c.v.p = L.money(down); c.v.r = L.money(l.loan.pay);
      return G.say('Tu achètes : {n} ! Apport de {p}, puis un prêt de 20 ans ({r} par an).', { b: h.b + 2 }, c, 'big');
    }
    l.home = id;
    if (id === 'parents') return G.say('Tu retournes vivre chez tes parents. Ta chambre n’a pas bougé, ton poster non plus.', { b: -2 }, c);
    return G.say('Tu emménages : {n}.', { b: h.b + 2 }, c, 'good');
  };
  G.homeCost = function (id) {
    const l = S.life, h = D.home(id);
    if (h.own) return Math.round(h.buy * D.SIZE[D.city(l.city).size].rent);
    return Math.round(h.cost * D.SIZE[D.city(l.city).size].rent + D.LIVING);
  };
  G.moveCity = function (name) {
    const l = S.life;
    const old = l.city;
    l.city = name;
    if (D.home(l.home).own) { const h = D.home(l.home); const val = Math.round(h.buy * D.SIZE[D.city(old).size].rent * 0.95); l.money += val; l.home = 'studio'; l.loan = null; }
    const c = G.ctx(); c.v = { o: L.esc(old) };
    if (l.job && D.job(l.job.id).cat !== 'star') { G.endJob('move'); return G.say('Tu déménages de {o} à {ville}. Nouveau départ… et nouveau travail à trouver.', { b: 3, s: -6 }, c, 'good'); }
    return G.say('Tu déménages de {o} à {ville}. Nouveau départ !', { b: 3, s: -5 }, c, 'good');
  };

  // pour les tests : vivre une vie entière sans interface
  G.autoplay = function (years, pick) {
    pick = pick || function (v) { const ok = v.opts.filter(function (o) { return !o.dis; }); return (L.pick(ok) || v.opts[0]).id; };
    for (let n = 0; n < years; n++) {
      let guard = 0;
      let q;
      while ((q = G.pending()) && guard++ < 40) {
        if (q.k === 'qte') { G.qteDone(L.chance(q.t === 'hosp' ? clamp(1 - (S.life.me.age - 30) / 80, 0.05, 0.95) : clamp(0.3 + G.helpers().length * 0.09, 0.2, 0.95))); continue; }
        const v = G.view(q);
        G.answer(pick(v, q));
      }
      if (S.life.dead) return S.life;
      G.ageUp();
    }
    return S.life;
  };
})(window.LP);
