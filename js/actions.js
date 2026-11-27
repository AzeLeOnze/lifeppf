/* LifePPF — actions du joueur : proches, activités, école, études, travail, entretien d'embauche, achats. */
(function (L) {
  'use strict';
  const D = L.D, G = L.G;
  const A = L.A = { lists: { p: [], fam: [], self: [], school: [], sup: [], work: [] } };
  const clamp = L.clamp;

  function def(kind, o) { o.kind = kind; A.lists[kind].push(o); }
  function R(t, fx, extra) { return Object.assign({ t: t, fx: fx || null }, extra || {}); }
  A.get = function (kind, id) { return A.lists[kind].find(function (d) { return d.id === id; }); };
  A.label = function (d, p) { const c = G.ctx(p ? { x: p } : {}); return L.T(typeof d.n === 'function' ? d.n(p) : d.n, c); };
  A.cost = function (d, p) { return typeof d.cost === 'function' ? d.cost(p) : (d.cost || 0); };
  A.desc = function (d, p) { return d.d ? L.T(typeof d.d === 'function' ? d.d(p) : d.d, G.ctx(p ? { x: p } : {})) : ''; };

  // raison pour laquelle une action est indisponible : null = cachée, '' = disponible
  A.why = function (d, p) {
    const l = G.L(), a = l.me.age;
    if (l.dead) return 'Fin de partie';
    if (p && d.who && !d.who(p)) return null;
    if (d.show && !d.show(p)) return null;
    if (d.age != null && a < d.age) return 'Dès ' + d.age + ' ans';
    if (d.max != null && a > d.max) return null;
    if (l.prison && !d.prison) return 'En prison';
    if (l.lonely && !d.lone) return 'Solitude profonde';
    if (d.if) { const r = d.if(p); if (r === false) return null; if (typeof r === 'string' && r) return r; }
    if (p && !d.free && G.isDone('p' + p.id)) return 'Déjà fait cette année';
    if (!p && !d.free && G.isDone(d.kind + ':' + d.id)) return 'Déjà fait cette année';
    if (!d.free && G.apLeft() <= 0) return A.NOTIME;
    const cost = A.cost(d, p);
    if (cost && l.money < cost) return 'Pas assez d’argent';
    return '';
  };

  A.run = function (kind, id, pid, arg) {
    const l = G.L();
    const d = A.get(kind, id);
    if (!d) return null;
    const p = pid ? G.byId(pid) : null;
    if (A.why(d, p) !== '') return null;
    const c = G.ctx(p ? { x: p } : {});
    const res = d.run(c, p, arg);
    if (!res) return null;
    if (!d.free) { G.spend(); G.mark(p ? 'p' + p.id : d.kind + ':' + d.id); }
    const fx = Object.assign({}, typeof res.fx === 'function' ? res.fx(c) : res.fx);
    const cost = res.cost != null ? res.cost : A.cost(d, p);
    if (cost) fx.m = (fx.m || 0) - cost;
    if (res.yf) Object.assign(l.yf, res.yf);
    const out = G.say(res.t, fx, c, res.k);
    if (res.after) res.after(c);
    G.afterAction();
    out.title = res.title || A.label(d, p);
    if (res.tier) out.tier = res.tier;
    if (res.k) out.k = res.k;
    return out;
  };

  A.NOTIME = 'Plus de temps cette année';
  // ---------- qui est qui ----------
  function W(list) { return function (p) { return list.indexOf(G.cat(p)) >= 0; }; }
  const HUM = W(['fam', 'enf', 'part', 'ami', 'coll', 'boss', 'ex']);
  const isPar = function (p) { return p.rel === 'mere' || p.rel === 'pere' || p.rel === 'par'; };
  function nt(p, t) { return p.nt && p.nt.indexOf(t) === 0; }

  // ---------- interactions avec une personne (1 par personne et par an) ----------
  def('p', {
    id: 'calin', n: 'Faire un câlin', who: W(['fam', 'enf', 'part', 'pet', 'ami']), lone: 1,
    run: function (c, p) {
      if (p.rel === 'pet') return R(p.sp === 'chat' ? 'Tu fais un câlin à {x.n}. Il ronronne, puis te griffe. Classique.' : p.sp === 'poisson' ? 'Tu essaies de faire un câlin à {x.n}. C’est compliqué avec un poisson.' : 'Gros câlin avec {x.n}. Bonheur partagé.', { b: 2, rq: { x: L.ri(3, 6) } });
      return R(L.pick(['Tu fais un gros câlin à {x}. Ça réchauffe le cœur.', 'Câlin surprise pour {x}. {X.il} fait semblant d’être gêné{x.e}, mais sourit.']), { b: 2, s: 1, rq: { x: L.ri(3, 6) }, acts: 1 });
    }
  });
  def('p', {
    id: 'pleurer', n: 'Pleurer pour attirer l’attention', who: isPar, max: 4, lone: 1,
    run: function () { return R('Tu pleures très fort. {X.n} accourt, te berce et chante faux. Mission réussie.', { b: 1, rq: { x: 2 }, acts: 1 }); }
  });
  const TOPICS_K = ['les dinosaures', 'pourquoi le ciel est bleu', 'ton dessin animé préféré', 'les crottes de nez (sujet sérieux)', 'le goûter idéal'];
  const TOPICS = ['la pluie et le beau temps', 'la dernière série à la mode', 'les prix qui augmentent', 'les voisins', 'la meilleure recette de crêpes', 'le sens de la vie', 'un documentaire sur les loutres', 'les vacances', 'le dernier potin de la famille'];
  def('p', {
    id: 'talk', n: 'Discussion basique', d: '100 % de réussite, petit gain', who: function (p) { return HUM(p) && p.rel !== 'enn'; }, age: 3, lone: 1,
    run: function (c) { c.v.t = L.pick(G.L().me.age < 10 ? TOPICS_K : TOPICS); return R('Petite discussion avec {x} sur {t}.', { s: 1, rq: { x: L.ri(2, 5) }, acts: 1 }); }
  });
  def('p', {
    id: 'deep', n: 'Discussion intense', d: 'Risqué, mais gros gain', who: function (p) { return HUM(p) && p.rel !== 'enn'; }, age: 8, lone: 1,
    run: function (c, p) {
      const l = G.L();
      let ch = 0.45 + p.rq * 0.003 + l.sk.eloquence * 0.002;
      if (G.is('bienveillant')) ch += 0.08;
      if (nt(p, 'Râleur')) ch -= 0.1;
      if (nt(p, 'Gentil') || nt(p, 'Bavard')) ch += 0.08;
      if (L.chance(G.luck(ch))) return R(L.pick(['Vous parlez pendant des heures de vos peurs, de vos rêves et de la meilleure garniture de pizza. Lien renforcé avec {x}.', 'Tu ouvres ton cœur à {x}. {X.il} t’ouvre le sien. Ça compte.']), { b: 2, s: 2, rq: { x: L.ri(8, 15) }, acts: 1 }, { k: 'good' });
      return R('La conversation avec {x} dérape sur un sujet sensible. Silence gêné, puis {x.n} change de sujet.', { b: -1, rq: { x: -5 } }, { k: 'bad' });
    }
  });
  def('p', {
    id: 'blague', n: 'Faire une blague sur…', d: 'Choisis la victime', who: function (p) { return HUM(p) && p.rel !== 'enn'; }, age: 6,
    pick: function (c, p) {
      return G.alive().filter(function (q) { return q.id !== p.id && q.rel !== 'pet' && q.rel !== 'gone' && q.rel !== 'old'; }).slice(0, 40)
        .map(function (q) { return { v: q.id, l: q.first + ' ' + q.last, sub: L.relName(q) }; });
    },
    run: function (c, p, tid) {
      const t = G.byId(tid);
      if (!t) return null;
      c.r.y = t;
      let ch = 0.5;
      if (G.is('drole')) ch += 0.2;
      if (G.is('charismatique')) ch += 0.05;
      if (nt(p, 'Drôle')) ch += 0.1;
      if (nt(p, 'Sérieux')) ch -= 0.12;
      if (L.chance(G.luck(ch))) {
        const back = L.chance(0.3);
        return R('Ta blague sur {y.full} fait pleurer de rire {x}.' + (back ? ' Mais {y.n} finit par l’apprendre… Froid polaire.' : ''), { b: 2, s: 2, rq: { x: L.ri(5, 9), y: back ? -L.ri(4, 8) : 0 }, acts: 1, tr: { drole: 2 } }, { k: back ? 'bad' : 'good' });
      }
      return R('{X.n} ne rit pas du tout à ta blague sur {y.n}. Il se trouve que {x.il} adore {y.n}.', { b: -1, rq: { x: -4 } }, { k: 'bad' });
    }
  });
  def('p', {
    id: 'soi', n: 'Parler de toi', who: function (p) { return HUM(p) && p.rel !== 'enn'; }, age: 5, lone: 1,
    run: function (c, p) {
      const ch = nt(p, 'Bavard') ? 0.45 : 0.72;
      if (L.chance(G.luck(ch))) return R('{X.n} t’écoute vraiment. Ça fait du bien de se sentir [compris|comprise].', { b: 2, rq: { x: L.ri(4, 7) }, acts: 1 });
      return R('{X.n} regarde son téléphone pendant que tu parles. Tu finis ta phrase pour le mur.', { b: -1, rq: { x: 1 } });
    }
  });
  def('p', {
    id: 'dispute', n: 'Dispute incohérente', who: W(['fam', 'enf', 'part']), age: 4,
    run: function (c) {
      c.v.d = L.pick(D.DISPUTES);
      return R('Tu te disputes avec {x} sur {d}. Les noms d’oiseaux volent.', { b: G.is('colerique') ? 1 : -2, rq: { x: -L.ri(6, 12) }, tr: { colerique: 2 } }, { k: 'bad' });
    }
  });
  def('p', {
    id: 'violence', n: 'Te montrer [violent|violente]', d: 'Peut faire venir la police', who: HUM, age: 6,
    run: function (c, p) {
      const l = G.L();
      const fx = { rq: { x: -L.ri(20, 32) }, b: -2, tr: { colerique: 3, rebelle: 1 } };
      let t = 'Tu bouscules violemment {x}. Tout le monde est choqué, même toi.';
      if ((p.rel === 'coll' || p.rel === 'boss') && l.job) {
        return R(t + ' Ton entreprise te licencie sur-le-champ.', fx, { k: 'bad', after: function () { G.loseJob('fired'); } });
      }
      if (l.me.age >= 13 && L.chance(0.35)) return R(t + ' Quelqu’un appelle la police.', fx, { k: 'bad', after: function () { G.arrest(isPar(p) || p.rel === 'part' ? 2 : 1, 'violence', p); } });
      if (l.me.age < 13 && isPar(p)) t = 'Tu tapes {x} en pleine crise. Tu es [puni|punie] pour une durée indéterminée.';
      return R(t, fx, { k: 'bad' });
    }
  });
  def('p', {
    id: 'argent', n: 'Demander de l’argent', who: function (p) { return isPar(p) || p.rel === 'gp'; }, age: 5,
    run: function (c, p) {
      const l = G.L(), w = D.wealth(l.wealth);
      const wi = D.WEALTH.indexOf(w);
      let ch = 0.3 + p.rq * 0.004 + wi * 0.1;
      if (nt(p, 'Radin')) ch -= 0.25;
      if (nt(p, 'Généreux')) ch += 0.25;
      if (G.is('bienveillant')) ch -= 0.05;
      const amt = Math.max(5, Math.round(w.pocket * L.rand(0.5, 2) * (l.me.age < 14 ? 0.3 : 1) / 5) * 5);
      c.v.m = L.money(amt);
      if (L.chance(G.luck(ch))) return R('{X.n} soupire, puis te tend {m}.', { m: amt, rq: { x: -1 } }, { k: 'money' });
      return R('« Tu me prends pour une banque ? » demande {x.n}. Non, c’est non.', { b: -1, rq: { x: -2 } });
    }
  });
  const GIFTS_K = ['un dessin de toute la famille (avec un chien en plus)', 'un caillou très spécial', 'un collier de pâtes'];
  const GIFTS = ['une bougie qui sent la « brise marine »', 'un livre', 'une plante grasse', 'une boîte de chocolats', 'un abonnement à un magazine de pêche', 'des chaussettes à motifs'];
  def('p', {
    id: 'cadeau', n: 'Offrir un cadeau', who: function (p) { return HUM(p) && p.rel !== 'enn' || p.rel === 'pet'; }, age: 6,
    cost: function () { const a = G.L().me.age; return a < 12 ? 0 : clamp(a * 4, 30, 250); },
    run: function (c, p) {
      if (p.rel === 'pet') return R('Tu offres un jouet couineur à {x.n}. Il est détruit en 4 minutes.', { b: 2, rq: { x: 8 } });
      c.v.g = L.pick(G.L().me.age < 12 ? GIFTS_K : GIFTS);
      return R('Tu offres {g} à {x}. {X.il} est ravi{x.e}.', { b: 1, rq: { x: L.ri(7, 12) }, acts: 1 }, { k: 'good' });
    }
  });
  const TOGETHER = ['une balade en forêt', 'une partie de cartes interminable', 'un pique-nique attaqué par des guêpes', 'un après-midi à refaire le monde', 'une séance de cinéma', 'une partie de jeu vidéo'];
  def('p', {
    id: 'temps', n: 'Passer du temps ensemble', who: W(['fam', 'enf', 'part', 'ami']), age: 3, lone: 1,
    run: function (c) { c.v.a = L.pick(TOGETHER); return R('Tu passes du temps avec {x} : {a}.', { b: 2, s: 1, rq: { x: L.ri(4, 8) }, acts: 1 }); }
  });
  const PJ = ['« la girafe en tutu »', '« le coup du parapluie »', '« tonton Fromage »', '« le pigeon de la gare »', '« c’est pas faux »', '« la soupe qui parle »'];
  def('p', {
    id: 'privatejoke', n: 'Private joke', who: W(['ami', 'part', 'fam']), age: 8,
    run: function (c) {
      c.v.j = L.pick(PJ);
      if (L.chance(0.85)) return R('Tu glisses {j} et {x.n} explose de rire. Personne d’autre ne comprend. C’est ça, la magie.', { b: 2, s: 2, rq: { x: L.ri(5, 8) }, acts: 1, tr: { drole: 1 } });
      return R('{X.n} ne se souvient plus de {j}. Un petit drame.', { b: -1, rq: { x: -2 } });
    }
  });
  const SOUV = ['le jour où vous vous êtes [perdu|perdue] dans un champ de maïs', 'la fois où le barbecue a pris feu', 'ce karaoké mémorable', 'la tempête de confettis au mariage de tonton', 'la chute légendaire dans la piscine'];
  def('p', {
    id: 'souvenir', n: 'Se remémorer un moment drôle', who: W(['ami', 'fam', 'part', 'enf']), age: 6,
    if: function (p) { return p && (G.FAM.indexOf(p.rel) >= 0 || G.L().me.age - (p.met || 0) >= 1) ? true : 'Pas encore de souvenirs ensemble'; },
    run: function (c) { c.v.s = L.T(L.pick(SOUV), c); return R('Avec {x}, vous repensez à {s}. Vous riez jusqu’aux larmes.', { b: 3, s: 1, rq: { x: L.ri(4, 7) }, acts: 1 }); }
  });
  const LOISIRS = [
    { v: 'jv', l: 'Jeux vidéo', age: 6, sk: { info: 1 }, t: 'Tournoi de jeux vidéo avec {x}. Tu perds, mais avec panache.' },
    { v: 'foot', l: 'Foot au parc', age: 5, sk: { sport: 2 }, h: 1, t: 'Foot au parc avec {x}. Le ballon finit dans le lac.' },
    { v: 'cine', l: 'Cinéma', age: 6, cost: 12, t: 'Ciné avec {x}. Vous partagez un seau de pop-corn géant.' },
    { v: 'shopping', l: 'Shopping', age: 12, cost: 50, c: 1, t: 'Shopping avec {x}. Tu ressors avec un chapeau que tu ne porteras jamais.' },
    { v: 'karaoke', l: 'Karaoké', age: 14, cost: 20, sk: { musique: 1 }, t: 'Karaoké avec {x}. Vous massacrez trois classiques avec conviction.' },
    { v: 'peche', l: 'Pêche', age: 7, t: 'Pêche avec {x}. Vous attrapez une botte et un rhume.' },
    { v: 'escape', l: 'Escape game', age: 12, cost: 30, sk: { logique: 1 }, t: 'Escape game avec {x}. Vous sortez avec 2 secondes d’avance.' },
    { v: 'cuisine', l: 'Cuisiner ensemble', age: 8, sk: { cuisine: 2 }, t: 'Atelier cuisine avec {x}. Le gâteau est raté, la rigolade réussie.' }
  ];
  def('p', {
    id: 'loisir', n: 'Faire un loisir ensemble', d: 'Choisis l’activité', who: W(['ami', 'part', 'fam', 'enf']), age: 5,
    pick: function () { const l = G.L(); return LOISIRS.filter(function (x) { return l.me.age >= x.age; }).map(function (x) { return { v: x.v, l: x.l, sub: x.cost ? L.money(x.cost) : 'gratuit', dis: x.cost && l.money < x.cost }; }); },
    run: function (c, p, v) {
      const x = LOISIRS.find(function (y) { return y.v === v; });
      if (!x) return null;
      return R(x.t, { b: 3, s: 3, h: x.h || 0, c: x.c || 0, sk: x.sk, rq: { x: L.ri(6, 10) }, acts: 1 }, { cost: x.cost || 0 });
    }
  });
  const IRR = ['d’avoir respiré trop fort au cinéma', 'de t’avoir regardé{e} bizarrement en 2019', 'd’aimer les pizzas à l’ananas', 'd’avoir un prénom trop long', 'de marcher trop lentement'];
  def('p', {
    id: 'disputeIrr', n: 'Dispute irrationnelle', who: W(['ami', 'coll']), age: 6,
    run: function (c) { c.v.r = L.T(L.pick(IRR), c); return R('Tu reproches à {x} {r}. {X.il} ne comprend rien. Toi non plus, au fond.', { b: -1, rq: { x: -L.ri(8, 14) }, tr: { colerique: 2 } }, { k: 'bad' }); }
  });
  def('p', {
    id: 'quitter', n: 'Mettre fin à l’amitié', d: 'Risque de te faire un ennemi', who: W(['ami']), age: 6,
    run: function (c, p) {
      const enemy = L.chance(p.rq < 30 ? 0.6 : 0.35);
      return R(enemy ? 'Tu mets fin à ton amitié avec {x.n}. {X.il} le prend très mal : vous êtes désormais ennemis.' : 'Tu prends tes distances avec {x.n}. Chacun sa route.', { s: -3, b: -1 }, { k: 'bad', after: function () { if (enemy) G.keep(p, 'enn', 12); else p.rel = 'old'; } });
    }
  });
  def('p', {
    id: 'ennemi', n: 'Devenir ennemis', d: 'Seulement si la relation est très basse', who: W(['ami']), age: 6,
    if: function (p) { return p && p.rq <= 20 ? true : 'Relation encore trop bonne'; },
    run: function (c, p) { return R('{X.n} et toi, c’est officiel : c’est la guerre.', { s: -2, b: 1, tr: { colerique: 1 } }, { k: 'bad', after: function () { G.keep(p, 'enn', 8); } }); }
  });
  def('p', {
    id: 'ovni', n: 'Parler d’OVNIs', d: 'Attention à l’hôpital psychiatrique', who: function (p) { return HUM(p) && p.rel !== 'enn'; }, age: 8,
    run: function (c, p) {
      c.v.o = L.pick(D.OVNI);
      const r = nt(p, 'Complotiste') ? 0 : L.r();
      if (r < 0.5) return R('Tu racontes à {x} avoir vu {o}. {X.il} est fasciné{x.e} et veut tout savoir.', { b: 2, rq: { x: L.ri(3, 6) }, acts: 1 });
      if (r < 0.85) return R('Tu racontes à {x} avoir vu {o}. {X.il} te regarde comme si tu avais une antenne sur la tête.', { rq: { x: -5 } });
      return R('Tu racontes à {x} avoir vu {o}. Inquiet{x.e}, {x.n} appelle l’hôpital psychiatrique. Trois jours en observation. La purée était correcte.', { b: -4, s: -3, flag: 'hp', ach: 'hp' }, { k: 'bad' });
    }
  });
  def('p', {
    id: 'emprunter', n: 'Emprunter de l’argent', who: function (p) { return (p.rel === 'ami' || p.rel === 'sib' || p.rel === 'part') && p.age >= 18; }, age: 14,
    run: function (c, p) {
      const l = G.L();
      const amt = Math.round(L.ri(50, 400) * (l.me.age > 25 ? 4 : 1) / 10) * 10;
      c.v.m = L.money(amt);
      if (L.chance(G.luck(0.45 + p.rq * 0.003 - (nt(p, 'Radin') ? 0.25 : 0)))) return R('{X.n} te prête {m}. « Tu me rends ça quand tu peux. »', { m: amt, rq: { x: -3 } }, { k: 'money' });
      return R('{X.n} refuse de te prêter {m}. L’ambiance se refroidit.', { rq: { x: -4 } });
    }
  });
  // couple
  const DATES = ['Dîner aux chandelles. Tu renverses la bougie, la nappe prend feu, vous riez aux éclats.', 'Balade au coucher du soleil avec {x.n}. Un goéland gâche un peu le moment, mais pas trop.', 'Soirée cinéma avec {x.n}. Vous ne regardez pas vraiment le film.', 'Pique-nique en amoureux. Les fourmis aussi étaient invitées.'];
  def('p', {
    id: 'date', n: 'Rendez-vous romantique', who: W(['part']), age: 12, cost: function () { return G.L().me.age < 16 ? 10 : 40; },
    run: function () { return R(L.pick(DATES), { b: 3, s: 1, rq: { x: L.ri(6, 12) }, acts: 1 }, { k: 'love' }); }
  });
  def('p', {
    id: 'demande', n: 'Demander en mariage', d: 'Bague : 1 200 €', who: W(['part']), age: 18, cost: 1200,
    if: function (p) { return p && p.st === 'date' ? true : false; },
    run: function (c, p) {
      const l = G.L();
      const ch = 0.15 + p.rq * 0.008 + l.st.c * 0.002;
      if (L.chance(G.luck(ch))) return R('Genou à terre, bague tendue… {x.n} dit OUI ! Les gens applaudissent dans le restaurant.', { b: 10, rq0: { x: 15 } }, { k: 'love', after: function () { p.st = 'fiance'; } });
      return R('Genou à terre, bague tendue… {x.n} dit non. Gênant. Très gênant. Tu gardes la bague.', { b: -8, rq: { x: -10 } }, { k: 'bad', cost: 0 });
    }
  });
  const WEDS = [{ v: 'mairie', l: 'Mariage simple à la mairie', cost: 600, b: 10 }, { v: 'grand', l: 'Grand mariage, 150 invités', cost: 18000, b: 16, s: 5 }, { v: 'chapelle', l: 'Mariage express dans une chapelle bizarre', cost: 2500, b: 12 }];
  def('p', {
    id: 'mariage', n: 'Organiser le mariage', d: 'Choisis la formule', who: W(['part']), age: 18,
    if: function (p) { return p && p.st === 'fiance' ? true : false; },
    pick: function () { const l = G.L(); return WEDS.map(function (w) { return { v: w.v, l: w.l, sub: L.money(w.cost), dis: l.money < w.cost }; }); },
    run: function (c, p, v) {
      const w = WEDS.find(function (x) { return x.v === v; });
      if (!w || G.L().money < w.cost) return null;
      const t = { mairie: 'Mariage à la mairie avec {x.n}. Court, simple, parfait.', grand: 'Grand mariage avec {x.n} ! Tonton Gérard danse sur les tables à 3 h du matin.', chapelle: 'Mariage express avec {x.n}, célébré par un sosie de chanteur à paillettes.' }[v];
      return R(t, { b: w.b, s: w.s || 2, rq: { x: 10 } }, { k: 'love', cost: w.cost, after: function () { const l = G.L(); p.st = 'marie'; p.cohab = 1; l.stats.mar++; G.ach('marie'); if (l.stats.mar >= 3) G.ach('mariages3'); G.gainXP(30); if (l.home === 'parents') l.home = 't3'; } });
    }
  });
  // un enfant se décide à deux : si l'autre accepte, le bébé naît l'année suivante (prénom et éducation au choix)
  function fertileAge(p) { const l = G.L(); const fem = l.me.sex === 'F' ? l.me : p.sex === 'F' ? p : null; return fem ? fem.age : 30; }
  def('p', {
    id: 'bebe', n: 'Proposer d’avoir un enfant', d: 'Si {x.il} accepte, bébé l’an prochain', who: W(['part']), age: 16,
    if: function (p) {
      const l = G.L();
      if (!p) return true;
      if (l.preg) return 'Un bébé est déjà en route';
      if (p.sex === l.me.sex && p.sex !== 'X') return 'Pensez à l’adoption (Biens)';
      if (fertileAge(p) >= 47) return 'Trop tard, biologiquement';
      return true;
    },
    run: function (c, p) {
      const l = G.L();
      let ch = 0.2 + p.rq * 0.008 + (p.st === 'marie' ? 0.1 : 0) - (p.age < 20 || l.me.age < 20 ? 0.2 : 0);
      if (!L.chance(clamp(ch, 0.05, 0.95))) return R('{X.n} n’est pas prêt{x.e} : « Pas maintenant… on en reparle l’an prochain ? »', { b: -2, rq: { x: -2 } }, { k: 'bad' });
      const fa = fertileAge(p);
      if (!L.chance(fa < 35 ? 0.85 : fa < 40 ? 0.6 : fa < 44 ? 0.3 : 0.08)) return R('{X.n} est d’accord ! Vous essayez toute l’année… mais pas de bébé pour l’instant. Vous réessaierez.', { b: -1, rq: { x: 3 } }, { k: 'love' });
      return R('{X.n} dit oui, les yeux brillants. Quelques semaines plus tard : test positif ! Bébé prévu l’an prochain.', { b: 8, rq: { x: 6 } }, { k: 'love', after: function () { l.preg = { pid: p.id, y: l.year }; } });
    }
  });
  def('p', {
    id: 'emmenager', n: 'Emménager ensemble', who: W(['part']), age: 18,
    if: function (p) { return p && !p.cohab ? true : false; },
    run: function (c, p) { return R('{X.n} et toi emménagez ensemble. Premier débat : le côté du lit.', { b: 4, rq: { x: 6 } }, { k: 'love', after: function () { const l = G.L(); p.cohab = 1; if (l.home === 'parents') l.home = 't3'; } }); }
  });
  def('p', {
    id: 'rompre', n: function (p) { return p && p.st === 'marie' ? 'Divorcer' : 'Rompre'; }, d: function (p) { return p && p.st === 'marie' ? 'Avocat 3 000 € + partage des biens' : ''; }, who: W(['part']), age: 10,
    run: function (c, p) {
      if (p.st === 'marie') return R('Divorce prononcé. L’avocat prend 3 000 €, {x.n} prend la moitié du reste.', { b: -8 }, { k: 'bad', cost: 3000, after: function () { G.breakup(p); } });
      return R('Tu romps avec {x.n}. Il y a des larmes, et un pull qu’on ne te rendra jamais.', { b: -5 }, { k: 'bad', after: function () { G.breakup(p); } });
    }
  });
  def('p', {
    id: 'tromper', n: 'Aller voir ailleurs', d: 'Si tu te fais prendre…', who: W(['part']), age: 16,
    run: function (c, p) {
      const caught = L.chance(G.is('menteur') ? 0.25 : 0.45);
      if (!caught) return R('Une aventure en cachette. Personne n’en saura rien. Pour l’instant.', { b: 2, tr: { menteur: 2 } });
      const leave = L.chance(0.6);
      return R('{X.n} découvre tout.' + (leave ? ' {X.il} fait ses valises dans la nuit.' : ' {X.il} reste, mais rien ne sera plus comme avant.'), { b: -8, rq: { x: -40 } }, { k: 'bad', after: function () { if (leave) G.breakup(p); } });
    }
  });
  def('p', {
    id: 'reprendre', n: 'Se remettre ensemble', who: W(['ex']), age: 14,
    if: function () { return G.partner() ? 'Tu es déjà en couple' : true; },
    run: function (c, p) {
      if (L.chance(G.luck(0.2 + p.rq * 0.005))) return R('{X.n} accepte de te redonner une chance. Deuxième saison !', { b: 6 }, { k: 'love', after: function () { G.date(p); } });
      return R('{X.n} te répond par un vocal de 4 minutes qui se résume à « non ».', { b: -3, rq: { x: -3 } });
    }
  });
  // enfants : éducation
  const MATS = ['maths', 'français', 'sciences', 'anglais', 'histoire-géo'];
  const isKid = function (lo, hi) { return function (p) { return p.rel === 'enf' && p.age >= lo && p.age <= hi; }; };
  def('p', {
    id: 'devoirs', n: 'Aider aux devoirs', d: 'Ses notes et ses compétences ↑', who: isKid(6, 17), lone: 1,
    run: function (c, p) {
      c.v.m = L.pick(MATS);
      const k = { maths: 'logique', français: 'langues', sciences: 'sciences', anglais: 'langues', 'histoire-géo': 'langues' }[c.v.m];
      return R('Tu aides {x.n} pour ses devoirs de {m}. Vous finissez par comprendre ensemble (surtout {x.n}).', { b: 1, rq: { x: L.ri(3, 6) }, acts: 1 }, { after: function () { if (p.kx) p.kx.sk[k] = (p.kx.sk[k] || 0) + 2.5; p.kg = clamp((p.kg != null ? p.kg : 11) + G.soften(L.rand(0.3, 0.9)), 0, 19.5); } });
    }
  });
  def('p', {
    id: 'activite', n: function (p) { return p && p.club ? 'Changer d’activité' : 'Inscrire à une activité'; }, d: function (p) { const cl = p && p.club && D.CLUBS.find(function (x) { return x.id === p.club; }); return cl ? 'Actuellement : ' + cl.n.toLowerCase() : 'Payée chaque année'; },
    who: isKid(4, 17), free: 1,
    pick: function (c, p) { const l = G.L(); const o = D.CLUBS.map(function (cl) { return { v: cl.id, l: cl.n, sub: L.money(cl.cost) + ' par an · ' + Object.keys(cl.sk).map(D.skillName).join(', '), dis: p.club === cl.id }; }); if (p.club) o.push({ v: 'none', l: 'Aucune activité', sub: 'Plus de temps libre' }); return o; },
    run: function (c, p, v) {
      if (v === 'none') return R('{X.n} arrête son activité. {X.il} a enfin le temps de regarder le plafond.', null, { after: function () { p.club = null; } });
      const cl = D.CLUBS.find(function (x) { return x.id === v; });
      if (!cl) return null;
      c.v.n = cl.n.toLowerCase();
      return R('Tu inscris {x.n} : {n}. {X.il} revient du premier cours ravi{x.e}.', { rq: { x: 3 } }, { k: 'good', after: function () { p.club = v; } });
    }
  });
  def('p', {
    id: 'eduStyle', n: 'Changer d’éducation', d: function (p) { return p ? 'Actuellement : ' + D.eduStyle(p.ed).n.toLowerCase() : ''; }, who: isKid(0, 17), free: 1,
    pick: function (c, p) { return D.EDU_STYLES.map(function (s) { return { v: s.id, l: s.n, sub: s.d, dis: p.ed === s.id }; }); },
    run: function (c, p, v) {
      const s = D.EDU_STYLES.find(function (x) { return x.id === v; });
      if (!s) return null;
      c.v.n = s.n.toLowerCase();
      return R('Nouvelle méthode pour {x.n} : une éducation {n}.', null, { after: function () { p.ed = v; } });
    }
  });
  def('p', {
    id: 'feliciter', n: function (p) { return p && p.sex === 'F' ? 'La féliciter' : 'Le féliciter'; }, who: isKid(3, 17), lone: 1,
    run: function (c, p) { return R(L.pick(['Tu félicites {x.n} pour ses efforts. {X.il} rougit et file le raconter à tout le monde.', 'Tu dis à {x.n} que tu es fier{e} de {x:lui|elle}. {X.il} fait semblant de s’en ficher. {X.il} ne s’en fiche pas du tout.']), { b: 2, rq: { x: L.ri(5, 8) }, acts: 1 }, { after: function () { if (p.kx) p.kx.tr.ambitieux = (p.kx.tr.ambitieux || 0) + 1; } }); }
  });
  def('p', {
    id: 'punir', n: function (p) { return p && p.sex === 'F' ? 'La punir' : 'Le punir'; }, d: 'Plus de discipline, moins d’amour', who: isKid(3, 17),
    run: function (c, p) { return R(L.pick(['Tu punis {x.n} : privé{x.e} d’écran pendant une semaine. Les portes claquent.', 'Punition pour {x.n} : vaisselle pendant un mois. {X.il} te traite de « dictateur du lave-vaisselle ».']), { rq: { x: -L.ri(4, 7) } }, { after: function () { if (p.kx) { p.kx.tr.discipline = (p.kx.tr.discipline || 0) + 1.5; p.kx.tr.rebelle = (p.kx.tr.rebelle || 0) + 0.5; } } }); }
  });
  def('p', { id: 'histoire', n: 'Lire une histoire', who: function (p) { return p.rel === 'enf' && p.age < 11; }, lone: 1, run: function () { return R('Tu lis une histoire à {x.n}. {X.il} s’endort avant la fin. Toi aussi.', { b: 3, rq: { x: L.ri(5, 8) }, acts: 1, sk: { eloquence: 0.5 } }); } });
  def('p', { id: 'jouer', n: 'Jouer ensemble', who: function (p) { return (p.rel === 'enf' || p.rel === 'sib') && p.age < 14; }, lone: 1, run: function () { return R('Partie de cache-cache avec {x.n}. {X.il} se cache toujours derrière le même rideau.', { b: 3, rq: { x: L.ri(5, 9) }, acts: 1 }); } });
  def('p', {
    id: 'conseil', n: 'Donner un conseil', who: function (p) { return (p.rel === 'enf' || p.rel === 'sib') && p.age >= 10 && p.age < G.L().me.age; }, age: 12,
    run: function () { if (L.chance(0.6)) return R('{X.n} écoute ton conseil. Vraiment. Tu en restes sans voix.', { b: 2, rq: { x: 6 }, acts: 1 }); return R('{X.n} lève les yeux au ciel si fort qu’on entend presque le bruit.', { rq: { x: -2 } }); }
  });
  // animaux
  def('p', { id: 'caresser', n: 'Caresser', who: W(['pet']), lone: 1, run: function (c, p) { return R(p.sp === 'poisson' ? 'Tu tapotes la vitre de l’aquarium. {X.n} fait des bulles. C’est un oui.' : 'Tu caresses {x.n}. Le monde va un peu mieux.', { b: 2, rq: { x: 5 } }); } });
  def('p', { id: 'promener', n: 'Promener', who: function (p) { return p.rel === 'pet' && (p.sp === 'chien' || p.sp === 'robochien'); }, age: 5, lone: 1, run: function () { return R('Balade avec {x.n}. Il renifle chaque poteau comme si c’était un roman.', { b: 2, h: 2, rq: { x: 6 } }); } });
  // ennemis
  def('p', { id: 'insulter', n: 'Insulter', who: W(['enn']), age: 6, run: function () { return R('Tu traites {x.n} de « moule à gaufres ». Coup critique.', { b: 1, rq: { x: -5 }, tr: { colerique: 1 } }); } });
  def('p', {
    id: 'farce', n: 'Faire une farce', who: W(['enn']), age: 6,
    run: function () { if (L.chance(0.6)) return R('Tu remplis la boîte aux lettres de {x.n} de confettis. Il y en aura jusqu’à Noël.', { b: 3, tr: { rebelle: 1 } }, { k: 'good' }); return R('Ta farce contre {x.n} se retourne contre toi. Tu as de la colle dans les cheveux.', { b: -3 }, { k: 'bad' }); }
  });
  def('p', {
    id: 'reconcilier', n: 'Se réconcilier', who: W(['enn']), age: 6,
    run: function (c, p) {
      const ch = 0.3 + (G.is('bienveillant') ? 0.2 : 0) + p.rq * 0.004;
      if (L.chance(G.luck(ch))) return R('Tu tends la main à {x.n}. {X.il} la serre. Fin de la guerre.', { b: 3, s: 2 }, { k: 'good', after: function () { G.keep(p, 'ami', 35); } });
      return R('{X.n} ignore ta main tendue. La guerre continue.', { b: -2, rq: { x: -3 } });
    }
  });
  def('p', {
    id: 'bagarre', n: 'Se battre', d: 'Santé en jeu, police possible', who: W(['enn']), age: 6,
    run: function (c, p) {
      const l = G.L();
      const win = L.chance(G.luck(0.45 + l.sk.sport / 200));
      const cops = l.me.age >= 13 && L.chance(0.25);
      const fx = win ? { h: -3, b: 3, c: 1, rq: { x: -8 } } : { h: -8, b: -4, rq: { x: -5 } };
      fx.tr = { colerique: 2, rebelle: 1 };
      return R((win ? 'Bagarre avec {x.n}. Tu gagnes, mais tu as mal partout.' : 'Bagarre avec {x.n}. Tu perds, et ton nez n’est pas content.') + (cops ? ' La police arrive.' : ''), fx, { k: 'bad', after: function () { if (cops) G.arrest(l.me.age >= 18 ? 2 : 1, 'bagarre', p); } });
    }
  });
  // travail
  def('p', { id: 'cafe', n: 'Boire un café', who: W(['coll', 'boss']), lone: 1, run: function () { return R('Pause café avec {x}. Vous critiquez la machine à café, qui le mérite.', { s: 2, rq: { x: L.ri(4, 7) }, acts: 1 }); } });
  def('p', {
    id: 'lecher', n: 'Lécher les bottes', who: W(['boss']), age: 14,
    run: function () { if (L.chance(0.55)) return R('Tu complimentes {x} sur sa cravate. {X.il} n’en porte pas, mais apprécie l’effort.', { rq: { x: 8 }, perf: 4 }); return R('{X.n} voit clair dans ton jeu. Regard glacial.', { rq: { x: -4 }, perf: -2 }); }
  });
  def('p', { id: 'afterwork', n: 'Afterwork', who: W(['coll']), age: 18, cost: 25, run: function () { return R('Afterwork avec {x}. Vous refaites l’organigramme de l’entreprise sur une serviette en papier.', { s: 3, b: 2, h: -1, rq: { x: L.ri(6, 10) }, acts: 1 }); } });

  // ---------- cadeau coûteux : 100 % de réussite ----------
  function luxPrice(p) { const l = G.L(); return 1500 + (((p.id * 2654435761) + l.year * 40503) >>> 0) % 271 * 50; }
  function luxGift(v) {
    if (v < 3000) return L.pick(['un week-end au spa', 'un sac de créateur', 'une trottinette électrique haut de gamme', 'un dîner dans un restaurant étoilé']);
    if (v < 7000) return L.pick(['un séjour à Rome', 'une montre suisse', 'un ordinateur dernier cri', 'un vélo de course en carbone']);
    if (v < 11000) return L.pick(['un voyage au Japon', 'un scooter neuf', 'un piano droit', 'une croisière en Méditerranée']);
    return L.pick(['une petite voiture d’occasion', 'un voyage autour du monde', 'une moto neuve', 'un cheval (avec sa pension)']);
  }
  def('p', {
    id: 'cadeauLuxe', n: 'Offrir un cadeau coûteux', d: '100 % de réussite, lien ↑↑', who: function (p) { return ['fam', 'enf', 'part', 'ami'].indexOf(G.cat(p)) >= 0 && p.age >= 3; }, age: 16,
    cost: function (p) { return p ? luxPrice(p) : 1500; },
    run: function (c, p) {
      const v = luxPrice(p);
      c.v.g = luxGift(v);
      return R('Tu offres {g} à {x}. {X.il} n’en revient pas : « Il ne fallait pas… » (Il fallait.)', { b: 3, s: 1, rq0: { x: Math.round(18 + v / 1000) }, acts: 1 }, { k: 'good' });
    }
  });

  // ---------- amis → amour ----------
  def('p', {
    id: 'declarer', n: 'Proposer de sortir ensemble', d: function (p) { return p ? 'Chance : ' + Math.round(p.rq) + ' % (votre lien)' : ''; }, who: W(['ami']), age: 12,
    if: function (p) {
      const l = G.L();
      if (!p) return true;
      if ((l.me.age < 18) !== (p.age < 18)) return false;
      if (G.partner()) return 'Tu es déjà en couple';
      return true;
    },
    run: function (c, p) {
      if (L.chance(p.rq / 100)) return R('Tu avoues tes sentiments à {x.n}. Silence… puis un grand sourire : {x.il} ressent la même chose ! Votre amitié devient une histoire d’amour.', { b: 8, s: 1 }, { k: 'love', after: function () { G.date(p); } });
      return R('Tu avoues tes sentiments à {x.n}. {X.il} te prend la main : « Je tiens trop à notre amitié. » Malaise poli.', { b: -4, rq: { x: -8 } }, { k: 'bad' });
    }
  });

  // ---------- objets : une interaction par objet possédé ----------
  Object.keys(D.ITEM_FX || {}).forEach(function (id) {
    const ia = D.ITEM_FX[id].ia;
    if (!ia) return;
    def('p', {
      id: 'it-' + id, item: id,
      n: function () { return typeof ia.n === 'function' ? ia.n(G.L().year) : ia.n; },
      who: function (p) { return (p.rel === 'ami' || p.rel === 'part' || p.rel === 'sib') && p.age >= 6; },
      show: function () { return G.owns(id); }, age: 6, lone: 1,
      run: function () {
        if (ia.ko && L.chance(ia.ko)) return R(ia.kot, { rq: { x: -3 } }, { k: 'bad' });
        const txt = ia.t0 && G.L().year <= 2006 ? ia.t0 : ia.t;
        const rq = ia.rq || [5, 9];
        return R(L.pick(txt), Object.assign({ b: 2, s: 2, rq: { x: L.ri(rq[0], rq[1]) }, acts: 1 }, ia.fx || {}), { k: 'good' });
      }
    });
  });

  // ---------- centres d'intérêt : en parler à ses proches ----------
  function aboutLabel(sub) {
    if (/^les /.test(sub)) return 'Parler des ' + sub.slice(4);
    if (/^le /.test(sub)) return 'Parler du ' + sub.slice(3);
    if (/^[aeiouyhéèêàâîôœ]/i.test(sub)) return 'Parler d’' + sub;
    return 'Parler de ' + sub;
  }
  D.INTERESTS.forEach(function (it) {
    def('p', {
      id: 'int-' + it.id, n: aboutLabel(it.sub), d: 'Centre d’intérêt : ' + it.n,
      who: function (p) { return ['fam', 'enf', 'part', 'ami'].indexOf(G.cat(p)) >= 0 && p.age >= 6; },
      show: function () { return G.L().ints.indexOf(it.id) >= 0; }, age: 6, lone: 1,
      run: function (c, p) {
        if (p.int === undefined) p.int = L.chance(it.ag && it.ag.some(function (t) { return nt(p, t); }) ? 0.3 : 0.08) ? it.id : null;
        if (p.int === it.id) return R('Incroyable : {x.n} est fan aussi ! Vous parlez ' + aboutLabel(it.sub).slice(7) + ' pendant des heures.', { b: 4, s: 3, rq: { x: L.ri(10, 14) }, acts: 1 }, { k: 'good' });
        let ch = 0.5 + (p.rq - 50) / 250;
        if (it.ag && it.ag.some(function (t) { return nt(p, t); })) ch += 0.25;
        if (it.young && p.age > 60) ch -= 0.25;
        if (G.is('drole') || G.is('charismatique')) ch += 0.05;
        if (L.chance(clamp(ch, 0.1, 0.9))) return R(it.ok, { b: 2, s: 2, rq: { x: L.ri(6, 10) }, acts: 1 }, { k: 'good' });
        return R(it.ko, { rq: { x: -2 } });
      }
    });
  });
  // ajouter dans une place libre : toujours possible ; enlever ou remplacer : une fois par an, effet immédiat
  A.intsWhy = function (id) {
    const l = G.L();
    if (l.me.age < 6) return 'Dès 6 ans';
    if (id && l.ints.indexOf(id) < 0 && l.ints.length < 2) return '';
    if (G.isDone('ints')) return 'Déjà changé cette année';
    return '';
  };
  A.toggleInterest = function (id, rep) {
    const l = G.L(), it = D.interest(id);
    if (!it || A.intsWhy(id)) return null;
    const on = l.ints.indexOf(id) >= 0;
    let t;
    if (on) { G.mark('ints'); l.ints = l.ints.filter(function (x) { return x !== id; }); t = 'Tu passes à autre chose : ' + it.n + ', c’est fini.'; }
    else if (l.ints.length < 2) { l.ints.push(id); t = 'Nouveau centre d’intérêt : <b>' + it.n + '</b>. Tu en parles déjà à tout le monde.'; }
    else {
      if (l.ints.indexOf(rep) < 0) return null;
      G.mark('ints');
      l.ints = l.ints.filter(function (x) { return x !== rep; }).concat([id]);
      t = 'Tu laisses tomber ' + D.interest(rep).n + ' pour une nouvelle passion : <b>' + it.n + '</b> !';
    }
    const o = G.say(t, on ? null : { b: 2 }, null, on ? '' : 'good');
    o.title = 'Centres d’intérêt';
    return o;
  };

  def('p', {
    id: 'lettre', n: 'Écrire une lettre', d: 'Depuis ta cellule', who: W(['fam', 'enf', 'part', 'ami']), prison: 1, lone: 1,
    show: function () { return G.L().prison > 0; },
    run: function () { return R(L.pick(['Tu écris une longue lettre à {x}. {X.il} te répond, et glisse un dessin dans l’enveloppe.', 'Lettre à {x} : tu racontes la cantine, les codétenus, tes regrets. {X.il} la relit trois fois.']), { b: 3, rq: { x: L.ri(5, 9) } }, { k: 'good' }); }
  });

  // ---------- actions de famille / sociales (globales) ----------
  const REUNION = ['Tonton Gérard refait sa blague sur les impôts. Tout le monde rit par politesse.', 'Mamie ressort l’album photo de ta naissance. Tout le monde te voit [tout nu|toute nue] sur une peau de mouton.', 'Le chien de la famille vole le rôti. Ovation générale.', 'Partie de Trivial Pursuit : ton cousin triche, tout le monde le sait.', 'Quelqu’un a ramené un gâteau « sans sucre ». Personne n’y touche.'];
  def('fam', {
    id: 'reunion', n: 'Réunion de famille', d: 'Toute la famille, une fois par an', age: 3, lone: 1,
    if: function () { return G.alive(['mere', 'pere', 'par', 'sib', 'gp', 'enf', 'part']).length >= 2 ? true : 'Pas assez de famille'; },
    run: function (c) {
      const fam = G.alive(['mere', 'pere', 'par', 'sib', 'gp', 'enf', 'part']);
      const fight = L.chance(0.15);
      fam.forEach(function (p) { G.rel(p, L.ri(2, 6)); });
      if (fight) { const p = L.pick(fam); c.r.y = p; G.rel(p, -6); }
      return R(L.pick(REUNION) + (fight ? ' Puis {y.n} et toi vous accrochez sur la politique. Ambiance.' : ''), { b: fight ? 0 : 3, s: 3, acts: 2 }, { k: 'fam' });
    }
  });
  def('fam', {
    id: 'amis', n: 'Se faire des amis', d: function () { const l = G.L(); return l.job ? 'Au travail' : G.isStudent() ? 'À l’école' : 'Dans le quartier'; }, age: 3, lone: 1,
    run: function (c) {
      const l = G.L();
      let ch = 0.5 + l.st.c / 250 + l.st.s / 300;
      if (G.is('charismatique')) ch += 0.1;
      if (G.is('drole')) ch += 0.05;
      if (G.is('timide')) ch -= 0.15;
      if (!L.chance(G.luck(ch))) return R('Tu tentes une approche. Ça finit en silence gêné et en hochements de tête.', { b: -1 });
      const p = G.tmp(l.me.age < 18 ? 'peer' : 'adult');
      if (l.me.age >= 18 && L.chance(0.5)) p.age = clamp(l.me.age + L.ri(-6, 6), 18, 110);
      c.r.x = p;
      const where = l.job ? 'à la machine à café' : G.isStudent() ? 'à la récré' : 'à la boulangerie';
      c.v.w = where;
      return R('Tu rencontres {x.n} ' + where + '. Le courant passe : nouvel{x.e} ami{x.e} !', { s: 3, b: 2, acts: 1 }, { k: 'good', after: function () { G.keep(p, 'ami', L.ri(40, 58)); } });
    }
  });

  // ---------- activités ----------
  const SPORT = ['Tu cours 5 km. Enfin, 3. Bon, tu as marché vite.', 'Séance de sport intense. Tu transpires des choses que tu ne soupçonnais pas.', 'Tu fais du vélo jusqu’au lac et retour. Tes mollets te détestent.', 'Cours de natation. Tu nages le crawl comme un moulin à vent, mais tu nages.'];
  def('self', {
    id: 'sport', cat: 'sante', n: 'Faire du sport', d: 'Santé ↑, compétence Sport ↑', age: 4, lone: 1,
    run: function () {
      const a = G.L().me.age;
      if (L.chance(0.05)) return R('Claquage en plein effort. Tu boites pendant un mois.', { h: -3, b: -1 }, { k: 'bad' });
      return R(L.pick(SPORT), { h: a > 70 ? L.ri(1, 3) : L.ri(3, 5), b: 1, sk: { sport: L.ri(2, 4) } }, { k: 'good' });
    }
  });
  def('self', {
    id: 'mediter', cat: 'sante', n: 'Méditer', d: 'Bonheur ↑, un peu de santé', age: 8, lone: 1,
    run: function () { return R(L.pick(['Tu médites 20 minutes. Tu penses à des pizzas pendant 19 minutes.', 'Méditation au calme. Ton esprit devient un lac tranquille, avec quelques canards.', 'Tu respires profondément. Le monde ralentit un peu.']), { b: L.ri(2, 4), h: 1, tr: { calme: 2 } }); }
  });
  def('self', {
    id: 'medecin', cat: 'sante', n: 'Aller chez le médecin', d: 'Consultation remboursée par la Sécu', age: 0, lone: 1,
    run: function () {
      const l = G.L();
      if (!l.ill.length && !l.depr) return R('Le médecin ne trouve rien. Il te conseille de boire de l’eau et de « lever le pied ».', { h: 1 });
      const healed = [], kept = [];
      l.ill.forEach(function (i) { const d = D.ILLS[i.id]; if (L.chance(d.cure)) healed.push(d); else kept.push(i); });
      l.ill = kept;
      let t = healed.length ? 'Le médecin te soigne : ' + healed.map(function (d) { return d.n.toLowerCase() + (d.hosp ? ' (opération à l’hôpital)' : ''); }).join(', ') + '.' : 'Le traitement ne fait pas encore effet.';
      let b = healed.length ? 3 : -1;
      if (l.depr) { t += ' Il te prescrit un traitement et t’oriente vers un psy.'; b += 4; }
      return R(t, { h: healed.reduce(function (s, d) { return s + Math.min(6, d.sev); }, 0), b: b }, { k: healed.length ? 'good' : '' });
    }
  });
  def('self', {
    id: 'psy', cat: 'sante', n: 'Voir un·e psy', d: function () { return G.L().year >= 2022 ? 'Séances remboursées' : '300 € les séances'; }, age: 10, lone: 1,
    cost: function () { return G.L().year >= 2022 ? 0 : 300; },
    run: function () {
      const l = G.L();
      let t = 'Séances chez le psy. Tu parles de ton enfance, de ta mère et d’un rêve étrange avec un hérisson.';
      let fx = { b: L.ri(4, 7) };
      if (l.depr && L.chance(0.45)) { t += ' Petit à petit, la dépression desserre son étau.'; fx.b += 8; }
      if (l.lonely) { fx.s = 5; t += ' Ton psy t’encourage à reprendre contact avec tes proches.'; }
      return R(t, fx, { k: 'good' });
    }
  });
  def('self', {
    id: 'desintox', cat: 'sante', n: 'Cure de désintoxication', d: function () { return 'Addictions : ' + Object.keys(G.L().add).map(function (k) { return G.ADD[k]; }).join(', '); }, age: 12, lone: 1,
    show: function () { return Object.keys(G.L().add).length > 0; },
    run: function () {
      const l = G.L();
      const k = L.pick(Object.keys(l.add));
      const ch = 0.5 + (G.is('calme') ? 0.15 : 0) + (G.is('discipline') ? 0.1 : 0);
      if (L.chance(G.luck(ch))) return R('Cure réussie : tu arrêtes ' + { tabac: 'le tabac', alcool: 'l’alcool', jeu: 'les jeux d’argent' }[k] + '. Fierté.', { b: 5, h: 3 }, { k: 'good', after: function () { delete l.add[k]; } });
      return R('Tu craques au bout de trois semaines. Tu réessaieras.', { b: -2 }, { k: 'bad' });
    }
  });
  def('self', {
    id: 'look', cat: 'sante', n: 'Changer de look', d: 'Charisme ↑ (si tout va bien)', age: 11, cost: 60,
    run: function () { if (L.chance(G.luck(0.72))) return R(L.pick(['Nouvelle coupe, nouveaux vêtements. Tu te trouves [canon|canon] dans les vitrines.', 'Relooking réussi. Ta boulangère ne te reconnaît pas.']), { c: L.ri(2, 4), b: 2 }, { k: 'good' }); return R('Ton coiffeur a eu une « vision artistique ». Toi, tu as eu une frange.', { c: -2, b: -2 }, { k: 'bad' }); }
  });
  def('self', {
    id: 'chirurgie', cat: 'sante', n: 'Chirurgie esthétique', d: 'Gros gain de Charisme… ou catastrophe', age: 18, cost: 4500,
    run: function () { if (L.chance(G.luck(0.75))) return R('Opération réussie. Ton reflet te fait un clin d’œil.', { c: L.ri(6, 10), b: 3, h: -2 }, { k: 'good' }); return R('Opération ratée. Ton nez ressemble à une prise électrique.', { c: -L.ri(6, 10), b: -6, h: -3 }, { k: 'bad' }); }
  });
  // sorties
  def('self', {
    id: 'parc', cat: 'sortie', n: 'Aller au parc', age: 2,
    run: function (c) {
      const l = G.L();
      const r = L.r();
      if (r < 0.15 && l.me.age >= 4) { const p = G.tmp(l.me.age < 18 ? 'peer' : 'adult'); c.r.x = p; return R('Au parc, tu rencontres {x.n}. Vous parlez de la forme des nuages pendant une heure.', { b: 2, s: 3, acts: 1 }, { after: function () { G.keep(p, 'ami', 42); } }); }
      if (r < 0.25) return R('Un pigeon te vole ton goûter au parc. Il ne s’excuse même pas.', { b: -1, flag: 'pigeon' }, { after: function () { if (l.flags.pigeon >= 3) G.ach('pigeon'); } });
      return R(L.pick(['Balade au parc. L’herbe est verte, les canards sont bruyants.', 'Tu nourris les canards au parc. Un cygne te fixe, menaçant.', 'Tu t’allonges dans l’herbe et tu regardes passer les nuages.']), { b: 2, s: 1, h: 1 });
    }
  });
  // cinéma : trois films à l'affiche, le genre choisi forge le caractère, et on adore… ou pas
  A.cine = [];
  // une de tes créations a des chances de se retrouver à l'affiche
  function withMine(pool, slot, genres) {
    const own = L.M ? L.M.mine(slot).filter(function (f) { return !genres || genres[f.g]; }) : [];
    return own.length && L.chance(0.3) ? [L.pick(own)].concat(pool) : pool;
  }
  A.cineOffers = function () {
    const pool = withMine(L.shuffle(D.FILMS.slice()), 'film', D.GENRES), out = [], gs = {};
    for (let i = 0; i < pool.length && out.length < 3; i++) {
      const f = pool[i];
      if (gs[f.g]) continue;
      gs[f.g] = 1;
      out.push({ t: f.mine ? f.t : f.t + (!/\d$/.test(f.t) && L.chance(0.15) ? ' ' + L.ri(2, 5) : ''), g: f.g, dur: L.ri(78, 172), st: L.ri(1, 5), mine: f.mine });
    }
    A.cine = out;
    return out;
  };
  function tier(p) { const r = L.r(); return r < p * 0.4 ? 'fan' : r < p ? 'ok' : r < p + (1 - p) * 0.55 ? 'meh' : 'bad'; }
  const CINE_T = {
    fan: ['{prenom} est devenu{e} fan de « {t} », tellement c’était époustouflant !', '{prenom} ressort de « {t} » [transformé|transformée]. Tu en parles à tout le monde pendant une semaine.', 'Coup de cœur absolu pour « {t} ». {prenom} achète le t-shirt du film en sortant.'],
    ok: ['{prenom} a bien aimé « {t} ». Une bonne soirée, et du pop-corn jusque dans les chaussettes.', '« {t} » : sympa ! {prenom} rit, sursaute, et sort de la salle de bonne humeur.'],
    meh: ['{prenom} n’a pas très aimé ce film. Le pop-corn, lui, était excellent.', '« {t} » ? Bof. {prenom} a surtout regardé l’heure.'],
    bad: ['{prenom} a détesté « {t} » et s’est [endormi|endormie] au bout de 20 minutes.', '{prenom} quitte la salle au milieu de « {t} ». Remboursement refusé.']
  };
  A.cineRun = function (c, p, i) {
    const l = G.L(), f = A.cine[i], a = l.me.age;
    if (!f) return null;
    const g = D.GENRES[f.g];
    let pr = 0.55;
    if (G.is(g.tr) || (l.tr[g.tr] || 0) >= 4) pr += 0.25;
    if (f.g === 'horreur' && a < 12) pr -= 0.4;
    if (f.g === 'auteur' && a < 15) pr -= 0.35;
    if (f.g === 'romance' && a < 11) pr -= 0.25;
    if (f.g === 'anim' && a < 13) pr += 0.2;
    pr = clamp(pr, 0.08, 0.92);
    const tr = tier(pr);
    c.v.t = L.esc(f.t);
    let t = f.g === 'horreur' && a < 12 && tr === 'bad' ? 'Après « {t} », {prenom} dort avec la lumière allumée pendant une semaine.' : L.pick(CINE_T[tr]);
    if (f.mine) t = 'Ton idée est devenue réalité : le film porte le titre que tu avais inventé ! ' + t;
    const fx = { b: { fan: 5, ok: 3, meh: 1, bad: -1 }[tr] };
    if (tr === 'fan' || tr === 'ok') {
      fx.tr = {}; fx.tr[g.tr] = tr === 'fan' ? 2 : 1;
      if (g.sk) fx.sk = g.sk;
      if (!l.traits.length) t += ' Ça développe ton côté ' + L.gs(D.TRAITS[g.tr].n, l.me.sex).toLowerCase() + '.';
    }
    return R(t, fx, { k: tr === 'fan' ? 'good' : tr === 'bad' ? 'bad' : '', title: 'Cinéma · ' + g.n, tier: tr });
  };
  def('self', {
    id: 'cinema', cat: 'sortie', n: 'Aller au cinéma', d: 'Trois films à l’affiche : choisis le tien', age: 6, cost: 12, ui: 'cine',
    pick: function () { return A.cineOffers().map(function (f, i) { return { v: i, l: f.t, sub: D.GENRES[f.g].n }; }); },
    run: function (c, p, i) { return A.cineRun(c, p, i); }
  });
  def('self', {
    id: 'bar', cat: 'sortie', n: 'Aller au bar', d: 'Social ↑, attention à l’alcool', age: 18, cost: 30,
    run: function (c) {
      const l = G.L();
      l.cnt.bar = (l.cnt.bar || 0) + 1;
      const addict = l.cnt.bar >= 3 && G.addict('alcool', 0.12);
      if (L.chance(0.2)) { const p = G.tmp('adult'); c.r.x = p; return R('Au bar, tu sympathises avec {x.n} autour d’un débat sur les frites.' + (addict ? ' Tu remarques que tu bois un peu trop souvent…' : ''), { s: 4, b: 2, h: -1, acts: 1 }, { after: function () { G.keep(p, 'ami', 40); } }); }
      return R(L.pick(['Soirée au bar. Le serveur connaît maintenant ton prénom.', 'Tu gagnes le quiz du bar grâce à une question sur les capitales.', 'Soirée au bar. Quelqu’un chante faux, et c’est toi.']) + (addict ? ' Tu remarques que tu bois un peu trop souvent…' : ''), { s: 4, b: 2, h: -1, acts: 1 }, { k: addict ? 'bad' : '' });
    }
  });
  def('self', {
    id: 'boite', cat: 'sortie', n: 'Sortir en boîte', d: 'Social ↑, rencontres possibles', age: 18, cost: 45,
    run: function (c) {
      const l = G.L();
      if (!G.partner() && L.chance(0.22 + l.st.c / 300)) { const p = G.tmp('crush'); c.r.x = p; return R('Sur la piste, tu danses toute la nuit avec {x.n}. Vous échangez vos numéros, puis bien plus : vous sortez ensemble !', { s: 5, b: 5, h: -2, acts: 1 }, { k: 'love', after: function () { G.date(p); } }); }
      return R(L.pick(['Nuit en boîte. Tu danses comme si personne ne te regardait. Tout le monde te regardait.', 'Tu passes la soirée au vestiaire à chercher ton manteau. Bonne soirée quand même.']), { s: 5, b: 3, h: -2, acts: 1 });
    }
  });
  // festival ou concert : trois affiches au choix
  A.fest = [];
  A.festOffers = function () {
    const djs = L.shuffle(D.DJS.slice()), fests = L.shuffle(D.FESTS.slice());
    const myDj = L.M ? L.M.mine('dj') : [], myFest = L.M ? L.M.mine('fest') : [];
    const nDj = L.ri(1, 2), out = [];
    for (let i = 0; i < 3; i++) {
      if (i < nDj) out.push({ kind: 'dj', n: djs[i], st: L.pick(D.DJ_STYLES), cost: L.ri(7, 12) * 5 });
      else out.push({ kind: 'fest', n: fests[i], st: L.pick(D.FEST_STYLES), cost: L.ri(14, 32) * 5, line: [djs[5 + i], djs[9 + i]] });
    }
    // tes DJ et tes festivals passent parfois en ville
    if (myDj.length && L.chance(0.3)) { const m = L.pick(myDj); out[0] = { kind: 'dj', n: m.t, st: m.g || L.pick(D.DJ_STYLES), cost: L.ri(7, 12) * 5, mine: 1 }; }
    if (myFest.length && L.chance(0.3)) { const m = L.pick(myFest); out[2] = { kind: 'fest', n: m.t, st: m.g || L.pick(D.FEST_STYLES), cost: L.ri(14, 32) * 5, line: [djs[6], djs[10]], mine: 1 }; }
    A.fest = L.shuffle(out);
    return A.fest;
  };
  const FEST_T = {
    fan: ['{prenom} est devenu{e} fan {de}, tellement c’était époustouflant !', 'Nuit légendaire {au}. {prenom} danse jusqu’au lever du soleil et garde le bracelet fluo pendant des mois.'],
    ok: ['Belle soirée {au} : du {st}, de la sueur et des inconnus devenus potes le temps d’un refrain.', '{prenom} a bien aimé {n}. Les oreilles sifflent encore le lendemain.'],
    meh: ['{prenom} n’a pas trop aimé {n} : trop de monde et pas assez de toilettes.', 'Bof. {prenom} trouve que tous les morceaux de {n} se ressemblent.'],
    bad: ['{prenom} a détesté {n}. Pluie, boue, et une chaussure perdue dans la foule.', 'Catastrophe {au} : tu perds tes amis, ta voix et ton téléphone (retrouvé, couvert de soda).']
  };
  A.festRun = function (c, p, i) {
    const l = G.L(), f = A.fest[i], a = l.me.age;
    if (!f || l.money < f.cost) return null;
    let pr = 0.55 + l.sk.musique / 250 + (l.st.s - 50) / 300;
    if (G.is('drole') || G.is('charismatique')) pr += 0.08;
    if (G.is('timide')) pr -= 0.1;
    if (a > 60) pr -= 0.15;
    const tr = tier(clamp(pr, 0.1, 0.92));
    c.v.n = L.esc(f.n); c.v.st = L.esc(f.st);
    c.v.de = f.kind === 'dj' ? 'de ' + c.v.n : 'du ' + c.v.n;
    c.v.au = f.kind === 'dj' ? 'au concert de ' + c.v.n : 'au ' + c.v.n;
    let t = L.pick(FEST_T[tr]);
    if (f.mine) t = 'Ton idée est devenue réalité : ' + (f.kind === 'dj' ? 'le DJ' : 'le festival') + ' porte le nom que tu avais inventé ! ' + t;
    const fx = { s: { fan: 5, ok: 4, meh: 2, bad: 1 }[tr], b: { fan: 6, ok: 4, meh: 1, bad: -2 }[tr], h: -1, sk: { musique: 1 }, acts: 1 };
    let after = null;
    if (tr !== 'bad' && L.chance(0.12)) { const q = G.tmp(a < 18 ? 'peer' : 'adult'); c.r.y = q; t += ' Dans la foule, tu sympathises avec {y.n}.'; after = function () { G.keep(q, 'ami', L.ri(40, 55)); }; }
    else if (tr !== 'bad' && a >= 14 && !G.partner() && L.chance(0.07)) { const q = G.tmp('crush'); c.r.y = q; t += ' Et pendant le dernier morceau, {y.n} t’embrasse. Vous sortez ensemble !'; after = function () { G.date(q); }; }
    return R(t, fx, { k: tr === 'fan' ? 'good' : tr === 'bad' ? 'bad' : '', cost: f.cost, title: f.kind === 'dj' ? 'Concert · ' + f.n : f.n, tier: tr, after: after });
  };
  def('self', {
    id: 'festival', cat: 'sortie', n: 'Festival ou concert', d: 'Trois affiches au choix', age: 14, ui: 'fest',
    pick: function () { const m = G.L().money; return A.festOffers().map(function (f, i) { return { v: i, l: f.n, sub: (f.kind === 'dj' ? 'Concert ' : 'Festival ') + f.st + ' · ' + L.money(f.cost), dis: m < f.cost }; }); },
    run: function (c, p, i) { return A.festRun(c, p, i); }
  });
  def('self', {
    id: 'casino', cat: 'sortie', n: 'Casino', d: 'Roulette : choisis ta mise', age: 18,
    pick: function () {
      const m = G.L().money;
      return [
        { v: 'r100', l: '100 € sur le rouge', sub: 'Gain ×2', dis: m < 100 },
        { v: 'r1000', l: '1 000 € sur le noir', sub: 'Gain ×2', dis: m < 1000 },
        { v: 'n50', l: '50 € sur le 17', sub: 'Gain ×36', dis: m < 50 },
        { v: 'all', l: 'Tout miser sur le rouge', sub: m > 0 ? L.money(m) : 'Tu n’as rien à miser', dis: m <= 0 }
      ];
    },
    run: function (c, p, v) {
      const l = G.L();
      const bet = v === 'r100' ? 100 : v === 'r1000' ? 1000 : v === 'n50' ? 50 : Math.max(0, Math.round(l.money));
      if (!bet || l.money < bet) return null;
      l.cnt.casino = (l.cnt.casino || 0) + 1;
      const addict = l.cnt.casino >= 3 && G.addict('jeu', 0.1);
      const win = v === 'n50' ? L.chance(1 / 37) : L.chance(18 / 37);
      const gain = win ? (v === 'n50' ? bet * 35 : bet) : -bet;
      c.v.g = L.money(Math.abs(gain));
      if (win && gain >= 10000) G.ach('jackpot');
      const tail = addict ? ' Le bruit des jetons commence à te manquer quand tu n’y es pas…' : '';
      return R(win ? 'La bille s’arrête sur ta case ! Tu gagnes {g}.' + tail : 'La bille t’ignore royalement. Tu perds {g}.' + tail, { m: gain, b: win ? 6 : -4 }, { k: win ? 'good' : 'bad' });
    }
  });
  def('self', {
    id: 'loto', cat: 'sortie', n: 'Jouer au loto', d: 'Ticket à 2,20 €', age: 18, cost: 2.2,
    run: function (c) {
      const r = L.r();
      if (r < 1 / 4000) { const g = L.ri(2, 14) * 1e6; c.v.g = L.money(g); return R('JACKPOT ! Tu gagnes {g} au loto. Tu cries si fort que le chien du voisin s’évanouit.', { m: g, b: 25 }, { k: 'big', after: function () { G.ach('loto'); } }); }
      if (r < 0.04) { const g = L.pick([5, 10, 20, 100]); c.v.g = L.money(g); return R('Petit gain au loto : {g}. Tu rejoues aussitôt, évidemment.', { m: g, b: 1 }); }
      return R('Perdu. Comme d’habitude. Mais tu y étais presque (tu avais le 7).', { b: -1 });
    }
  });
  const TRIPS = [
    { v: 'bzh', l: 'Week-end en Bretagne', cost: 300, b: 4, t: 'Week-end en Bretagne. Crêpes, pluie fine et vent dans les cheveux.' },
    { v: 'esp', l: 'Une semaine en Espagne', cost: 700, b: 6, sk: { langues: 2 }, t: 'Une semaine en Espagne. Tu rentres bronzé{e} et avec trois mots d’espagnol.' },
    { v: 'ita', l: 'Rome et Florence', cost: 1100, b: 7, sk: { art: 2 }, t: 'Rome et Florence. Tu as vu 400 statues et mangé 40 glaces.' },
    { v: 'isl', l: 'Road trip en Islande', cost: 2200, b: 9, t: 'Road trip en Islande. Geysers, aurores boréales, et un mouton qui te suit partout.' },
    { v: 'ny', l: 'New York', cost: 2800, b: 9, sk: { langues: 2 }, t: 'New York ! Tu te perds dans Central Park et tu manges un hot-dog géant.' },
    { v: 'jpn', l: 'Trois semaines au Japon', cost: 3500, b: 11, sk: { langues: 2 }, t: 'Trois semaines au Japon. Tu reviens avec une valise pleine de bonbons bizarres.' },
    { v: 'monde', l: 'Tour du monde (un an)', cost: 15000, b: 20, s: 6, sk: { langues: 6 }, t: 'Tour du monde ! 22 pays, 3 coups de soleil, 1 mariage avec un inconnu en Thaïlande (annulé depuis).' },
    { v: 'lune', l: 'Séjour sur la Lune', cost: 250000, b: 30, yr: 2065, t: 'Séjour sur la Lune. Tu fais des bonds de 6 mètres et tu vois la Terre se lever.' }
  ];
  def('self', {
    id: 'voyage', cat: 'sortie', n: 'Partir en voyage', d: 'Choisis ta destination', age: 16,
    pick: function () { const l = G.L(); return TRIPS.filter(function (t) { return !t.yr || l.year >= t.yr; }).map(function (t) { return { v: t.v, l: t.l, sub: L.money(t.cost), dis: l.money < t.cost }; }); },
    run: function (c, p, v) {
      const l = G.L(), t = TRIPS.find(function (x) { return x.v === v; });
      if (!t || l.money < t.cost) return null;
      return R(t.t, { b: t.b, s: t.s || 2, h: 1, sk: t.sk }, { k: 'good', cost: t.cost, after: function () { if (l.travels.indexOf(v) < 0) l.travels.push(v); if (l.travels.length >= 5) G.ach('voyageur'); } });
    }
  });
  def('self', {
    id: 'benevolat', cat: 'sortie', n: 'Faire du bénévolat', age: 12,
    run: function () { return R(L.pick(['Tu sers des repas à la banque alimentaire. Tu repars le cœur plein.', 'Tu nettoies une plage avec une association. Tu trouves une bouteille avec un message : « Coucou ».', 'Tu promènes les chiens du refuge. L’un d’eux essaie de rentrer avec toi.']), { b: 3, s: 3, acts: 1, tr: { bienveillant: 2 } }, { k: 'good' }); }
  });
  // loisirs
  // jeux vidéo et livres : même principe que le cinéma (3 choix, un genre qui forge le caractère, un verdict)
  function mediaOffers(pool, slot, genres) {
    const p = withMine(L.shuffle(pool.slice()), slot, genres), out = [], gs = {};
    for (let i = 0; i < p.length && out.length < 3; i++) { if (gs[p[i].g]) continue; gs[p[i].g] = 1; const f = Object.assign({ st: L.ri(1, 5), n: L.ri(1, 4) }, p[i]); f.t = f.t.replace('{an}', String(G.L().year)); out.push(f); }

    return out;
  }
  function mediaRun(c, f, genres, texts, adj, base, title) {
    const l = G.L(), a = l.me.age;
    if (!f) return null;
    const g = genres[f.g];
    let pr = 0.55 + adj(f, l);
    if (G.is(g.tr) || (l.tr[g.tr] || 0) >= 4) pr += 0.25;
    if (g.kid && a < 12) pr -= 0.4;
    const tr = tier(clamp(pr, 0.08, 0.92));
    c.v.t = L.esc(f.t);
    let t = g.kid && a < 12 && tr === 'bad' ? texts.kid : L.pick(texts[tr]);
    if (f.mine) t = 'Ton idée est devenue réalité : il porte le titre que tu avais inventé ! ' + t;
    const fx = Object.assign({ b: { fan: 5, ok: 3, meh: 1, bad: -1 }[tr] }, base);
    if (tr === 'fan' || tr === 'ok') {
      fx.tr = {}; fx.tr[g.tr] = tr === 'fan' ? 2 : 1;
      if (g.sk) { fx.sk = Object.assign({}, fx.sk || {}); Object.keys(g.sk).forEach(function (k) { fx.sk[k] = (fx.sk[k] || 0) + g.sk[k]; }); }
      if (!l.traits.length) t += ' Ça développe ton côté ' + L.gs(D.TRAITS[g.tr].n, l.me.sex).toLowerCase() + '.';
    }
    return R(t, fx, { k: tr === 'fan' ? 'good' : tr === 'bad' ? 'bad' : '', title: title + ' · ' + g.n, tier: tr });
  }
  A.jeux = [];
  A.jvOffers = function () { A.jeux = mediaOffers(D.VGAMES, 'jeu', D.VG_GENRES); return A.jeux; };
  const JV_T = {
    fan: ['{prenom} devient accro à « {t} » : jeu terminé à 100 %, trophées compris !', 'Coup de cœur pour « {t} ». {prenom} en rêve la nuit et fredonne la musique du menu.'],
    ok: ['Bonne partie de « {t} ». {prenom} lâche la manette avec le sourire.', '« {t} » : sympa ! {prenom} débloque deux niveaux et un chapeau rigolo.'],
    meh: ['« {t} » ? Bof. {prenom} s’ennuie dès le deuxième niveau.', '{prenom} n’accroche pas à « {t} ». Le tutoriel dure trois heures.'],
    bad: ['{prenom} a détesté « {t} ». La manette a volé (sur le canapé, heureusement).', '« {t} » plante toutes les cinq minutes. {prenom} abandonne, [furieux|furieuse].'],
    kid: 'Après « {t} », {prenom} ne veut plus descendre [seul|seule] à la cave.'
  };
  def('self', {
    id: 'jv', cat: 'loisir', n: 'Jouer aux jeux vidéo', d: 'Trois jeux dans ta ludothèque : choisis', age: 5, ui: 'jv',
    if: function () { return G.owns('console') || G.owns('pcgaming') ? true : 'Il te faut une console (Biens)'; },
    pick: function () { return A.jvOffers().map(function (f, i) { return { v: i, l: f.t, sub: D.VG_GENRES[f.g].n }; }); },
    run: function (c, p, i) { return mediaRun(c, A.jeux[i], D.VG_GENRES, JV_T, function (f, l) { return l.sk.info / 300 + (f.g === 'sport' ? l.sk.sport / 400 : 0); }, { sk: { info: 1 } }, 'Jeu vidéo'); }
  });
  A.livres = [];
  A.bookOffers = function () { A.livres = mediaOffers(D.BOOKS, 'livre', D.BOOK_GENRES).map(function (b) { b.pages = L.ri(9, 64) * 10; return b; }); return A.livres; };

  const BOOK_T = {
    fan: ['{prenom} dévore « {t} » en une nuit et devient [fan|fan] de l’auteur.', '« {t} » bouleverse {prenom}. Le livre reste sur la table de chevet pendant des mois.'],
    ok: ['{prenom} a bien aimé « {t} ». Quelques pages cornées et de belles phrases soulignées.', 'Bonne lecture : « {t} » se lit tout seul.'],
    meh: ['{prenom} n’accroche pas trop à « {t} ». Il finit par caler la table bancale.', '« {t} » ? {prenom} s’endort à la page 12. Puis à la page 13.'],
    bad: ['{prenom} a détesté « {t} » et le dépose dès le lendemain dans une boîte à livres.', 'Abandonné à la page 40 : « {t} », c’est non.'],
    kid: 'Après « {t} », {prenom} dort avec la lampe de poche allumée sous la couette.'
  };
  def('self', {
    id: 'lire', cat: 'loisir', n: 'Lire un livre', d: 'Trois livres sur l’étagère : choisis', age: 6, lone: 1, ui: 'livre',
    pick: function () { return A.bookOffers().map(function (f, i) { return { v: i, l: f.t, sub: D.BOOK_GENRES[f.g].n }; }); },
    run: function (c, p, i) {
      return mediaRun(c, A.livres[i], D.BOOK_GENRES, BOOK_T, function (f, l) {
        let x = l.sk.langues / 300;
        if (l.me.age < 12 && (f.g === 'devperso' || f.g === 'essai' || f.g === 'histoire')) x -= 0.3;
        if (l.me.age < 14 && f.g === 'bd') x += 0.2;
        return x;
      }, { sk: { langues: 1.5, eloquence: 1 } }, 'Lecture');
    }
  });

  const NOVELS = ['Le Pigeon de minuit', 'Les Larmes du camembert', 'Une vie de chaussette', 'L’Amour au rayon surgelés', 'Tonton Gérard contre les extraterrestres', 'Le Silence des tartines', 'Quatorze nuances de beige'];
  def('self', {
    id: 'ecrire', cat: 'loisir', n: 'Écrire un roman', d: function () { const n = G.L().novel; return n ? 'Avancement : ' + Math.min(100, Math.round(n.p)) + ' %' : 'Un an d’écriture… ou plus'; }, age: 12,
    run: function (c) {
      const l = G.L();
      if (!l.novel) l.novel = { p: 0, t: L.pick(NOVELS) };
      const n = l.novel;
      n.p += L.ri(18, 32) + l.sk.eloquence / 8;
      c.v.t = L.esc(n.t);
      if (n.p < 100) return R('Tu écris quelques chapitres de « {t} ». Avancement : ' + Math.round(n.p) + ' %.', { b: 1, sk: { eloquence: 1.5, langues: 1 } });
      const q = (l.sk.langues + l.sk.eloquence + l.sk.art) / 3 + L.ri(-20, 30);
      const copies = Math.max(40, Math.round(Math.pow(Math.max(5, q), 2.2) * L.rand(0.5, 3)));
      c.v.n = L.fmt(copies);
      const money = Math.round(copies * 1.6);
      l.novel = null;
      return R('Ton roman « {t} » est publié ! {n} exemplaires vendus.' + (copies > 20000 ? ' Les critiques parlent de toi à la radio.' : ''), { m: money, b: 8, c: copies > 20000 ? 4 : 1 }, { k: 'big', after: function () { G.ach('roman'); } });
    }
  });
  const VIDS = ['Je mange que des aliments jaunes pendant 24 h', 'J’adopte un pigeon (il me déteste)', 'Réaction à ma propre vidéo', 'Je teste les pires gadgets de cuisine', 'Ma grand-mère note mes tenues', 'Je dors dans un supermarché (autorisé, promis)'];
  def('self', {
    id: 'video', cat: 'loisir', n: 'Publier une vidéo', d: function () { const y = G.L().yt; return y ? L.fmt(y.subs) + ' abonnés' : 'Devenir influenceur·se ?'; }, age: 12,
    show: function () { return G.L().year >= 2006; },
    if: function () { return G.L().st.c < 8 ? 'Charisme trop bas (moins de 8)' : true; },
    run: function (c) {
      const l = G.L();
      if (!l.yt) l.yt = { subs: 0, n: 0 };
      const y = l.yt;
      y.n++;
      y.last = l.year;
      const base = Math.pow((l.st.c + l.sk.eloquence + l.sk.art / 2) / 2, 1.35) * L.rand(0.3, 2.5);
      const viral = L.chance(0.08);
      const gain = Math.round(base * (1 + Math.sqrt(y.subs) / 45) * (viral ? 12 : 1));
      y.subs += gain;
      c.v.t = L.pick(VIDS); c.v.g = L.fmt(gain); c.v.s = L.fmt(y.subs);
      const big = y.subs >= 1e6;
      return R((viral ? 'Ta vidéo « {t} » devient virale ! ' : 'Tu publies « {t} ». ') + '+{g} abonnés ({s} au total).', { c: viral ? 3 : 1, b: viral ? 6 : 1, s: 1 }, { k: viral ? 'big' : '', after: function () { if (big) G.ach('influ'); } });
    }
  });
  // amour
  A.cands = [];
  const BIOS = ['Aime les randonnées et les gens qui aiment les randonnées.', 'Cherche quelqu’un pour finir ses frites.', 'Pas de prise de tête. Beaucoup de prise de chats.', 'Végétarien·ne, sauf pour le saucisson.', 'Sait faire le bruit du dauphin.', 'Fan de puzzles de 5 000 pièces.', 'Collectionne les magnets de frigo. Sérieusement.', 'Cherche partenaire de karaoké, niveau débutant accepté.', 'Ne répond qu’en mèmes.', 'A un potager et des opinions sur les tomates.'];
  const RANGES = [[18, 24], [25, 34], [35, 44], [45, 59], [60, 79], [80, 105]];
  function genCands(n, app, range) {
    const l = G.L();
    A.cands = [];
    for (let i = 0; i < n; i++) {
      const p = G.tmp('crush');
      if (range) { p.age = L.ri(range[0], range[1]); p.first = D.firstName(p.sex, l.year - p.age); }
      p.bio = app ? L.pick(BIOS) : '';
      A.cands.push(p);
    }
  }
  function lovePick(app) {
    return function () {
      genCands(app ? 4 : 3, app);
      return A.cands.map(function (p, i) { return { v: i, l: p.first + ', ' + p.age + ' ans', sub: p.bio || L.gs(p.nt, p.sex), face: p }; });
    };
  }
  function loveRun(app) {
    return function (c, _, i) {
      const l = G.L(), p = A.cands[i];
      if (!p) return null;
      c.r.x = p;
      let ch = 0.22 + l.st.c / 160 + (app ? 0.08 : 0);
      if (G.is('charismatique')) ch += 0.1;
      if (G.is('drole')) ch += 0.05;
      if (G.is('timide')) ch -= 0.08;
      if (L.chance(G.luck(ch))) return R(app ? 'Ça matche avec {x.n} ! Premier rendez-vous dans un bar à jeux. Vous sortez ensemble.' : 'Tu tentes ta chance avec {x.n}… et ça marche ! Vous sortez ensemble.', { b: 6, acts: 1 }, { k: 'love', after: function () { G.date(p); } });
      return R(app ? '{X.n} ne répond jamais à ton message. Tu relis ton « coucou ça va » douze fois.' : '{X.n} te met un râteau poli : « Je te vois plus comme {x:un pote|une copine}. »', { b: -3 }, { k: 'bad' });
    };
  }
  def('self', { id: 'amour', cat: 'amour', n: 'Chercher l’amour', d: 'Le charisme aide beaucoup', age: 12, if: function () { return G.partner() ? 'Tu es déjà en couple' : true; }, pick: lovePick(false), run: loveRun(false) });
  def('self', {
    id: 'appli', cat: 'amour', n: 'Appli de rencontre', d: 'Choisis une tranche d’âge', age: 18, show: function () { return G.L().year >= 2012; }, if: function () { return G.partner() ? 'Tu es déjà en couple' : true; },
    pick: function () { return RANGES.map(function (r, i) { return { v: 'r' + i, l: r[1] > 100 ? r[0] + ' ans et plus' : r[0] + ' – ' + r[1] + ' ans', sub: 'Profils de cette tranche d’âge' }; }); },
    next: function (v) {
      const m = /^r(\d)$/.exec(String(v));
      if (!m) return null;
      genCands(4, true, RANGES[Number(m[1])]);
      return A.cands.map(function (p, i) { return { v: i, l: p.first + ', ' + p.age + ' ans', sub: p.bio, face: p }; });
    },
    run: loveRun(true)
  });
  // risques
  def('self', {
    id: 'fumer', cat: 'risque', n: 'Fumer une cigarette', d: 'Très addictif', age: 13, show: function () { return !G.L().add.tabac; },
    run: function () { const ad = G.addict('tabac', 0.45); return R(ad ? 'Tu fumes une cigarette. Puis une autre. Puis un paquet par jour. Te voilà [accro|accro] au tabac.' : 'Tu fumes une cigarette en toussant comme un vieux moteur. Tu te trouves cool. Tu ne l’es pas.', { h: -2, s: 1, tr: { rebelle: 1 } }, { k: ad ? 'bad' : '' }); }
  });
  const LOOT = ['un paquet de chewing-gums', 'une paire de lunettes de soleil', 'un pot de pâte à tartiner', 'un parapluie à motif licorne'];
  def('self', {
    id: 'voler', cat: 'risque', n: 'Voler à l’étalage', d: 'Risque de police', age: 9,
    run: function (c) {
      c.v.o = L.pick(LOOT);
      const caught = L.chance(G.is('menteur') ? 0.2 : 0.32);
      if (!caught) return R('Tu voles {o}. Ton cœur bat à 200. Personne n’a rien vu.', { b: 2, tr: { rebelle: 2, menteur: 1 } });
      return R('Tu essaies de voler {o}. Le vigile t’attrape par la capuche.', { b: -3, tr: { rebelle: 2 } }, { k: 'bad', after: function () { G.arrest(1, 'vol'); } });
    }
  });
  def('self', {
    id: 'graffiti', cat: 'risque', n: 'Faire un graffiti', age: 11,
    run: function () {
      if (L.chance(0.25)) return R('Tu tagues un mur… juste devant une patrouille.', { tr: { rebelle: 2 }, sk: { art: 1 } }, { k: 'bad', after: function () { G.arrest(1, 'graffiti'); } });
      return R('Tu peins une fresque géante sur un mur abandonné. Le quartier l’adore.', { b: 3, c: 1, sk: { art: 3 }, tr: { rebelle: 1, creatif: 2 } }, { k: 'good' });
    }
  });

  // crimes : la police n'est jamais loin
  const vicRef = function (y) { return y.tmp ? { tmp: { first: y.first, last: y.last, sex: y.sex, age: y.age } } : { id: y.id }; };
  const guilt = function () { return G.is('egoiste') || G.is('colerique') ? -4 : -12; };
  function targets(stranger) {
    return function () {
      const o = G.alive().filter(function (q) { return q.rel !== 'pet' && q.rel !== 'gone' && q.rel !== 'old'; }).slice(0, 40)
        .map(function (q) { return { v: q.id, l: q.first + ' ' + q.last, sub: L.relName(q) + ' · ' + q.age + ' ans' }; });
      if (stranger) o.unshift({ v: 'x', l: 'Un parfait inconnu', sub: 'Quelqu’un hors de ton entourage' });
      return o;
    };
  }
  def('self', {
    id: 'meurtre', cat: 'risque', n: 'Commettre un meurtre', d: 'Choisis qui · risque de police élevé', age: 16,
    pick: targets(true),
    run: function (c, p, v) {
      const l = G.L(), known = v !== 'x';
      const y = known ? G.byId(Number(v)) : G.tmp('adult');
      if (!y || !y.alive) return null;
      c.r.y = y;
      const fam = known && ['mere', 'pere', 'par', 'sib', 'gp', 'enf', 'part'].indexOf(y.rel) >= 0;
      if (!L.chance(clamp(0.62 + (l.gun ? 0.2 : 0) + l.sk.sport / 400, 0.3, 0.92))) {
        const caught = L.chance(0.85);
        return R('Tu passes à l’acte contre {y}… et tu échoues. {Y.il} s’enfuit en hurlant et donne ton signalement à la police.', { b: -6, tr: { colerique: 3 } }, { k: 'bad', title: 'Tentative ratée', after: function () { if (known) G.keep(y, 'enn', 0); if (caught) G.arrest(3, 'tentative', y); else l.cold.push({ m: 'tentative', vic: vicRef(y), vn: y.first, y: l.year, p: 0.15 }); } });
      }
      let pc = known ? (fam ? 0.8 : 0.65) : 0.4;
      if (G.is('menteur')) pc -= 0.08;
      if (G.is('calme')) pc -= 0.05;
      if (l.gun) pc += 0.05;
      const caught = L.chance(clamp(pc, 0.1, 0.95));
      return R('Tu passes à l’acte. {y.n} ne verra pas la fin de l’année.' + (caught ? ' Les sirènes arrivent presque aussitôt.' : ' Personne ne t’a vu. Pour l’instant.'), { b: guilt(), tr: { colerique: 3, menteur: 1 } }, { k: 'bad', title: 'Meurtre', after: function () { G.kill(y); if (caught) G.arrest(3, 'meurtre', y); else l.cold.push({ m: 'meurtre', vic: vicRef(y), vn: y.first, y: l.year, p: known ? 0.14 : 0.08 }); } });
    }
  });
  def('self', {
    id: 'tueur', cat: 'risque', n: 'Payer un tueur à gages', d: 'Risque de police moindre', age: 18, cost: 15600,
    pick: targets(false),
    run: function (c, p, v) {
      const l = G.L(), y = G.byId(Number(v));
      if (!y || !y.alive) return null;
      c.r.y = y;
      if (L.chance(0.1)) return R('Le tueur à gages encaisse les 15 600 € et disparaît. Difficile de porter plainte.', { b: -6 }, { k: 'bad', title: 'Arnaque' });
      if (!L.chance(0.85)) return R('Le tueur se trompe d’adresse et terrorise une boîte aux lettres. {Y.n} ne se doute de rien. L’argent, lui, est parti.', { b: -4 }, { k: 'bad', title: 'Contrat raté' });
      const caught = L.chance(0.22);
      return R('Un coup de fil, une enveloppe, un message codé : {y.n} disparaît de ta vie.' + (caught ? ' Mais le tueur se fait arrêter… et il parle.' : ' Le tueur, lui, s’évapore.'), { b: guilt(), tr: { menteur: 2 } }, { k: 'bad', title: 'Contrat', after: function () { G.kill(y); if (caught) G.arrest(3, 'commandite', y); else l.cold.push({ m: 'commandite', vic: vicRef(y), vn: y.first, y: l.year, p: 0.07 }); } });
    }
  });
  def('self', {
    id: 'arme', cat: 'risque', n: 'Acheter une arme à feu', d: 'Illégal · aide pour un « mauvais coup »', age: 18, cost: 1400,
    show: function () { return !G.L().gun; },
    run: function () {
      const l = G.L();
      if (L.chance(0.12)) return R('Sur un parking, un type louche te tend un paquet… puis sort une carte de police. C’était un agent infiltré.', { b: -5 }, { k: 'bad', after: function () { G.arrest(2, 'arme'); } });
      return R('Sur un parking, un type louche te vend un pistolet emballé dans un vieux journal. Tu le caches au fond d’un placard.', { b: -1, tr: { rebelle: 2 } }, { k: 'bad', after: function () { l.gun = l.year; } });
    }
  });
  def('self', {
    id: 'jeterArme', cat: 'risque', n: 'Te débarrasser de ton arme', d: 'Plus de risque au prochain contrôle', age: 18, free: 1,
    show: function () { return !!G.L().gun; },
    run: function () { return R('Tu jettes ton arme dans le fleuve, de nuit. Un canard te regarde, l’air de dire « Je n’ai rien vu ».', { b: 2 }, { after: function () { G.L().gun = 0; } }); }
  });
  // la vie en prison
  const inPrison = function () { return G.L().prison > 0; };
  def('self', {
    id: 'conduite', cat: 'prison', n: 'Bonne conduite', d: 'Peut réduire ta peine', prison: 1, lone: 1, show: inPrison,
    run: function () {
      const l = G.L();
      l.pc = (l.pc || 0) + 1;
      if (!l.perpet && l.prison > 1 && l.pc >= 2 && L.chance(0.35)) return R('Remise de peine : ta bonne conduite te vaut <b>un an de moins</b> !', { b: 6 }, { k: 'good', after: function () { l.prison--; } });
      return R(L.pick(['Tu fais ton lit au carré et tu dis bonjour à chaque gardien. Ça finira par se voir.', 'Tu aides un codétenu à écrire une lettre à sa mère. Le directeur l’a remarqué.', 'Pas une seule histoire cette année. Ton dossier commence à briller.']), { b: 1, tr: { discipline: 1 } });
    }
  });
  def('self', { id: 'pmuscu', cat: 'prison', n: 'Musculation dans la cour', prison: 1, lone: 1, show: inPrison, run: function () { return R('Pompes, tractions, haltères en bidons de lessive. Tu sors de la cour avec des biceps et un surnom.', { h: 3, sk: { sport: 3 } }); } });
  def('self', { id: 'patelier', cat: 'prison', n: 'Travailler à l’atelier', d: 'Un petit pécule', prison: 1, lone: 1, show: inPrison, run: function () { return R('Tu assembles des stylos à l’atelier toute l’année. Pécule : 300 €. Et un vrai talent pour les stylos.', { m: 300, sk: { bricolage: 3 } }); } });
  def('self', { id: 'pbibli', cat: 'prison', n: 'Bibliothèque de la prison', prison: 1, lone: 1, show: inPrison, run: function () { return R(L.pick(['Tu lis tous les romans de la bibliothèque de la prison. Il y en a 43. Tu les relis.', 'Tu prépares un diplôme par correspondance entre deux promenades. Le gardien te fait réciter.']), { b: 2, sk: { langues: 2, eloquence: 2 } }); } });
  def('self', {
    id: 'evasion', cat: 'prison', n: 'Tenter de t’évader', d: 'Très risqué', prison: 1, show: inPrison,
    run: function () {
      const l = G.L();
      if (L.chance(clamp(0.1 + l.sk.sport / 500 + (G.is('rebelle') ? 0.04 : 0), 0.05, 0.3))) return R('Draps noués, mur escaladé, bus de nuit : tu es dehors ! Mais désormais, tu es en cavale.', { b: 10 }, { k: 'big', title: 'Évasion', after: function () { l.fugitif = l.perpet ? 25 : l.prison; l.prison = 0; l.perpet = 0; G.ach('evade'); } });
      return R('Les projecteurs s’allument au moment où tu touches le haut du mur. Peine allongée de deux ans.', { b: -6 }, { k: 'bad', after: function () { if (!l.perpet) l.prison += 2; } });
    }
  });
  def('self', {
    id: 'appel', cat: 'prison', n: 'Faire appel', d: 'Une fois par condamnation · quitte ou double', prison: 1, show: inPrison,
    if: function () { return G.L().appel ? 'Déjà fait' : true; },
    run: function () {
      const l = G.L(), r = L.r();
      if (r < 0.35) {
        const n = l.perpet ? 20 : Math.max(1, Math.round(l.prison * L.rand(0.45, 0.7)));
        return R('La cour d’appel réduit ta peine : il ne te reste plus que <b>' + n + ' an' + (n > 1 ? 's' : '') + '</b>.', { b: 8 }, { k: 'good', after: function () { l.appel = 1; l.prison = n; l.perpet = 0; } });
      }
      if (r < 0.55 && !l.perpet) return R('Mauvaise pioche : la cour d’appel alourdit ta peine. Ton avocat évite ton regard.', { b: -6 }, { k: 'bad', after: function () { l.appel = 1; l.prison = Math.ceil(l.prison * 1.25); } });
      return R('La cour d’appel confirme ta peine. Rien ne change, à part ton moral.', { b: -2 }, { after: function () { l.appel = 1; } });
    }
  });

  // ---------- compétences, clubs ----------
  // enfant : le nombre d'entraînements par an dépend du bonheur (adulte : cours du soir payants, sans limite)
  A.trainLimit = function () {
    const l = G.L();
    if (l.me.age >= 18) return 99;
    const b = Math.round(l.st.b);
    return b >= 90 ? 3 : b >= 70 ? 2 : b >= 50 ? 1 : 0;
  };
  A.trainedCount = function () { return D.SKILLS.filter(function (s) { return G.isDone('train:' + s.id); }).length; };
  A.trainWhy = function (k) {
    const l = G.L();
    if (l.dead) return 'Fin de partie';
    if (l.me.age < 6) return 'Dès 6 ans';
    if (l.lonely) return 'Solitude profonde';
    if (G.isDone('train:' + k)) return 'Déjà fait cette année';
    if (l.me.age < 18) { const lim = A.trainLimit(); if (A.trainedCount() >= lim) return lim ? 'Limite de l’année' : 'Bonheur trop bas'; }
    if (G.apLeft() <= 0) return A.NOTIME;
    if (l.me.age >= 18 && l.money < 150) return 'Pas assez d’argent';
    return '';
  };
  A.train = function (k) {
    const l = G.L();
    if (A.trainWhy(k)) return null;
    G.spend();
    G.mark('train:' + k);
    const adult = l.me.age >= 18;
    const v = L.ri(3, 6) * (adult ? 0.85 : 1.25);
    const c = G.ctx(); c.v = { n: D.skillName(k).toLowerCase() };
    const fx = { sk: {} }; fx.sk[k] = v; fx.tr = { curieux: 1 };
    if (adult) fx.m = -150;
    const out = G.say(adult ? 'Cours du soir : {n}.' : 'Tu t’entraînes : {n}.', fx, c);
    out.title = 'Entraînement';
    G.afterAction();
    return out;
  };
  A.clubWhy = function () {
    const l = G.L();
    if (l.me.age < 6 || l.me.age >= 18) return 'De 6 à 17 ans';
    if (l.lonely) return 'Solitude profonde';
    if (G.isDone('club')) return 'Un changement de club par an';
    if (G.apLeft() <= 0) return A.NOTIME;
    return '';
  };
  A.club = function (id) {
    const l = G.L(), e = l.edu;
    if (A.clubWhy()) return null;
    const cl = D.CLUBS.find(function (x) { return x.id === id; });
    const c = G.ctx(); c.v = { n: cl.n.toLowerCase() };
    G.spend();
    G.mark('club');
    if (e.clubs.indexOf(id) >= 0) {
      e.clubs = e.clubs.filter(function (x) { return x !== id; });
      const o = G.say('Tu arrêtes : {n}.', null, c); o.title = 'Clubs'; return o;
    }
    if (e.clubs.length >= 2) return null;
    const payer = l.wealth === 'modeste' ? 'me' : 'par';
    if (payer === 'me' && l.money < cl.cost) { G.L().done.club = 0; return { t: 'Tes parents n’ont pas les moyens de payer ce club, et toi non plus (' + L.money(cl.cost) + ').', d: {}, title: 'Clubs' }; }
    e.clubs.push(id);
    const o = G.say('Tu t’inscris : {n}.' + (payer === 'me' ? ' Tu paies l’inscription toi-même.' : ''), { b: 2, s: 1, m: payer === 'me' ? -cl.cost : 0 }, c, 'good');
    o.title = 'Clubs';
    G.afterAction();
    return o;
  };

  // ---------- école ----------
  def('school', { id: 'etudier', n: 'Étudier plus dur', d: 'Moyenne ↑', age: 6, lone: 1, run: function () { const v = L.rand(0.8, 1.6) * (G.is('discipline') ? 1.2 : 1); return R(L.pick(['Tu révises tous les soirs. Ton bureau est enseveli sous les fiches.', 'Tu fais tes devoirs sans qu’on te le demande. Tes parents vérifient ta température.']), { g: v, b: -1, tr: { discipline: 2, ambitieux: 1 }, sk: (function () { const o = {}; o[L.pick(['logique', 'langues', 'sciences'])] = 1; return o; })() }); } });
  def('school', {
    id: 'reviserAmi', n: 'Réviser avec un ami', age: 8, lone: 0,
    if: function () { return G.alive('ami').length ? true : 'Il te faut un ami'; },
    run: function (c) { const p = L.pick(G.alive('ami')); c.r.x = p; return R('Tu révises avec {x.n}. Vous travaillez 40 minutes et rigolez 2 heures.', { g: 0.6, s: 2, rq: { x: 3 }, acts: 1 }); }
  });
  def('school', { id: 'participer', n: 'Participer en classe', age: 6, lone: 1, run: function () { return R('Tu lèves la main à chaque question. Tes camarades te détestent un peu, la prof t’adore.', { g: 0.4, c: 1, sk: { eloquence: 1 }, tr: { charismatique: 1, discipline: 1 } }); } });
  def('school', {
    id: 'clown', n: 'Faire le clown en classe', age: 4, lone: 0,
    run: function () { const l = G.L(); const colle = L.chance(0.25); if (colle) l.edu.warn++; return R(colle ? 'Ton imitation de la prof fait hurler de rire toute la classe… sauf la prof. Heure de colle.' : 'Tu fais rire toute la classe avec ton imitation d’un dauphin. Légende.', { g: -0.5, s: 3, b: 2, tr: { drole: 2, rebelle: 1 } }); }
  });
  def('school', {
    id: 'secher', n: 'Sécher les cours', d: 'Moyenne ↓, risque', age: 11, lone: 1,
    run: function (c) {
      const l = G.L();
      const caught = L.chance(0.3);
      const par = G.role('par');
      if (caught) { l.edu.warn++; c.r.par = par; }
      return R(caught ? 'Tu sèches pour aller au parc. Le CPE appelle {par}. Ambiance glaciale au dîner.' : 'Tu sèches la journée. Tu passes l’après-midi à manger des frites au soleil.', { g: -1.2, b: 3, rq: caught && par ? { par: -4 } : null, tr: { rebelle: 3, nonchalant: 1 } }, { k: caught ? 'bad' : '' });
    }
  });
  def('school', {
    id: 'tricher', n: 'Tricher à un contrôle', d: 'Gros gain… ou gros ennuis', age: 8,
    run: function () {
      const l = G.L();
      if (L.chance(G.luck(G.is('menteur') ? 0.7 : 0.55))) return R('Antisèche dans la trousse. 18/20. Personne n’a rien vu.', { g: 1.5, tr: { menteur: 2 } });
      l.edu.warn++;
      return R('Pris{e} la main dans le sac avec une antisèche. Zéro et convocation des parents.', { g: -2.5, b: -3, tr: { menteur: 2 } }, { k: 'bad' });
    }
  });
  def('school', { id: 'prof', n: 'Parler à ton prof', age: 6, lone: 1, run: function () { return R('Tu restes après le cours pour poser des questions. Le prof te prête un livre sur les volcans.', { g: 0.3, b: 1, tr: { discipline: 1, curieux: 1 } }); } });
  def('school', {
    id: 'bac', n: 'Préparer le bac à fond', d: 'Bonus pour l’examen', age: 15,
    show: function () { return G.L().edu.i === 14 && G.L().edu.st === 'lyc'; },
    run: function () { const l = G.L(); l.flags.revBac = l.year; return R('Fiches, annales, café. Tu révises le bac comme jamais.', { g: 0.6, b: -2 }); }
  });
  // études supérieures
  def('sup', { id: 'reviser', n: 'Réviser les partiels', age: 16, lone: 1, run: function () { return R('Tu passes tes nuits à la bibliothèque universitaire. Tu connais le prénom du gardien.', { g: L.rand(1, 2), b: -1 }); } });
  def('sup', { id: 'fete', n: 'Faire la fête', age: 16, run: function () { return R('Soirée étudiante légendaire. Tu te réveilles avec un cône de chantier dans les bras.', { g: -0.8, s: 4, b: 3, h: -1, acts: 1 }); } });
  def('sup', { id: 'amphi', n: 'Sécher les amphis', age: 16, lone: 1, run: function () { return R('Tu sèches l’amphi. Tu récupéreras les cours. Peut-être.', { g: -1.2, b: 2, tr: { nonchalant: 1 } }); } });
  // travail
  def('work', { id: 'bosser', n: 'Travailler plus dur', d: 'Performance ↑, santé ↓', age: 14, run: function () { return R(L.pick(['Tu restes tard au travail tous les soirs. Le vigile te dit bonsoir par ton prénom.', 'Tu donnes tout au boulot cette année. Ta plante verte, elle, meurt de solitude.']), { perf: L.ri(8, 14), h: -2, b: -1 }, { yf: { hard: 1 } }); } });
  def('work', { id: 'glander', n: 'Glander au travail', d: 'Bonheur ↑, performance ↓', age: 14, run: function () { return R('Tu passes tes journées à regarder des vidéos de chats en faisant semblant de lire des tableaux.', { perf: -L.ri(8, 14), b: 3 }); } });
  def('work', {
    id: 'heuressup', n: 'Faire des heures sup', d: 'Argent ↑, santé ↓', age: 14,
    run: function (c) { const v = Math.round(G.salary() * 0.08 / 10) * 10; c.v.m = L.money(v); return R('Heures sup tous les samedis. Ça paie : {m}.', { m: v, perf: 4, h: -3, b: -1 }, { yf: { hard: 1 } }); }
  });
  def('work', {
    id: 'augmentation', n: 'Demander une augmentation', d: 'Le patron accepte si tu travailles bien', age: 14,
    run: function (c) {
      const l = G.L(), j = l.job;
      let ch = j.perf >= 60 ? 0.35 + (j.perf - 60) / 80 : 0.05;
      if (G.is('egoiste')) ch += 0.12;
      if (G.is('ambitieux')) ch += 0.1;
      if (G.is('charismatique')) ch += 0.05;
      if (G.is('bienveillant')) ch -= 0.05;
      c.r.boss = G.role('boss');
      if (L.chance(G.luck(ch))) {
        const r = L.rand(0.04, 0.12);
        j.raise = (j.raise || 1) * (1 + r);
        c.v.p = Math.round(r * 100);
        return R('{Boss} accepte : +{p} % de salaire !', { b: 5 }, { k: 'good' });
      }
      return R(j.perf < 60 ? '{Boss} te rit au nez : « Avec ton travail de cette année ? »' : '{Boss} refuse : « Ce n’est pas le moment, le budget est serré. » Il vient de changer de voiture.', { b: -3, perf: -2, rq: { boss: -3 } }, { k: 'bad' });
    }
  });
  def('work', {
    id: 'promotion', n: 'Demander une promotion', d: function () { const j = G.L().job; return j ? 'Échelon ' + (j.lvl + 1) + '/' + D.job(j.id).lv.length : ''; }, age: 14,
    if: function () { const j = G.L().job; if (!j) return false; if (j.lvl >= D.job(j.id).lv.length - 1) return 'Déjà au sommet'; if (j.ly < 2) return 'Au moins 2 ans à ce poste'; return true; },
    run: function (c) {
      const l = G.L(), j = l.job;
      let ch = 0.1 + (j.perf - 50) / 60;
      if (G.is('ambitieux')) ch += 0.1;
      if (G.is('charismatique')) ch += 0.05;
      c.r.boss = G.role('boss');
      if (L.chance(G.luck(ch)) && G.promote()) { c.v.t = L.esc(G.jobTitle()); return R('Promotion accordée ! Tu deviens <b>{t}</b>.', { b: 7, c: 1 }, { k: 'big' }); }
      return R('{Boss} te dit que « ce n’est pas encore le moment ». Tu attendras.', { b: -3 }, { k: 'bad' });
    }
  });
  A.quit = function () {
    const l = G.L();
    if (!l.job) return null;
    const c = G.ctx(); c.v = { t: L.esc(G.jobTitle()) };
    G.endJob('quit');
    const o = G.say('Tu démissionnes de ton poste de {t}. Tu claques la porte (doucement, elle est vitrée).', { b: 2 }, c);
    o.title = 'Démission';
    G.afterAction();
    return o;
  };
  A.retire = function () {
    const l = G.L();
    if (!l.job || l.me.age < 62) return null;
    G.retire();
    const c = G.ctx(); c.v = { p: L.money(l.pension) };
    const o = G.say('Pot de départ, discours ému, mug offert : te voilà à la retraite ! Pension : {p} par an.', { b: 6 }, c, 'big');
    o.title = 'Retraite';
    G.afterAction();
    return o;
  };
  A.stopSchool = function () {
    const l = G.L();
    if (l.me.age < 16 || !G.isStudent()) return null;
    l.edu.st = 'fini'; l.edu.sup = null; l.edu.cap = null; l.edu.clubs = [];
    const o = G.say('Tu arrêtes les études. Adieu les cours, bonjour la vraie vie.', { b: 2 }, null);
    o.title = 'Fin des études';
    G.afterAction();
    return o;
  };
  A.studyAgain = function () {
    const l = G.L();
    if (l.me.age < 17 || G.isStudent() || l.queue.length) return false;
    l.queue.push({ k: 'q', t: 'sup', tried: [] });
    return true;
  };

  // ---------- emploi : candidatures et entretiens ----------
  A.applyWhy = function (id) {
    const l = G.L();
    if (l.lonely) return 'Solitude profonde';
    if (l.prison) return 'En prison';
    if (l.job && l.job.id === id) return 'C’est ton poste actuel';
    if (G.isDone('apply:' + id)) return 'Déjà postulé cette année';
    if (G.apLeft() <= 0) return A.NOTIME;
    if (!G.canApply(id)) return 'Profil incomplet';
    if (D.job(id).cat !== 'petit' && G.isStudent() && l.edu.st !== 'sup') return 'Termine d’abord l’école';
    return '';
  };
  A.QUESTIONS = [
    { q: 'Parlez-moi de vous.', a: [
      { l: '« Je suis quelqu’un de très motivé. »', s: function () { return 0.05; }, r: 'Le recruteur hoche la tête. Il a entendu ça 40 fois aujourd’hui.' },
      { l: 'Raconter ta vie depuis la maternelle', s: function (l) { return l.sk.eloquence >= 40 ? 0.1 : -0.1; }, r: 'Vingt minutes plus tard, tu en es au CE2.' },
      { l: '« Euh… je m’appelle {prenom}. »', s: function () { return G.is('drole') ? 0.02 : -0.08; }, r: 'Silence. Le recruteur attend la suite. Il n’y a pas de suite.' }] },
    { q: 'Quel est votre plus grand défaut ?', a: [
      { l: '« Je suis trop perfectionniste. »', s: function () { return 0; }, r: 'Le recruteur coche une case. La case « cliché ».' },
      { l: '« Je mange les post-it quand je stresse. »', s: function () { return G.is('drole') ? 0.15 : -0.1; }, r: 'Le recruteur éloigne discrètement son bloc de post-it.' },
      { l: '« Je n’ai aucun défaut. »', s: function () { return G.is('charismatique') || G.is('egoiste') ? 0.08 : -0.08; }, r: 'Le recruteur lève un sourcil. Un seul.' }] },
    { q: 'Où vous voyez-vous dans cinq ans ?', a: [
      { l: '« À votre place. »', s: function () { return G.is('ambitieux') ? 0.12 : -0.05; }, r: 'Le recruteur rit jaune. Très jaune.' },
      { l: '« Ici, heureux·se et utile. »', s: function () { return 0.06; }, r: 'Réponse sage. Le recruteur sourit.' },
      { l: '« Sur une île, avec un perroquet. »', s: function () { return G.is('drole') ? 0.08 : -0.12; }, r: 'Le recruteur note « perroquet » dans ton dossier.' }] },
    { q: 'Pourquoi devrions-nous vous embaucher ?', a: [
      { l: 'Lister tes compétences', s: function (l, j) { const sk = j.req.sk || {}; const ks = Object.keys(sk); return ks.length && ks.every(function (k) { return l.sk[k] >= sk[k] + 10; }) ? 0.12 : 0.02; }, r: 'Tu déroules ton CV comme un pro.' },
      { l: '« Parce que j’ai besoin d’argent. »', s: function () { return G.is('honnete') ? 0.05 : -0.05; }, r: 'Honnête, au moins.' },
      { l: '« Ma mère m’a dit de postuler. »', s: function () { return -0.15; }, r: 'Le recruteur demande si ta mère est disponible pour le poste.' }] },
    { q: 'Que savez-vous de notre entreprise ?', a: [
      { l: '« Tout, j’ai lu votre site en entier. »', s: function () { return 0.08; }, r: 'Le recruteur est impressionné. Lui ne l’a jamais lu.' },
      { l: '« Vous avez un joli logo. »', s: function () { return G.is('drole') ? 0.05 : -0.05; }, r: 'C’est vrai, le logo est joli.' },
      { l: '« C’est quoi déjà, votre nom ? »', s: function () { return -0.2; }, r: 'Aïe.' }] },
    { q: 'Racontez-moi un conflit que vous avez géré.', a: [
      { l: '« Je suis resté·e calme et j’ai écouté. »', s: function () { return G.is('calme') ? 0.12 : 0.04; }, r: 'Le recruteur note « maturité ».' },
      { l: '« J’ai crié plus fort. »', s: function () { return G.is('colerique') ? -0.15 : -0.08; }, r: 'Le recruteur recule légèrement sa chaise.' },
      { l: '« J’ai apporté des croissants. »', s: function () { return 0.08; }, r: 'Le recruteur hoche la tête, ému. Les croissants règlent tout.' }] },
    { q: 'Si vous étiez un animal, lequel seriez-vous ?', a: [
      { l: '« Un lion. »', s: function () { return G.is('charismatique') ? 0.08 : 0; }, r: 'Rugissement intérieur.' },
      { l: '« Un paresseux. »', s: function () { return G.is('drole') ? 0.05 : -0.06; }, r: 'Le recruteur apprécie la franchise, moins le message.' },
      { l: '« Une huître. Je préfère ne pas répondre. »', s: function () { return G.is('drole') ? 0.1 : -0.05; }, r: 'Le recruteur éclate de rire malgré lui.' }] },
    { q: 'Quelles sont vos prétentions salariales ?', a: [
      { l: '« Le salaire prévu me convient. »', s: function () { return 0.05; }, r: 'Le recruteur est soulagé.' },
      { l: '« Le double. »', s: function () { return G.is('egoiste') || G.is('ambitieux') ? 0.04 : -0.1; }, raise: 1.1, r: 'Le recruteur s’étouffe avec son café.' },
      { l: '« Payez-moi en tickets resto. »', s: function () { return G.is('drole') ? 0.02 : -0.05; }, r: 'Le recruteur ne sait pas si c’est une blague.' }] },
    { q: 'Savez-vous travailler en équipe ?', a: [
      { l: '« Oui, j’adore les gens. »', s: function () { return G.is('bienveillant') ? 0.1 : 0.03; }, r: 'Le recruteur sourit.' },
      { l: '« Je préfère travailler seul·e. »', s: function () { return G.is('timide') ? 0.03 : -0.05; }, r: 'Le recruteur note « ours ».' },
      { l: '« Ça dépend de l’équipe. »', s: function () { return 0; }, r: 'Réponse diplomatique.' }] }
  ];
  A.interview = function () { return L.shuffle(A.QUESTIONS).slice(0, 2); };
  A.apply = function (id, answers) {
    const l = G.L(), d = D.job(id);
    if (A.applyWhy(id)) return null;
    G.spend();
    G.mark('apply:' + id);
    let score = 0, raise = 1;
    (answers || []).forEach(function (a) { if (!a || typeof a.s !== 'function') return; score += a.s(l, d); if (a.raise) raise *= a.raise; });
    const p = G.hireChance(id, score);
    const c = G.ctx(); c.v = { t: L.esc(L.gs(d.lv ? d.lv[0] : d.n, l.me.sex)) };
    let o;
    if (L.chance(G.luck(p))) {
      G.hire(id, raise);
      c.v.s = L.money(G.salary());
      o = G.say('[Embauché|Embauchée] ! Tu deviens <b>{t}</b>. Salaire : {s} par an.', { b: 7 }, c, 'good');
      o.ok = true;
    } else {
      o = G.say('Candidature refusée pour le poste de {t}. « Nous gardons votre CV précieusement. » Il est déjà à la poubelle.', { b: -2 }, c, 'bad');
      o.ok = false;
    }
    o.title = o.ok ? 'Embauche' : 'Refus';
    G.afterAction();
    return o;
  };

  // ---------- biens ----------
  A.buyWhy = function (id) {
    const l = G.L(), d = D.item(id);
    if (!D.itemName(d, l.year)) return null;
    if (l.me.age < d.age) return 'Dès ' + d.age + ' ans';
    if (l.prison) return 'En prison';
    if (d.permis && !l.permis) return 'Permis requis';
    if (d.once && l.flags['buy:' + id]) return 'Déjà acheté';
    if (G.owns(id)) return d.sub ? 'Déjà abonné·e' : 'Déjà à toi';
    if (G.apLeft() <= 0) return A.NOTIME;
    if (l.money < d.price) return 'Pas assez d’argent';
    return '';
  };
  A.buy = function (id) {
    if (A.buyWhy(id) !== '') return null;
    const l = G.L();
    if (D.item(id).once) l.flags['buy:' + id] = 1;
    G.spend();
    const o = G.buy(id);
    o.title = 'Achat';
    G.afterAction();
    return o;
  };
  A.petWhy = function (id) {
    const l = G.L(), d = D.pet(id);
    if (d.yr && l.year < d.yr) return null;
    if (l.me.age < 6) return 'Dès 6 ans';
    if (l.money < d.price) return 'Pas assez d’argent';
    if (G.isDone('pet')) return 'Une adoption par an';
    if (G.apLeft() <= 0) return A.NOTIME;
    return '';
  };
  A.adopt = function (id) {
    if (A.petWhy(id) !== '') return null;
    const d = D.pet(id);
    G.spend();
    G.mark('pet');
    const p = G.adopt(id);
    const c = G.ctx({ x: p }); c.v = { n: d.n.toLowerCase() };
    const o = G.say('Tu adoptes {x.n} ({n}). Coup de foudre immédiat.', { m: -d.price, b: 6 }, c, 'good');
    o.title = 'Adoption';
    G.afterAction();
    return o;
  };
  A.adoptChildWhy = function () {
    const l = G.L();
    if (l.me.age < 25) return 'Dès 25 ans';
    if (l.money < 6000) return 'Pas assez d’argent';
    if (G.isDone('adoptkid')) return 'Une démarche par an';
    if (G.apLeft() <= 0) return A.NOTIME;
    return '';
  };
  A.adoptChild = function () {
    if (A.adoptChildWhy()) return null;
    G.spend();
    G.mark('adoptkid');
    const l = G.L();
    const ok = L.chance(0.55);
    let o;
    if (ok) {
      const k = G.haveChild(G.partner());
      k.age = L.ri(0, 6);
      k.kx = { sk: {}, tr: {} };
      const c = G.ctx({ x: k });
      o = G.say('L’adoption est acceptée ! {X.n}, {x:un petit garçon|une petite fille} de ' + k.age + ' an' + (k.age > 1 ? 's' : '') + ', entre dans ta vie.', { m: -6000, b: 10 }, c, 'big');
      l.queue.push({ k: 'q', t: 'bebeedu', id: k.id });
    } else o = G.say('Le dossier d’adoption est encore à l’étude. Les délais sont longs.', { b: -1 }, null);
    o.title = 'Adoption';
    G.afterAction();
    return o;
  };
  A.moveWhy = function (id) {
    const l = G.L(), h = D.home(id);
    if (l.home === id) return 'Tu y habites';
    if (h.id === 'parents') return G.parents().length || (l.me.age < 25 && G.alive('gp').length) ? '' : 'Plus de parents';
    if (l.me.age < 18 && !(l.me.age >= 16 && l.job)) return 'Dès 18 ans (ou 16 avec un emploi)';
    if (h.student && l.edu.st !== 'sup') return 'Réservé aux étudiants';
    const cost = G.homeCost(id);
    if (h.own) {
      if (l.money >= cost) return '';
      if (!l.job) return 'Il faut un emploi pour le prêt';
      if (l.money < cost * 0.1) return 'Apport de 10 % requis';
      if (l.loan) return 'Déjà un prêt en cours';
      return '';
    }
    if (l.money < cost * 0.25 && !l.job) return 'Il faut un emploi ou de l’épargne';
    return '';
  };
  A.move = function (id) {
    if (A.moveWhy(id) !== '') return null;
    if (G.isDone('move') || G.apLeft() <= 0) return null;
    G.spend();
    G.mark('move');
    const o = G.move(id);
    o.title = 'Logement';
    G.afterAction();
    return o;
  };
  A.cityWhy = function () {
    const l = G.L();
    if (l.me.age < 18) return 'Dès 18 ans';
    if (G.isDone('city')) return 'Un déménagement par an';
    if (G.apLeft() <= 0) return A.NOTIME;
    if (l.prison) return 'En prison';
    return '';
  };
  A.moveCity = function (name) {
    if (A.cityWhy() || name === G.L().city) return null;
    G.spend();
    G.mark('city');
    const o = G.moveCity(name);
    o.title = 'Déménagement';
    G.afterAction();
    return o;
  };
  A.permisWhy = function () {
    const l = G.L();
    const min = l.year >= 2024 ? 17 : 18;
    if (l.permis) return null;
    if (l.me.age < min) return 'Dès ' + min + ' ans';
    if (G.isDone('permis')) return 'Un passage par an';
    if (G.apLeft() <= 0) return A.NOTIME;
    if (l.prison) return 'En prison';
    const paid = l.me.age < 21 && l.home === 'parents' && D.wealth(l.wealth).help >= 0.35;
    if (!paid && l.money < 1800) return 'Pas assez d’argent (1 800 €)';
    return '';
  };
  A.permis = function () {
    if (A.permisWhy() !== '') return null;
    G.spend();
    G.mark('permis');

    const l = G.L();
    const paid = l.me.age < 21 && l.home === 'parents' && D.wealth(l.wealth).help >= 0.35;
    let ch = 0.55 + l.st.h / 400;
    if (G.is('calme')) ch += 0.15;
    if (G.is('colerique')) ch -= 0.1;
    const ok = L.chance(G.luck(ch));
    if (ok) l.permis = 1;
    const o = G.say(ok ? 'Permis de conduire en poche ! Tu fais trois fois le tour du rond-point pour fêter ça.' : 'Recalé{e} au permis : tu as calé quatre fois et grillé un stop. L’inspecteur prie encore.', { m: paid ? 0 : -1800, b: ok ? 6 : -3 }, null, ok ? 'good' : 'bad');
    if (paid) G.log('Tes parents ont payé l’auto-école.');
    o.title = 'Permis de conduire';
    G.afterAction();
    return o;
  };
})(window.LP);
