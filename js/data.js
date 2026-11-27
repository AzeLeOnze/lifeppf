/* LifePPF — données : prénoms, villes, compétences, caractère, école, études, métiers, objets, maladies, succès, niveaux. */
(function (L) {
  'use strict';
  const D = L.D = {};

  // ---------- les 4 jauges ----------
  D.STATS = [
    { k: 'h', n: 'Santé', short: 'SAN' },
    { k: 'b', n: 'Bonheur', short: 'BON' },
    { k: 'c', n: 'Charisme', short: 'CHA' },
    { k: 's', n: 'Social', short: 'SOC' }
  ];

  // ---------- prénoms par génération ----------
  D.FIRST = {
    old: {
      M: ['Jean', 'Michel', 'Pierre', 'André', 'Bernard', 'Jacques', 'Gérard', 'Claude', 'Roger', 'René', 'Marcel', 'Robert', 'Daniel', 'Alain', 'Guy', 'Raymond', 'Henri', 'Lucien', 'Georges', 'Maurice', 'Paul', 'Jean-Pierre', 'Gilbert', 'Yves', 'Serge', 'Christian', 'Roland', 'Louis', 'Albert', 'Fernand'],
      F: ['Marie', 'Jeanne', 'Monique', 'Jacqueline', 'Françoise', 'Simone', 'Denise', 'Josiane', 'Ginette', 'Colette', 'Paulette', 'Odette', 'Suzanne', 'Yvette', 'Micheline', 'Huguette', 'Nicole', 'Annie', 'Christiane', 'Danielle', 'Madeleine', 'Germaine', 'Lucienne', 'Bernadette', 'Gisèle', 'Arlette', 'Renée', 'Marcelle', 'Janine', 'Mireille']
    },
    mid: {
      M: ['Philippe', 'Patrick', 'Thierry', 'Christophe', 'Stéphane', 'Laurent', 'Frédéric', 'Éric', 'Pascal', 'Olivier', 'David', 'Nicolas', 'Sébastien', 'Julien', 'Jérôme', 'Cédric', 'Vincent', 'Franck', 'Didier', 'Fabrice', 'Arnaud', 'Guillaume', 'Mickaël', 'Ludovic', 'Grégory', 'Xavier', 'Romain', 'Damien', 'Benoît', 'Karim'],
      F: ['Nathalie', 'Isabelle', 'Sylvie', 'Sandrine', 'Valérie', 'Céline', 'Stéphanie', 'Véronique', 'Christelle', 'Karine', 'Virginie', 'Sophie', 'Aurélie', 'Émilie', 'Delphine', 'Laetitia', 'Audrey', 'Caroline', 'Élodie', 'Julie', 'Corinne', 'Patricia', 'Martine', 'Catherine', 'Hélène', 'Séverine', 'Magali', 'Vanessa', 'Mélanie', 'Samia']
    },
    now: {
      M: ['Lucas', 'Nathan', 'Hugo', 'Enzo', 'Louis', 'Gabriel', 'Arthur', 'Jules', 'Léo', 'Raphaël', 'Adam', 'Mathis', 'Théo', 'Noah', 'Tom', 'Ethan', 'Maël', 'Sacha', 'Paul', 'Mohamed', 'Nolan', 'Timéo', 'Kylian', 'Baptiste', 'Axel', 'Rayan', 'Liam', 'Aaron', 'Malo', 'Gaspard', 'Ibrahim', 'Yanis'],
      F: ['Emma', 'Léa', 'Chloé', 'Manon', 'Inès', 'Jade', 'Louise', 'Alice', 'Lina', 'Camille', 'Sarah', 'Zoé', 'Juliette', 'Lola', 'Ambre', 'Rose', 'Anna', 'Mila', 'Clara', 'Lou', 'Romane', 'Maëlys', 'Nina', 'Agathe', 'Margaux', 'Léna', 'Yasmine', 'Eva', 'Capucine', 'Jeanne', 'Aïcha', 'Nour']
    },
    fut: {
      M: ['Kaï', 'Orion', 'Zéphyr', 'Néo', 'Ézio', 'Ilyan', 'Soren', 'Elio', 'Aël', 'Nox', 'Atlas', 'Lior', 'Milo', 'Cosmo', 'Ryu', 'Ulysse', 'Iko', 'Oslo', 'Talos', 'Ezra'],
      F: ['Nova', 'Lyra', 'Astra', 'Iris', 'Luna', 'Elya', 'Swann', 'Aube', 'Zia', 'Céleste', 'Mira', 'Neïla', 'Ondine', 'Vega', 'Lumi', 'Kaïa', 'Sélène', 'Ysé', 'Nyx', 'Électre']
    }
  };
  D.LAST = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guérin', 'Muller', 'Henry', 'Roussel', 'Perrin', 'Morin', 'Mathieu', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin', 'Masson', 'Sanchez', 'Nguyen', 'Boyer', 'Denis', 'Lemaire', 'Duval', 'Joly', 'Roche', 'Roy', 'Noël', 'Meyer', 'Lucas', 'Meunier', 'Pérez', 'Marchand', 'Dufour', 'Blanchard', 'Barbier', 'Brun', 'Dumas', 'Brunet', 'Schmitt', 'Leroux', 'Colin', 'Fernandez', 'Renard', 'Arnaud', 'Caron', 'Aubert', 'Giraud', 'Leclerc', 'Vidal', 'Bourgeois', 'Renaud', 'Lemoine', 'Picard', 'Gaillard', 'Lacroix', 'Fabre', 'Dupuis', 'Olivier', 'Da Silva', 'Hoarau', 'Le Gall', 'Kerjean', 'Benali', 'Haddad', 'Diallo', 'Traoré', 'Ferreira', 'Rakoto', 'Tran', 'Kowalski', 'Bensaïd', 'Le Goff'];
  D.firstName = function (sex, birthYear) {
    const g = birthYear < 1958 ? 'old' : birthYear < 1990 ? 'mid' : birthYear < 2045 ? 'now' : 'fut';
    return L.pick(D.FIRST[g][sex === 'F' ? 'F' : 'M']);
  };

  // ---------- villes (taille, régions) ----------
  // tailles : metro, grande, moyenne, petite, village
  D.CITIES = [
    ['Paris', 'metro', 'paris'], ['Marseille', 'grande', 'sud mer'], ['Lyon', 'grande', 'lyon'], ['Toulouse', 'grande', 'sud'], ['Nice', 'grande', 'sud mer'],
    ['Nantes', 'grande', 'ouest'], ['Montpellier', 'grande', 'sud'], ['Strasbourg', 'grande', 'est'], ['Bordeaux', 'grande', 'ouest'], ['Lille', 'grande', 'nord'],
    ['Rennes', 'moyenne', 'bzh'], ['Reims', 'moyenne', 'est'], ['Toulon', 'moyenne', 'sud mer'], ['Saint-Étienne', 'moyenne', ''], ['Le Havre', 'moyenne', 'nord mer'],
    ['Grenoble', 'moyenne', 'mont'], ['Dijon', 'moyenne', ''], ['Angers', 'moyenne', 'ouest'], ['Nîmes', 'moyenne', 'sud'], ['Clermont-Ferrand', 'moyenne', 'mont'],
    ['Aix-en-Provence', 'moyenne', 'sud'], ['Brest', 'moyenne', 'bzh mer'], ['Tours', 'moyenne', ''], ['Amiens', 'moyenne', 'nord'], ['Limoges', 'moyenne', ''],
    ['Annecy', 'moyenne', 'mont'], ['Perpignan', 'moyenne', 'sud mer'], ['Metz', 'moyenne', 'est'], ['Besançon', 'moyenne', 'est'], ['Orléans', 'moyenne', ''],
    ['Rouen', 'moyenne', 'nord'], ['Caen', 'moyenne', 'nord mer'], ['Nancy', 'moyenne', 'est'], ['Avignon', 'moyenne', 'sud'], ['Poitiers', 'moyenne', 'ouest'],
    ['Fort-de-France', 'moyenne', 'dom mer'], ['Saint-Denis de La Réunion', 'moyenne', 'dom mer'],
    ['La Rochelle', 'petite', 'ouest mer'], ['Pau', 'petite', 'sud mont'], ['Bayonne', 'petite', 'sud mer'], ['Ajaccio', 'petite', 'corse mer'], ['Quimper', 'petite', 'bzh'],
    ['Colmar', 'petite', 'est'], ['Chambéry', 'petite', 'mont'], ['Saint-Malo', 'petite', 'bzh mer'], ['Vannes', 'petite', 'bzh mer'], ['Arles', 'petite', 'sud'],
    ['Carcassonne', 'petite', 'sud'], ['Biarritz', 'petite', 'sud mer'], ['Pointe-à-Pitre', 'petite', 'dom mer'],
    ['Sarlat-la-Canéda', 'village', ''], ['Gérardmer', 'village', 'mont est'], ['Cancale', 'village', 'bzh mer'], ['Rocamadour', 'village', ''], ['Saint-Tropez', 'village', 'sud mer'],
    ['Chamonix', 'village', 'mont'], ['Étretat', 'village', 'nord mer'], ['Riquewihr', 'village', 'est'], ['Collioure', 'village', 'sud mer'], ['Bonifacio', 'village', 'corse mer']
  ].map(function (c) { return { n: c[0], size: c[1], tags: c[2] }; });
  D.city = function (name) { return D.CITIES.find(function (c) { return c.n === name; }) || { n: name, size: 'moyenne', tags: '' }; };
  D.SIZE = {
    metro: { n: 'métropole', sal: 1.22, rent: 1.9 },
    grande: { n: 'grande ville', sal: 1.06, rent: 1.25 },
    moyenne: { n: 'ville moyenne', sal: 1, rent: 1 },
    petite: { n: 'petite ville', sal: 0.95, rent: 0.85 },
    village: { n: 'village', sal: 0.9, rent: 0.7 }
  };

  // ---------- richesse de la famille ----------
  D.WEALTH = [
    { id: 'modeste', n: 'modeste', w: 26, pocket: 80, help: 0, inherit: 4000, jobs: ['caisse', 'menage', 'manut', 'livreur', 'serveur', 'agriculteur', 'securite', 'chauffeur', 'aidesoignant', 'vendeur'] },
    { id: 'moyenne', n: 'moyenne', w: 44, pocket: 220, help: 0.35, inherit: 30000, jobs: ['facteur', 'infirmier', 'meca', 'elec', 'secretaire', 'prof', 'boulanger', 'policier', 'comptable', 'commercial', 'coiffeur', 'pompier'] },
    { id: 'aisee', n: 'aisée', w: 22, pocket: 600, help: 0.75, inherit: 140000, jobs: ['inge', 'dev', 'pharma', 'archi', 'banquier', 'avocat', 'medecin', 'agentimmo', 'chercheur'] },
    { id: 'riche', n: 'très riche', w: 8, pocket: 2500, help: 1, inherit: 1200000, jobs: ['trader', 'medecin', 'avocat', 'pilote', 'animtv', 'politique', 'chef'] }
  ];
  D.wealth = function (id) { return D.WEALTH.find(function (w) { return w.id === id; }) || D.WEALTH[1]; };

  // ---------- apparence ----------
  D.SKINS = ['#ffdfc4', '#f3c9a5', '#e8b48a', '#d29a6b', '#b97a4e', '#8d5a36', '#6b4227', '#4a2e1c'];
  D.HAIRS = ['#1b1512', '#3b2416', '#6a3e1f', '#a8662e', '#d9a441', '#efd37a', '#b8361f', '#2a2a2a'];
  // génétique : la peau est un mélange des deux parents, les cheveux foncés dominent, le roux est récessif
  // (porteur caché « rc »), la pilosité et la vue (lunettes) se transmettent souvent, les boucles aussi.
  const HAIR_DARK = [0, 1, 2, 3, 4, 5, -1, 0]; // rang de clarté de chaque couleur de D.HAIRS (-1 = roux)
  const HAIR_BY_RANK = [[0, 7], [1], [2], [3], [4], [5]];
  function skinIdx(lk) { const i = lk ? D.SKINS.indexOf(lk.skin) : -1; return i >= 0 ? i : L.ri(0, D.SKINS.length - 1); }
  function hairRank(lk) { const i = lk ? D.HAIRS.indexOf(lk.hair) : -1; return i >= 0 ? HAIR_DARK[i] : L.ri(0, 5); }
  function redAllele(lk) { if (!lk) return L.chance(0.08) ? 1 : 0; if (lk.hair === D.HAIRS[6]) return 1; return lk.rc && L.chance(0.5) ? 1 : 0; }
  // traits du visage dessiné (forme, yeux, nez, sourcils, bouche) : chacun vient d'un des deux parents, parfois une surprise
  const GENES = ['f', 'e', 'n', 's', 'm'];
  function rgene() { return L.ri(0, 9999); }
  function genes(pa, pb) {
    const out = { b: rgene(), h: rgene(), br: rgene(), l: rgene() };
    GENES.forEach(function (k) {
      const a = pa && pa.g && pa.g[k], b = pb && pb.g && pb.g[k];
      out[k] = L.chance(0.15) || (a == null && b == null) ? rgene() : a == null ? b : b == null ? a : L.chance(0.5) ? a : b;
    });
    return out;
  }
  D.genes = genes;
  D.look = function (pa, pb) {
    if (pa && pb) {
      const sk = L.clamp(Math.round((skinIdx(pa) + skinIdx(pb)) / 2 + L.rand(-0.75, 0.75)), 0, D.SKINS.length - 1);
      const ra = hairRank(pa), rb = hairRank(pb);
      const dark = Math.min(ra < 0 ? 3 : ra, rb < 0 ? 3 : rb), light = Math.max(ra < 0 ? 3 : ra, rb < 0 ? 3 : rb);
      let rank = L.chance(0.62) ? dark : L.chance(0.6) ? Math.round((dark + light) / 2) : light;
      rank = L.clamp(rank + (L.chance(0.2) ? L.pick([-1, 1]) : 0), 0, 5);
      const red = redAllele(pa) + redAllele(pb);
      const hair = red >= 2 ? D.HAIRS[6] : D.HAIRS[L.pick(HAIR_BY_RANK[rank])];
      const nfr = (pa.fr ? 1 : 0) + (pb.fr ? 1 : 0);
      const curly = pa.hs === 2 || pb.hs === 2;
      return {
        skin: D.SKINS[sk], hair: hair, rc: red === 1 || undefined,
        hs: curly && L.chance(0.45) ? 2 : L.ri(0, 5),
        g: genes(pa, pb),
        eye: L.chance(0.5) ? pa.eye : pb.eye,
        fr: L.chance(nfr === 2 ? 0.75 : nfr === 1 ? 0.4 : 0.06)
      };
    }
    return { skin: L.pick(D.SKINS), hair: L.pick(D.HAIRS), rc: L.chance(0.12) || undefined, hs: L.ri(0, 5), eye: L.ri(0, 2), fr: L.chance(0.2), g: genes() };
  };
  // un proche « assorti » : couple qui se ressemble un peu, ou parent d'un parent
  D.lookNear = function (lk, spread) {
    const o = D.look();
    if (!lk) return o;
    o.skin = D.SKINS[L.clamp(skinIdx(lk) + L.ri(-spread, spread), 0, D.SKINS.length - 1)];
    if (L.chance(0.55)) o.hair = lk.hair;
    if (lk.hair === D.HAIRS[6] || lk.rc) o.rc = L.chance(0.6) || undefined;
    if (lk.g) o.g = genes(lk, null);

    return o;
  };

  // ---------- traits de caractère (forgés de 0 à 18 ans) ----------
  D.TRAITS = {
    bienveillant: { n: 'Bienveillant|Bienveillante', opp: 'egoiste', ink: 'c', d: 'Tes relations progressent plus vite. Réclamer de l’argent te gêne un peu.' },
    egoiste: { n: 'Égoïste', opp: 'bienveillant', ink: 'r', d: 'Plus de culot pour les augmentations, mais tes proches s’éloignent plus vite.' },
    charismatique: { n: 'Charismatique', opp: 'timide', ink: 'm', d: 'Ton charisme grimpe tout seul. Séduction et entretiens facilités.' },
    timide: { n: 'Timide', opp: 'charismatique', ink: 'b', d: 'Moins de vie sociale, mais des études et une concentration renforcées.' },
    ambitieux: { n: 'Ambitieux|Ambitieuse', opp: 'nonchalant', ink: 'y', d: 'Promotions et augmentations plus faciles. Le surmenage te guette.' },
    nonchalant: { n: 'Nonchalant|Nonchalante', opp: 'ambitieux', ink: 'g', d: 'Le bonheur vient facilement, le stress glisse. Carrière plus lente.' },
    drole: { n: 'Drôle', ink: 'y', d: 'Tes blagues marchent. Bonus de Social et de Charisme.' },
    rebelle: { n: 'Rebelle', opp: 'discipline', ink: 'r', d: 'Les ennuis te trouvent, la police aussi. Ta vie est plus imprévisible.' },
    discipline: { n: 'Discipliné|Disciplinée', opp: 'rebelle', ink: 'c', d: 'Meilleures notes, meilleure performance au travail.' },
    colerique: { n: 'Colérique', opp: 'calme', ink: 'r', d: 'Tes disputes dégénèrent. Risque de violence et d’ennemis.' },
    calme: { n: 'Calme', opp: 'colerique', ink: 'g', d: 'Tu résistes mieux à la déprime et au stress.' },
    curieux: { n: 'Curieux|Curieuse', ink: 'c', d: 'Tu apprends les compétences plus vite.' },
    creatif: { n: 'Créatif|Créative', ink: 'm', d: 'Bonus dans les métiers et loisirs artistiques.' },
    honnete: { n: 'Honnête', opp: 'menteur', ink: 'g', d: 'On te fait confiance. Tes mensonges, eux, tombent à plat.' },
    menteur: { n: 'Menteur|Menteuse', opp: 'honnete', ink: 'b', d: 'Tes mensonges passent souvent… jusqu’au jour où ils ne passent plus.' }
  };
  D.TRAIT_IDS = Object.keys(D.TRAITS);

  // petits traits des autres personnages (pour la saveur)
  D.NPC_TRAITS = ['Gentil|Gentille', 'Râleur|Râleuse', 'Drôle', 'Sérieux|Sérieuse', 'Bizarre', 'Généreux|Généreuse', 'Radin|Radine', 'Bavard|Bavarde', 'Timide', 'Sportif|Sportive', 'Geek', 'Fêtard|Fêtarde', 'Jaloux|Jalouse', 'Complotiste', 'Zen', 'Dramatique', 'Gourmand|Gourmande', 'Snob'];

  // ---------- compétences (cruciales pour le CV) ----------
  D.SKILLS = [
    { id: 'logique', n: 'Maths & logique' },
    { id: 'langues', n: 'Langues' },
    { id: 'sciences', n: 'Sciences' },
    { id: 'info', n: 'Informatique' },
    { id: 'art', n: 'Dessin & arts' },
    { id: 'musique', n: 'Musique' },
    { id: 'sport', n: 'Sport' },
    { id: 'eloquence', n: 'Éloquence' },
    { id: 'bricolage', n: 'Bricolage' },
    { id: 'cuisine', n: 'Cuisine' }
  ];
  D.skillName = function (id) { const s = D.SKILLS.find(function (x) { return x.id === id; }); return s ? s.n : id; };

  // clubs et activités extrascolaires (6–17 ans, 2 au maximum)
  D.CLUBS = [
    { id: 'foot', n: 'Club de foot', sk: { sport: 6 }, s: 2, cost: 180 },
    { id: 'danse', n: 'Danse', sk: { sport: 4, art: 2 }, c: 1, cost: 300 },
    { id: 'judo', n: 'Judo', sk: { sport: 5 }, tr: { calme: 1 }, cost: 220 },
    { id: 'theatre', n: 'Théâtre', sk: { eloquence: 6 }, c: 1, cost: 250 },
    { id: 'echecs', n: 'Club d’échecs', sk: { logique: 6 }, cost: 90 },
    { id: 'robotique', n: 'Robotique', sk: { info: 4, sciences: 3 }, cost: 260 },
    { id: 'conserva', n: 'École de musique', sk: { musique: 7 }, cost: 380 },
    { id: 'artsplast', n: 'Arts plastiques', sk: { art: 6 }, tr: { creatif: 1 }, cost: 200 },
    { id: 'cuisineclub', n: 'Atelier cuisine', sk: { cuisine: 6 }, cost: 160 },
    { id: 'anglais', n: 'Club d’anglais', sk: { langues: 6 }, cost: 150 },
    { id: 'scouts', n: 'Scouts', sk: { bricolage: 5 }, s: 3, cost: 140 },
    { id: 'debat', n: 'Club de débat', sk: { eloquence: 5, langues: 1 }, tr: { charismatique: 1 }, cost: 60 }
  ];

  // ---------- école ----------
  D.CLASSES = ['Petite section', 'Moyenne section', 'Grande section', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', 'Seconde', 'Première', 'Terminale'];
  D.stageOf = function (i) { return i < 3 ? 'mat' : i < 8 ? 'prim' : i < 12 ? 'col' : 'lyc'; };
  D.STAGE = { mat: 'Maternelle', prim: 'École primaire', col: 'Collège', lyc: 'Lycée', cap: 'CAP', sup: 'Études supérieures' };

  // profils du bac
  D.BAC = {
    sci: { n: 'Bac général · maths & physique-chimie', sk: { logique: 4, sciences: 4 } },
    bio: { n: 'Bac général · SVT & physique-chimie', sk: { sciences: 5, logique: 2 } },
    num: { n: 'Bac général · NSI & maths', sk: { info: 5, logique: 3 } },
    eco: { n: 'Bac général · SES & maths', sk: { logique: 3, eloquence: 3 } },
    lettres: { n: 'Bac général · humanités & langues', sk: { langues: 4, eloquence: 4 } },
    art: { n: 'Bac général · arts & langues', sk: { art: 5, langues: 2 } },
    sti2d: { n: 'Bac techno STI2D', sk: { bricolage: 4, sciences: 3 } },
    stmg: { n: 'Bac techno STMG', sk: { logique: 2, eloquence: 3 } },
    st2s: { n: 'Bac techno ST2S', sk: { sciences: 3, eloquence: 2 } },
    'pro-cuisine': { n: 'Bac pro cuisine', sk: { cuisine: 7 } },
    'pro-meca': { n: 'Bac pro maintenance auto', sk: { bricolage: 7 } },
    'pro-elec': { n: 'Bac pro électricité', sk: { bricolage: 6, sciences: 1 } },
    'pro-commerce': { n: 'Bac pro commerce', sk: { eloquence: 5 } },
    'pro-batiment': { n: 'Bac pro bâtiment', sk: { bricolage: 7 } }
  };
  D.CAPS = [
    { id: 'cap-cuisine', n: 'CAP cuisine', sk: { cuisine: 8 } },
    { id: 'cap-coiffure', n: 'CAP coiffure', sk: { art: 4, eloquence: 2 } },
    { id: 'cap-boulanger', n: 'CAP boulanger', sk: { cuisine: 7 } },
    { id: 'cap-meca', n: 'CAP mécanique auto', sk: { bricolage: 8 } },
    { id: 'cap-elec', n: 'CAP électricien', sk: { bricolage: 7 } },
    { id: 'cap-plomberie', n: 'CAP plomberie', sk: { bricolage: 7 } }
  ];

  // ---------- études supérieures (Parcoursup) ----------
  // sel = note du bac « confortable » ; req = profils admis (vide = tous) ; fee = frais par an ; lvl = niveau du diplôme
  const ALLG = ['sci', 'bio', 'num', 'eco', 'lettres', 'art'];
  D.SUP = [
    { id: 'lic-droit', n: 'Licence de droit', yrs: 3, sel: 9.5, fee: 180, req: ALLG.concat(['stmg']), lvl: 4, sk: { eloquence: 5, langues: 1 }, next: 'mas-droit' },
    { id: 'mas-droit', n: 'Master de droit', yrs: 2, sel: 12, fee: 250, lvl: 5, sk: { eloquence: 6 }, hidden: 1 },
    { id: 'lic-psy', n: 'Licence de psychologie', yrs: 3, sel: 11, fee: 180, req: ALLG.concat(['st2s']), lvl: 4, sk: { eloquence: 3, sciences: 2 }, next: 'mas-psy' },
    { id: 'mas-psy', n: 'Master de psychologie', yrs: 2, sel: 13, fee: 250, lvl: 5, sk: { eloquence: 4, sciences: 2 }, hidden: 1 },
    { id: 'lic-lettres', n: 'Licence de lettres & langues', yrs: 3, sel: 9, fee: 180, req: [], lvl: 4, sk: { langues: 6, eloquence: 2 }, next: 'mas-meef' },
    { id: 'lic-histoire', n: 'Licence d’histoire', yrs: 3, sel: 9, fee: 180, req: [], lvl: 4, sk: { langues: 2, eloquence: 3 }, next: 'mas-meef' },
    { id: 'mas-meef', n: 'Master MEEF (devenir prof)', yrs: 2, sel: 11, fee: 250, lvl: 5, sk: { eloquence: 5 }, hidden: 1 },
    { id: 'lic-eco', n: 'Licence d’économie-gestion', yrs: 3, sel: 10.5, fee: 180, req: ['sci', 'eco', 'num', 'stmg', 'bio'], lvl: 4, sk: { logique: 5 }, next: 'mas-finance' },
    { id: 'mas-finance', n: 'Master finance', yrs: 2, sel: 13, fee: 250, lvl: 5, sk: { logique: 6 }, hidden: 1 },
    { id: 'lic-bio', n: 'Licence de biologie', yrs: 3, sel: 10.5, fee: 180, req: ['bio', 'sci', 'st2s'], lvl: 4, sk: { sciences: 6 }, next: 'mas-bio' },
    { id: 'mas-bio', n: 'Master de biologie', yrs: 2, sel: 13, fee: 250, lvl: 5, sk: { sciences: 7 }, hidden: 1 },
    { id: 'lic-info', n: 'Licence d’informatique', yrs: 3, sel: 11, fee: 180, req: ['sci', 'num', 'sti2d', 'eco'], lvl: 4, sk: { info: 7, logique: 3 }, next: 'mas-info' },
    { id: 'mas-info', n: 'Master d’informatique', yrs: 2, sel: 13, fee: 250, lvl: 5, sk: { info: 8 }, hidden: 1 },
    { id: 'staps', n: 'Licence STAPS (sport)', yrs: 3, sel: 10, fee: 180, req: [], lvl: 4, sk: { sport: 7, sciences: 2 }, min: { sport: 30 }, next: 'mas-meef' },
    { id: 'lic-arts', n: 'Licence arts du spectacle', yrs: 3, sel: 10, fee: 180, req: [], lvl: 4, sk: { art: 4, eloquence: 4 } },
    { id: 'but-info', n: 'BUT informatique', yrs: 3, sel: 12, fee: 180, req: ['sci', 'num', 'sti2d', 'eco', 'stmg'], lvl: 4, sk: { info: 8, logique: 2 } },
    { id: 'but-tc', n: 'BUT techniques de commercialisation', yrs: 3, sel: 11.5, fee: 180, req: ['eco', 'stmg', 'lettres', 'sci', 'pro-commerce'], lvl: 4, sk: { eloquence: 6, langues: 2 } },
    { id: 'bts-mco', n: 'BTS commerce (MCO)', yrs: 2, sel: 10, fee: 0, req: [], lvl: 3, sk: { eloquence: 5 } },
    { id: 'bts-compta', n: 'BTS comptabilité', yrs: 2, sel: 10.5, fee: 0, req: ['stmg', 'eco', 'sci', 'num', 'pro-commerce'], lvl: 3, sk: { logique: 6 } },
    { id: 'bts-tourisme', n: 'BTS tourisme', yrs: 2, sel: 10.5, fee: 0, req: [], lvl: 3, sk: { langues: 6, eloquence: 2 } },
    { id: 'ifsi', n: 'École d’infirmier·ère (IFSI)', yrs: 3, sel: 11.5, fee: 180, req: ['bio', 'st2s', 'sci', 'lettres', 'eco'], lvl: 4, sk: { sciences: 5, eloquence: 2 } },
    { id: 'medecine', n: 'Études de médecine', yrs: 9, sel: 15.5, fee: 250, req: ['bio', 'sci'], lvl: 6, sk: { sciences: 7 } },
    { id: 'pharma', n: 'Études de pharmacie', yrs: 6, sel: 14.5, fee: 250, req: ['bio', 'sci'], lvl: 6, sk: { sciences: 6, logique: 2 } },
    { id: 'veto', n: 'École vétérinaire', yrs: 6, sel: 16, fee: 2500, req: ['bio', 'sci'], lvl: 6, sk: { sciences: 7 } },
    { id: 'inge', n: 'École d’ingénieurs', yrs: 5, sel: 14.5, fee: 2500, req: ['sci', 'num', 'sti2d'], lvl: 5, sk: { logique: 7, sciences: 4, info: 3 } },
    { id: 'archi', n: 'École d’architecture', yrs: 5, sel: 13, fee: 600, req: ['sci', 'art', 'num', 'eco', 'sti2d'], lvl: 5, sk: { art: 6, logique: 3 }, min: { art: 20 } },
    { id: 'commerce', n: 'École de commerce', yrs: 5, sel: 13, fee: 12500, req: ['eco', 'sci', 'lettres', 'num', 'stmg'], lvl: 5, sk: { eloquence: 5, logique: 3, langues: 3 } },
    { id: 'beauxarts', n: 'Beaux-Arts', yrs: 5, sel: 11, fee: 450, req: [], lvl: 5, sk: { art: 9 }, min: { art: 40 } },
    { id: 'cinema', n: 'École de cinéma', yrs: 3, sel: 12.5, fee: 6500, req: [], lvl: 4, sk: { art: 5, eloquence: 3 }, min: { art: 25 } },
    { id: 'journalisme', n: 'École de journalisme', yrs: 3, sel: 13, fee: 3000, req: ['lettres', 'eco', 'art', 'sci', 'bio', 'num'], lvl: 5, sk: { langues: 4, eloquence: 5 }, min: { eloquence: 30 } },
    { id: 'conservatoire', n: 'Conservatoire de musique', yrs: 4, sel: 10, fee: 400, req: [], lvl: 4, sk: { musique: 10 }, min: { musique: 50 } },
    { id: 'hotellerie', n: 'École hôtelière', yrs: 3, sel: 10.5, fee: 9000, req: [], lvl: 4, sk: { cuisine: 8, langues: 2 } },
    { id: 'jeuvideo', n: 'École de jeu vidéo', yrs: 3, sel: 11.5, fee: 8000, req: [], lvl: 4, sk: { info: 6, art: 4 }, min: { info: 20 }, yr: [1990, 9999] },
    { id: 'pilote', n: 'École de pilotes de ligne', yrs: 3, sel: 15.5, fee: 0, req: ['sci', 'num', 'bio', 'sti2d'], lvl: 4, sk: { sciences: 4, langues: 5 }, minH: 70 },
    { id: 'police', n: 'École de police', yrs: 1, sel: 10.5, fee: 0, req: [], lvl: 2, sk: { sport: 5, eloquence: 2 }, min: { sport: 25 }, clean: 1 },
    { id: 'pompier', n: 'Formation de sapeur-pompier', yrs: 1, sel: 9.5, fee: 0, req: [], lvl: 2, sk: { sport: 7 }, min: { sport: 35 }, minH: 55 },
    { id: 'armee', n: 'Engagement dans l’armée', yrs: 1, sel: 7, fee: 0, req: [], lvl: 2, sk: { sport: 7, bricolage: 2 }, minH: 50, clean: 1 },
    { id: 'cap-cuisine', n: 'CAP cuisine', yrs: 2, sel: 0, fee: 0, req: [], lvl: 1, sk: { cuisine: 8 } },
    { id: 'cap-coiffure', n: 'CAP coiffure', yrs: 2, sel: 0, fee: 0, req: [], lvl: 1, sk: { art: 4, eloquence: 2 } },
    { id: 'cap-boulanger', n: 'CAP boulanger', yrs: 2, sel: 0, fee: 0, req: [], lvl: 1, sk: { cuisine: 7 } },
    { id: 'cap-meca', n: 'CAP mécanique auto', yrs: 2, sel: 0, fee: 0, req: [], lvl: 1, sk: { bricolage: 8 } },
    { id: 'cap-elec', n: 'CAP électricien', yrs: 2, sel: 0, fee: 0, req: [], lvl: 1, sk: { bricolage: 7 } },
    { id: 'cap-plomberie', n: 'CAP plomberie', yrs: 2, sel: 0, fee: 0, req: [], lvl: 1, sk: { bricolage: 7 } }
  ];
  D.sup = function (id) { return D.SUP.find(function (s) { return s.id === id; }); };
  D.DEG_LVL = ['Brevet', 'CAP', 'Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];

  // ---------- métiers ----------
  // cat : petit (petits boulots, pas d'exigence), metier, diplome, star (exposé au public)
  // req : deg (un de ces diplômes), lvl (niveau minimum), sk (compétences), cha, h, age [min,max], clean (casier vierge), permis
  // lv : titres par échelon ; sal : salaire annuel net de départ ; stress 0–3 ; vis : métier exposé (charisme < 8 interdit)
  D.JOBS = [
    { id: 'babysit', n: 'Baby-sitter', cat: 'petit', sal: 3200, pt: 1, req: { age: [14, 40] }, lv: ['Baby-sitter', 'Baby-sitter de confiance', 'Nounou star du quartier'] },
    { id: 'flyers', n: 'Distributeur|Distributrice de prospectus', cat: 'petit', sal: 2600, pt: 1, req: { age: [14, 80] }, lv: ['Distributeur|Distributrice de prospectus', 'Chef|Cheffe de secteur prospectus'] },
    { id: 'dogwalk', n: 'Promeneur|Promeneuse de chiens', cat: 'petit', sal: 3000, pt: 1, req: { age: [14, 80] }, lv: ['Promeneur|Promeneuse de chiens', 'Chuchoteur|Chuchoteuse canin·e'] },
    { id: 'fastfood', n: 'Équipier|Équipière fast-food', cat: 'petit', sal: 8200, pt: 1, req: { age: [16, 70] }, lv: ['Équipier|Équipière fast-food', 'Responsable de zone', 'Manager du restaurant', 'Directeur|Directrice de franchise'] },
    { id: 'caisse', n: 'Caissier|Caissière', cat: 'petit', sal: 8800, pt: 1, req: { age: [16, 70] }, lv: ['Caissier|Caissière', 'Chef|Cheffe de caisse', 'Responsable de magasin'] },
    { id: 'serveur', n: 'Serveur|Serveuse', cat: 'petit', sal: 9200, pt: 1, req: { age: [16, 70] }, lv: ['Serveur|Serveuse', 'Chef|Cheffe de rang', 'Maître|Maîtresse d’hôtel'] },
    { id: 'livreur', n: 'Livreur|Livreuse', cat: 'petit', sal: 7800, pt: 1, req: { age: [16, 65] }, lv: ['Livreur|Livreuse', 'Livreur|Livreuse le plus rapide de la ville'] },
    { id: 'plonge', n: 'Plongeur|Plongeuse en restaurant', cat: 'petit', sal: 8000, pt: 1, req: { age: [16, 70] }, lv: ['Plongeur|Plongeuse', 'Commis de cuisine'] },
    { id: 'vendeur', n: 'Vendeur|Vendeuse', cat: 'petit', sal: 9500, pt: 1, req: { age: [16, 70] }, lv: ['Vendeur|Vendeuse', 'Conseiller|Conseillère de vente', 'Responsable de boutique'] },
    { id: 'vendange', n: 'Vendangeur|Vendangeuse', cat: 'petit', sal: 3500, pt: 1, req: { age: [16, 75] }, lv: ['Vendangeur|Vendangeuse', 'Chef|Cheffe d’équipe'] },
    { id: 'colo', n: 'Animateur|Animatrice de colo', cat: 'petit', sal: 4200, pt: 1, req: { age: [17, 40] }, lv: ['Animateur|Animatrice de colo', 'Directeur|Directrice de colo'] },
    { id: 'menage', n: 'Agent|Agente d’entretien', cat: 'petit', sal: 14500, req: { age: [18, 70] }, lv: ['Agent|Agente d’entretien', 'Chef|Cheffe d’équipe propreté'] },
    { id: 'manut', n: 'Manutentionnaire', cat: 'petit', sal: 15500, req: { age: [18, 64] }, lv: ['Manutentionnaire', 'Cariste', 'Chef|Cheffe d’entrepôt'] },
    { id: 'accueil', n: 'Hôte|Hôtesse d’accueil', cat: 'petit', sal: 14800, vis: 1, req: { age: [18, 65] }, lv: ['Hôte|Hôtesse d’accueil', 'Responsable de l’accueil'] },
    { id: 'standardiste', n: 'Standardiste', cat: 'petit', sal: 13800, yr: [1950, 2006], req: { age: [18, 65] }, lv: ['Standardiste', 'Chef|Cheffe du standard'] },

    { id: 'securite', n: 'Agent|Agente de sécurité', cat: 'metier', sal: 18500, req: { age: [18, 64], sk: { sport: 20 }, clean: 1 }, lv: ['Agent|Agente de sécurité', 'Chef|Cheffe de poste', 'Responsable sûreté'] },
    { id: 'facteur', n: 'Facteur|Factrice', cat: 'metier', sal: 19000, req: { age: [18, 64] }, lv: ['Facteur|Factrice', 'Facteur|Factrice titulaire', 'Chef|Cheffe de tournée'] },
    { id: 'agriculteur', n: 'Agriculteur|Agricultrice', cat: 'metier', sal: 16000, req: { age: [18, 75], sk: { bricolage: 10 } }, lv: ['Ouvrier|Ouvrière agricole', 'Agriculteur|Agricultrice', 'Exploitant|Exploitante', 'Grand|Grande propriétaire terrien·ne'] },
    { id: 'chauffeur', n: 'Chauffeur|Chauffeuse de bus', cat: 'metier', sal: 22000, req: { age: [21, 64], permis: 1, clean: 1 }, lv: ['Chauffeur|Chauffeuse de bus', 'Conducteur|Conductrice de ligne', 'Régulateur|Régulatrice'] },
    { id: 'routier', n: 'Routier|Routière', cat: 'metier', sal: 23500, req: { age: [21, 64], permis: 1 }, stress: 1, lv: ['Routier|Routière', 'Routier|Routière longue distance', 'Patron|Patronne de transport'] },
    { id: 'aidesoignant', n: 'Aide-soignant|Aide-soignante', cat: 'metier', sal: 19500, stress: 1, req: { age: [18, 64], lvl: 2 }, lv: ['Aide-soignant|Aide-soignante', 'Aide-soignant|Aide-soignante confirmé·e', 'Référent|Référente'] },
    { id: 'secretaire', n: 'Assistant administratif|Assistante administrative', cat: 'metier', sal: 20500, req: { age: [18, 64], lvl: 2 }, lv: ['Assistant administratif|Assistante administrative', 'Assistant|Assistante de direction', 'Office manager'] },
    { id: 'coiffeur', n: 'Coiffeur|Coiffeuse', cat: 'metier', sal: 18000, req: { age: [17, 70], deg: ['cap-coiffure'] }, lv: ['Coiffeur|Coiffeuse', 'Coiffeur|Coiffeuse styliste', 'Propriétaire du salon'] },
    { id: 'boulanger', n: 'Boulanger|Boulangère', cat: 'metier', sal: 19500, req: { age: [17, 70], deg: ['cap-boulanger'] }, lv: ['Boulanger|Boulangère', 'Chef|Cheffe boulanger·ère', 'Artisan·e de la meilleure baguette'] },
    { id: 'meca', n: 'Mécanicien|Mécanicienne', cat: 'metier', sal: 21000, req: { age: [17, 66], deg: ['cap-meca', 'pro-meca'], sk: { bricolage: 25 } }, lv: ['Mécanicien|Mécanicienne', 'Chef|Cheffe d’atelier', 'Patron|Patronne de garage'] },
    { id: 'elec', n: 'Électricien|Électricienne', cat: 'metier', sal: 23000, req: { age: [17, 66], deg: ['cap-elec', 'pro-elec'] }, lv: ['Électricien|Électricienne', 'Chef|Cheffe de chantier', 'Patron|Patronne d’entreprise'] },
    { id: 'plombier', n: 'Plombier|Plombière', cat: 'metier', sal: 24000, req: { age: [17, 66], deg: ['cap-plomberie', 'pro-batiment'] }, lv: ['Plombier|Plombière', 'Plombier|Plombière chauffagiste', 'Patron|Patronne de plomberie'] },
    { id: 'cuisinier', n: 'Cuisinier|Cuisinière', cat: 'metier', sal: 20000, stress: 1, req: { age: [17, 66], deg: ['cap-cuisine', 'pro-cuisine', 'hotellerie'], sk: { cuisine: 20 } }, lv: ['Commis de cuisine', 'Cuisinier|Cuisinière', 'Second|Seconde de cuisine', 'Chef|Cheffe de cuisine'] },
    { id: 'militaire', n: 'Militaire', cat: 'metier', sal: 21000, stress: 1, always: 1, req: { age: [17, 32], h: 45, sk: { sport: 15 }, clean: 1 }, lv: ['Soldat|Soldate', 'Caporal|Caporale', 'Sergent|Sergente', 'Lieutenant|Lieutenante', 'Colonel|Colonelle', 'Général|Générale'] },
    { id: 'policier', n: 'Policier|Policière', cat: 'metier', sal: 25000, stress: 2, always: 1, req: { age: [18, 45], lvl: 2, h: 40, sk: { sport: 20 }, clean: 1 }, lv: ['Gardien|Gardienne de la paix', 'Brigadier|Brigadière', 'Lieutenant|Lieutenante', 'Commissaire', 'Directeur|Directrice de la police'] },
    { id: 'pompier', n: 'Sapeur-pompier|Sapeuse-pompière', cat: 'metier', sal: 24000, stress: 2, req: { age: [18, 57], deg: ['pompier'], h: 55, sk: { sport: 40 } }, lv: ['Sapeur-pompier|Sapeuse-pompière', 'Caporal|Caporale', 'Sergent|Sergente', 'Capitaine'] },
    { id: 'agentimmo', n: 'Agent immobilier|Agente immobilière', cat: 'metier', sal: 24000, vis: 1, req: { age: [20, 70], lvl: 2, cha: 30, sk: { eloquence: 20 } }, lv: ['Agent immobilier|Agente immobilière', 'Négociateur|Négociatrice', 'Directeur|Directrice d’agence'] },
    { id: 'commercial', n: 'Commercial|Commerciale', cat: 'metier', sal: 26000, stress: 1, vis: 1, req: { age: [20, 66], lvl: 2, cha: 20, sk: { eloquence: 25 } }, lv: ['Commercial|Commerciale', 'Commercial|Commerciale grands comptes', 'Directeur|Directrice commercial·e'] },
    { id: 'agentvoyage', n: 'Agent|Agente de voyages', cat: 'metier', sal: 21500, req: { age: [19, 66], deg: ['bts-tourisme'] }, lv: ['Agent|Agente de voyages', 'Conseiller|Conseillère senior', 'Directeur|Directrice d’agence'] },
    { id: 'steward', n: 'Steward|Hôtesse de l’air', cat: 'metier', sal: 25000, vis: 1, req: { age: [19, 55], lvl: 2, cha: 30, sk: { langues: 40 }, h: 45 }, lv: ['Steward|Hôtesse de l’air', 'Chef|Cheffe de cabine', 'Chef|Cheffe de cabine principal·e'] },
    { id: 'robot', n: 'Réparateur|Réparatrice de robots', cat: 'metier', sal: 26000, yr: [2045, 9999], req: { age: [18, 70], sk: { bricolage: 30, info: 20 } }, lv: ['Réparateur|Réparatrice de robots', 'Technicien|Technicienne androïde', 'Psy pour robots'] },
    { id: 'dronetaxi', n: 'Pilote de drone-taxi', cat: 'metier', sal: 30000, yr: [2055, 9999], req: { age: [21, 65], permis: 1, h: 50 }, lv: ['Pilote de drone-taxi', 'Pilote de ligne aérienne urbaine', 'Commandant·e de flotte'] },

    { id: 'dev', n: 'Développeur|Développeuse', cat: 'diplome', sal: 34000, stress: 1, yr: [1975, 9999], req: { age: [19, 70], deg: ['but-info', 'lic-info', 'mas-info', 'inge', 'jeuvideo'], sk: { info: 40 } }, lv: ['Développeur|Développeuse junior', 'Développeur|Développeuse', 'Développeur|Développeuse senior', 'Lead dev', 'Directeur|Directrice technique'] },
    { id: 'inge', n: 'Ingénieur|Ingénieure', cat: 'diplome', sal: 40000, stress: 1, req: { age: [22, 70], deg: ['inge'], sk: { logique: 40 } }, lv: ['Ingénieur|Ingénieure junior', 'Ingénieur|Ingénieure', 'Ingénieur|Ingénieure senior', 'Chef|Cheffe de projet', 'Directeur|Directrice R&D'] },
    { id: 'archi', n: 'Architecte', cat: 'diplome', sal: 33000, stress: 1, req: { age: [22, 75], deg: ['archi'], sk: { art: 30 } }, lv: ['Architecte junior', 'Architecte', 'Architecte senior', 'Associé·e du cabinet', 'Star·chitecte'] },
    { id: 'medecin', n: 'Médecin', cat: 'diplome', sal: 62000, stress: 2, req: { age: [26, 75], deg: ['medecine'], sk: { sciences: 45 } }, lv: ['Interne', 'Médecin', 'Médecin spécialiste', 'Chirurgien|Chirurgienne', 'Chef|Cheffe de service'] },
    { id: 'infirmier', n: 'Infirmier|Infirmière', cat: 'diplome', sal: 25500, stress: 2, req: { age: [21, 66], deg: ['ifsi'] }, lv: ['Infirmier|Infirmière', 'Infirmier|Infirmière spécialisé·e', 'Cadre de santé'] },
    { id: 'pharma', n: 'Pharmacien|Pharmacienne', cat: 'diplome', sal: 42000, req: { age: [24, 75], deg: ['pharma'] }, lv: ['Pharmacien|Pharmacienne adjoint·e', 'Pharmacien|Pharmacienne', 'Titulaire de l’officine'] },
    { id: 'veto', n: 'Vétérinaire', cat: 'diplome', sal: 38000, stress: 1, req: { age: [24, 75], deg: ['veto'] }, lv: ['Vétérinaire', 'Vétérinaire associé·e', 'Vétérinaire de zoo'] },
    { id: 'avocat', n: 'Avocat|Avocate', cat: 'diplome', sal: 38000, stress: 2, vis: 1, req: { age: [23, 75], deg: ['mas-droit'], sk: { eloquence: 45 } }, lv: ['Avocat|Avocate collaborateur·rice', 'Avocat|Avocate', 'Avocat|Avocate associé·e', 'Ténor du barreau'] },
    { id: 'prof', n: 'Professeur|Professeure', cat: 'diplome', sal: 27000, stress: 1, req: { age: [22, 66], deg: ['mas-meef'], clean: 1 }, lv: ['Professeur|Professeure stagiaire', 'Professeur|Professeure', 'Professeur|Professeure agrégé·e', 'Principal|Principale', 'Inspecteur|Inspectrice'] },
    { id: 'comptable', n: 'Comptable', cat: 'diplome', sal: 26500, req: { age: [20, 66], deg: ['bts-compta', 'lic-eco', 'mas-finance', 'commerce'], sk: { logique: 30 } }, lv: ['Comptable', 'Comptable senior', 'Expert·e-comptable', 'Directeur|Directrice financier·ère'] },
    { id: 'banquier', n: 'Banquier|Banquière', cat: 'diplome', sal: 38000, stress: 1, req: { age: [22, 66], deg: ['mas-finance', 'commerce'] }, lv: ['Conseiller|Conseillère bancaire', 'Banquier|Banquière', 'Directeur|Directrice d’agence', 'Banquier|Banquière d’affaires'] },
    { id: 'trader', n: 'Trader|Tradeuse', cat: 'diplome', sal: 65000, stress: 3, req: { age: [22, 60], deg: ['commerce', 'inge', 'mas-finance'], sk: { logique: 60 } }, lv: ['Trader|Tradeuse junior', 'Trader|Tradeuse', 'Trader|Tradeuse star', 'Loup|Louve de la finance'] },
    { id: 'journaliste', n: 'Journaliste', cat: 'diplome', sal: 27000, stress: 1, vis: 1, req: { age: [21, 70], deg: ['journalisme', 'lic-lettres', 'lic-histoire'], sk: { eloquence: 30, langues: 25 } }, lv: ['Pigiste', 'Journaliste', 'Grand reporter', 'Rédacteur|Rédactrice en chef'] },
    { id: 'psy', n: 'Psychologue', cat: 'diplome', sal: 32000, req: { age: [23, 75], deg: ['mas-psy'] }, lv: ['Psychologue', 'Psychologue réputé·e', 'Psy des stars'] },
    { id: 'chercheur', n: 'Chercheur|Chercheuse', cat: 'diplome', sal: 30000, req: { age: [24, 75], deg: ['mas-bio', 'mas-info', 'inge', 'medecine', 'pharma'], sk: { sciences: 55 } }, lv: ['Doctorant·e', 'Chercheur|Chercheuse', 'Directeur|Directrice de recherche', 'Prix Nobel en puissance'] },
    { id: 'pilote', n: 'Pilote de ligne', cat: 'diplome', sal: 70000, stress: 2, req: { age: [22, 64], deg: ['pilote'], h: 70, sk: { langues: 40 } }, lv: ['Copilote', 'Commandant·e de bord', 'Instructeur|Instructrice', 'Chef|Cheffe pilote'] },
    { id: 'chef', n: 'Chef cuisinier|Cheffe cuisinière', cat: 'diplome', sal: 30000, stress: 2, vis: 1, req: { age: [21, 75], deg: ['hotellerie'], sk: { cuisine: 55 } }, lv: ['Chef|Cheffe de partie', 'Chef cuisinier|Cheffe cuisinière', 'Chef|Cheffe étoilé·e', 'Chef|Cheffe triple étoilé·e'] },
    { id: 'designer', n: 'Designer graphique', cat: 'diplome', sal: 29000, req: { age: [20, 75], deg: ['beauxarts', 'lic-arts', 'jeuvideo'], sk: { art: 45 } }, lv: ['Designer graphique junior', 'Designer graphique', 'Directeur|Directrice artistique'] },
    { id: 'gamedesign', n: 'Game designer', cat: 'diplome', sal: 33000, stress: 1, yr: [1985, 9999], req: { age: [21, 70], deg: ['jeuvideo'], sk: { info: 30, art: 25 } }, lv: ['Game designer junior', 'Game designer', 'Lead game designer', 'Créateur|Créatrice culte'] },
    { id: 'realisateur', n: 'Réalisateur|Réalisatrice', cat: 'diplome', sal: 30000, stress: 1, vis: 1, req: { age: [21, 80], deg: ['cinema'], sk: { art: 40 } }, lv: ['Assistant·e réalisation', 'Réalisateur|Réalisatrice', 'Réalisateur|Réalisatrice primé·e', 'Palme d’or'] },
    { id: 'coach', n: 'Coach sportif|Coach sportive', cat: 'diplome', sal: 22000, vis: 1, req: { age: [19, 65], sk: { sport: 60 } }, lv: ['Coach sportif|Coach sportive', 'Coach des stars', 'Patron|Patronne de salle'] },
    { id: 'musicien', n: 'Musicien|Musicienne', cat: 'star', sal: 18000, vis: 1, req: { age: [16, 85], sk: { musique: 70 } }, lv: ['Musicien|Musicienne de bar', 'Musicien|Musicienne de studio', 'Artiste en tournée', 'Star de la musique'] },
    { id: 'acteur', n: 'Acteur|Actrice', cat: 'star', sal: 20000, vis: 1, req: { age: [16, 85], cha: 45, sk: { eloquence: 35 } }, lv: ['Figurant·e', 'Acteur|Actrice de séries', 'Acteur|Actrice de cinéma', 'Star internationale'] },
    { id: 'mannequin', n: 'Mannequin', cat: 'star', sal: 30000, vis: 1, req: { age: [16, 35], cha: 65, h: 55 }, lv: ['Mannequin catalogue', 'Mannequin de défilé', 'Égérie', 'Top-modèle'] },
    { id: 'animtv', n: 'Animateur|Animatrice télé', cat: 'star', sal: 45000, stress: 1, vis: 1, req: { age: [21, 75], cha: 55, sk: { eloquence: 55 } }, lv: ['Chroniqueur|Chroniqueuse', 'Animateur|Animatrice', 'Visage du 20 h', 'Légende du petit écran'] },
    { id: 'sportif', n: 'Sportif|Sportive pro', cat: 'star', sal: 40000, stress: 1, vis: 1, req: { age: [17, 36], sk: { sport: 85 }, h: 75 }, lv: ['Espoir régional', 'Pro', 'Sélection nationale', 'Champion·ne du monde'] },
    { id: 'politique', n: 'Élu|Élue', cat: 'star', sal: 20000, stress: 2, vis: 1, req: { age: [25, 85], lvl: 2, cha: 45, sk: { eloquence: 50 }, clean: 1 }, lv: ['Conseiller|Conseillère municipal·e', 'Maire', 'Député·e', 'Ministre', 'Président·e de la République'] },
    { id: 'astronaute', n: 'Astronaute', cat: 'star', sal: 75000, stress: 2, vis: 1, rare: 1, req: { age: [27, 48], deg: ['inge', 'medecine', 'pilote'], h: 80, sk: { sport: 60, sciences: 60, langues: 50 } }, lv: ['Candidat·e astronaute', 'Astronaute', 'Commandant·e de mission', 'Premier pas sur Mars'] }
  ];
  D.job = function (id) { return D.JOBS.find(function (j) { return j.id === id; }); };
  D.LV_MULT = [1, 1.22, 1.5, 1.85, 2.4, 3.2];

  // ---------- logements (coût annuel, loyer + vie courante) ----------
  D.HOMES = [
    { id: 'parents', n: 'Chez tes parents', cost: 0, b: 0 },
    { id: 'crous', n: 'Chambre CROUS', cost: 3600, b: 0, student: 1 },
    { id: 'coloc', n: 'Colocation', cost: 5400, b: 1, s: 2 },
    { id: 'studio', n: 'Studio', cost: 7200, b: 1 },
    { id: 't3', n: 'Appartement T3', cost: 11400, b: 3 },
    { id: 'maison', n: 'Maison en location', cost: 15600, b: 4 },
    { id: 'achat-appart', n: 'Appartement (propriétaire)', buy: 190000, cost: 2400, b: 5, own: 1 },
    { id: 'achat-maison', n: 'Maison (propriétaire)', buy: 320000, cost: 3600, b: 7, own: 1 },
    { id: 'villa', n: 'Villa avec piscine (propriétaire)', buy: 1450000, cost: 18000, b: 12, own: 1 }
  ];
  D.home = function (id) { return D.HOMES.find(function (h) { return h.id === id; }) || D.HOMES[0]; };
  D.LIVING = 6000; // vie courante quand on habite seul·e

  // ---------- objets (le nom dépend de l'année) ----------
  // n : nom fixe, ou ns : [[annéeMax, nom], ...] ; age : âge minimum ; b : bonheur à l'achat ; up : entretien annuel ; yb : effets annuels
  D.ITEMS = [
    { id: 'tel', ns: [[1994, null], [2006, 'Téléphone portable à clapet'], [2044, 'Smartphone'], [9999, 'Implant téléphonique']], price: 450, age: 10, b: 7, yb: { s: 1 } },
    { id: 'telluxe', ns: [[2006, null], [2044, 'Smartphone dernier cri'], [9999, 'Implant téléphonique premium']], price: 1400, age: 12, b: 9, yb: { s: 1, c: 0.5 } },
    { id: 'ordi', ns: [[1979, null], [1999, 'Ordinateur de bureau'], [9999, 'Ordinateur portable']], price: 900, age: 8, b: 5, yb: { sk: { info: 1 } } },
    { id: 'pcgaming', ns: [[1994, null], [2049, 'PC gaming'], [9999, 'PC gaming quantique']], price: 1900, age: 10, b: 10, yb: { b: 1, sk: { info: 1 } } },
    { id: 'console', ns: [[1976, null], [1994, 'Console 8 bits'], [2045, 'Console de salon'], [9999, 'Console holographique']], price: 480, age: 6, b: 7, yb: { b: 1 } },
    { id: 'walkman', ns: [[1978, null], [2000, 'Walkman'], [2012, 'Lecteur MP3'], [9999, null]], price: 110, age: 8, b: 4, yb: { sk: { musique: 0.5 } } },
    { id: 'vr', ns: [[2015, null], [9999, 'Casque de réalité virtuelle']], price: 550, age: 12, b: 7 },
    { id: 'velo', n: 'Vélo', price: 250, age: 5, b: 4, yb: { h: 1 } },
    { id: 'trott', ns: [[2016, null], [9999, 'Trottinette électrique']], price: 450, age: 12, b: 5, risk: 1 },
    { id: 'hoverboard', ns: [[2049, null], [9999, 'Hoverboard volant']], price: 2600, age: 12, b: 9, risk: 1 },
    { id: 'guitare', n: 'Guitare', price: 280, age: 7, b: 3, yb: { sk: { musique: 1.5 } } },
    { id: 'piano', n: 'Piano', price: 3800, age: 6, b: 4, yb: { sk: { musique: 2 } } },
    { id: 'salle', n: 'Abonnement salle de sport', price: 420, age: 14, b: 2, sub: 1, yb: { h: 3, sk: { sport: 2 } } },
    { id: 'scooter', n: 'Scooter 50 cm³', price: 1900, age: 14, b: 7, up: 400, risk: 1, yb: { s: 1 } },
    { id: 'moto', n: 'Moto', price: 7800, age: 18, b: 9, up: 900, permis: 1, risk: 2, yb: { c: 0.5 } },
    { id: 'voiture-occa', n: 'Voiture d’occasion', price: 5500, age: 18, b: 6, up: 1400, permis: 1, risk: 1, yb: { s: 1 } },
    { id: 'voiture', ns: [[2034, 'Voiture neuve'], [9999, 'Voiture autonome']], price: 24000, age: 18, b: 10, up: 1600, permis: 1, risk: 1, yb: { s: 1 } },
    { id: 'sportive', n: 'Voiture de sport', price: 95000, age: 18, b: 14, up: 4000, permis: 1, risk: 2, yb: { c: 1 } },
    { id: 'volante', ns: [[2059, null], [9999, 'Voiture volante']], price: 160000, age: 18, b: 16, up: 5000, permis: 1, risk: 2, yb: { c: 1 } },
    { id: 'montre', n: 'Montre de luxe', price: 12000, age: 16, b: 6, yb: { c: 1 } },
    { id: 'banane', n: 'Œuvre d’art contemporain (une banane scotchée)', price: 40000, age: 18, b: 4 },
    { id: 'yacht', n: 'Yacht', price: 2500000, age: 18, b: 22, up: 120000, yb: { c: 1, s: 1 } },
    { id: 'ile', n: 'Île privée', price: 15000000, age: 18, b: 30, up: 300000 },
    { id: 'mars', ns: [[2069, null], [9999, 'Billet pour Mars']], price: 800000, age: 18, b: 25, once: 1 }
  ];
  D.item = function (id) { return D.ITEMS.find(function (i) { return i.id === id; }); };
  D.itemName = function (it, year) {
    if (it.n) return it.n;
    for (let i = 0; i < it.ns.length; i++) if (year <= it.ns[i][0]) return it.ns[i][1];
    return null;
  };
  // animaux de compagnie
  D.PETS = [
    { id: 'chien', spn: 'ton chien', n: 'Chien', price: 350, life: [10, 15], names: ['Rex', 'Pépito', 'Saucisse', 'Nala', 'Rocky', 'Biscotte', 'Gaston', 'Moka'] },
    { id: 'chat', spn: 'ton chat', n: 'Chat', price: 150, life: [12, 19], names: ['Mistigri', 'Croquette', 'Pacha', 'Moustache', 'Simba', 'Choupette', 'Napoléon', 'Câlin'] },
    { id: 'lapin', spn: 'ton lapin', n: 'Lapin', price: 60, life: [6, 10], names: ['Pompon', 'Caramel', 'Flocon', 'Panpan'] },
    { id: 'hamster', spn: 'ton hamster', n: 'Hamster', price: 25, life: [2, 3], names: ['Turbo', 'Noisette', 'Sushi', 'Boulette'] },
    { id: 'poisson', spn: 'ton poisson rouge', n: 'Poisson rouge', price: 15, life: [3, 10], names: ['Bulle', 'Nemo', 'Sardine', 'Glouglou'] },
    { id: 'perroquet', spn: 'ton perroquet', n: 'Perroquet', price: 900, life: [30, 60], names: ['Coco', 'Jacquot', 'Capitaine', 'Kiwi'] },
    { id: 'tortue', spn: 'ta tortue', n: 'Tortue', price: 80, life: [40, 80], names: ['Franklin', 'Speedy', 'Mamie', 'Caillou'] },
    { id: 'robochien', spn: 'ton robot-chien', n: 'Robot-chien', price: 4000, life: [15, 30], yr: 2045, names: ['Byte', 'Unit-9', 'Ferraille', 'Pixel'] }
  ];
  D.pet = function (id) { return D.PETS.find(function (p) { return p.id === id; }); };

  // ---------- maladies ----------
  // sev = perte de santé par an ; cure = chance de guérir chez le médecin ; hosp = soigné à l'hôpital ; chronic = revient
  D.ILLS = {
    rhume: { n: 'Rhume', sev: 1, cure: 0.98, auto: 0.9 },
    poux: { n: 'Poux', sev: 0.5, cure: 0.95, auto: 0.5, kid: 1 },
    varicelle: { n: 'Varicelle', sev: 3, cure: 0.95, auto: 0.95, kid: 1 },
    angine: { n: 'Angine', sev: 3, cure: 0.95, auto: 0.5 },
    grippe: { n: 'Grippe', sev: 4, cure: 0.9, auto: 0.7 },
    gastro: { n: 'Gastro', sev: 3, cure: 0.95, auto: 0.85 },
    covid: { n: 'Covid', sev: 5, cure: 0.85, auto: 0.8 },
    fracture: { n: 'Fracture', sev: 6, cure: 1, auto: 1 },
    carie: { n: 'Carie', sev: 1, cure: 1, auto: 0 },
    allergie: { n: 'Allergie au pollen', sev: 1, cure: 0.5, auto: 0.2 },
    migraine: { n: 'Migraines', sev: 2, cure: 0.6, auto: 0.15 },
    maldos: { n: 'Mal de dos', sev: 3, cure: 0.55, auto: 0.1 },
    appendicite: { n: 'Appendicite', sev: 12, cure: 0.97, auto: 0, hosp: 1 },
    hypertension: { n: 'Hypertension', sev: 3, cure: 0.45, auto: 0 },
    diabete: { n: 'Diabète', sev: 4, cure: 0.15, auto: 0 },
    arthrose: { n: 'Arthrose', sev: 3, cure: 0.3, auto: 0 },
    burnout: { n: 'Burn-out', sev: 5, cure: 0.6, auto: 0.3, mind: 1 },
    cancer: { n: 'Cancer', sev: 11, cure: 0.6, auto: 0, hosp: 1 }
  };

  // ---------- succès (XP de compte) ----------
  D.ACH = [
    { id: 'an1', n: 'Premier tour de soleil', d: 'Fêter ton premier anniversaire.', xp: 10 },
    { id: 'brevet', n: 'Brevet en poche', d: 'Obtenir le brevet.', xp: 20 },
    { id: 'bac', n: 'Bachelier·ère', d: 'Obtenir le bac.', xp: 30 },
    { id: 'bac-tb', n: 'Mention très bien', d: 'Obtenir le bac avec la mention très bien.', xp: 60 },
    { id: 'bac5', n: 'Bac+5', d: 'Décrocher un diplôme de niveau bac+5.', xp: 60 },
    { id: 'doc', n: 'Docteur·e', d: 'Terminer des études de santé (médecine, pharmacie, véto).', xp: 90 },
    { id: 'redouble', n: 'Encore un tour', d: 'Redoubler une classe.', xp: 15 },
    { id: 'premierjob', n: 'Premier salaire', d: 'Être embauché·e pour la première fois.', xp: 20 },
    { id: 'promo', n: 'Ça grimpe', d: 'Obtenir une promotion.', xp: 25 },
    { id: 'sommet', n: 'Tout en haut', d: 'Atteindre le dernier échelon d’un métier.', xp: 120 },
    { id: 'vire', n: 'Prends tes cartons', d: 'Te faire licencier.', xp: 25 },
    { id: 'president', n: 'Président·e de la République', d: 'Atteindre l’Élysée.', xp: 300 },
    { id: 'astronaute', n: 'Dans les étoiles', d: 'Devenir astronaute.', xp: 200 },
    { id: 'star', n: 'Paparazzi', d: 'Atteindre le sommet d’un métier de star.', xp: 150 },
    { id: 'retraite', n: 'Retraite bien méritée', d: 'Partir à la retraite.', xp: 40 },
    { id: 'millionnaire', n: 'Millionnaire', d: 'Posséder 1 million d’euros.', xp: 150 },
    { id: 'proprio', n: 'Propriétaire', d: 'Acheter un logement.', xp: 50 },
    { id: 'dette', n: 'Dans le rouge', d: 'Avoir plus de 20 000 € de dettes.', xp: 20 },
    { id: 'premieramour', n: 'Papillons dans le ventre', d: 'Avoir ton premier amour.', xp: 15 },
    { id: 'marie', n: 'Oui, je le veux', d: 'Te marier.', xp: 40 },
    { id: 'mariages3', n: 'Collection d’alliances', d: 'Te marier trois fois dans la même vie.', xp: 100 },
    { id: 'parent', n: 'Parent', d: 'Avoir un enfant.', xp: 40 },
    { id: 'tribu', n: 'Famille nombreuse', d: 'Avoir 4 enfants ou plus.', xp: 80 },
    { id: 'fratrie', n: 'La tribu', d: 'Avoir au moins 6 frères et sœurs.', xp: 60 },
    { id: 'populaire', n: 'Populaire', d: 'Avoir 8 amis en même temps.', xp: 60 },
    { id: 'ennemis', n: 'Ennemi public', d: 'Avoir 4 ennemis en même temps.', xp: 50 },
    { id: 'hp', n: 'Ils sont parmi nous', d: 'Finir à l’hôpital psychiatrique après avoir parlé d’OVNIs.', xp: 60 },
    { id: 'police', n: 'Au poste', d: 'Avoir affaire à la police.', xp: 20 },
    { id: 'prison', n: 'Derrière les barreaux', d: 'Aller en prison.', xp: 50 },
    { id: 'jackpot', n: 'Jackpot', d: 'Gagner gros au casino.', xp: 60 },
    { id: 'loto', n: 'Le gros lot', d: 'Gagner au loto.', xp: 200 },
    { id: 'survivant', n: 'Toujours debout', d: 'Repousser les idées noires.', xp: 50 },
    { id: 'miracle', n: 'Miraculé·e', d: 'Sortir de l’hôpital après 90 ans.', xp: 120 },
    { id: 'octo', n: '80 bougies', d: 'Vivre jusqu’à 80 ans.', xp: 60 },
    { id: 'centenaire', n: 'Centenaire', d: 'Vivre jusqu’à 100 ans.', xp: 250 },
    { id: 'roman', n: 'Écrivain·e', d: 'Publier un roman.', xp: 50 },
    { id: 'influ', n: 'Influenceur·se', d: 'Atteindre 1 million d’abonnés.', xp: 120 },
    { id: 'voyageur', n: 'Citoyen·ne du monde', d: 'Voyager dans 5 destinations différentes.', xp: 60 },
    { id: 'tanguy', n: 'Le nid douillet', d: 'Vivre encore chez tes parents à 30 ans.', xp: 30 },
    { id: 'pigeon', n: 'Ennemi juré des pigeons', d: 'Te faire voler trois fois par des pigeons.', xp: 30 },
    { id: 'dynastie', n: 'Dynastie', d: 'Jouer la 3e génération d’une même famille.', xp: 100 },
    { id: 'animaux', n: 'Arche de Noé', d: 'Avoir 3 animaux en même temps.', xp: 30 },
    { id: 'mars', n: 'Martien·ne', d: 'Partir sur Mars.', xp: 150 },
    { id: 'relaxe', n: 'Innocent·e (officiellement)', d: 'Être relaxé·e au tribunal.', xp: 60 },
    { id: 'perpet', n: 'Pour toujours', d: 'Être condamné·e à perpétuité.', xp: 80 },
    { id: 'evade', n: 'La grande évasion', d: 'S’évader de prison.', xp: 90 },
    { id: 'reve', n: 'Rêve accompli', d: 'Réaliser le rêve que tu as écrit.', xp: 120 },
    { id: 'moulin', n: 'Moulin à paroles', d: 'Écrire 10 de tes propres phrases dans une vie.', xp: 50 }
  ];
  D.ach = function (id) { return D.ACH.find(function (a) { return a.id === id; }); };

  // ---------- niveau de compte : récompenses et titres ----------
  D.REWARDS = [
    { lvl: 2, id: 'reroll', n: 'Relancer la famille', d: 'À la création, tu peux tirer d’autres parents.' },
    { lvl: 3, id: 'passe', n: 'Époque : Passé', d: 'Naître entre 1950 et 2025.' },
    { lvl: 4, id: 'genes', n: 'Bonnes gènes', d: '+6 en Santé à la naissance.' },
    { lvl: 5, id: 'futur', n: 'Époque : Futur', d: 'Naître entre 2027 et 2100.' },
    { lvl: 6, id: 'don', n: 'Don naturel', d: 'Choisir une compétence de départ (+15).' },
    { lvl: 8, id: 'temperament', n: 'Tempérament', d: 'Choisir un trait de caractère de naissance.' },
    { lvl: 10, id: 'livret', n: 'Livret A', d: 'Un livret de 2 000 € t’attend à tes 18 ans.' },
    { lvl: 12, id: 'richesse', n: 'Bien né·e', d: 'Choisir la richesse de ta famille.' },
    { lvl: 15, id: 'etoile', n: 'Bonne étoile', d: '+5 % de réussite sur les actions risquées.' },
    { lvl: 18, id: 'charme', n: 'Petite gueule d’ange', d: '+6 en Charisme à la naissance.' },
    { lvl: 22, id: 'sage', n: 'Vieille âme', d: '+6 en Bonheur à la naissance.' },
    { lvl: 25, id: 'legende', n: 'Légende', d: 'Ton nom brille en or dans le cimetière.' }
  ];
  D.TITLES = ['Nouveau-né', 'Bambin', 'Écolier', 'Collégien', 'Ado rebelle', 'Bachelier', 'Jeune actif', 'Locataire', 'Adulte responsable', 'Propriétaire', 'Sage du quartier', 'Vieux de la vieille', 'Patriarche', 'Mémoire vivante', 'Âme ancienne', 'Réincarné en série', 'Maître du temps', 'Voyageur des époques', 'Immortel'];
  D.title = function (lvl) { return D.TITLES[Math.min(D.TITLES.length - 1, Math.floor((lvl - 1) / 2))]; };

  // ---------- divers textes ----------
  D.DISPUTES = ['la bonne façon de plier une pizza', 'la couleur exacte du ciel mardi dernier', 'qui a inventé la chaise', 'le nombre de pattes d’une crevette', 'pain au chocolat ou chocolatine', 'si les poissons ont soif', 'l’emplacement idéal de la télécommande', 'la meilleure saison pour manger une soupe', 'si un hot-dog est un sandwich', 'qui a laissé la dernière feuille de papier toilette', 'l’accent de la météo', 'si les pigeons nous espionnent', 'le prix d’une baguette en 1987', 'la forme des nuages', 'la meilleure place dans le canapé'];
  D.OVNI = ['un triangle lumineux au-dessus du Leclerc', 'des lumières qui clignotaient en morse au-dessus du stade', 'un vaisseau en forme de croissant au beurre', 'un petit homme gris au rayon surgelés', 'un cercle parfait dans le champ du voisin'];
  D.FIRST_WORDS = ['patate', 'wifi', 'non', 'croquette', 'chaussure', 'banane', 'caca', 'tracteur', 'mamie', 'fromage', 'moustique', 'impôts'];
  D.CAUSES = {
    vieillesse: 'de vieillesse, paisiblement',
    hopital: 'à l’hôpital, entouré·e de soignants',
    depression: 'des suites d’une dépression',
    accident: 'dans un accident',
    maladie: 'de maladie'
  };
})(window.LP);
