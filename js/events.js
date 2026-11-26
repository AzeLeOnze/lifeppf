/* LifePPF — les happenings de la vie : moteur de tirage + contenu (selon l'âge, la famille, l'école, le travail, la ville, l'époque). */
(function (L) {
  'use strict';
  const D = L.D, G = L.G;
  const EV = L.EV = { list: [], byId: {} };
  function ev(o) { EV.list.push(o); EV.byId[o.id] = o; }
  EV.get = function (id) { return EV.byId[id]; };

  const CAT = {
    bebe: ['PETITE ENFANCE', 'c'], fam: ['FAMILLE', 'c'], ecole: ['ÉCOLE', 'y'], amour: ['AMOUR', 'm'], amis: ['AMIS', 'c'],
    travail: ['TRAVAIL', 'y'], sante: ['SANTÉ', 'g'], argent: ['ARGENT', 'y'], lol: ['ABSURDE', 'b'], vie: ['LA VIE', 'm'],
    danger: ['TENTATION', 'r'], ville: ['TA VILLE', 'c'], epoque: ['L’ÉPOQUE', 'b'], prison: ['PRISON', 'r']
  };

  // ---------- moteur ----------
  function eligible(e, l) {
    const a = l.me.age;
    if (e.manual) return null;
    if (e.a && (a < e.a[0] || a > e.a[1])) return null;
    if (e.yr && (l.year < e.yr[0] || l.year > e.yr[1])) return null;
    if (e.once && l.flags['ev:' + e.id]) return null;
    if (!e.once && l.evLast[e.id] != null && a - l.evLast[e.id] < (e.cd || (e.a && e.a[1] - e.a[0] > 60 ? 14 : 8))) return null;
    if (!!l.prison !== !!e.prison) return null;
    if (e.tag && (' ' + D.city(l.city).tags + ' ').indexOf(' ' + e.tag + ' ') < 0) return null;
    const c = G.ctx();
    if (e.need) for (let i = 0; i < e.need.length; i++) { const p = G.role(e.need[i]); if (!p) return null; c.r[e.need[i]] = p; }
    if (e.mk) Object.keys(e.mk).forEach(function (k) { c.r[k] = G.tmp(e.mk[k]); });
    if (e.if && !e.if(c, l)) return null;
    return c;
  }
  function weight(e) {
    let w = e.w || 10;
    if (e.a && e.a[1] - e.a[0] > 60) w *= 0.55; // les happenings « tous âges » se font plus discrets
    if (e.wt) Object.keys(e.wt).forEach(function (t) { if (G.is(t)) w *= e.wt[t]; });
    return w;
  }
  EV.yearly = function (l) {
    const a = l.me.age;
    const n = a < 3 ? 1 : 1 + (L.chance(0.6) ? 1 : 0) + (L.chance(0.22) ? 1 : 0);
    const used = {};
    for (let i = 0; i < n; i++) {
      const cands = [];
      EV.list.forEach(function (e) { if (used[e.id]) return; const c = eligible(e, l); if (c) cands.push({ e: e, c: c }); });
      const pick = L.wpick(cands, function (x) { return weight(x.e); });
      if (!pick) break;
      used[pick.e.id] = 1;
      EV.fire(pick.e, pick.c);
    }
  };
  EV.fire = function (e, c) {
    const l = G.L();
    l.evLast[e.id] = l.me.age;
    if (e.once) l.flags['ev:' + e.id] = 1;
    c.v = e.vars ? e.vars(c, l) || {} : {};
    if (e.ch) {
      const roles = {};
      Object.keys(c.r).forEach(function (k) { const p = c.r[k]; roles[k] = p.tmp ? { tmp: p } : p.id; });
      l.queue.push({ k: 'ev', id: e.id, r: roles, v: c.v, a: l.me.age });
      return;
    }
    if (e.run) { const r = e.run(c, l); if (r === false) return; if (r && r.t) return G.say(r.t, r.fx, c, r.k || e.kind); }
    G.say(e.t, e.fx, c, e.kind);
  };
  EV.trigger = function (id, roles, vars) {
    const l = G.L(), e = EV.get(id);
    if (!e) return;
    const r = {};
    Object.keys(roles || {}).forEach(function (k) { const p = roles[k]; r[k] = p.tmp ? { tmp: p } : p.id; });
    l.queue.push({ k: 'ev', id: id, r: r, v: vars || {}, a: l.me.age });
  };
  EV.ctxOf = function (q) {
    const c = G.ctx();
    Object.keys(q.r || {}).forEach(function (k) { const v = q.r[k]; c.r[k] = typeof v === 'object' ? v.tmp : G.byId(v); });
    c.v = q.v || {};
    return c;
  };
  function choices(e, c) {
    const l = G.L();
    return e.ch.map(function (ch, i) { return { ch: ch, i: i }; }).filter(function (x) { return !x.ch.if || x.ch.if(c, l); });
  }
  EV.view = function (q) {
    const e = EV.get(q.id), c = EV.ctxOf(q);
    const cat = CAT[e.cat] || CAT.vie;
    return {
      kicker: cat[0] + ' · ' + (q.a != null ? q.a : G.L().me.age) + ' ANS', ink: cat[1],
      title: e.h || 'Un moment de vie', text: L.T(e.t, c), q: e.q ? L.T(e.q, c) : '',
      opts: choices(e, c).map(function (x) { return { id: x.i, l: L.T(x.ch.l, c), sub: x.ch.sub ? L.T(x.ch.sub, c) : '' }; })
    };
  };
  EV.resolve = function (q, id) {
    const l = G.L(), e = EV.get(q.id), c = EV.ctxOf(q);
    const x = choices(e, c).find(function (y) { return String(y.i) === String(id); });
    if (!x) return null;
    l.queue.shift();
    const ch = x.ch;
    let out = ch;
    if (ch.p != null) { const p = typeof ch.p === 'function' ? ch.p(c, l) : ch.p; out = (L.chance(G.luck(p)) ? ch.ok : ch.ko) || {}; }
    if (ch.tr) G.fx({ tr: ch.tr }, c);
    if (ch.run && out !== ch) ch.run(c, l);
    if (out.run) out.run(c, l);
    const res = L.T(out.t || '', c);
    const d = G.fx(out.fx, c);
    G.log(L.T(e.t, c) + ' <span class="ch">' + L.T(ch.l, c) + '</span> ' + res, d, out.k || e.kind);
    G.afterAction();
    return { t: res, d: d, title: e.h || 'Un moment de vie', pick: L.T(ch.l, c) };
  };

  // petits raccourcis
  function keep(role, rel, rq) { return function (c) { const p = c.r[role]; if (p) G.keep(p, rel, rq); }; }
  function love(role) { return function (c) { const p = c.r[role]; if (p && !G.partner()) G.date(p); }; }
  function money(a, b) { return function () { return { n: L.ri(a, b) }; }; }
  const has = function (id) { return function (c, l) { return l.items.some(function (x) { return x.id === id; }); }; };
  const notHas = function (id) { return function (c, l) { return !l.items.some(function (x) { return x.id === id; }); }; };
  const working = function (c, l) { return !!l.job; };
  const student = function (c, l) { return l.edu.st === 'sup'; };
  const alone = function (c, l) { return l.home !== 'parents'; };

  // =====================================================================
  //  BÉBÉ (1–2 ans)
  // =====================================================================
  ev({ id: 'premier-mot', a: [1, 2], once: 1, cat: 'bebe', need: ['par'], vars: function () { return { w: L.pick(D.FIRST_WORDS) }; }, t: 'Ton premier mot : « {w} ». {Par} filme la scène et l’envoie à toute la famille, même aux cousins qu’on ne voit jamais.', fx: { b: 3, s: 1, rq: { par: 3 } } });
  ev({ id: 'premiers-pas', a: [1, 1], once: 1, w: 14, cat: 'bebe', t: 'Tes premiers pas ! Tu traverses le salon comme un pingouin pressé et tu finis dans le panier du chien.', fx: { h: 1, b: 3 } });
  ev({ id: 'sable', a: [1, 3], cat: 'bebe', t: 'Tu manges une poignée de sable au parc. Verdict : croquant, mais décevant.', fx: { h: -1, b: 1 } });
  ev({ id: 'puree', a: [1, 2], cat: 'bebe', need: ['gp'], t: 'Tu envoies ta purée de carottes sur {gp}. Toute la famille rit. Sauf {gp.n}.', fx: { b: 2, rq: { gp: -2 } } });
  ev({ id: 'nuits', a: [1, 1], cat: 'bebe', need: ['par'], t: 'Tu pleures toutes les nuits à 3 h pile. {Par} ressemble désormais à un zombie qui boit son café à la louche.', fx: { rq: { par: -2 } } });
  ev({ id: 'canard', a: [1, 3], cat: 'bebe', t: 'Au bain, tu découvres que les canards en plastique ne savent pas nager sous l’eau. Grosse déception existentielle.', fx: { b: -1, tr: { curieux: 1 } } });
  ev({ id: 'creche', a: [1, 2], once: 1, cat: 'bebe', mk: { x: 'peer' }, t: 'À la crèche, tu mords [un bébé|un bébé] nommé {x.n}. Vous devenez inséparables.', fx: { s: 3, b: 2, fn: keep('x', 'ami', 55) } });
  ev({ id: 'doudou', a: [1, 4], once: 1, cat: 'bebe', need: ['par'], t: 'Tu perds ton doudou au supermarché. {Par} retourne tout le magasin pour le retrouver. Mission accomplie, rayon surgelés.', fx: { b: 2, rq: { par: 4 } } });
  ev({ id: 'chien-bebe', a: [1, 4], cat: 'bebe', need: ['pet'], t: '{Pet.n} te lèche la figure. Tu ris si fort que tu as le hoquet pendant une heure.', fx: { b: 3 } });
  ev({ id: 'tele-bebe', a: [1, 3], cat: 'bebe', t: 'Tu appuies sur toutes les touches de la télécommande. La télé parle maintenant en allemand. Personne ne sait l’en empêcher.', fx: { b: 2, tr: { curieux: 1 } } });

  // =====================================================================
  //  PETITE ENFANCE (3–5)
  // =====================================================================
  ev({
    id: 'mur', a: [3, 6], cat: 'fam', need: ['par'], h: 'Chef-d’œuvre mural',
    t: 'Tu as dessiné un dinosaure au feutre indélébile sur le mur du salon. {Par} arrive dans la pièce.', q: 'Que fais-tu ?',
    ch: [
      { l: 'J’avoue tout', t: '{Par.n} soupire, mais prend une photo du dinosaure. Tu es [privé|privée] de dessin animé.', fx: { b: -1 }, tr: { honnete: 3 } },
      { l: 'J’accuse le chat', p: 0.5, tr: { menteur: 3 }, ok: { t: 'Ça passe. Le chat est privé de croquettes. Tu ressens une légère culpabilité.', fx: { b: 1 } }, ko: { t: '{Par.n} remarque que le chat n’a pas de pouces. Double punition.', fx: { b: -3 } } },
      { l: 'C’est de l’art', t: '{Par.n} rit tellement que tu échappes à la punition. Le dinosaure reste au mur.', fx: { b: 2 }, tr: { creatif: 3, drole: 1 } }
    ]
  });
  ev({
    id: 'caprice', a: [3, 7], cat: 'fam', need: ['par'], h: 'Rayon bonbons',
    t: 'Au supermarché, tu veux absolument un paquet de bonbons en forme de dentiers.', q: 'Ta stratégie ?',
    ch: [
      { l: 'Hurler en te roulant par terre', p: 0.4, tr: { colerique: 2, egoiste: 1 }, ok: { t: '{Par.n} cède pour avoir la paix. Victoire.', fx: { b: 2 } }, ko: { t: 'Tu repars les mains vides et la gorge sèche.', fx: { b: -2, rq: { par: -2 } } } },
      { l: 'Demander gentiment', p: 0.6, tr: { charismatique: 2, bienveillant: 1 }, ok: { t: '« Bon, d’accord, parce que tu l’as demandé poliment. »', fx: { b: 2, rq: { par: 2 } } }, ko: { t: 'Non, c’est non. Mais {par.n} est fier{par.e} de toi.', fx: { rq: { par: 2 } } } },
      { l: 'Les cacher dans le caddie', p: 0.5, tr: { menteur: 2, rebelle: 1 }, ok: { t: 'Personne ne les remarque avant la caisse. Trop tard, ils sont payés.', fx: { b: 3 } }, ko: { t: '{Par.n} les retrouve sous les brocolis.', fx: { b: -1 } } }
    ]
  });
  ev({ id: 'ami-imaginaire', a: [3, 6], once: 1, cat: 'bebe', vars: function () { return { n: L.pick(['Bidule', 'Gros Pierre', 'Monsieur Patate', 'Zorglouf', 'Capitaine Nuage']) }; }, t: 'Tu as un ami imaginaire : {n}. Il est violet, mesure trois mètres et déteste les petits pois. Toi aussi, quel hasard.', fx: { b: 3, tr: { creatif: 3 } } });
  ev({ id: 'souris', a: [5, 7], once: 1, cat: 'bebe', vars: money(1, 5), t: 'Tu perds ta première dent ! La petite souris laisse {n} € sous ton oreiller. Tu envisages de vendre toutes tes dents.', fx: function (c) { return { m: c.v.n, b: 2, tr: { ambitieux: 1 } }; } });
  ev({
    id: 'pere-noel', a: [5, 8], once: 1, cat: 'fam', need: ['par'], h: 'Nuit de Noël',
    t: 'À 2 h du matin, tu surprends {par} en train de déposer les cadeaux sous le sapin.', q: 'Et maintenant ?',
    ch: [
      { l: 'Faire semblant de dormir', t: 'Tu gardes le secret. Les cadeaux continueront d’arriver. Stratège.', fx: { b: 1 }, tr: { menteur: 1, ambitieux: 1 } },
      { l: 'Hurler « IMPOSTEUR ! »', t: '{Par.n} est démasqué{par.e}. La magie de Noël meurt en direct.', fx: { b: -2, rq: { par: -2 } }, tr: { rebelle: 1, honnete: 2 } },
      { l: 'Proposer ton aide', t: 'Vous emballez les derniers cadeaux ensemble en chuchotant. Meilleur Noël de ta vie.', fx: { b: 4, rq: { par: 6 } }, tr: { bienveillant: 3 } }
    ]
  });
  ev({ id: 'noir', a: [3, 6], cat: 'bebe', need: ['par'], t: 'Tu as peur du noir. {Par} installe une veilleuse en forme de méduse. Maintenant, les ombres ressemblent à des méduses. Ce n’est pas mieux.', fx: { b: -1 } });
  ev({ id: 'sieste', a: [3, 5], cat: 'ecole', t: 'À la maternelle, tu refuses la sieste et tu lances une révolte des lits. Trois enfants te suivent.', fx: { s: 2, tr: { rebelle: 2, charismatique: 2 } } });
  ev({ id: 'kermesse', a: [4, 9], once: 1, cat: 'vie', t: 'À la kermesse, tu gagnes un poisson rouge à la pêche aux canards. Tu l’appelles {n}.', vars: function () { return { n: L.pick(D.pet('poisson').names) }; }, fx: { b: 3, fn: function (c) { G.adopt('poisson', c.v.n); } } });
  ev({ id: 'cabane', a: [4, 10], cat: 'vie', t: 'Tu construis une cabane avec les coussins du canapé. Elle s’effondre sur toi. Tu déclares que c’était prévu.', fx: { b: 2, tr: { creatif: 2 } } });
  ev({ id: 'maternelle-ami', a: [3, 5], cat: 'amis', mk: { x: 'peer' }, t: 'À la maternelle, {x.n} t’offre la moitié de son biscuit. C’est le début d’une grande amitié.', fx: { s: 3, b: 2, fn: keep('x', 'ami', 60) } });
  ev({
    id: 'partage-jouet', a: [3, 6], cat: 'amis', mk: { x: 'peer' }, h: 'Le camion rouge',
    t: '{X.n} veut jouer avec ton camion de pompiers préféré.', q: 'Tu le prêtes ?',
    ch: [
      { l: 'Oui, on joue ensemble', t: 'Vous organisez un sauvetage de peluches. {X.n} devient ton copain de récré.', fx: { s: 3, b: 2, fn: keep('x', 'ami', 55) }, tr: { bienveillant: 3 } },
      { l: 'Non, il est à moi', t: 'Tu serres ton camion très fort. {X.n} va pleurer plus loin.', fx: { b: 1, s: -1 }, tr: { egoiste: 3 } },
      { l: 'Échanger contre son goûter', t: 'Marché conclu. Tu as maintenant un camion ET un goûter.', fx: { b: 2 }, tr: { ambitieux: 2, egoiste: 1 } }
    ]
  });

  // =====================================================================
  //  ENFANCE (6–10)
  // =====================================================================
  ev({
    id: 'gouter', a: [6, 10], cat: 'amis', mk: { x: 'peer' }, h: 'Le goûter',
    t: 'À la récré, {x.n} n’a pas de goûter et fixe ton paquet de gâteaux.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Partager', t: '{X.n} devient ton ami{x.e} pour la vie. Ou au moins jusqu’à jeudi.', fx: { s: 3, b: 1, fn: keep('x', 'ami', 60) }, tr: { bienveillant: 3 } },
      { l: 'Tout manger lentement', t: 'Délicieux. {X.n} te regarde comme un chiot abandonné.', fx: { b: 2, s: -1 }, tr: { egoiste: 3 } },
      { l: 'Vendre la moitié 50 centimes', t: 'Affaire conclue. Ton sens des affaires est inquiétant pour ton âge.', fx: { m: 1, s: 1 }, tr: { ambitieux: 2, egoiste: 1 } }
    ]
  });
  ev({
    id: 'boue', a: [6, 12], cat: 'amis', mk: { x: 'peer' }, h: 'Bataille de boue',
    t: '{X.n} te pousse dans une flaque de boue devant toute la cour.', q: 'Ta réaction ?',
    ch: [
      { l: 'Riposter', p: function (c, l) { return 0.45 + l.sk.sport / 200; }, tr: { colerique: 2, rebelle: 1 }, ok: { t: '{X.n} finit dans la boue à son tour. Tu gagnes le respect de la cour.', fx: { s: 3, c: 2 } }, ko: { t: 'Tu finis encore plus dans la boue. Et chez le directeur.', fx: { h: -2, b: -3 } } },
      { l: 'Aller voir la maîtresse', t: '{X.n} est {x:puni|punie}. Toi, tu es [traité|traitée] de [rapporteur|rapporteuse] jusqu’à la fin de l’année.', fx: { s: -1 }, tr: { discipline: 2, honnete: 1 } },
      { l: 'En rire', t: 'Tu fais un ange dans la boue. Toute la cour rit avec toi, pas de toi.', fx: { s: 3, b: 1 }, tr: { drole: 3, calme: 2 } }
    ]
  });
  ev({
    id: 'harcelement', a: [8, 15], cat: 'ecole', mk: { x: 'peer' }, h: 'Témoin',
    t: '{X.n}, {x:un élève discret|une élève discrète} de ta classe, se fait harceler par une bande.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Prendre sa défense', p: 0.6, tr: { bienveillant: 3 }, ok: { t: 'La bande recule. {X.n} te regarde comme un super-héros.', fx: { s: 2, b: 3, fn: keep('x', 'ami', 70) } }, ko: { t: 'La bande se retourne contre toi pendant des semaines. Tu tiens bon.', fx: { b: -5, s: -3 } } },
      { l: 'Prévenir un adulte', t: 'Les parents sont convoqués. Le harcèlement s’arrête.', fx: { b: 1, fn: keep('x', 'ami', 55) }, tr: { bienveillant: 1, discipline: 2 } },
      { l: 'Regarder ailleurs', t: 'Tu détournes les yeux. Ça te reste en travers de la gorge.', fx: { b: -2 }, tr: { egoiste: 2, timide: 1 } },
      { l: 'Rejoindre la bande', t: 'Tu ricanes avec eux. Tu te sens [puissant|puissante], puis franchement minable.', fx: { s: 2, b: -3 }, tr: { egoiste: 3, colerique: 1 } }
    ]
  });
  ev({
    id: 'billet', a: [6, 15], cat: 'argent', h: 'Vingt euros', t: 'Tu trouves un billet de 20 € par terre, devant la boulangerie.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Le garder', t: 'Tu achètes 40 bonbons. Mal aux dents, mais quel bonheur.', fx: { m: 20, b: 3 }, tr: { egoiste: 1 } },
      { l: 'Le rapporter à la boulangère', t: 'La boulangère t’offre un croissant pour ta gentillesse. Le propriétaire du billet ne viendra jamais.', fx: { b: 2 }, tr: { honnete: 3, bienveillant: 1 } },
      { l: 'L’investir dans des cartes à collectionner', p: 0.3, tr: { ambitieux: 2 }, ok: { t: 'Tu tombes sur une carte ultra-rare. Elle vaut 150 € !', fx: { m: 150, b: 5 } }, ko: { t: 'Que des doublons. L’économie est cruelle.', fx: { b: -1 } } }
    ]
  });
  ev({ id: 'devoirs-chien', a: [7, 13], cat: 'ecole', need: ['pet'], if: function (c) { return c.r.pet.sp === 'chien'; }, t: 'Tu expliques à la maîtresse que {pet.n} a mangé tes devoirs. C’est la vérité. Personne ne te croit.', fx: { b: -1, g: -0.3, tr: { honnete: 1 } } });
  ev({ id: 'classe-verte', a: [8, 11], once: 1, cat: 'ecole', t: 'Classe verte à la montagne ! Tu vois une marmotte, tu perds une chaussure et tu reviens avec 14 nouveaux surnoms.', fx: { s: 4, b: 3, sk: { sciences: 1 } } });
  ev({ id: 'bras-casse', a: [6, 14], cat: 'sante', t: 'Tu tombes d’un arbre en voulant attraper un cerf-volant. Bras cassé. Tout le monde signe ton plâtre, même la directrice.', fx: { h: -4, s: 2, ill: 'fracture' }, kind: 'bad' });
  ev({ id: 'piscine', a: [6, 9], once: 1, cat: 'ecole', t: 'Cours de natation avec l’école. Tu bois la moitié de la piscine, mais tu finis par flotter.', fx: { h: 1, sk: { sport: 3 } } });
  ev({
    id: 'spectacle', a: [6, 11], cat: 'ecole', h: 'Spectacle de fin d’année', t: 'Pour le spectacle de fin d’année, on te donne le rôle de l’arbre numéro 3.', q: 'Comment joues-tu ?',
    ch: [
      { l: 'Avec une intensité dramatique', t: 'Tu vis le rôle. Une maman pleure au premier rang. Personne ne sait pourquoi.', fx: { c: 2, sk: { eloquence: 2 } }, tr: { creatif: 2 } },
      { l: 'En improvisant une réplique', p: 0.5, tr: { charismatique: 2, drole: 1 }, ok: { t: 'L’arbre numéro 3 dit « J’ai soif ». Toute la salle éclate de rire. Une étoile est née.', fx: { c: 3, s: 3 } }, ko: { t: 'Silence total. Un bébé pleure au fond de la salle.', fx: { b: -2 } } },
      { l: 'En faisant semblant d’être [malade|malade]', t: 'Tu restes à la maison. Le spectacle a lieu sans arbre numéro 3. Personne ne remarque rien.', fx: { b: -1 }, tr: { timide: 3 } }
    ]
  });
  ev({ id: 'jv-nuit', a: [8, 14], cat: 'vie', t: 'Tu joues aux jeux vidéo sous la couette jusqu’à 3 h du matin. Le lendemain, tu t’endors sur ta trousse.', fx: { b: 2, h: -1, g: -0.4, tr: { nonchalant: 1, rebelle: 1 } } });
  ev({ id: 'anniv-rate', a: [6, 12], cat: 'amis', mk: { x: 'peer' }, t: 'Tu organises ton anniversaire. Seul{x.e} {x.n} vient. Vous mangez tout le gâteau à deux. Meilleur anniversaire.', fx: { b: 1, s: 1, fn: keep('x', 'ami', 68) } });
  ev({ id: 'collection', a: [7, 13], cat: 'vie', vars: function () { return { o: L.pick(['cailloux qui ressemblent à des célébrités', 'capsules de bouteille', 'gommes parfumées', 'cartes de monstres', 'insectes morts (bien rangés)']) }; }, t: 'Tu commences une collection de {o}. Ta chambre ressemble maintenant à un musée bizarre.', fx: { b: 2, tr: { curieux: 2 } } });
  ev({ id: 'velo', a: [5, 8], once: 1, cat: 'vie', t: 'Tu fais du vélo sans les petites roues ! Pendant quatre mètres. Puis la haie.', fx: { h: -1, b: 3, sk: { sport: 1 } } });
  ev({
    id: 'journal', a: [7, 15], cat: 'fam', need: ['sib'], h: 'Journal intime', t: '{Sib} a lu ton journal intime à voix haute pendant le dîner.', q: 'Ta riposte ?',
    ch: [
      { l: 'Vengeance', t: 'Tu remplaces son shampooing par de la mayonnaise. Œil pour œil.', fx: { b: 2, rq: { sib: -6 } }, tr: { rebelle: 1, colerique: 2 } },
      { l: 'Pardonner', t: 'Tu pardonnes. {Sib.n} te donne ses frites pendant une semaine.', fx: { rq: { sib: 5 } }, tr: { bienveillant: 2, calme: 2 } },
      { l: 'Lire son journal à son tour', t: 'Tu découvres que {sib.n} a peur des pigeons. Une information précieuse.', fx: { b: 1 }, tr: { menteur: 1, rebelle: 1 } }
    ]
  });
  ev({ id: 'vase', a: [5, 16], cat: 'fam', need: ['sib'], t: '{Sib} et toi cassez un vase en jouant au ballon dans le salon. Vous jurez de ne rien dire. Le chat porte le chapeau.', fx: { rq: { sib: 5 }, b: 1, tr: { menteur: 1 } } });
  ev({ id: 'pull', a: [3, 14], cat: 'fam', need: ['gp'], t: '{Gp} te tricote un pull avec ton prénom dessus. Il gratte, il est orange, tu le portes quand même.', fx: { rq: { gp: 5 }, b: 1, c: -1 } });
  ev({ id: 'vache-poker', a: [5, 16], cat: 'fam', need: ['gp'], t: '{Gp} te raconte comment ton arrière-grand-père a gagné une vache au poker. Tu n’es pas [sûr|sûre] que ce soit vrai.', fx: { b: 2, rq: { gp: 3 } } });
  ev({ id: 'billet-gp', a: [6, 17], cat: 'fam', need: ['gp'], t: '{Gp} te glisse un billet de 10 € en cachette. « Ne dis rien à tes parents. »', fx: { m: 10, b: 2, rq: { gp: 3 } } });
  ev({ id: 'cles-frigo', a: [4, 17], cat: 'fam', need: ['mere', 'pere'], t: 'Tes parents se disputent pendant une heure pour savoir qui a perdu les clés. Elles étaient dans le frigo.', fx: { b: -1 } });
  ev({ id: 'parent-promo', a: [4, 17], cat: 'fam', need: ['par'], if: function (c) { return c.r.par.job && c.r.par.job !== 'chomage' && c.r.par.job !== 'foyer'; }, t: '{Par} a eu une promotion ! Pizza pour toute la famille.', fx: { b: 2 } });
  ev({ id: 'parent-chomage', a: [4, 17], cat: 'fam', need: ['par'], if: function (c) { return c.r.par.job && c.r.par.job !== 'chomage' && c.r.par.job !== 'foyer'; }, t: '{Par} a perdu son travail. L’ambiance est tendue à la maison, et les pâtes reviennent souvent.', fx: { b: -3, fn: function (c) { c.r.par.job = 'chomage'; } } });
  ev({ id: 'camping', a: [4, 15], cat: 'fam', mk: { x: 'peer' }, t: 'Vacances au camping. Il pleut 12 jours sur 14. Tu te fais {x:un ami néerlandais|une amie néerlandaise}, {x.n}, avec qui tu communiques par grimaces.', fx: { s: 2, b: 2, sk: { langues: 1 }, fn: keep('x', 'ami', 45) } });
  ev({ id: 'dinosaures', a: [6, 10], cat: 'ecole', t: 'Tu demandes à la maîtresse si elle a connu les dinosaures. Mot dans le cahier de liaison.', fx: { b: 1, tr: { rebelle: 1, drole: 2 } } });
  ev({ id: 'chorale', a: [6, 12], cat: 'ecole', t: 'Tu chantes tellement faux à la chorale qu’on te nomme « responsable des partitions ».', fx: { b: -1, sk: { musique: 1 }, tr: { drole: 1 } } });
  ev({ id: 'dentiste', a: [4, 12], cat: 'sante', t: 'Chez le dentiste, tu mords le dentiste. Il s’en remettra.', fx: { h: 1, tr: { colerique: 1 } } });
  ev({ id: 'poux', a: [5, 10], cat: 'sante', t: 'Épidémie de poux à l’école. Tu repars avec une coupe très, très courte.', fx: { c: -2, ill: 'poux' } });
  ev({
    id: 'animal-famille', a: [5, 14], once: 1, cat: 'fam', need: ['par'], if: function () { return !G.alive('pet').length; }, h: 'Un animal à la maison',
    t: 'Tu supplies tes parents d’adopter un animal. Tu as préparé un exposé avec des graphiques.', q: 'Tu demandes quoi ?',
    ch: [
      { l: 'Un chien', p: 0.5, ok: { t: 'Ils craquent ! Bienvenue à la maison, {d}.', fx: { b: 6, fn: function (c) { G.adopt('chien', c.v.d); } } }, ko: { t: '« Qui va le promener ? » Personne. Refusé.', fx: { b: -2 } } },
      { l: 'Un chat', p: 0.6, ok: { t: 'Accordé ! {c2} s’installe immédiatement sur le meilleur fauteuil.', fx: { b: 6, fn: function (c) { G.adopt('chat', c.v.c2); } } }, ko: { t: 'Ton père est allergique. Il éternue rien qu’en t’entendant dire « chat ».', fx: { b: -2 } } },
      { l: 'Un dragon', t: 'Refusé. Ils te proposent un poisson rouge. Tu l’appelles Dracarys.', fx: { b: 2, fn: function () { G.adopt('poisson', 'Dracarys'); } }, tr: { drole: 1 } }
    ],
    vars: function () { return { d: L.pick(D.pet('chien').names), c2: L.pick(D.pet('chat').names) }; }
  });
  ev({ id: 'pere-noel-fin', a: [7, 9], once: 1, cat: 'fam', t: 'Un camarade t’annonce que le Père Noël n’existe pas. Tu le traites de menteur. Puis tu réfléchis. Puis tu pleures un peu.', fx: { b: -2, tr: { curieux: 1 } } });
  ev({ id: 'piece-theatre', a: [8, 12], cat: 'vie', t: 'Tu écris une pièce de théâtre et tu forces toute la famille à la regarder. Durée : 2 h 15. Entracte compris.', fx: { b: 2, sk: { eloquence: 2 }, tr: { creatif: 2, charismatique: 1 } } });

  // =====================================================================
  //  ADOLESCENCE (11–17)
  // =====================================================================
  ev({ id: 'puberte', a: [11, 14], once: 1, w: 14, cat: 'sante', t: 'Puberté. Ta voix fait des montagnes russes et un bouton a élu domicile sur ton nez.', fx: { c: -4, b: -2 } });
  ev({
    id: 'crush', a: [11, 16], once: 1, w: 14, cat: 'amour', mk: { x: 'crush' }, h: 'Premier crush',
    t: 'Tu as un énorme crush sur {x.n}. Ton cœur fait du trampoline à chaque fois que {x.il} passe dans le couloir.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Lui écrire un mot', p: function (c, l) { return 0.35 + l.st.c / 200; }, tr: { charismatique: 2 }, ok: { t: '{X.n} répond « moi aussi » avec trois cœurs. Ton premier amour !', fx: { b: 8, fn: love('x') }, k: 'love' }, ko: { t: '{X.n} montre ton mot à toute la classe. Tu veux déménager sur la Lune.', fx: { b: -6, s: -2 } } },
      { l: 'Garder le secret', t: 'Tu gardes tout pour toi. Ton journal intime, lui, sait tout.', fx: { b: -1 }, tr: { timide: 3 } },
      { l: 'Envoyer un ami en messager', p: 0.4, tr: { timide: 1 }, ok: { t: 'Le messager revient avec un « oui » timide. Vous sortez ensemble !', fx: { b: 7, fn: love('x') }, k: 'love' }, ko: { t: 'Ton messager se trompe de personne. Très long malaise.', fx: { s: -1, b: -3 } } }
    ]
  });
  ev({
    id: 'telephone', a: [11, 14], once: 1, w: 12, yr: [1997, 2044], cat: 'fam', need: ['par'], if: function (c, l) { return !l.items.some(function (x) { return x.id === 'tel' || x.id === 'telluxe'; }); }, h: 'Le dossier téléphone',
    t: 'Tout le monde a un téléphone sauf toi. Tu prépares un dossier de six pages pour convaincre {par}.', q: 'Ta méthode ?',
    ch: [
      { l: 'Présenter le dossier', p: function (c, l) { return 0.4 + l.sk.eloquence / 150 + D.WEALTH.indexOf(D.wealth(l.wealth)) * 0.1; }, tr: { ambitieux: 1, charismatique: 1 }, ok: { t: '{Par.n} craque devant ta présentation. Premier téléphone !', fx: { b: 6, s: 2, fn: function (c, l) { G.L().items.push({ id: 'tel', y: G.L().year }); } } }, ko: { t: 'Refusé : « Tu en auras un quand tu le paieras toi-même. »', fx: { b: -3 } } },
      { l: 'Bouder pendant un mois', p: 0.35, tr: { colerique: 1, egoiste: 1 }, ok: { t: 'Ça marche. La stratégie est douteuse, mais efficace.', fx: { b: 5, fn: function () { G.L().items.push({ id: 'tel', y: G.L().year }); } } }, ko: { t: 'Un mois de bouderie pour rien. Ton record personnel, au moins.', fx: { b: -3, rq: { par: -4 } } } }
    ]
  });
  ev({
    id: 'cigarette', a: [12, 17], once: 1, cat: 'danger', mk: { x: 'peer' }, h: 'Derrière le gymnase',
    t: 'Derrière le gymnase, {x.n} te tend une cigarette. « Allez, tout le monde le fait. »', q: 'Tu fais quoi ?',
    ch: [
      { l: 'Refuser', t: 'Tu refuses. {X.n} hausse les épaules. Tes poumons te disent merci.', fx: { h: 1 }, tr: { discipline: 2, calme: 1 } },
      { l: 'Essayer', t: 'Tu tousses comme un vieux moteur diesel. Mais tu en reprends une le lendemain.', fx: { h: -2, s: 2, fn: function () { G.addict('tabac', 0.5); } }, tr: { rebelle: 3 } },
      { l: 'Faire semblant', t: 'Tu tiens la cigarette comme un crayon. Personne n’est dupe.', fx: { c: -1 }, tr: { menteur: 1, drole: 1 } }
    ]
  });
  ev({
    id: 'soiree', a: [14, 17], cat: 'danger', need: ['par'], mk: { x: 'peer' }, h: 'Soirée sans parents',
    t: 'Première soirée chez {x.n}, sans parents. Quelqu’un a apporté une bouteille suspecte.', q: 'Tu bois ?',
    ch: [
      { l: 'Oui', p: 0.6, tr: { rebelle: 3 }, ok: { t: 'Tu danses sur la table. Tu ne t’en souviens pas, mais tout le monde, si.', fx: { s: 4, b: 3, h: -2 } }, ko: { t: 'Tu finis la soirée la tête dans un bac à fleurs. {Par.n} vient te chercher. Ambiance.', fx: { h: -4, b: -3, rq: { par: -5 } } } },
      { l: 'Rester au soda', t: 'Tu restes lucide et tu filmes tout. Tu détiens désormais des secrets.', fx: { s: 2 }, tr: { discipline: 1, calme: 2 } },
      { l: 'Rentrer avant minuit', t: 'Tu rentres tôt. Tu rates la légendaire bataille de chips.', fx: { s: -1, rq: { par: 2 } }, tr: { timide: 2, discipline: 1 } }
    ]
  });
  ev({
    id: 'stage3e', a: [14, 15], once: 1, w: 30, cat: 'ecole', need: ['par'], if: function (c, l) { return l.edu.st === 'col' && l.edu.i === 11; }, h: 'Stage de 3e',
    t: 'Stage d’observation de 3e : une semaine pour découvrir le monde du travail.', q: 'Où vas-tu ?',
    ch: [
      { l: 'Au travail de {par.n}', t: 'Tu fais des photocopies et tu découvres que {par.n} a un surnom au bureau.', fx: { rq: { par: 4 }, sk: { eloquence: 1 } } },
      { l: 'À la boulangerie', t: 'Réveil à 4 h. Tu repars avec trois kilos de croissants ratés et un nouveau respect pour les boulangers.', fx: { h: -1, sk: { cuisine: 4 } }, tr: { discipline: 2 } },
      { l: 'Chez un architecte', t: 'Tu construis une maquette en carton. On te dit que tu as « l’œil ».', fx: { sk: { art: 3, logique: 2 } }, tr: { curieux: 2 } },
      { l: 'Au zoo', t: 'Un lama te crache dessus le premier jour. Le dernier jour, vous êtes amis.', fx: { b: 3, sk: { sciences: 2 } } },
      { l: 'Dans un garage', t: 'Tu changes ta première roue. Tu as du cambouis jusqu’aux oreilles.', fx: { sk: { bricolage: 4 } } },
      { l: 'Dans un journal', t: 'Tu écris un article sur le marché du dimanche. Il est publié en page 14, entre deux pubs.', fx: { sk: { eloquence: 3, langues: 1 } } }
    ]
  });
  ev({
    id: 'rumeur', a: [12, 17], yr: [2005, 9999], cat: 'amis', h: 'La rumeur', t: 'Une rumeur circule sur toi dans le groupe de la classe : tu aurais un troisième téton.', q: 'Comment réagis-tu ?',
    ch: [
      { l: 'Démentir', p: 0.45, ok: { t: 'Ton démenti calme tout le monde. Fin de l’affaire.', fx: { b: 1 } }, ko: { t: 'Plus tu démens, plus tout le monde y croit.', fx: { b: -3, s: -2 } } },
      { l: 'Assumer avec humour', t: 'Tu crées un compte fan de ton troisième téton. 400 abonnés. Rumeur détruite.', fx: { s: 3, c: 2 }, tr: { drole: 3 } },
      { l: 'Ignorer', t: 'La rumeur meurt d’elle-même au bout de deux semaines. Comme toutes les rumeurs.', fx: {}, tr: { calme: 3 } }
    ]
  });
  ev({
    id: 'tatouage', a: [16, 17], once: 1, cat: 'danger', h: 'Le tatouage', t: 'Tu veux absolument un tatouage. Tes parents disent non.', q: 'Alors ?',
    ch: [
      { l: 'Le faire en cachette', p: 0.5, tr: { rebelle: 3 }, ok: { t: 'Un petit dauphin sur la cheville. Personne n’a rien vu.', fx: { b: 3, c: 1 } }, ko: { t: 'Le tatoueur a écrit « Ne regrète rien ». Avec la faute. Tes parents l’ont vu.', fx: { b: -3, c: -1 } } },
      { l: 'Attendre tes 18 ans', t: 'Sage décision. Dans deux ans, tu ne voudras plus de dauphin.', fx: {}, tr: { discipline: 2 } }
    ]
  });
  ev({
    id: 'groupe', a: [13, 17], cat: 'amis', h: 'Le groupe de rock', t: 'Des copains montent un groupe de rock et cherchent du renfort.', q: 'Tu en es ?',
    ch: [
      { l: 'Rejoindre le groupe', t: 'Répétitions dans un garage. Vous jouez fort. Les voisins appellent la police deux fois.', fx: { s: 3, b: 3, sk: { musique: 4 } }, tr: { creatif: 3, rebelle: 1 } },
      { l: 'Devenir [manager|manageuse]', t: 'Tu décroches votre premier concert : la fête de la musique, devant la boulangerie.', fx: { s: 2, sk: { eloquence: 3 } }, tr: { ambitieux: 3 } },
      { l: 'Refuser', t: 'Tu préfères écouter la musique plutôt que la faire.', fx: {} }
    ]
  });
  ev({
    id: 'delegue', a: [11, 17], cat: 'ecole', mk: { x: 'peer' }, h: 'Élection des délégués', t: 'Élection des délégués de classe.', q: 'Tu te présentes ?',
    ch: [
      { l: 'Oui, avec un vrai programme', p: function (c, l) { return 0.3 + l.st.c / 200 + l.sk.eloquence / 200; }, tr: { ambitieux: 2, charismatique: 2 }, ok: { t: '[Élu|Élue] ! Ta promesse d’un distributeur de bonbons ne sera jamais tenue.', fx: { c: 3, s: 3, sk: { eloquence: 2 } } }, ko: { t: 'Battu{e} par {x.n}, qui a promis la fin des contrôles du lundi.', fx: { b: -2 } } },
      { l: 'Oui, en promettant n’importe quoi', p: 0.45, tr: { menteur: 3, charismatique: 1 }, ok: { t: 'Tu promets une piscine à vagues dans la cour. [Élu|Élue] à 92 %.', fx: { c: 3, s: 2 } }, ko: { t: 'Personne n’a cru à la piscine à vagues.', fx: { b: -1 } } },
      { l: 'Non merci', t: 'Tu votes blanc. Enfin, tu dessines un chat sur ton bulletin.', fx: {}, tr: { nonchalant: 2 } }
    ]
  });
  ev({ id: 'linguistique', a: [12, 17], once: 1, cat: 'ecole', t: 'Voyage linguistique en Angleterre. Ta famille d’accueil mange des haricots au petit-déjeuner. Tu reviens avec un accent bizarre.', fx: { sk: { langues: 5 }, b: 3, s: 2 } });
  ev({ id: 'colle', a: [11, 17], cat: 'ecole', wt: { rebelle: 2.5 }, t: 'Heure de colle pour avoir lancé ta trousse au plafond. Elle y est toujours.', fx: { b: -1, tr: { rebelle: 2 }, fn: function () { G.L().edu.warn++; } } });
  ev({
    id: 'prof-injuste', a: [11, 17], cat: 'ecole', h: 'Accusation', t: 'Ton prof de maths t’accuse d’avoir copié. Tu n’as pas copié.', q: 'Tu réagis comment ?',
    ch: [
      { l: 'Te défendre calmement', p: 0.6, tr: { calme: 2 }, ok: { t: 'Le prof vérifie et s’excuse. Un miracle pédagogique.', fx: { b: 2 } }, ko: { t: 'Il ne te croit pas. Zéro. L’injustice a un goût amer.', fx: { b: -3, g: -0.5 } } },
      { l: 'Exploser', t: 'Tu traites le prof de « dictateur des fractions ». Conseil de discipline.', fx: { b: -2, s: 1, fn: function () { G.L().edu.warn++; } }, tr: { colerique: 3 } },
      { l: 'Laisser couler', t: 'Tu prends le zéro. Tu rumines pendant trois jours.', fx: { b: -2, g: -0.5 }, tr: { calme: 1, timide: 1 } }
    ]
  });
  ev({ id: 'chambre', a: [13, 17], cat: 'fam', need: ['par'], t: '{Par} entre dans ta chambre sans frapper. Encore. Tu installes un panneau « DANGER : ADO ».', fx: { rq: { par: -2 }, b: 1, tr: { rebelle: 1 } } });
  ev({
    id: 'couvre-feu', a: [14, 17], cat: 'fam', need: ['par'], h: '2 h du matin', t: 'Tu rentres à 2 h du matin au lieu de 23 h. {Par} t’attend dans le salon, dans le noir.', q: 'Tu dis quoi ?',
    ch: [
      { l: 'Mentir', p: function () { return G.is('menteur') ? 0.6 : 0.35; }, tr: { menteur: 3 }, ok: { t: '« Le bus a déraillé. Enfin, il était en retard. Très en retard. » Ça passe.', fx: { b: 1 } }, ko: { t: '{Par.n} a vu tes stories. Tous tes stories.', fx: { b: -4, rq: { par: -6 } } } },
      { l: 'Dire la vérité', t: '[Privé|Privée] de sortie un mois, mais {par.n} apprécie ta franchise.', fx: { b: -2, rq: { par: 3 } }, tr: { honnete: 3 } },
      { l: 'Filer dans ta chambre', t: 'Tu claques la porte. Le cadre de mamie tombe du mur.', fx: { rq: { par: -6 } }, tr: { rebelle: 2, colerique: 2 } }
    ]
  });
  ev({
    id: 'ete', a: [15, 17], cat: 'vie', h: 'Les grandes vacances', t: 'Les vacances d’été arrivent. Deux mois devant toi.', q: 'Tu fais quoi ?',
    ch: [
      { l: 'Job d’été au camping', t: 'Tu nettoies les sanitaires du camping pendant deux mois. Ça forge le caractère et le porte-monnaie.', fx: { m: 900, b: -1, sk: { bricolage: 1 } }, tr: { ambitieux: 2, discipline: 2 } },
      { l: 'Rien du tout', t: 'Deux mois de grasses matinées. Record personnel : 14 h de sommeil d’affilée.', fx: { b: 4, h: 1 }, tr: { nonchalant: 3 } },
      { l: 'Partir avec des amis', if: function (c, l) { return l.money >= 200; }, t: 'Une semaine à la mer avec tes amis. Coups de soleil et fous rires.', fx: { m: -200, s: 4, b: 4 }, tr: { charismatique: 1 } }
    ]
  });
  ev({ id: 'photo-classe', a: [12, 16], cat: 'ecole', t: 'Un bouton géant pousse sur ton front la veille de la photo de classe. Il est sur la photo. Il y sera pour toujours.', fx: { c: -2, b: -1 } });
  ev({
    id: 'trahison', a: [10, 19], cat: 'amis', need: ['ami'], h: 'Secret trahi', t: '{Ami} a raconté ton secret à toute la classe.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Pardonner', t: 'Tu pardonnes. {Ami.n} te doit une fière chandelle.', fx: { b: -1, rq: { ami: 2 } }, tr: { bienveillant: 3 } },
      { l: 'Couper les ponts', t: 'Tu ne parles plus à {ami.n}. Silence radio.', fx: { s: -2, fn: function (c) { c.r.ami.rel = 'old'; } }, tr: { colerique: 1, egoiste: 1 } },
      { l: 'Révéler son secret à son tour', t: 'Tu balances son secret. C’est la guerre ouverte.', fx: { s: 1, fn: function (c) { G.keep(c.r.ami, 'enn', 10); } }, tr: { rebelle: 2, menteur: 1, colerique: 1 } }
    ]
  });
  ev({
    id: 'faille', a: [12, 18], cat: 'ecole', if: function (c, l) { return l.sk.info >= 25 && G.inSchool(); }, h: 'La faille', t: 'Tu découvres une faille dans le site de notes du collège.', q: 'Tu en fais quoi ?',
    ch: [
      { l: 'Prévenir l’établissement', t: 'Le principal te félicite et te demande de « ne plus jamais rien toucher ».', fx: { sk: { info: 2 } }, tr: { honnete: 3 } },
      { l: 'Changer tes notes', p: 0.5, tr: { rebelle: 2, menteur: 2 }, ok: { t: 'Ta moyenne gagne deux points. Personne ne remarque rien. Pour l’instant.', fx: { g: 2 } }, ko: { t: 'Repéré{e} ! Trois jours d’exclusion.', fx: { b: -4, g: -1, fn: function () { G.L().edu.warn += 2; } } } },
      { l: 'Afficher un chat qui danse', t: 'Un chat danse trois jours sur la page d’accueil. Légende de l’établissement.', fx: { s: 4, c: 1 }, tr: { drole: 2, rebelle: 1 } }
    ]
  });
  ev({ id: 'bsr', a: [14, 15], once: 1, cat: 'vie', yr: [1990, 9999], t: 'Tu passes ton permis AM pour le scooter. Tu cales devant le moniteur, mais tu l’as quand même.', fx: { b: 2 } });
  ev({ id: 'exclusion', a: [11, 17], cat: 'ecole', if: function (c, l) { return l.edu.warn >= 4 && G.inSchool(); }, once: 1, w: 40, t: 'Trop d’avertissements : tu es [exclu|exclue] de ton établissement. Nouveau collège, nouvelle réputation à te faire.', fx: { b: -6, s: -5, fn: function () { G.L().edu.warn = 0; } }, kind: 'bad' });
  ev({ id: 'meilleur-ami', a: [8, 30], cat: 'amis', need: ['ami'], if: function (c) { return c.r.ami.rq >= 70 && !c.r.ami.bff && !G.alive('ami').some(function (p) { return p.bff; }); }, t: '{Ami.n} t’offre un bracelet tressé. C’est officiel : vous êtes meilleurs amis.', fx: { b: 4, s: 2, fn: function (c) { c.r.ami.bff = 1; } } });

  // =====================================================================
  //  JEUNE ADULTE (18–29)
  // =====================================================================
  ev({ id: 'coloc-escargots', a: [18, 32], cat: 'lol', if: function (c, l) { return l.home === 'coloc'; }, mk: { x: 'adult' }, t: '{x:Ton colocataire|Ta colocataire} {x.n} élève des escargots dans la baignoire. Il y en a 43. Ils ont tous un prénom.', fx: { b: 1, s: 1 } });
  ev({ id: 'soiree-etudiante', a: [18, 26], cat: 'amis', if: student, t: 'Soirée étudiante sur le thème « Dinosaures et paillettes ». Tu te réveilles [déguisé|déguisée] en tricératops.', fx: { s: 4, b: 3, h: -2 } });
  ev({ id: 'caf', a: [18, 35], cat: 'argent', if: alone, t: 'La CAF te demande un justificatif prouvant que tu existes. Tu envoies une photo de toi. « Dossier incomplet. »', fx: { b: -2 } });
  ev({ id: 'apl', a: [18, 26], cat: 'argent', if: function (c, l) { return student(c, l) && alone(c, l); }, t: 'Tu touches les APL : environ 120 € par mois. Tu te sens [riche|riche] pendant trois jours.', fx: { m: 1400, b: 2 } });
  ev({
    id: 'erasmus', a: [19, 24], once: 1, cat: 'ecole', if: student, h: 'Erasmus', t: 'Opportunité : un semestre Erasmus à l’étranger.', q: 'Où pars-tu ?',
    ch: [
      { l: 'Barcelone', t: 'Tu apprends l’espagnol, la sieste et la paella. Tu reviens [transformé|transformée].', fx: { sk: { langues: 7 }, s: 4, b: 5, m: -1500 } },
      { l: 'Oslo', t: 'Il fait nuit 20 h par jour. Tu développes une passion pour les bougies et les pulls.', fx: { sk: { langues: 5 }, b: 2, m: -1800 } },
      { l: 'Rester', t: 'Tu restes. Tes amis t’envoient 400 photos de tapas.', fx: { b: -1 } }
    ]
  });
  ev({
    id: 'colis', a: [15, 90], yr: [2012, 9999], cat: 'argent', h: 'Le colis bloqué', t: 'SMS : « Votre colis est bloqué, payez 1,99 € pour le débloquer. » Tu n’as rien commandé.', q: 'Tu fais quoi ?',
    ch: [
      { l: 'Payer', t: 'On te vide 1 200 € sur ton compte. Le colis n’a jamais existé.', fx: { m: -1200, b: -5 }, k: 'bad' },
      { l: 'Supprimer', t: 'Tu supprimes le message avec un sourire supérieur.', fx: { b: 1 } },
      { l: 'Répondre en alexandrins', t: 'Tu envoies un poème de quatorze vers à l’arnaqueur. Il bloque ton numéro.', fx: { b: 3, sk: { eloquence: 1 } } }
    ]
  });
  ev({ id: 'temoin', a: [22, 50], cat: 'amis', need: ['ami'], if: function (c) { return c.r.ami.age >= 21; }, t: '{Ami} se marie et te choisit comme témoin. Ton discours fait pleurer l’assemblée… de rire.', fx: { s: 4, b: 3, m: -300, rq: { ami: 8 } } });
  ev({ id: 'trott-accident', a: [12, 70], cat: 'sante', if: has('trott'), t: 'Accident de trottinette électrique contre un plot. Le plot va bien.', fx: { h: -5, b: -2 }, kind: 'bad' });
  ev({ id: 'premier-appart', a: [18, 30], once: 1, cat: 'vie', if: alone, t: 'Premier appartement à toi ! Tu manges des pâtes au beurre trois soirs de suite et tu trouves ça merveilleux.', fx: { b: 4 } });
  ev({ id: 'tanguy', a: [25, 45], cat: 'fam', need: ['par'], if: function (c, l) { return l.home === 'parents'; }, t: '{Par} a « oublié » des annonces de location sur ton oreiller. Encore.', fx: { rq: { par: -3 }, b: -1 } });
  ev({
    id: 'festival-ev', a: [16, 35], cat: 'amis', if: function (c, l) { return l.money >= 120; }, h: 'Le festival', t: 'Un festival de musique a lieu près de chez toi. Les billets coûtent 120 €.', q: 'Tu y vas ?',
    ch: [
      { l: 'Acheter un billet', t: 'Trois jours de musique, de boue et de rencontres improbables.', fx: { m: -120, s: 4, b: 5, h: -1 } },
      { l: 'Escalader la clôture', p: 0.45, tr: { rebelle: 2 }, ok: { t: 'Tu passes ! Meilleur festival de ta vie, gratuit en plus.', fx: { s: 3, b: 6 } }, ko: { t: 'La sécurité t’attrape. Tu passes la soirée dans un enclos avec un mime.', fx: { b: -3 } } },
      { l: 'Rester chez toi', t: 'Tu écoutes les concerts depuis ta fenêtre. C’est presque pareil.', fx: { b: -1 } }
    ]
  });
  ev({ id: 'panne', a: [18, 80], cat: 'argent', if: function (c, l) { return l.items.some(function (x) { return /voiture|sportive|volante/.test(x.id); }); }, t: 'Ta voiture tombe en panne sur l’autoroute. Le dépanneur te facture 380 € et un sermon.', fx: { m: -380, b: -2 } });
  ev({
    id: 'voisin', a: [18, 85], cat: 'vie', if: alone, mk: { x: 'adult' }, h: 'Le voisin du dessus', t: 'Ton voisin du dessus, {x.n}, fait du trampoline à 3 h du matin. Tous les soirs.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Aller lui parler', p: 0.6, tr: { calme: 1 }, ok: { t: '{X.n} s’excuse et t’invite à dîner. Il fait des lasagnes incroyables.', fx: { b: 2, s: 2, fn: keep('x', 'ami', 45) } }, ko: { t: '{X.n} t’explique qu’il s’entraîne pour les Jeux olympiques. Ça continue.', fx: { b: -2 } } },
      { l: 'Musique classique à fond', t: '{X.n} descend… il adore Mozart. Vous devenez amis.', fx: { s: 2, fn: keep('x', 'ami', 50) } },
      { l: 'Supporter en silence', t: 'Tu achètes des bouchons d’oreilles. Ta vie continue, en sourdine.', fx: { b: -2 } }
    ]
  });
  ev({ id: '47cv', a: [18, 30], cat: 'travail', if: function (c, l) { return !l.job && !G.isStudent(); }, t: 'Tu envoies 47 CV. Tu reçois une réponse : un refus pour un poste auquel tu n’as pas postulé.', fx: { b: -2 } });
  ev({ id: 'pote-appart', a: [18, 30], cat: 'amis', need: ['ami'], t: 'Tu aides {ami} à déménager. Le canapé ne passe pas dans l’escalier. Vous le laissez sur le palier, comme une œuvre d’art.', fx: { rq: { ami: 6 }, h: -1, s: 2 } });

  // =====================================================================
  //  ADULTE (30–59)
  // =====================================================================
  ev({
    id: 'quarantaine', a: [38, 50], once: 1, w: 14, cat: 'vie', h: 'Crise de la quarantaine', t: 'Tu te regardes dans le miroir et tu te demandes ce que tu as fait de ta vie.', q: 'Ta réponse ?',
    ch: [
      { l: 'Acheter une voiture de sport', if: function (c, l) { return l.money >= 95000 && l.permis; }, t: 'Tu achètes une voiture de sport rouge. Tu te sens 20 ans de moins. Ton banquier, 20 ans de plus.', fx: { fn: function () { G.buy('sportive'); } } },
      { l: 'Te mettre au marathon', t: 'Tu cours ton premier marathon. Tu finis derrière un homme déguisé en banane, mais tu finis.', fx: { h: 4, b: 3, sk: { sport: 5 } } },
      { l: 'Teindre tes cheveux en bleu', p: 0.5, ok: { t: 'Le bleu te va à merveille. Tout le monde te complimente.', fx: { c: 3, b: 3 } }, ko: { t: 'Le bleu a viré au vert piscine. Tu assumes. Plus ou moins.', fx: { c: -2 } } },
      { l: 'Accepter, et prendre un thé', t: 'Tu fais la paix avec toi-même. Le thé était bon.', fx: { b: 4 } }
    ]
  });
  ev({ id: 'anciens', a: [30, 60], once: 1, cat: 'amis', mk: { x: 'peer' }, t: 'Réunion des anciens du lycée. {X.n}, qui te harcelait en 4e, est devenu{x.e} coach en bienveillance.', fx: { b: 1, s: 3 } });
  ev({
    id: 'impots', a: [25, 85], cat: 'argent', if: working, vars: function () { return { n: L.ri(4, 30) * 100 }; }, h: 'Courrier des impôts', t: 'Les impôts t’envoient un courrier : un redressement de {n} €.', q: 'Tu fais quoi ?',
    ch: [
      { l: 'Payer sans discuter', t: 'Tu paies. Tu ranges le courrier dans le tiroir des mauvais souvenirs.', fx: function (c) { return { m: -c.v.n, b: -2 }; } },
      { l: 'Contester', p: 0.4, ok: { t: 'Tu avais raison : erreur de leur côté. Rien à payer, et une lettre d’excuses !', fx: { b: 4 } }, ko: { t: 'Contestation rejetée, avec majoration de 10 %.', fx: function (c) { return { m: -Math.round(c.v.n * 1.1), b: -4 }; } } }
    ]
  });
  ev({ id: 'enfant-chat', a: [22, 70], cat: 'fam', need: ['enfK'], t: '{EnfK} a peint le chat en vert. Le chat a l’air d’approuver.', fx: { b: 2, rq: { enfK: 1 } } });
  ev({ id: 'boomer', a: [35, 75], cat: 'fam', need: ['enfT'], t: '{EnfT} te traite de « vieux » pour la première fois. Tu prends un coup de vieux.', fx: { b: -1 } });
  ev({ id: 'enfant-bulletin', a: [25, 70], cat: 'fam', need: ['enfK'], t: '{EnfK.n} ramène un bulletin parfait. Tu l’affiches sur le frigo, puis au bureau, puis dans la voiture.', fx: { b: 4, rq: { enfK: 4 } } });
  ev({ id: 'enfant-question', a: [22, 70], cat: 'fam', need: ['enfK'], t: '{EnfK.n} te demande d’où viennent les bébés. Tu parles de cigognes pendant 20 minutes. {EnfK.il} n’est pas dupe.', fx: { b: 1, rq: { enfK: 2 } } });
  ev({
    id: 'idee-volee', a: [20, 66], cat: 'travail', if: working, need: ['coll'], h: 'Idée volée', t: '{Coll} présente ton idée en réunion comme si c’était la sienne.', q: 'Tu réagis comment ?',
    ch: [
      { l: 'Le recadrer en pleine réunion', p: 0.5, ok: { t: 'Tu sors tes mails datés. Silence. Le patron te félicite.', fx: { perf: 8, b: 3, rq: { coll: -12 } } }, ko: { t: 'Ça tourne à la querelle de cour de récré. Tout le monde perd.', fx: { perf: -3, b: -2, rq: { coll: -10 } } } },
      { l: 'En parler au patron en privé', p: 0.6, ok: { t: 'Le patron rétablit la vérité. Discrètement, mais sûrement.', fx: { perf: 5, b: 2 } }, ko: { t: 'Le patron hausse les épaules : « L’important, c’est l’équipe. »', fx: { b: -3 } } },
      { l: 'Laisser faire', t: 'Tu laisses filer. Ton idée deviendra le projet de l’année. Sans toi.', fx: { b: -3, perf: -2 } }
    ]
  });
  ev({ id: 'team-building', a: [20, 66], cat: 'travail', if: working, need: ['boss'], t: 'Team building : saut à l’élastique avec ton service. {Boss} hurle plus fort que tout le monde.', fx: { s: 3, b: 2, rq: { boss: 3 } } });
  ev({ id: 'reunion-inutile', a: [20, 66], cat: 'travail', if: working, t: 'Réunion de deux heures pour planifier la prochaine réunion. Tu dessines quatorze hiboux dans la marge.', fx: { b: -1, sk: { art: 1 } } });
  ev({ id: 'machine-cafe', a: [20, 66], cat: 'travail', if: working, need: ['coll'], t: 'La machine à café est en panne. {Coll} et toi organisez une résistance clandestine à base de bouilloire.', fx: { s: 2, rq: { coll: 6 } } });
  ev({ id: 'promo-coll', a: [24, 66], cat: 'travail', if: working, need: ['coll'], t: '{Coll} obtient la promotion que tu visais. Tu applaudis avec les dents serrées.', fx: { b: -3, rq: { coll: -3 } } });
  ev({ id: 'compliment-boss', a: [16, 70], cat: 'travail', if: working, need: ['boss'], t: '{Boss} te félicite devant toute l’équipe. Tu ne sais plus quoi faire de tes mains.', fx: { b: 3, perf: 5, rq: { boss: 4 } } });
  ev({ id: 'client', a: [16, 70], cat: 'travail', if: working, t: 'Un client te hurle dessus parce qu’il pleut. Tu souris. Tu souris très fort.', fx: { b: -2 } });
  ev({ id: 'greve', a: [18, 64], cat: 'travail', if: working, t: 'Grève des transports ! Tu fais 12 km à pied pour aller travailler. Tes mollets te remercient. Toi, non.', fx: { h: 1, b: -1 } });
  ev({ id: 'seminaire', a: [22, 64], cat: 'travail', if: working, t: 'Séminaire d’entreprise dans un château. Au programme : un atelier « libère ton lion intérieur ».', fx: { s: 2, b: 1 } });
  ev({ id: 'dos', a: [30, 75], cat: 'sante', t: 'Tu te bloques le dos en ramassant une chaussette. Une seule chaussette.', fx: { h: -2, ill: 'maldos' } });
  ev({ id: 'lunettes', a: [40, 55], once: 1, cat: 'sante', t: 'Tu tends ton menu de plus en plus loin pour le lire. Verdict de l’ophtalmo : lunettes.', fx: { c: -1, b: -1, fn: function (c, l) { G.L().me.look.gl = 1; } } });
  ev({ id: 'grand-oncle', a: [20, 85], w: 3, cat: 'argent', vars: money(3, 25), t: 'Un grand-oncle dont tu ignorais l’existence te lègue {n} 000 € et un perroquet empaillé.', fx: function (c) { return { m: c.v.n * 1000, b: 4 }; } });
  ev({ id: 'voisine', a: [30, 95], cat: 'vie', t: 'La voisine sait tout sur tout le monde. Elle t’apprend que ton propre anniversaire, c’est la semaine prochaine.', fx: { b: 1 } });
  ev({
    id: 'meuble', a: [20, 85], cat: 'vie', h: 'Meuble en kit', t: 'Tu montes une armoire en kit de 214 pièces.', q: 'Ta méthode ?',
    ch: [
      { l: 'L’instinct', p: function (c, l) { return 0.3 + l.sk.bricolage / 100; }, ok: { t: 'L’armoire tient debout. Il reste six vis. Mystère.', fx: { b: 2, sk: { bricolage: 2 } } }, ko: { t: 'L’armoire ressemble à une sculpture moderne. Elle s’effondre si on la regarde.', fx: { b: -2 } } },
      { l: 'Lire la notice', t: 'La notice est en suédois. Tu apprends trois mots de suédois.', fx: { sk: { langues: 1, bricolage: 1 } } }
    ]
  });
  ev({ id: 'raclette', a: [10, 90], cat: 'sante', t: 'Indigestion de raclette. Tu jures que c’était la dernière. Ce n’était pas la dernière.', fx: { h: -1, b: 2 } });
  ev({ id: 'parent-age', a: [30, 70], cat: 'fam', need: ['par'], if: function (c) { return c.r.par.age >= 65; }, t: '{Par} t’appelle pour te demander comment on envoie une photo. L’appel dure 1 h 40. La photo n’est jamais partie.', fx: { b: 1, rq: { par: 4 } } });
  ev({ id: 'parent-hopital', a: [8, 70], cat: 'fam', need: ['par'], t: '{Par} est {par:hospitalisé|hospitalisée} quelques jours. Tu passes tous les soirs avec des magazines et du raisin.', fx: { b: -3, rq: { par: 6 } } });
  ev({ id: 'divorce-parents', a: [3, 17], once: 1, w: 4, cat: 'fam', need: ['mere', 'pere'], t: 'Tes parents divorcent. Désormais, tu auras deux chambres, deux Noëls et deux fois plus de questions.', fx: { b: -8, fn: function () { G.L().flags.divorce = 1; } }, kind: 'bad' });
  ev({ id: 'gp-anniv', a: [5, 50], cat: 'fam', need: ['gp'], if: function (c) { return c.r.gp.age >= 80; }, vars: function (c) { return { n: c.r.gp.age }; }, t: '{Gp} fête ses {n} ans et souffle les bougies du premier coup. Les pompiers étaient prévenus, au cas où.', fx: { b: 2, s: 1, rq: { gp: 3 } } });
  ev({ id: 'sib-diplome', a: [10, 60], cat: 'fam', need: ['sib'], if: function (c) { return c.r.sib.age >= 20; }, t: '{Sib} décroche un super diplôme. Tes parents en parlent à chaque repas. À chaque. Repas.', fx: { b: -1 } });
  ev({ id: 'sib-mariage', a: [8, 70], cat: 'fam', need: ['sib'], if: function (c) { return c.r.sib.age >= 22; }, once: 1, t: '{Sib} se marie ! Tu danses la chenille avec tonton Gérard jusqu’à 4 h du matin.', fx: { s: 3, b: 3, rq: { sib: 4 } } });
  ev({
    id: 'sib-pret', a: [18, 70], cat: 'fam', need: ['sib'], if: function (c, l) { return l.money >= 500 && c.r.sib.age >= 18; }, h: 'Un prêt en famille', t: '{Sib} te demande de lui prêter 500 €.', q: 'Tu prêtes ?',
    ch: [
      { l: 'Prêter', p: 0.6, tr: { bienveillant: 1 }, ok: { t: 'Remboursé trois mois plus tard, avec un pot de confiture en bonus.', fx: { rq: { sib: 6 } } }, ko: { t: 'Tu ne reverras jamais cet argent. Mais {sib.n} t’aime fort.', fx: { m: -500, rq: { sib: 3 } } } },
      { l: 'Refuser', t: '{Sib.n} fait la tête jusqu’à Noël.', fx: { rq: { sib: -6 } }, tr: { egoiste: 1 } }
    ]
  });
  ev({ id: 'noel', a: [4, 95], cat: 'fam', need: ['par'], t: 'Repas de Noël : tonton Gérard parle politique, mamie s’endort dans la bûche. Tradition respectée.', fx: { s: 2, b: 2 } });

  // couple
  ev({
    id: 'trompe', manual: 1, cat: 'amour', h: 'Trahison', t: 'Tu découvres que {part} te trompe avec {x.n}.', q: 'Que fais-tu ?',
    ch: [
      { l: 'Pardonner', t: 'Tu pardonnes. La confiance, elle, mettra du temps à revenir.', fx: { b: -6, rq: { part: -10 } } },
      { l: 'Rompre', t: 'Tu fais ses valises toi-même. Tes amis débarquent avec de la glace.', fx: { b: -10, fn: function (c) { const h = G.breakup(c.r.part); if (h) G.log('Le divorce te coûte ' + L.money(h) + '.'); } }, k: 'bad' },
      { l: 'Scène publique au restaurant', t: 'Tu renverses un plat de spaghettis sur {part.n}. Le restaurant applaudit. Rupture immédiate.', fx: { b: -6, s: 2, fn: function (c) { G.breakup(c.r.part); } }, k: 'bad' }
    ]
  });
  ev({
    id: 'demande-recue', a: [20, 70], cat: 'amour', need: ['part'], if: function (c) { return c.r.part.st === 'date' && c.r.part.rq >= 65; }, h: 'La demande', t: '{Part} pose un genou à terre au milieu du restaurant : « Veux-tu m’épouser ? »', q: 'Ta réponse ?',
    ch: [
      { l: 'Oui !', t: 'Tout le restaurant applaudit. Le serveur pleure.', fx: { b: 10, fn: function (c) { c.r.part.st = 'fiance'; } }, k: 'love' },
      { l: 'Non…', t: 'Long silence. {Part.n} range la bague. Rien ne sera plus pareil.', fx: { b: -4, rq: { part: -25 } }, k: 'bad' },
      { l: 'Je peux réfléchir ?', t: '{Part.n} fait « d’accord » avec la voix qui tremble.', fx: { rq: { part: -6 } } }
    ]
  });
  ev({ id: 'couple-dispute', a: [16, 95], cat: 'amour', need: ['part'], vars: function () { return { d: L.pick(D.DISPUTES) }; }, t: 'Dispute avec {part} sur {d}. Personne ne gagne.', fx: { rq: { part: -4 }, b: -1 } });
  ev({ id: 'couple-surprise', a: [16, 95], cat: 'amour', need: ['part'], t: '{Part} t’organise un week-end surprise au bord de la mer. Tu pleures un peu dans le train.', fx: { rq: { part: 5 }, b: 4 }, kind: 'love' });
  ev({
    id: 'emmenager-ev', a: [18, 55], cat: 'amour', need: ['part'], if: function (c) { return !c.r.part.cohab; }, h: 'Une clé de plus', t: '{Part} te tend une clé : « Et si on vivait ensemble ? »', q: 'Alors ?',
    ch: [
      { l: 'Oui', t: 'Vous emménagez ensemble. Premier débat : le côté du lit.', fx: { b: 4, rq: { part: 6 }, fn: function (c, l) { c.r.part.cohab = 1; if (G.L().home === 'parents') G.L().home = 't3'; } }, k: 'love' },
      { l: 'Pas encore', t: '« Je comprends », dit {part.n}. {Part.il} ne comprend pas.', fx: { rq: { part: -5 } } }
    ]
  });
  ev({ id: 'bebe-surprise', a: [20, 42], w: 4, cat: 'amour', need: ['part'], h: 'Un projet de bébé', if: function (c, l) { const p = c.r.part; const fem = l.me.sex === 'F' ? l.me : p.sex === 'F' ? p : null; return p.sex !== l.me.sex && p.rq >= 55 && !l.preg && (!fem || fem.age < 44) && G.alive('enf').length < 3; },
    t: '{Part} te prend la main : « Et si on faisait un bébé ? »',
    ch: [
      { l: 'Oui, faisons un bébé !', p: function (c, l) { const p = c.r.part; const fem = l.me.sex === 'F' ? l.me : p; return fem.age < 35 ? 0.85 : fem.age < 40 ? 0.6 : 0.3; },
        ok: { t: 'Quelques semaines plus tard : test positif ! Bébé prévu l’an prochain.', fx: { b: 6, rq: { part: 5 } }, k: 'love', run: function (c, l) { l.preg = { pid: c.r.part.id, y: l.year }; } },
        ko: { t: 'Vous essayez toute l’année, sans succès pour l’instant. Vous gardez espoir.', fx: { b: -1, rq: { part: 3 } } } },
      { l: 'Pas maintenant', t: '{Part.n} comprend, mais semble un peu déçu{part.e}.', fx: { rq: { part: -3 } } }
    ] });
  ev({
    id: 'coup-foudre', a: [18, 75], cat: 'amour', if: function () { return !G.partner(); }, mk: { x: 'crush' }, h: 'Rayon surgelés', t: 'Au rayon surgelés, {x.n} te sourit en tenant un sac de petits pois.', q: 'Tu tentes ta chance ?',
    ch: [
      { l: 'Engager la conversation', p: function (c, l) { return 0.3 + l.st.c / 180; }, ok: { t: 'Vous parlez petits pois pendant une heure, puis de tout le reste. Vous sortez ensemble !', fx: { b: 6, fn: love('x') }, k: 'love' }, ko: { t: 'Tu bafouilles quelque chose sur les petits pois. {X.n} s’en va.', fx: { b: -2 } } },
      { l: 'Passer ton chemin', t: 'Tu repars avec tes surgelés. Et quelques regrets.', fx: {} }
    ]
  });
  ev({ id: 'anniv-oublie', a: [18, 95], cat: 'amour', need: ['part'], t: 'Tu as oublié l’anniversaire de {part}. Tu offres en catastrophe un bouquet de la station-service.', fx: { rq: { part: -5 }, b: -1 } });

  // =====================================================================
  //  SENIORS (60+)
  // =====================================================================
  ev({ id: 'bridge', a: [62, 95], cat: 'amis', if: function (c, l) { return l.retired; }, t: 'Tu découvres le club de bridge. Tu triches. Tout le monde triche.', fx: { s: 3, b: 2 } });
  ev({ id: 'grand-parent', a: [45, 95], cat: 'fam', need: ['enfA'], cd: 6, t: '{EnfA} t’annonce que tu vas être [grand-père|grand-mère] ! Tu as déjà acheté trois doudous.', fx: { b: 6, fn: function () { G.L().stats.grandkids++; } } });
  ev({ id: 'video-deambulateur', a: [62, 98], yr: [2016, 9999], cat: 'lol', t: 'Tu publies une vidéo de toi en train de danser avec ton déambulateur. Deux millions de vues.', fx: { c: 3, s: 3, b: 3 } });
  ev({ id: 'mouette', a: [65, 105], tag: 'mer', cat: 'lol', t: 'Une mouette te vole ton dentier sur la plage. Tu la poursuis sur 200 mètres. Tu gagnes.', fx: { h: -1, b: 3 } });
  ev({ id: 'deambulateur', a: [72, 108], once: 1, cat: 'lol', t: 'Tu customises ton déambulateur : flammes peintes, klaxon et porte-gobelet. Les infirmières t’adorent.', fx: { b: 4, c: 1 } });
  ev({ id: 'lunettes-tete', a: [70, 110], cat: 'vie', t: 'Tu cherches tes lunettes pendant une heure. Elles étaient sur ta tête.', fx: { b: -1 } });
  ev({
    id: 'neveu', a: [65, 105], cat: 'argent', h: 'Un neveu au téléphone', t: 'Un « neveu » dont tu n’as jamais entendu parler t’appelle et te demande 2 000 € pour une urgence.', q: 'Tu fais quoi ?',
    ch: [
      { l: 'Envoyer l’argent', if: function (c, l) { return l.money >= 2000; }, t: 'Le « neveu » disparaît avec tes 2 000 €. Les arnaqueurs n’ont pas de cœur.', fx: { m: -2000, b: -4 }, k: 'bad' },
      { l: 'Raccrocher', t: 'Tu raccroches. On ne te la fait pas.', fx: { b: 1 } },
      { l: 'Le garder deux heures au téléphone', t: 'Tu lui racontes tes rhumatismes en détail pendant deux heures. C’est lui qui raccroche.', fx: { b: 4 }, tr: { drole: 1 } }
    ]
  });
  ev({ id: 'courgette', a: [55, 98], cat: 'vie', t: 'Ton potager produit une courgette de quatre kilos. Tu la présentes au concours du village. Elle gagne.', fx: { b: 4, s: 2 } });
  ev({ id: 'memoire-vive', a: [75, 110], cat: 'fam', need: ['enf'], t: '{Enf} vient te voir avec les petits-enfants. Tu racontes pour la 30e fois l’histoire de la vache gagnée au poker.', fx: { b: 3, s: 2, rq: { enf: 4 } } });

  // =====================================================================
  //  TOUS ÂGES (absurde, santé, argent)
  // =====================================================================
  ev({ id: 'pigeon', a: [5, 105], cat: 'lol', t: 'Un pigeon te vole ton sandwich en plein vol. Respect.', fx: { b: -1, flag: 'pigeon', fn: function () { if (G.L().flags.pigeon >= 3) G.ach('pigeon'); } } });
  ev({ id: 'ovni-vu', a: [9, 105], cat: 'lol', vars: function () { return { o: L.pick(D.OVNI) }; }, t: 'En rentrant chez toi, tu vois {o}. Personne ne te croit.', fx: { b: 1, flag: 'ovni' } });
  ev({ id: 'selfie', a: [15, 80], cat: 'lol', t: 'Un inconnu te prend pour une star de la télé et te demande un selfie. Tu acceptes. Tu ne sauras jamais qui tu étais [censé|censée] être.', fx: { c: 1, b: 2 } });
  ev({ id: 'ascenseur', a: [8, 100], cat: 'lol', t: 'Coincé{e} trois heures dans un ascenseur avec un inconnu qui ne parle que de son aquarium. Tu sais tout sur les poissons-clowns, maintenant.', fx: { b: -1, sk: { sciences: 1 } } });
  ev({ id: 'banane', a: [8, 95], cat: 'lol', t: 'Tu glisses sur une peau de banane. Une vraie. Comme dans les dessins animés.', fx: { h: -1, b: 1 } });
  ev({ id: 'fromage', a: [16, 75], w: 4, cat: 'lol', t: 'Une marque de fromage locale te choisit comme visage de sa nouvelle campagne. Ta tête est sur 3 000 camemberts.', fx: { c: 3, m: 500, b: 2 } });
  ev({ id: 'orage', a: [5, 95], cat: 'vie', t: 'Panne de courant pendant un orage. Tu racontes des histoires de fantômes à la lampe torche.', fx: { s: 1, b: 1 } });
  ev({ id: 'boulangere', a: [8, 100], cat: 'vie', t: 'La boulangère t’appelle par ton prénom. Tu es [devenu un habitué|devenue une habituée] du quartier.', fx: { s: 1, b: 1 } });
  ev({ id: 'amende-stationnement', a: [18, 90], cat: 'argent', if: function (c, l) { return l.permis; }, t: 'Amende de stationnement : 35 €. Tu t’étais garé{e} « juste deux minutes ».', fx: { m: -35, b: -1 } });
  ev({ id: 'vieux-manteau', a: [10, 100], cat: 'argent', t: 'Tu retrouves 50 € dans la poche d’un vieux manteau. Le toi du passé pensait à toi.', fx: { m: 50, b: 2 } });
  ev({ id: 'yoga', a: [16, 90], cat: 'sante', t: 'Premier cours de yoga. Tu restes coincé{e} dans la posture du chien tête en bas. Le prof doit t’aider à te relever.', fx: { h: 2, b: 1 } });
  ev({ id: 'insomnie', a: [14, 95], cat: 'sante', t: 'Insomnie : tu passes la nuit à te demander si les poissons dorment. Ils dorment.', fx: { h: -1, b: -1 } });
  ev({ id: 'gastro-ev', a: [3, 100], cat: 'sante', t: 'Une gastro fait le tour de la famille. Tu perds trois kilos et ta dignité.', fx: { h: -2, ill: 'gastro' } });
  ev({ id: 'quiz-tele', a: [16, 90], w: 4, cat: 'lol', t: 'Tu participes à un jeu télévisé. Tu bloques sur la question « De quelle couleur est le cheval blanc d’Henri IV ? »', fx: { c: 1, b: 1, m: 150 } });
  ev({ id: 'perdu-gps', a: [18, 90], cat: 'lol', if: function (c, l) { return l.permis; }, t: 'Ton GPS t’envoie dans un champ de tournesols. Tu y restes coincé{e} deux heures. C’était joli.', fx: { b: 1 } });
  ev({ id: 'chat-voisin', a: [6, 95], cat: 'lol', t: 'Le chat du voisin a décidé que ta maison était sa maison. Il dort sur ton lit tous les après-midis.', fx: { b: 2 } });
  ev({ id: 'jardin-taupe', a: [25, 95], cat: 'lol', if: function (c, l) { return /maison|villa/.test(l.home); }, t: 'Une taupe ravage ta pelouse. Tu déclares la guerre. La taupe gagne.', fx: { b: -1 } });
  ev({ id: 'tombola', a: [6, 95], w: 5, cat: 'argent', t: 'Tu gagnes la tombola du quartier : un jambon entier et un bon d’achat de 100 €.', fx: { m: 100, b: 3 } });

  // =====================================================================
  //  TA VILLE
  // =====================================================================
  ev({ id: 'bzh-pluie', a: [4, 100], tag: 'bzh', cat: 'ville', t: 'Il a plu 280 jours cette année. Tu possèdes maintenant six cirés de couleurs différentes.', fx: { b: -1 } });
  ev({ id: 'bzh-crepes', a: [4, 100], tag: 'bzh', cat: 'ville', t: 'Fest-noz au village : tu manges ton poids en crêpes au beurre salé et tu danses jusqu’à 4 h.', fx: { s: 3, b: 3, h: -1 } });
  ev({ id: 'sud-mistral', a: [4, 100], tag: 'sud', cat: 'ville', t: 'Le mistral souffle si fort qu’il emporte ton parasol jusqu’à la plage voisine.', fx: { b: -1 } });
  ev({ id: 'sud-petanque', a: [12, 100], tag: 'sud', cat: 'ville', t: 'Tu gagnes le tournoi de pétanque du quartier. Le perdant boude depuis trois semaines.', fx: { s: 3, b: 3 } });
  ev({ id: 'paris-metro', a: [6, 100], tag: 'paris', cat: 'ville', t: 'Dans le métro, un accordéoniste joue à côté de ton oreille pendant douze stations.', fx: { b: -1, sk: { musique: 0.5 } } });
  ev({ id: 'paris-9m2', a: [18, 80], tag: 'paris', cat: 'ville', if: alone, t: 'Tu visites un appartement de 9 m² « plein de charme ». Le charme, c’est la douche dans la cuisine.', fx: { b: -1 } });
  ev({ id: 'nord-gris', a: [4, 100], tag: 'nord', cat: 'ville', t: 'Il fait gris depuis onze jours. Tu manges des frites pour compenser. Ça compense.', fx: { b: 1, h: -1 } });
  ev({ id: 'mont-ski', a: [6, 80], tag: 'mont', cat: 'ville', t: 'Tu dévales une piste noire sur les fesses. Les secouristes applaudissent ta technique.', fx: { b: 2, h: -1 } });
  ev({ id: 'dom-cyclone', a: [4, 100], tag: 'dom', cat: 'ville', t: 'Alerte cyclonique : deux jours enfermé{e} avec ta famille, des bougies et des jeux de société.', fx: { s: 2, b: 1 } });
  ev({ id: 'corse-sanglier', a: [4, 100], tag: 'corse', cat: 'ville', t: 'Un sanglier traverse la terrasse pendant le repas de famille. Personne ne s’arrête de manger.', fx: { b: 1 } });
  ev({ id: 'lyon-bouchon', a: [8, 100], tag: 'lyon', cat: 'ville', t: 'Repas dans un bouchon lyonnais. Tu ne sais pas exactement ce que tu as mangé, mais c’était délicieux.', fx: { b: 2, h: -1 } });
  ev({ id: 'est-marche', a: [4, 100], tag: 'est', cat: 'ville', t: 'Marché de Noël : tu bois trop de vin chaud et tu achètes une boule à neige géante.', fx: { b: 2, m: -30 } });
  ev({ id: 'ouest-plage', a: [4, 100], tag: 'ouest', cat: 'ville', t: 'Tu fais un château de sable XXL sur la plage. La marée le détruit sous tes yeux. Tragédie.', fx: { b: 1 } });
  ev({ id: 'mer-baignade', a: [4, 90], tag: 'mer', cat: 'ville', t: 'Première baignade de l’année. L’eau est à 14 °C. Tu cries comme une mouette.', fx: { h: 1, b: 2 } });
  ev({ id: 'village-bus', a: [8, 85], cat: 'ville', if: function (c, l) { return D.city(l.city).size === 'village'; }, t: 'Le bus du village passe deux fois par jour. Tu l’as raté. Les deux fois.', fx: { b: -1 } });
  ev({ id: 'village-fete', a: [4, 100], cat: 'ville', if: function (c, l) { return D.city(l.city).size === 'village' || D.city(l.city).size === 'petite'; }, t: 'Fête du village : tu gagnes le concours de lancer de bottes. Le maire te serre la main.', fx: { s: 3, b: 3 } });

  // =====================================================================
  //  L'ÉPOQUE
  // =====================================================================
  ev({ id: 'coupe98', yr: [1998, 1998], a: [4, 100], once: 1, w: 60, cat: 'epoque', t: 'La France gagne la Coupe du monde ! Tu fais la fête dans la rue avec des inconnus jusqu’à l’aube.', fx: { b: 6, s: 4 } });
  ev({ id: 'an2000', yr: [1999, 2000], a: [5, 100], once: 1, w: 40, cat: 'epoque', t: 'Bug de l’an 2000 : toute la famille attend la fin du monde devant la télé. Rien ne se passe. Déception générale.', fx: { b: 1 } });
  ev({ id: 'euro', yr: [2002, 2002], a: [6, 100], once: 1, w: 60, cat: 'epoque', t: 'Passage à l’euro ! Mamie convertit tout en francs et trouve que la baguette coûte « six francs, quelle honte ».', fx: { b: 1 } });
  ev({ id: 'minitel', yr: [1982, 1999], a: [8, 80], cat: 'epoque', need: ['par'], t: 'Tu passes trois heures sur le Minitel. La facture de téléphone arrive. {Par} devient {par:violet|violette}.', fx: { b: 2, rq: { par: -4 } } });
  ev({ id: 'cabine', yr: [1970, 2005], a: [10, 80], cat: 'epoque', t: 'Tu appelles ton crush depuis une cabine téléphonique. Ta dernière pièce tombe pile quand tu dis « je t’… ».', fx: { b: -1 } });
  ev({ id: 'k7', yr: [1975, 2003], a: [8, 60], cat: 'epoque', t: 'Tu enregistres tes chansons préférées à la radio sur une cassette en coupant les pubs. Travail d’orfèvre.', fx: { b: 2, sk: { musique: 1 } } });
  ev({ id: 'tamagotchi', yr: [1996, 2003], a: [6, 16], cat: 'epoque', t: 'Ton animal virtuel de poche meurt pendant la dictée. Deuil national dans la classe.', fx: { b: -2 } });
  ev({ id: 'tactile', yr: [2007, 2010], a: [10, 40], once: 1, cat: 'epoque', t: 'Quelqu’un dans ton entourage a un téléphone tactile. Tout le monde fait la queue pour le toucher.', fx: { b: 1 } });
  ev({ id: 'confinement', yr: [2020, 2020], a: [3, 110], once: 1, w: 60, cat: 'epoque', t: 'Confinement ! Tu fais du pain, tu applaudis à 20 h et tu parles à tes plantes.', fx: { s: -4, b: -2, sk: { cuisine: 3 } } });
  ev({ id: 'canicule', yr: [2030, 9999], a: [3, 110], cat: 'epoque', t: 'Canicule à 47 °C. Tu dors dans la baignoire avec un ventilateur.', fx: { h: -2, b: -1 } });
  ev({ id: 'prof-ia', yr: [2035, 9999], a: [6, 17], cat: 'epoque', t: 'Ton professeur principal est une IA. Elle a mis 20/20 à un élève qui avait juste écrit « bonjour ».', fx: { b: 1 } });
  ev({ id: 'robot-boude', yr: [2045, 9999], a: [5, 110], cat: 'epoque', t: 'Ton robot aspirateur a développé une personnalité. Il boude quand tu marches sur le tapis.', fx: { b: 1 } });
  ev({ id: 'bouchon-ciel', yr: [2060, 9999], a: [16, 100], cat: 'epoque', t: 'Embouteillage à 300 mètres d’altitude. Un pigeon te double.', fx: { b: -1 } });
  ev({
    id: 'implant', yr: [2050, 9999], a: [14, 90], cat: 'epoque', h: 'Promo dans ton rêve', t: 'Une publicité dans ton rêve te propose un implant de mémoire à prix cassé.', q: 'Tu essaies ?',
    ch: [
      { l: 'Essayer', p: 0.5, ok: { t: 'Tu retiens tout, même le numéro de téléphone de ta maîtresse de CP.', fx: function () { const o = { sk: {} }; o.sk[L.pick(['logique', 'langues', 'sciences', 'info'])] = 6; return o; } }, ko: { t: 'L’implant joue une chanson de Noël en boucle dans ta tête. Pour toujours.', fx: { b: -3 } } },
      { l: 'Refuser', t: 'Tu préfères ta mémoire d’origine, avec ses trous.', fx: {} }
    ]
  });
  ev({ id: 'mars-recrute', yr: [2070, 9999], a: [18, 70], cat: 'epoque', t: 'La première colonie sur Mars recrute. Le formulaire fait 400 pages. Tu abandonnes à la page 3.', fx: { b: 1 } });
  ev({ id: 'hologramme', yr: [2055, 9999], a: [6, 100], cat: 'epoque', t: 'Ton grand-père apparaît en hologramme au dîner de famille. Il raconte encore la blague de la vache au poker.', fx: { b: 2, s: 1 } });

  // =====================================================================
  //  PRISON
  // =====================================================================
  ev({ id: 'prison-ragout', a: [18, 110], prison: 1, cat: 'prison', t: 'En prison, tu deviens [le roi|la reine] du ragoût. Tout le monde t’appelle « Chef ».', fx: { s: 2, sk: { cuisine: 3 } } });
  ev({ id: 'prison-echecs', a: [18, 110], prison: 1, cat: 'prison', mk: { x: 'adult' }, t: 'Ton codétenu {x.n} t’apprend à jouer aux échecs avec des morceaux de savon.', fx: { sk: { logique: 3 }, s: 1, fn: keep('x', 'ami', 45) } });
  ev({ id: 'prison-sport', a: [18, 110], prison: 1, cat: 'prison', t: 'Tu fais 300 pompes par jour dans ta cellule. Tes biceps ont leur propre code postal.', fx: { h: 3, sk: { sport: 4 } } });
  ev({ id: 'prison-parloir', a: [18, 110], prison: 1, cat: 'prison', need: ['par'], t: '{Par} vient te voir au parloir avec un gâteau. Le gardien en prend une part « pour vérifier ».', fx: { b: 3, rq: { par: 5 } } });
  ev({
    id: 'prison-evasion', a: [18, 110], prison: 1, cat: 'prison', h: 'La cuillère', t: 'Un détenu te propose de t’évader en creusant avec une cuillère.', q: 'Tu tentes ?',
    ch: [
      { l: 'Creuser', p: 0.1, ok: { t: 'Tu t’évades ! Tu es repris{e} trois jours plus tard en train de manger une glace. Peine allongée.', fx: { b: 2, fn: function () { G.L().prison += 1; } } }, ko: { t: 'Les gardiens trouvent le tunnel. Il fait 30 cm. Peine allongée d’un an.', fx: { b: -4, fn: function () { G.L().prison += 1; } } } },
      { l: 'Refuser', t: 'Tu purges ta peine sagement. Le détenu, lui, creuse encore.', fx: {} }
    ]
  });
})(window.LP);
