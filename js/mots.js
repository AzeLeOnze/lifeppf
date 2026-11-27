/* LifePPF — « Tes mots » : le joueur écrit ses propres phrases (rêve, plat préféré, surnom, cri de guerre…),
 * le jeu les accorde en français (articles, du/de la/des, au/à la/aux, élisions) et les fait revenir tout au long de la vie. */
(function (L) {
  'use strict';
  const G = L.G;
  const M = L.M = {};
  const VOW = /^[aeiouyhàâäéèêëîïôöùûüœæ]/i;
  const el = function (w) { return VOW.test(String(w || '').trim()); };
  M.clean = function (s) { return String(s || '').replace(/[<>{}\[\]|«»"@]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60); };
  const hl = function (t) { return '<span class="mot">' + L.esc(t) + '</span>'; };

  // ---------- les types de phrases ----------
  // act : une action à l'infinitif (avec ou sans verbe à choisir) ; nom : un nom + son article ; nomp : un nom propre ou un titre ;
  // quote : une phrase dite telle quelle ; lieu : une préposition + un lieu
  const ART = [['un', 'un…'], ['une', 'une…'], ['des', 'des…'], ['nom', 'Nom propre']];
  M.SLOTS = {
    reve: { n: 'Ton rêve le plus cher', kind: 'act', sel: [['avoir', 'avoir…'], ['etre', 'être…'], ['devenir', 'devenir…'], ['faire', 'faire…'], ['aller', 'aller…'], ['vivre', 'vivre…']], def: 'devenir', ph: 'astronaute',
      ex: [['devenir', 'astronaute'], ['avoir', 'un château gonflable'], ['etre', 'une star de la chanson'], ['aller', 'sur la Lune'], ['faire', 'le tour du monde en trottinette'], ['vivre', 'dans une cabane perchée'], ['devenir', 'président des pigeons'], ['avoir', 'un dragon apprivoisé']] },
    plat: { n: 'Ton plat préféré', kind: 'nom', sel: ART, def: 'un', ph: 'couscous', ex: [['un', 'couscous'], ['une', 'raclette'], ['des', 'nouilles sautées'], ['un', 'gratin dauphinois'], ['des', 'crêpes au sucre'], ['une', 'pizza à l’ananas']] },
    peur: { n: 'Ta plus grande peur', kind: 'nom', sel: ART, def: 'un', ph: 'clown', ex: [['un', 'clown'], ['une', 'araignée'], ['des', 'pigeons'], ['un', 'aspirateur'], ['une', 'marionnette'], ['des', 'abeilles']] },
    doudou: { n: 'Le nom de ton doudou', kind: 'nomp', ph: 'Monsieur Lapin', ex: [['', 'Monsieur Lapin'], ['', 'Doudou Câlin'], ['', 'Patapouf'], ['', 'Capitaine Chaussette'], ['', 'Nounours Kevin']] },
    motinv: { n: 'Ton mot inventé', kind: 'nomp', ph: 'Flibouillon', ex: [['', 'Flibouillon'], ['', 'Scrougnette'], ['', 'Patatrouille'], ['', 'Gloubiboulga'], ['', 'Zapouf']] },
    animal: { n: 'Ton animal totem', kind: 'nom', sel: ART, def: 'un', ph: 'paresseux', ex: [['un', 'paresseux'], ['une', 'loutre'], ['un', 'ornithorynque'], ['une', 'girafe'], ['un', 'hérisson'], ['des', 'pingouins']] },
    surnom: { n: 'Ton surnom', kind: 'nomp', ph: 'La Fusée', ex: [['', 'La Fusée'], ['', 'Bubulle'], ['', 'Le Professeur'], ['', 'Chaussette'], ['', 'Ti-Loup']] },
    cri: { n: 'Ton expression fétiche', kind: 'quote', ph: 'Ça passe crème', ex: [['', 'Ça passe crème'], ['', 'Saperlipopette'], ['', 'Allez hop, on y va'], ['', 'C’est pas faux'], ['', 'Oh la belle bleue']] },
    deteste: { n: 'Ce que tu détestes le plus', kind: 'nom', sel: ART, def: 'des', ph: 'épinards', ex: [['des', 'épinards'], ['un', 'lundi matin'], ['des', 'chaussettes mouillées'], ['une', 'alarme de réveil'], ['un', 'bruit de craie']] },
    chanson: { n: 'Ta chanson préférée', kind: 'nomp', ph: 'Danse avec les poireaux', ex: [['', 'Danse avec les poireaux'], ['', 'Mon cœur fait boum'], ['', 'L’Été des moustiques'], ['', 'Pizza Pizza Baby']] },
    talent: { n: 'Ton talent caché', kind: 'act', ph: 'imiter un dauphin', ex: [['', 'imiter un dauphin'], ['', 'jongler avec des œufs'], ['', 'réciter l’alphabet à l’envers'], ['', 'dormir debout'], ['', 'deviner le prix des choses']] },
    bebe: { n: 'Le prénom de ton futur enfant', kind: 'nomp', ph: 'Gaston', ex: [['', 'Gaston'], ['', 'Luna'], ['', 'Marcel'], ['', 'Céleste'], ['', 'Napoléon']] },
    devise: { n: 'Ta devise', kind: 'quote', ph: 'Toujours plus de fromage', ex: [['', 'Toujours plus de fromage'], ['', 'Rien n’est impossible, sauf le lundi'], ['', 'Vivre vite, manger lentement'], ['', 'Un jour, peut-être']] },
    lieu: { n: 'L’endroit où tu rêves de vivre', kind: 'lieu', sel: [['a', 'à…'], ['au', 'au…'], ['en', 'en…'], ['aux', 'aux…'], ['dans', 'dans…'], ['sur', 'sur…']], def: 'au', ph: 'Japon',
      ex: [['au', 'Japon'], ['a', 'Tokyo'], ['en', 'Islande'], ['aux', 'Bahamas'], ['dans', 'une yourte'], ['sur', 'une péniche']] },
    coll: { n: 'Ta collection', kind: 'nom', sel: ART, def: 'des', ph: 'magnets de frigo', ex: [['des', 'magnets de frigo'], ['des', 'cailloux'], ['des', 'capsules de bouteille'], ['des', 'cuillères souvenirs'], ['des', 'canards en plastique']] },
    juron: { n: 'Ce que tu cries quand tu te cognes', kind: 'quote', ph: 'Sapristi de saperlotte', ex: [['', 'Sapristi de saperlotte'], ['', 'Crotte de bique'], ['', 'Nom d’une pipe en bois'], ['', 'Rhooo la vache'], ['', 'Mille sabords']] },
    secret: { n: 'Ton secret honteux', kind: 'quote', ph: 'J’ai déjà mangé de la pâtée pour chat', ex: [['', 'J’ai déjà mangé de la pâtée pour chat'], ['', 'Je pleure devant les pubs de yaourt'], ['', 'Je parle à mes plantes'], ['', 'Je ne sais pas faire mes lacets']] },
    // tes créations : elles finissent à l'affiche, en rayon, sur scène
    film: { n: 'Tes films', kind: 'titre', sel: genreSel(L.D.GENRES), def: 'comedie', ph: 'Le Retour du grille-pain', ex: [['comedie', 'Mamie fait du ski'], ['horreur', 'Le Frigo qui chuchote'], ['romance', 'Amour et coquillettes'], ['sf', 'Les Pingouins de Mars'], ['action', 'Opération Baguette']] },
    jeu: { n: 'Tes jeux vidéo', kind: 'titre', sel: genreSel(L.D.VG_GENRES), def: 'aventure', ph: 'Super Escargot Galactique', ex: [['plateforme', 'Super Escargot Galactique'], ['course', 'Brouette Kart'], ['combat', 'Chaussons de combat'], ['simulation', 'Simulateur de sieste'], ['rpg', 'La Légende du rond-point']] },
    livre: { n: 'Tes livres', kind: 'titre', sel: genreSel(L.D.BOOK_GENRES), def: 'roman', ph: 'Les Pantoufles de la colère', ex: [['roman', 'Les Pantoufles de la colère'], ['polar', 'Meurtre au rayon chaussettes'], ['poesie', 'Odes à mon radiateur'], ['devperso', 'Comment rater sa vie avec style'], ['fantasy', 'Le Dragon allergique']] },
    dj: { n: 'Tes DJ', kind: 'titre', pre: 'DJ-', sel: styleSel(L.D.DJ_STYLES), def: 'techno', ph: 'Crumble', ex: [['techno', 'Crumble'], ['house', 'Mayonnaise'], ['disco', 'Paillette'], ['dubstep', 'Tracteur'], ['lo-fi', 'Sieste']] },
    fest: { n: 'Tes festivals', kind: 'titre', pre: 'Festival ', sel: styleSel(L.D.FEST_STYLES), def: 'rock', ph: 'des Pantoufles volantes', ex: [['rock', 'des Pantoufles volantes'], ['électro', 'du Bout du monde'], ['folk', 'de la Soupe à l’oignon'], ['jazz', 'des Escargots pressés'], ['reggae', 'du Hamac']] }
  };
  function genreSel(G0) { return Object.keys(G0 || {}).map(function (k) { return [k, G0[k].n]; }); }
  function styleSel(list) { return (list || []).map(function (s) { return [s, s]; }); }
  M.TITLE_SLOTS = ['film', 'jeu', 'livre', 'dj', 'fest'];
  M.titleName = function (slot, e) { return (M.SLOTS[slot].pre || '') + e.t; };
  M.ORDER = Object.keys(M.SLOTS);
  const VERB = { avoir: 'avoir', etre: 'être', devenir: 'devenir', faire: 'faire', aller: 'aller', vivre: 'vivre' };
  const PREP = { a: 'à', au: 'au', en: 'en', aux: 'aux', dans: 'dans', sur: 'sur' };

  // ---------- accorder une phrase ----------
  // formes : nom → le, un, du (du/de la/de l’/des), au (au/à la/à l’/aux), dnu (de/d’ + nom seul), nu, ce, son, ton
  //          act → inf, de (de/d’ + infinitif), a (à + infinitif) ; nomp/quote → q (entre guillemets), raw, de ; lieu → raw
  M.form = function (slot, e, form) {
    const S = M.SLOTS[slot];
    if (!S || !e) return '…';
    const t = e.t;
    if (S.kind === 'act') {
      const inf = (S.sel ? VERB[e.s] || VERB[S.def] : '');
      const h = hl((inf ? inf + ' ' : '') + t);
      const first = inf || t;
      if (form === 'de') return (el(first) ? 'd’' : 'de ') + h;
      if (form === 'a') return 'à ' + h;
      return h;
    }
    if (S.kind === 'nomp' || S.kind === 'quote') {
      if (form === 'raw') return hl(t);
      if (form === 'de') return (el(t) ? 'd’' : 'de ') + hl(t);
      return '« ' + hl(t) + ' »';
    }
    if (S.kind === 'lieu') return hl((PREP[e.s] || PREP[S.def]) + ' ' + t);
    if (S.kind === 'titre') {
      const name = (S.pre || '') + t;
      if (form === 'raw') return hl(name);
      if (form === 'au') return 'au ' + hl(name);
      if (form === 'du') return 'du ' + hl(name);
      if (form === 'de') return (el(name) ? 'd’' : 'de ') + hl(name);
      return S.pre ? hl(name) : '« ' + hl(name) + ' »';
    }
    // nom
    const g = e.s === 'une' ? 'f' : e.s === 'des' ? 'p' : e.s === 'nom' ? 'n' : 'm';
    const v = el(t), h = hl(t);
    switch (form) {
      case 'un': return g === 'm' ? 'un ' + h : g === 'f' ? 'une ' + h : g === 'p' ? 'des ' + h : h;
      case 'du': return g === 'p' ? 'des ' + h : g === 'n' ? (v ? 'd’' : 'de ') + h : v ? 'de l’' + h : g === 'm' ? 'du ' + h : 'de la ' + h;
      case 'au': return g === 'p' ? 'aux ' + h : g === 'n' ? 'à ' + h : v ? 'à l’' + h : g === 'm' ? 'au ' + h : 'à la ' + h;
      case 'dnu': return (v ? 'd’' : 'de ') + h;
      case 'nu': return h;
      case 'ce': return g === 'p' ? 'ces ' + h : g === 'n' ? h : g === 'm' ? (v ? 'cet ' : 'ce ') + h : 'cette ' + h;
      case 'son': return g === 'p' ? 'ses ' + h : g === 'n' ? h : g === 'f' && !v ? 'sa ' + h : 'son ' + h;
      case 'ton': return g === 'p' ? 'tes ' + h : g === 'n' ? h : g === 'f' && !v ? 'ta ' + h : 'ton ' + h;
      default: return g === 'p' ? 'les ' + h : g === 'n' ? h : v ? 'l’' + h : g === 'm' ? 'le ' + h : 'la ' + h;
    }
  };
  // {@slot:forme} dans un texte : la même phrase est gardée pour tout le texte
  M.expand = function (s, c) {
    return s.replace(/\{@([a-z]+)(?::([a-z]+))?\}/g, function (m, slot, form) {
      c._mots = c._mots || {};
      let e = c._mots[slot];
      if (!e) {
        const l = c.life || G.L();
        const list = l && l.mots && l.mots[slot];
        if (!list || !list.length) return '…';
        e = c._mots[slot] = L.pick(list);
      }
      return M.form(slot, e, form);
    });
  };
  M.has = function (l, slot) { return !!(l.mots && l.mots[slot] && l.mots[slot].length); };
  M.count = function (l) { return l.mots ? Object.keys(l.mots).reduce(function (n, k) { return n + l.mots[k].length; }, 0) : 0; };
  M.example = function (slot) { const x = L.pick(M.SLOTS[slot].ex); return { s: x[0] || M.SLOTS[slot].def, t: x[1] }; };
  M.add = function (l, slot, e) {
    l.mots = l.mots || {};
    (l.mots[slot] = l.mots[slot] || []).push(e);
    if (M.count(l) >= 10) G.ach('moulin');
  };

  // ---------- les questions posées au fil de la vie ----------
  // who : qui pose la question (le premier présent) ; prev : la phrase écrite dans le journal (et l'aperçu)
  M.PROMPTS = [
    { id: 'doudou', slot: 'doudou', a: [2, 4], who: ['par', 'gp'], title: 'Un doudou sans nom', t: '{X} te tend ton doudou préféré : « Il lui faut un nom, tu ne crois pas ? »', prev: 'Ton doudou s’appelle désormais {@doudou}.' },
    { id: 'plat', slot: 'plat', a: [5, 7], who: ['gp', 'par'], title: 'Le repas du dimanche', t: '{X} prépare le repas du dimanche et te demande ton plat préféré.', prev: 'Le plat préféré de {prenom} : {@plat:le}.' },
    { id: 'peur', slot: 'peur', a: [6, 8], who: ['par', 'sib'], title: 'Ce qui fait peur', t: 'Il est tard. {X} éteint la lumière et te demande ce qui te fait le plus peur au monde.', prev: '{prenom} a une peur bleue {@peur:du}.' },
    { id: 'reve', slot: 'reve', a: [7, 9], who: ['mere', 'pere', 'par', 'gp'], title: 'Le rêve le plus cher', t: '{X} veut savoir quel est le rêve le plus cher de {prenom}.', prev: '{prenom} rêve {@reve:de}.' },
    { id: 'motinv', slot: 'motinv', a: [8, 10], who: null, title: 'Un mot tout neuf', t: 'En classe, tu inventes un mot qui n’existe pas. Toute la classe se met à le répéter.', prev: 'Le mot {@motinv} est né. Il ne veut rien dire, et c’est ça qui est beau.' },
    { id: 'animal', slot: 'animal', a: [9, 11], who: ['ami', 'sib'], title: 'Soirée pyjama', t: 'Soirée pyjama. {X} demande : « Si tu étais un animal, tu serais quoi ? »', prev: 'Si {prenom} était un animal, ce serait {@animal:un}.' },
    { id: 'surnom', slot: 'surnom', a: [10, 12], who: ['ami', 'sib'], title: 'Un surnom', t: '{X} décide qu’il te faut un surnom. Lequel acceptes-tu ?', prev: 'Désormais, tout le monde t’appelle {@surnom}.' },
    { id: 'cri', slot: 'cri', a: [11, 13], who: ['ami', 'par'], title: 'Ton expression', t: '{X} remarque que tu répètes toujours la même expression. Laquelle ?', prev: '{prenom} dit tout le temps : {@cri}' },
    { id: 'juron', slot: 'juron', a: [12, 15], who: null, title: 'Aïe, le petit orteil', t: 'Tu te cognes le petit orteil contre le pied du lit. Qu’est-ce que tu cries ?', prev: 'Quand {prenom} se cogne, {prenom} crie : {@juron}' },
    { id: 'deteste', slot: 'deteste', a: [13, 15], who: ['ami', 'sib', 'par'], title: 'Ton pire ennemi', t: '{X} te demande ce que tu détestes le plus au monde.', prev: '{prenom} déteste {@deteste:le}. Plus que tout.' },
    { id: 'chanson', slot: 'chanson', a: [14, 16], who: null, title: 'En boucle', t: 'Une chanson tourne en boucle dans tes écouteurs depuis trois semaines. Son titre ?', prev: 'La chanson de {prenom} : {@chanson}.' },
    { id: 'talent', slot: 'talent', a: [15, 17], who: ['ami', 'sib'], title: 'Talent caché', t: '{X} jure que tout le monde a un talent caché. Le tien, c’est…', prev: '{prenom} sait {@talent}. Personne ne sait pourquoi.' },
    { id: 'bebe', slot: 'bebe', a: [16, 22], who: ['ami', 'part'], title: 'Plus tard…', t: '{X} te demande : « Si un jour tu as un enfant, tu l’appelles comment ? »', prev: 'Le futur enfant de {prenom} s’appellera {@bebe}. C’est décidé.' },
    { id: 'devise', slot: 'devise', a: [18, 20], who: null, title: 'Une devise pour la vie', t: 'Tu es [majeur|majeure]. Il te faut une devise, une phrase pour toute ta vie.', prev: 'La devise de {prenom} : {@devise}' },
    { id: 'lieu', slot: 'lieu', a: [18, 24], who: ['ami', 'part'], title: 'Ailleurs', t: 'Un soir, avec {X}, tu regardes une carte du monde. Où rêves-tu de vivre un jour ?', prev: '{prenom} rêve de vivre {@lieu}.' },
    { id: 'coll', slot: 'coll', a: [22, 40], who: null, title: 'Une collection', t: 'Tu commences une collection. Personne ne comprend, mais c’est la tienne.', prev: '{prenom} collectionne {@coll:le}.' },
    { id: 'secret', slot: 'secret', a: [20, 45], who: ['ami', 'part', 'sib'], title: 'Un secret', t: '{X} te jure de ne rien répéter. Tu lui confies ton secret le plus honteux.', prev: 'Le secret de {prenom} : {@secret}' },
    { id: 'reve2', slot: 'reve', a: [30, 40], who: ['part', 'ami', 'sib'], title: 'Et maintenant ?', t: '{X} te demande : « Et toi, c’est quoi ton rêve, maintenant ? »', prev: 'Nouveau rêve : {prenom} rêve {@reve:de}.' },
    { id: 'plat2', slot: 'plat', a: [45, 60], who: ['part', 'enf', 'ami'], title: 'Les goûts changent', t: '{X} te demande si ton plat préféré a changé depuis le temps.', prev: 'Le plat préféré de {prenom}, version adulte : {@plat:le}.' },
    { id: 'jeu', slot: 'jeu', a: [10, 16], who: null, title: 'Le jeu de tes rêves', t: 'Dans ton cahier de brouillon, tu dessines un jeu vidéo entier, niveaux compris. Comment s’appelle-t-il ?', prev: '{prenom} invente un jeu vidéo : {@jeu}. Un jour, peut-être…' },
    { id: 'film', slot: 'film', a: [12, 18], who: null, title: 'Silence, ça tourne', t: 'En sortant du cinéma, tu imagines ton propre film. Il te faut un titre.', prev: '{prenom} imagine un film : {@film}. Un jour, peut-être…' },
    { id: 'dj', slot: 'dj', a: [15, 22], who: ['ami', 'sib'], title: 'Nom de scène', t: 'Avec {X}, vous vous imaginez DJ en soirée. Il te faut un nom de scène.', prev: 'Si {prenom} devient DJ, ce sera sous le nom de {@dj}.' },
    { id: 'livre', slot: 'livre', a: [16, 30], who: null, title: 'Le livre que tu écriras', t: 'Un jour, tu écriras un livre. Tu n’as pas encore l’histoire, mais tu as déjà le titre.', prev: 'Le futur livre de {prenom} : {@livre}.' },
    { id: 'fest', slot: 'fest', a: [18, 30], who: ['ami', 'part'], title: 'Ton festival', t: '{X} et toi rêvez d’organiser un festival. Comment s’appellerait-il ?', prev: 'Le festival imaginé par {prenom} : le {@fest}.' }
  ];
  M.prompt = function (id) { return M.PROMPTS.find(function (p) { return p.id === id; }); };
  function roleOf(name) {
    if (name === 'bebe') return L.pick(G.alive('enf').filter(function (p) { return p.age <= 2; })) || null;
    return G.role(name);
  }
  function asker(p) { if (!p.who) return null; for (let i = 0; i < p.who.length; i++) { const x = roleOf(p.who[i]); if (x) return x; } return null; }

  // ---------- les moments où tes mots reviennent ----------
  M.EV = [
    // rêve
    { id: 'r1', s: ['reve'], a: [10, 17], need: ['sib'], t: '{Sib} se confie à toi : {sib.il} aussi voulait {@reve}. Vous scellez un pacte secret avec du chewing-gum.' },
    { id: 'r2', s: ['reve'], a: [18, 26], need: ['mere'], t: '{Mere} retrouve ton dessin de maternelle : « Plus tard, je veux {@reve} ». Elle le raccroche au frigo, quinze ans plus tard.' },
    { id: 'r3', s: ['reve'], a: [20, 60], need: ['boss'], t: 'À l’entretien annuel, {boss} te demande où tu te vois dans cinq ans. Tu réponds : « En train {@reve:de}. » {Boss.il} écrit « motivé{e} ? ».' },
    { id: 'r4', s: ['reve'], a: [25, 70], need: ['part'], t: 'Pour ton anniversaire, {part} t’offre un coffret « Le kit pour {@reve} ». C’est l’intention qui compte. Vraiment.', fx: { b: 4, rq: { part: 4 } } },
    { id: 'r5', s: ['reve'], a: [35, 55], t: 'Petite crise existentielle : tu n’as toujours pas réussi à {@reve}. Tu achètes un livre de développement personnel et une glace.', fx: { b: -2 } },
    { id: 'r6', s: ['reve'], a: [40, 95], w: 3, t: 'Le jour est enfin arrivé : tu as réussi à {@reve} ! Tu pleures de joie pendant trois heures.', fx: { b: 15, ach: 'reve' }, k: 'big' },
    { id: 'r7', s: ['reve'], a: [55, 100], need: ['enf'], t: '{Enf} apprend ton rêve d’enfance : {@reve}. {Enf.il} décide de t’aider à le réaliser. Tu fais semblant de ne pas pleurer.', fx: { b: 5, rq: { enf: 6 } } },
    { id: 'r8', s: ['reve'], a: [14, 25], need: ['ami'], t: '{Ami} t’envoie un message à 2 h du matin : « Tu te souviens que tu voulais {@reve} ? Moi j’y crois. »', fx: { b: 3, rq: { ami: 4 } } },
    // plat
    { id: 'p1', s: ['plat'], a: [6, 16], need: ['gp'], t: '{Gp} te prépare {@plat:du} tous les dimanches. Tu n’as jamais eu le cœur de dire que tu saturais un peu.' },
    { id: 'p2', s: ['plat'], a: [17, 45], t: 'Premier rendez-vous galant : tu commandes {@plat:du}. La moitié finit sur ta chemise. Il y aura un deuxième rendez-vous quand même.' },
    { id: 'p3', s: ['plat'], a: [25, 70], need: ['enf'], t: '{Enf} refuse de manger {@plat:le}. Tu te demandes à quel moment tu as raté son éducation.' },
    { id: 'p4', s: ['plat'], a: [70, 110], t: 'À la maison de retraite, tu as obtenu {@plat:du} tous les jeudis. Tu as négocié comme un chef.', fx: { b: 3 } },
    { id: 'p5', s: ['plat'], a: [20, 70], need: ['part'], t: '{Part} t’a préparé {@plat:du} « à sa façon ». Tu souris très fort. Très, très fort.', fx: { rq: { part: 3 } } },
    // peur
    { id: 'f1', s: ['peur'], a: [7, 16], need: ['sib'], t: '{Sib} a caché {@peur:un} en plastique sous ta couette. Tu cries si fort que le voisin appelle les pompiers.', fx: { b: -2, rq: { sib: -3 } } },
    { id: 'f2', s: ['peur'], a: [8, 60], t: 'Cauchemar : tu fuis {@peur:le} dans un supermarché sans fin. Tu te réveilles en criant « Caisse numéro 4 ! ».' },
    { id: 'f3', s: ['peur'], a: [22, 60], need: ['boss'], t: 'Team-building au bureau, thème du jour : {@peur:le}. Tu passes la journée [caché|cachée] dans les toilettes.', fx: { b: -2 } },
    { id: 'f4', s: ['peur'], a: [30, 80], t: 'Pour vaincre ta peur {@peur:du}, tu t’inscris à un stage de trois jours. Tu tiens 40 minutes. C’est déjà ça.' },
    { id: 'f5', s: ['peur'], a: [5, 12], need: ['par'], t: '{Par} essaie de te guérir de ta peur {@peur:du} avec une méthode trouvée sur internet. C’est pire.' },
    // doudou
    { id: 'd1', s: ['doudou'], a: [3, 8], need: ['par'], t: '{Par} lave {@doudou} à 60 °C. Tu fais trois jours de deuil. Il revient tout doux et légèrement rose.' },
    { id: 'd2', s: ['doudou'], a: [15, 30], t: 'En rangeant ta chambre, tu retrouves {@doudou}. Tu le caches avant que quelqu’un ne le voie. Tu dors avec, juste ce soir.' },
    { id: 'd3', s: ['doudou'], a: [25, 60], need: ['enfK'], t: 'Tu offres {@doudou} à {enfK.n}. Le flambeau est passé. {EnfK.il} le renomme aussitôt. Tu fais comme si ça ne te faisait rien.' },
    { id: 'd4', s: ['doudou'], a: [60, 110], t: '{@doudou} trône toujours sur ta table de nuit. Il a vécu plus longtemps que trois de tes voitures.' },
    // mot inventé
    { id: 'm1', s: ['motinv'], a: [10, 18], need: ['par'], t: 'Toute la famille dit {@motinv} maintenant. Même {par.n}, qui fait semblant de trouver ça idiot.' },
    { id: 'm2', s: ['motinv'], a: [22, 70], t: 'Le mot {@motinv} entre dans le dictionnaire. Définition : « inventé par {prenom}, personne ne sait ce que ça veut dire ».', fx: { b: 6, c: 2 }, k: 'big' },
    { id: 'm3', s: ['motinv'], a: [20, 65], need: ['coll'], t: '{Coll} dit {@motinv} en pleine réunion. Tu ne dis rien, mais tu es très [fier|fière].' },
    { id: 'm4', s: ['motinv'], a: [28, 80], need: ['enfK'], t: '{EnfK} rentre de l’école : toute sa classe dit {@motinv}. Ton héritage est assuré.' },
    // animal
    { id: 'a1', s: ['animal'], a: [10, 30], t: 'Au zoo, tu restes deux heures devant {@animal:le}. Vous vous comprenez sans un mot.' },
    { id: 'a2', s: ['animal'], a: [20, 70], need: ['part'], t: '{Part} t’offre une peluche géante en forme {@animal:dnu}. Elle prend toute la place dans le lit.', fx: { b: 3 } },
    { id: 'a3', s: ['animal'], a: [16, 40], need: ['ami'], t: '{Ami} te dessine {@animal:un} sur le bras au feutre indélébile. Ça ne part pas pendant une semaine.' },
    { id: 'a4', s: ['animal'], a: [30, 100], t: 'Un documentaire à la télé sur {@animal:le}. Tu pleures devant l’écran. Tu sais pourquoi.' },
    // surnom
    { id: 's1', s: ['surnom'], a: [12, 25], need: ['ami'], t: '{Ami} t’appelle {@surnom} devant toute la cafétéria. Ça y est, c’est officiel.' },
    { id: 's2', s: ['surnom'], a: [22, 65], need: ['ami', 'boss'], t: '{Ami} t’appelle {@surnom} devant {boss}. Depuis, tout le bureau t’appelle comme ça.' },
    { id: 's3', s: ['surnom'], a: [28, 75], need: ['enf'], t: '{Enf} découvre que ton surnom était {@surnom}. {Enf.il} ne s’en remet pas.' },
    { id: 's4', s: ['surnom'], a: [70, 110], t: 'À la maison de retraite, personne ne connaît ton vrai prénom. Pour tout le monde, tu es {@surnom}.' },
    // expression fétiche
    { id: 'c1', s: ['cri'], a: [12, 18], t: 'En plein contrôle de maths, tu lâches {@cri} à voix haute. La prof te met une heure de colle et un petit sourire.' },
    { id: 'c2', s: ['cri'], a: [22, 64], need: ['boss'], t: 'En pleine réunion avec {boss}, tu laisses échapper {@cri}. Silence. Puis {boss.n} en fait le slogan de l’entreprise.', fx: { perf: 5, b: 3 } },
    { id: 'c3', s: ['cri'], a: [18, 60], need: ['bebe'], t: 'Le premier mot de {bebe.n} : {@cri}. Personne ne sait d’où ça vient. Toi, si.', fx: { b: 6 } },
    { id: 'c4', s: ['cri'], a: [14, 95], t: 'Le perroquet du voisin a appris {@cri}. Il le hurle tous les jours à 6 h du matin. Tout le quartier sait que c’est ta faute.' },
    { id: 'c5', s: ['cri'], a: [25, 90], need: ['ami'], t: '{Ami} fait imprimer {@cri} sur des t-shirts. Il s’en vend 400 au marché. Tu ne touches aucun droit d’auteur.' },
    // ce que tu détestes
    { id: 'h1', s: ['deteste'], a: [14, 25], need: ['par'], t: 'Pour ton anniversaire, {par} t’offre {@deteste:un}. « Je croyais que tu adorais ça ! »', fx: { b: -1 } },
    { id: 'h2', s: ['deteste'], a: [18, 60], need: ['part'], t: 'Révélation : {part} adore {@deteste:le}. Premier vrai test pour votre couple.', fx: { rq: { part: -2 } } },
    { id: 'h3', s: ['deteste'], a: [22, 64], need: ['boss'], t: '{Boss} organise une journée spéciale autour {@deteste:du} au bureau. Tu poses un jour de congé.' },
    { id: 'h4', s: ['deteste'], a: [45, 110], t: 'Des décennies plus tard, ton verdict n’a pas bougé d’un millimètre : tu détestes toujours {@deteste:le}.' },
    // chanson
    { id: 'k1', s: ['chanson'], a: [15, 35], t: 'Au karaoké, tu choisis {@chanson}. Tu connais toutes les paroles, même celles qui n’existent pas.', fx: { s: 3, b: 3 } },
    { id: 'k2', s: ['chanson'], a: [20, 60], need: ['part'], t: 'Pour votre danse, {part} a choisi {@chanson}. Tu pleures dès la deuxième note.', fx: { b: 5, rq: { part: 5 } } },
    { id: 'k3', s: ['chanson'], a: [30, 80], need: ['enfT'], t: '{EnfT} trouve {@chanson} « trop ringarde ». Tu la passes en boucle dans la voiture pendant trois jours.' },
    { id: 'k4', s: ['chanson'], a: [65, 110], t: 'À la radio, ils passent {@chanson}. Tu fermes les yeux : tu as quinze ans, pendant trois minutes et quarante secondes.', fx: { b: 5 } },
    // talent
    { id: 't1', s: ['talent'], a: [17, 45], t: 'À un entretien d’embauche, on te demande ton talent caché. Tu te lèves et tu montres que tu sais {@talent}. Le recruteur est conquis. Ou terrifié.' },
    { id: 't2', s: ['talent'], a: [18, 60], need: ['sib'], t: 'Au mariage d’un cousin, {sib} te supplie de montrer ton talent. Tu sais {@talent}, et maintenant toute la famille aussi.', fx: { s: 3 } },
    { id: 't3', s: ['talent'], a: [20, 70], w: 4, t: 'Tu passes à l’émission « La France a un incroyable talent » pour {@talent}. Le jury te donne trois « oui » et un regard inquiet.', fx: { c: 4, b: 5 }, k: 'big' },
    { id: 't4', s: ['talent'], a: [28, 90], need: ['enfK'], t: '{EnfK} veut apprendre {@talent:a}. Tu deviens [le meilleur prof|la meilleure prof] du monde.', fx: { rq: { enfK: 6 } } },
    // futur prénom
    { id: 'b1', s: ['bebe'], a: [18, 35], need: ['ami'], t: '{Ami} te rappelle que ton futur enfant doit s’appeler {@bebe}. Vous trinquez à sa santé, même s’il n’existe pas encore.' },
    // devise
    { id: 'v1', s: ['devise'], a: [18, 45], t: 'Tu te fais tatouer ta devise : {@devise}. Le tatoueur fait une faute d’orthographe. Tu l’assumes.', fx: { c: 1 } },
    { id: 'v2', s: ['devise'], a: [20, 30], t: 'Remise des diplômes : on te tend le micro. Tu dis juste {@devise}. Standing ovation, surtout au premier rang.', fx: { c: 2, b: 2 } },
    { id: 'v3', s: ['devise'], a: [30, 95], need: ['enfA'], t: '{EnfA} t’avoue que ta devise, {@devise}, l’a aidé{enfA.e} à tenir dans les moments difficiles.', fx: { b: 6, rq: { enfA: 5 } } },
    // lieu
    { id: 'l1', s: ['lieu'], a: [20, 60], t: 'Tu épargnes en secret pour partir vivre {@lieu}. Ta tirelire s’appelle « Projet ».' },
    { id: 'l2', s: ['lieu'], a: [25, 75], need: ['part'], t: '{Part} t’annonce une surprise : une semaine de vacances {@lieu} ! Il pleut tous les jours. C’est le plus beau voyage de ta vie.', fx: { b: 8, rq: { part: 6 } }, k: 'love' },
    { id: 'l3', s: ['lieu'], a: [50, 100], need: ['enfA'], t: 'Une carte postale arrive : « Je suis {@lieu}, je pense à toi. » C’est {enfA.n}. Tu l’accroches au frigo.', fx: { b: 5 } },
    // collection
    { id: 'o1', s: ['coll'], a: [25, 60], need: ['part'], t: 'Ta collection {@coll:dnu} déborde du placard. {Part} pose un ultimatum : « Elle ou moi. » Tu réfléchis trop longtemps.', fx: { rq: { part: -3 } } },
    { id: 'o2', s: ['coll'], a: [30, 90], t: 'Un expert examine ta collection {@coll:dnu}. Valeur estimée : 12 €. Valeur sentimentale : inestimable.' },
    { id: 'o3', s: ['coll'], a: [35, 90], need: ['enf'], t: '{Enf} revend une partie de ta collection {@coll:dnu} sur internet. Tu ne lui parles plus pendant une semaine.', fx: { rq: { enf: -4 } } },
    // juron
    { id: 'j1', s: ['juron'], a: [13, 30], need: ['par'], t: 'Tu te cognes contre la table du salon et tu cries {@juron}. {Par} le note dans le carnet des citations de la famille.' },
    { id: 'j2', s: ['juron'], a: [22, 64], need: ['boss'], t: 'Tu renverses ton café sur ton clavier et tu cries {@juron} en plein open space. {Boss} adopte l’expression.' },
    { id: 'j3', s: ['juron'], a: [26, 60], need: ['enfK'], t: '{EnfK} se cogne à l’école et crie {@juron}. La maîtresse t’envoie un mot. Tu fais semblant de ne pas savoir d’où ça vient.' },
    // secret
    { id: 'x1', s: ['secret'], a: [21, 60], need: ['ami'], t: 'À une soirée, {ami} a trop bu et révèle ton secret à tout le monde : {@secret}. Tu n’oses plus sortir pendant une semaine.', fx: { b: -4, rq: { ami: -8 } }, k: 'bad' },
    { id: 'x2', s: ['secret'], a: [35, 100], need: ['part'], t: 'Après des années, tu avoues ton secret à {part} : {@secret}. {Part.il} éclate de rire, puis t’avoue le sien. Il est bien pire.', fx: { b: 4, rq: { part: 6 } } },
    // mélanges
    { id: 'z1', s: ['cri', 'surnom'], a: [14, 70], need: ['ami'], t: '{Ami} t’imite devant tout le monde : « Salut, c’est {@surnom:raw}, et je dis tout le temps {@cri} ! » Tout le monde rit. Toi aussi, un peu.', fx: { s: 2 } },
    { id: 'z2', s: ['plat', 'lieu'], a: [30, 80], t: 'Coup de folie : tu ouvres un petit restaurant {@lieu} qui ne sert que {@plat:du}. Il ferme au bout de trois mois. Tu ne regrettes rien.', fx: { m: -4000, b: 5 } },
    { id: 'z3', s: ['animal', 'peur'], a: [8, 60], t: 'Un rêve étrange : {@animal:un} géant te protège {@peur:du}. Tu te réveilles [reconnaissant|reconnaissante].' },
    { id: 'z4', s: ['reve', 'deteste'], a: [18, 60], t: 'Ironie du sort : pour {@reve}, il faudrait supporter {@deteste:le} pendant des mois. Tu hésites très, très longtemps.' },
    { id: 'z5', s: ['juron', 'doudou'], a: [20, 70], t: 'Tu marches pieds nus sur un jouet en rangeant le grenier et tu cries {@juron}. C’était {@doudou}. Vous vous retrouvez enfin.' },
    { id: 'z6', s: ['chanson', 'talent'], a: [16, 60], t: 'Ton numéro au spectacle de fin d’année : {@talent} sur {@chanson}. Personne n’était prêt. Ovation.', fx: { s: 3, c: 2 } },
    // tes créations reviennent dans le monde
    { id: 'tf1', s: ['film'], a: [16, 95], t: 'Incroyable : un studio sort un film qui s’appelle {@film}, exactement le titre que tu avais inventé ! Tu cries au plagiat en pleine salle.', fx: { b: 3 } },
    { id: 'tf2', s: ['film'], a: [14, 80], need: ['ami'], t: '{Ami} te demande ton film préféré. Tu réponds {@film} sans réfléchir. {Ami.il} le cherche partout et ne le trouve pas.' },
    { id: 'tj1', s: ['jeu'], a: [14, 60], need: ['ami'], t: '{Ami} te bat à {@jeu} en ligne, et te le rappelle tous les jours.' },
    { id: 'tj2', s: ['jeu'], a: [28, 80], need: ['enfK'], t: '{EnfK} joue à {@jeu} toute la nuit. Tu ne peux pas lui en vouloir : c’est toi qui en avais inventé le nom.' },
    { id: 'tl1', s: ['livre'], a: [20, 95], t: 'Dans une librairie, tu tombes sur {@livre}. Quelqu’un a écrit le livre dont tu avais imaginé le titre. Tu l’achètes, par principe.', fx: { b: 3 } },
    { id: 'tl2', s: ['livre'], a: [25, 90], need: ['part'], t: '{Part} lit {@livre} au lit. Tu fais semblant de ne pas lire par-dessus son épaule.' },
    { id: 'td1', s: ['dj'], a: [16, 45], t: '{@dj} mixe à la fête du quartier. Tu cries « C’est moi qui ai trouvé ce nom ! ». Personne ne te croit.', fx: { s: 2 } },
    { id: 'td2', s: ['dj'], a: [18, 60], need: ['sib'], t: 'Au mariage de {sib}, c’est {@dj} aux platines. La piste de danse s’effondre, de joie.', fx: { s: 3, b: 3 } },
    { id: 'tfe1', s: ['fest'], a: [18, 60], t: 'Tu achètes un pass trois jours pour le {@fest}. Il pleut tout le week-end. C’est parfait.', fx: { b: 4, s: 3 } },
    { id: 'tfe2', s: ['fest'], a: [18, 70], need: ['ami'], t: '{Ami} revient {@fest:du} avec un bracelet fluo et la voix cassée. Tu es [jaloux|jalouse].' }
  ];
  function eligible(e, l) {
    const a = l.me.age;
    if (l.motEv && l.motEv[e.id]) return null;
    if (a < e.a[0] || a > e.a[1]) return null;
    if (!e.s.every(function (s) { return M.has(l, s); })) return null;
    const c = G.ctx();
    if (e.need) for (let i = 0; i < e.need.length; i++) { const p = roleOf(e.need[i]); if (!p) return null; c.r[e.need[i]] = p; }
    return c;
  }
  M.fire = function (e, c) {
    const l = G.L();
    l.motEv = l.motEv || {};
    l.motEv[e.id] = 1;
    return G.say(e.t, e.fx || { b: 1 }, c, e.k || 'mot');
  };
  // chaque année : au plus une question, et parfois un de tes mots qui revient
  M.yearly = function (l) {
    const a = l.me.age;
    l.mots = l.mots || {}; l.motQ = l.motQ || {};
    if (!l.queue.some(function (q) { return q.t === 'mot'; })) {
      const due = M.PROMPTS.filter(function (p) {
        const st = l.motQ[p.id];
        if (st === 1 || st === 2) return false;
        if (st && st.skip != null) return a >= st.skip + 4 && a <= p.a[1] + 15;
        return a >= p.a[0] && a <= p.a[1] + 15 && (p.id !== 'reve2' && p.id !== 'plat2' || M.has(l, p.slot));
      })[0];
      if (due && (a <= due.a[1] || L.chance(0.6))) {
        const x = asker(due);
        l.queue.push({ k: 'q', t: 'mot', id: due.id, x: x ? x.id : 0 });
      }
    }
    if (M.count(l) && L.chance(0.38)) {
      const cands = [];
      M.EV.forEach(function (e) { const c = eligible(e, l); if (c) cands.push({ e: e, c: c }); });
      const pick = L.wpick(cands, function (x) { return x.e.w || 10; });
      if (pick) M.fire(pick.e, pick.c);
    }
  };
  // le prénom qu'on gardait en tête pour son enfant, s'il est encore libre
  M.babyName = function (l) {
    const used = G.alive('enf').map(function (p) { return p.first.toLowerCase(); });
    const list = (l.mots && l.mots.bebe || []).filter(function (e) { return used.indexOf(e.t.toLowerCase()) < 0; });
    return list.length ? list[0].t : null;
  };

  // ---------- la question dans la file du jeu ----------
  G.Q.mot = {
    view: function (q, l) {
      const p = M.prompt(q.id);
      if (!p) return null;
      const c = G.ctx({ x: G.byId(q.x) });
      const S = M.SLOTS[p.slot];
      return {
        kicker: 'TES MOTS · ' + l.me.age + ' ANS', title: L.T(p.title, c), ink: 'm', text: L.T(p.t, c),
        mot: { slot: p.slot, prev: p.prev, sel: S.def || '', v: '' },
        opts: [{ id: 'ok', l: 'Valider' }, { id: 'skip', l: 'Je ne sais pas encore', alt: 1 }]
      };
    },
    answer: function (q, id, l, val) {
      const p = M.prompt(q.id);
      l.queue.shift();
      if (!p) return null;
      l.motQ = l.motQ || {};
      let e = null;
      if (id !== 'skip') {
        if (val && typeof val === 'object') e = { s: val.s || M.SLOTS[p.slot].def || '', t: M.clean(val.t) };
        else e = M.example(p.slot); // sans saisie (simulation)
      }
      if (!e || !e.t) {
        const st = l.motQ[p.id];
        l.motQ[p.id] = st && st.skip != null ? 2 : { skip: l.me.age };
        return null;
      }
      l.motQ[p.id] = 1;
      M.add(l, p.slot, e);
      const c = G.ctx({ x: G.byId(q.x) });
      c._mots = {}; c._mots[p.slot] = e;
      return G.say(p.prev, { b: 1 }, c, 'mot');
    }
  };
  // aperçu en direct pendant la saisie
  M.preview = function (slot, prevTpl, e) {
    const c = G.ctx();
    c._mots = {}; c._mots[slot] = e;
    return L.T(prevTpl, c);
  };
  M.DEF_PREV = {
    reve: '{prenom} rêve {@reve:de}.', plat: 'Le plat préféré de {prenom} : {@plat:le}.', peur: '{prenom} a une peur bleue {@peur:du}.', doudou: 'Ton doudou s’appelle {@doudou}.',
    motinv: 'Le mot {@motinv} est né.', animal: 'Si {prenom} était un animal, ce serait {@animal:un}.', surnom: 'On t’appelle {@surnom}.', cri: '{prenom} dit tout le temps : {@cri}',
    deteste: '{prenom} déteste {@deteste:le}.', chanson: 'La chanson de {prenom} : {@chanson}.', talent: '{prenom} sait {@talent}.', bebe: 'Le futur enfant de {prenom} s’appellera {@bebe}.',
    devise: 'La devise de {prenom} : {@devise}', lieu: '{prenom} rêve de vivre {@lieu}.', coll: '{prenom} collectionne {@coll:le}.', juron: 'Quand {prenom} se cogne : {@juron}', secret: 'Le secret de {prenom} : {@secret}',
    film: 'Un film imaginé par {prenom} : {@film}.', jeu: 'Un jeu vidéo imaginé par {prenom} : {@jeu}.', livre: 'Un livre imaginé par {prenom} : {@livre}.', dj: 'Un DJ imaginé par {prenom} : {@dj}.', fest: 'Un festival imaginé par {prenom} : le {@fest}.'
  };
  // tes créations, prêtes à passer à l'affiche (cinéma, ludothèque, librairie, concerts, festivals)
  M.mine = function (slot) {
    const l = G.L();
    return (l && l.mots && l.mots[slot] || []).map(function (e) { return { t: M.titleName(slot, e), g: e.s, mine: 1 }; });
  };

})(window.LP);
