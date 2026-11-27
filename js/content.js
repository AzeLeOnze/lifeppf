/* LifePPF — contenus en plus : interactions et anecdotes des objets, films, concerts et festivals, centres d'intérêt, styles d'éducation. */
(function (L) {
  'use strict';
  const D = L.D;

  // ---------- objets : interaction débloquée avec les amis (ia) + anecdotes du journal (an, une fois par vie chacune) ----------
  D.ITEM_FX = {
    tel: {
      ia: { n: function (y) { return y <= 2006 ? 'S’envoyer des SMS' : 'Parler à distance sur LifeChat'; },
        t: ['Soirée entière à papoter sur LifeChat avec {x}. Tu t’endors le téléphone sur la joue.', 'Appel vidéo avec {x} : dix minutes de « tu m’entends ? », puis deux heures de fous rires.', 'Tu envoies à {x} un vocal de 6 minutes. {X.il} te répond par un vocal de 11 minutes. C’est la guerre des vocaux.'],
        t0: ['Vous vous envoyez 80 SMS avec {x}. Le forfait explose, l’amitié aussi (dans le bon sens).', 'Tu écris un SMS à {x} en appuyant trois fois sur chaque touche. Il fait 160 caractères pile.'] },
      an: ['Tu fais tomber ton téléphone du 3e étage. Il n’a rien. Toi, tu as perdu dix ans d’espérance de vie.', 'Tu as joué sur ton téléphone toute la journée en oubliant l’heure qui tournait. Il fait nuit. Il faisait jour.', 'Ton téléphone tombe dans les toilettes. Une nuit dans un bol de riz plus tard, il revit. Miracle.', 'Tu envoies un message d’amour au groupe de la famille par erreur. Tonton Gérard répond « moi aussi ».', 'Tu cherches ton téléphone partout pendant 20 minutes. Il était dans ta main.', 'Ton correcteur automatique remplace « bisous » par « bison » dans un message important.']
    },
    telluxe: {
      ia: { n: 'Te la péter avec ton smartphone dernier cri', ko: 0.25, kot: '{X.n} lève les yeux au ciel : « Oui, on a compris, il est neuf. »',
        t: ['Tu sors ton smartphone dernier cri devant {x}, « par hasard ». Trois caméras, zéro modestie.', 'Tu montres à {x} le mode photo de nuit. {X.il} est impressionné{x.e}. Toi, tu es surtout fier{e}.', '{X.n} te demande si ton téléphone fait aussi le café. Pas encore, mais la mise à jour arrive.'], fx: { c: 1 } },
      an: ['Ton smartphone dernier cri fait de si belles photos que tu photographies ton petit-déjeuner tous les matins.', 'Une mise à jour de ton smartphone change toutes les icônes de place. Tu ne sais plus passer un appel.', 'Tu casses l’écran de ton smartphone neuf le jour même. Il marche, mais tout est en mosaïque.', 'Ton smartphone dernier cri reconnaît ton visage… et aussi celui de ton chat.', 'Quelqu’un te demande si ton téléphone « fait aussi le café ». Tu cherches l’option dans les réglages.']
    },
    ordi: {
      ia: { n: 'Partager des mèmes rigolos', t: ['Tu envoies à {x} un mème de chat en costume. {X.il} répond par un mème de chien en costume. Escalade.', 'Vous passez l’après-midi devant l’ordi à regarder des vidéos de chutes. Fou rire nerveux garanti.', 'Tu répares l’ordi de {x} : tu l’éteins et tu le rallumes. Ça marche. Tu passes pour un génie.'], fx: { sk: { info: 0.5 } } },
      an: ['Ton ordinateur décide de faire une mise à jour de deux heures pile avant un truc important.', 'Tu ouvres 47 onglets sur ton ordinateur. Le ventilateur décolle.', 'Tu perds un document de 30 pages. Tu le retrouves dans « Nouveau dossier (12) ».', 'Ton ordi affiche un écran bleu. Tu lui parles doucement. Il redémarre. Vous êtes liés pour la vie.', 'Tu passes une nuit entière sur une encyclopédie en ligne, de « fourchette » à « Empire byzantin ».']
    },
    pcgaming: {
      ia: { n: 'Parler des dernières cartes graphiques', t: ['Tu expliques à {x} la différence entre deux cartes graphiques pendant 45 minutes. {X.il} hoche la tête poliment.', 'Débat enflammé avec {x} : 4K ou 240 images par seconde ? Personne ne gagne, tout le monde s’amuse.', '{X.n} vient voir ton PC gaming. Les LED RGB l’éblouissent. Il faut des lunettes de soleil.'], fx: { sk: { info: 0.5 } } },
      an: ['Ton PC gaming chauffe tellement que tu fais sécher tes chaussettes dessus l’hiver.', 'Les LED de ton PC gaming clignotent au rythme de ta musique. Ta chambre ressemble à une boîte de nuit.', 'Tu nettoies ton PC gaming : il y a assez de poussière dedans pour fabriquer un deuxième chat.', 'Tu passes trois heures à régler les graphismes d’un jeu, puis dix minutes à y jouer.', 'Ton PC gaming fait plus de bruit qu’un avion au décollage. Les voisins pensent que tu vis dans un aéroport.']
    },
    console: {
      ia: { n: 'Partager des astuces de combat sur console', t: ['Tu montres à {x} le combo secret : bas, bas, haut, saut, cri. Ça ne marche qu’avec le cri.', 'Soirée console avec {x}. Vous enchaînez les combats jusqu’à 2 h du matin. Les manettes fument.', '{X.n} te bat avec ta propre technique. L’élève a dépassé le maître.'] },
      an: ['Tu lances une partie « juste cinq minutes » sur ta console. Il est 3 h du matin.', 'Ta manette disparaît. Tu la retrouves dans le frigo. Personne n’a d’explication.', 'Tu bats enfin le boss final après 41 essais. Tu cries si fort que le chien aboie.', 'Coupure de courant pendant ta partie, juste avant la sauvegarde. Tu pleures un peu.', 'Tu apprends à ta mamie à jouer à la console. Elle te bat dès la deuxième partie.']
    },
    walkman: {
      ia: { n: 'Partager tes écouteurs', t: ['Un écouteur chacun avec {x}, ta playlist secrète. Moment suspendu.', 'Tu fais écouter à {x} ta chanson préférée en boucle. À la 12e, {x.il} la connaît par cœur.'], fx: { sk: { musique: 0.5 } } },
      an: ['Tes écouteurs sont emmêlés en un nœud de marin. Tu y passes la soirée.', 'Tu chantes à tue-tête dans la rue avec ton baladeur. Tout le monde t’entend. Toi, non.', 'Les piles de ton baladeur meurent au milieu de ta chanson préférée.', 'Tu écoutes la même chanson 63 fois d’affilée. Record personnel.', 'Tu fais une playlist pour chaque humeur. Tu en as 41.']
    },
    vr: {
      ia: { n: 'Est-ce que tout ça est réel ?', t: ['Tu prêtes ton casque VR à {x}. {X.il} se cogne dans l’armoire en esquivant un dragon. Fou rire.', 'Grand débat avec {x}, casque sur la tête : et si on vivait déjà dans une simulation ? Vous fixez le plafond, songeurs.', '{X.n} enlève le casque et te regarde fixement : « Et toi, tu es réel ? » Ambiance.'], fx: { tr: { curieux: 1 } } },
      an: ['Avec ton casque de réalité virtuelle, tu esquives un dragon… et tu renverses la lampe du salon.', 'Après quatre heures de réalité virtuelle, tu essaies d’attraper ton verre d’eau avec les mains en l’air.', 'Tu visites Venise en réalité virtuelle. Tu sens presque l’odeur des canaux. Heureusement, presque.', 'Quelqu’un te filme pendant que tu joues en réalité virtuelle. La vidéo fait le tour de la famille.', 'Tu enlèves ton casque VR et le vrai monde te paraît un peu… mal dessiné.']
    },
    velo: {
      ia: { n: 'Inviter à faire du vélo', t: ['Balade à vélo avec {x} jusqu’au lac. Le retour en côte est moins drôle.', 'Course de vélo avec {x}. Tu gagnes d’une roue. {X.il} réclame une revanche.', 'Pique-nique à vélo avec {x}. Le sandwich a voyagé dans la sacoche : il est plat, mais délicieux.'], fx: { h: 1 } },
      an: ['Ta chaîne de vélo déraille au milieu d’une côte. Tu finis à pied, en poussant, avec dignité.', 'Tu crèves un pneu de vélo et tu apprends à le réparer. Tu te sens invincible.', 'Un chien te poursuit pendant ta balade à vélo. Ton record de vitesse est pulvérisé.', 'Tu fais du vélo sans les mains pendant quatre secondes. Puis avec le visage.', 'Tu pars à vélo acheter du pain et tu reviens trois heures plus tard, après 40 km.']
    },
    trott: {
      ia: { n: 'Course de trottinettes électriques', t: ['Course de trottinettes avec {x}. Un pigeon est le seul blessé (dans son orgueil).', 'Balade en trottinette électrique avec {x}. La batterie lâche à 3 km de la maison.'] },
      an: ['Ta trottinette électrique tombe en panne de batterie à 3 km de chez toi. Tu la portes comme un bébé.', 'Tu frôles un pigeon en trottinette. Il ne bouge pas d’un millimètre. Respect mutuel.', 'Tu prends un nid-de-poule en trottinette électrique. Tu voles un peu. Tu atterris bien. Presque.', 'Ta trottinette électrique fait un bruit bizarre. Tu l’appelles désormais « Bernard ».', 'Tu doubles un cycliste en trottinette. Il te le reproche à chaque feu rouge.']
    },
    hoverboard: {
      ia: { n: 'Faire un tour d’hoverboard volant', t: ['Tu emmènes {x} faire un tour d’hoverboard au-dessus du parc. {X.il} hurle de joie (et un peu de peur).', 'Course d’hoverboards avec {x} entre les drones de livraison. Adrénaline pure.'] },
      an: ['Ton hoverboard reste coincé à deux mètres du sol pendant une heure. Tu salues les passants d’en haut.', 'Tu fais un looping en hoverboard. Ton déjeuner fait aussi un looping.', 'Un drone de livraison te double en hoverboard. Tu le prends personnellement.', 'Ton hoverboard se met à jour en plein vol. Tu attends, en lévitation, que la barre atteigne 100 %.', 'Les enfants du quartier t’appellent « le magicien » quand tu passes en hoverboard.']
    },
    guitare: {
      ia: { n: 'Faire écouter ta composition à la guitare', t: ['Tu joues ta composition à la guitare pour {x}. {X.il} applaudit, puis demande le titre. Elle s’appelle « {x.n} ».', 'Tu gratouilles un morceau pour {x}. Trois accords, beaucoup d’émotion.', 'Feu de camp improvisé : ta guitare, {x} et une chanson que vous inventez ensemble.'], fx: { sk: { musique: 1 } } },
      an: ['Tu casses une corde de guitare en plein solo. Le public (ton oreiller) ne remarque rien.', 'Tu apprends enfin le fameux accord de fa. Tes doigts ne te le pardonneront jamais.', 'Tu joues de la guitare sous une fenêtre. Il pleut. C’est très romantique et très mouillé.', 'Tu composes une chanson sur ton petit-déjeuner. Elle est étonnamment émouvante.', 'Ta guitare est désaccordée depuis trois mois. Tu trouves que ça lui donne du caractère.']
    },
    piano: {
      ia: { n: 'Faire écouter ta composition au piano', t: ['Tu joues ta composition au piano pour {x}. {X.il} ferme les yeux. Le voisin aussi, mais d’agacement.', 'Concert privé au piano pour {x}. Tu rates une note, tu dis que c’est du jazz.'], fx: { sk: { musique: 1 } } },
      an: ['Tu joues du piano à 7 h du matin. Les voisins se réveillent aussi, mais moins en musique.', 'Un chat du voisinage entre et marche sur les touches du piano. Son morceau est meilleur que le tien.', 'Tu joues « Au clair de la lune » pour la 400e fois. Tu commences à la trouver profonde.', 'Ton piano sert surtout à poser des cartons. Parfois, tu joues une note pour lui faire plaisir.', 'Tu fais accorder ton piano. L’accordeur repart en hochant la tête d’un air grave.']
    },
    salle: {
      ia: { n: 'Séance de sport à deux', t: ['Séance de muscu avec {x}. Vous vous encouragez à grands cris. Les autres aussi, par politesse.', 'Cours de zumba avec {x}. Aucun de vous n’est synchro. Personne ne s’en soucie.'], fx: { h: 1, sk: { sport: 1 } } },
      an: ['À la salle de sport, quelqu’un soulève trois fois ton poids. Tu fais semblant de t’étirer.', 'Tu restes 20 minutes sur le vélo d’appartement en regardant une série. Ça compte.', 'Tu oublies ta serviette à la salle de sport. Tu ne la reverras jamais.', 'Le coach de la salle de sport te tutoie. Tu te sens [accepté|acceptée].', 'Courbatures légendaires après la salle de sport. Descendre l’escalier devient un sport extrême.']
    },
    scooter: {
      ia: { n: 'Balade en scooter', t: ['Balade en scooter avec {x} derrière toi. Le casque est trop grand, le fou rire aussi.', 'Tour de ville en scooter avec {x}. Vous vous arrêtez pour une glace à chaque feu rouge.'] },
      an: ['Ton scooter refuse de démarrer un matin d’hiver. Tu lui parles. Il démarre. Vous êtes complices.', 'Tu cales ton scooter au feu rouge devant tout le monde. Le feu repasse au vert deux fois.', 'Ton casque de scooter t’a fait une coiffure inédite. Tu la gardes toute la journée.', 'Tu fais le plein de ton scooter pour 4 €. Tu te sens plein{e} aux as.', 'Ton scooter fait le bruit d’une tondeuse énervée. Tout le quartier sait quand tu rentres.']
    },
    moto: {
      ia: { n: 'Balade à moto', t: ['Virée à moto avec {x} sur les routes de campagne. Le vent, la liberté, les moucherons dans les dents.', 'Tu emmènes {x} à moto voir le coucher de soleil. Moment de film.'] },
      an: ['Un moucheron t’arrive dans la bouche à 90 km/h. Protéines gratuites.', 'Tu fais le salut des motards à un autre motard. Il te répond. Tu fais partie du club.', 'Tu laves ta moto un dimanche matin pendant trois heures. Elle brille plus que toi.', 'Ta moto démarre du premier coup après tout l’hiver. Petit miracle mécanique.', 'Pause dans un café de motards : tout le monde parle de chaînes et de pneus. Tu adores.']
    },
    'voiture-occa': {
      ia: { n: 'Road trip du week-end', t: ['Road trip avec {x} dans ta vieille voiture. Elle tousse dans les côtes, vous chantez plus fort.', 'Week-end improvisé avec {x}. La clim ne marche pas et la radio capte une seule station : de l’accordéon.'] },
      an: ['Ta vieille voiture fait un bruit inquiétant. Tu montes le son de la radio : problème réglé.', 'Ta voiture d’occasion a une odeur mystérieuse de fromage. Personne ne sait d’où elle vient.', 'Le voyant moteur de ta voiture est allumé depuis deux ans. Tu le considères comme une décoration.', 'Ta vieille voiture passe le contrôle technique de justesse. Le garagiste te serre la main, ému.', 'Tu trouves 12 € en pièces sous les sièges de ta voiture. Jour de chance.']
    },
    voiture: {
      ia: { n: 'Road trip du week-end', t: ['Road trip avec {x} dans ta voiture. Règle n° 1 : interdiction de manger des chips à l’intérieur.', 'Week-end à la mer avec {x}. Le GPS vous fait passer par un chemin de vaches. Inoubliable.'] },
      an: ['Tu cherches ta voiture pendant 30 minutes sur le parking du supermarché. Elle était juste devant.', 'Tu chantes à tue-tête dans ta voiture. Au feu rouge, le voisin te regarde. Tu continues.', 'Un oiseau choisit ta voiture toute propre pour faire ses besoins. Il visait.', 'Ta voiture fait un bip mystérieux. Tu lis les 400 pages du manuel. Tu ne trouves pas.', 'Tu réussis un créneau parfait du premier coup. Personne ne l’a vu. Tu le racontes à tout le monde.']
    },
    sportive: {
      ia: { n: 'Faire vrombir le moteur', t: ['Tu fais vrombir le moteur de ta voiture de sport devant {x}. Toute la rue se retourne. {X.il} rit (de toi ou avec toi ?).', 'Tour de circuit avec {x} dans ta voiture de sport. {X.il} ne lâche plus la poignée.'], fx: { c: 1 } },
      an: ['Ta voiture de sport consomme tellement que la station-service t’envoie une carte de vœux.', 'Tu restes [coincé|coincée] derrière un tracteur avec ta voiture de sport. Le karma.', 'Un enfant fait coucou à ta voiture de sport. Tu fais vrombir le moteur. Il est ravi.', 'Le dos-d’âne du quartier est ton pire ennemi. Ta voiture de sport racle à chaque fois.', 'Tu laves ta voiture de sport à la main, chaque recoin, en lui parlant doucement.']
    },
    volante: {
      ia: { n: 'Survoler la ville ensemble', t: ['Tu emmènes {x} survoler la ville en voiture volante. Vous saluez un pigeon à hauteur des yeux.', 'Pique-nique perché avec {x} : vous vous posez sur le toit le plus haut de la ville.'] },
      an: ['Embouteillage aérien au-dessus du périphérique. Même dans le ciel, ça bouchonne.', 'Ta voiture volante se pose sur le mauvais toit. Les voisins t’invitent à dîner.', 'Tu survoles ta ville natale en voiture volante. Tu repères la maison de ton enfance.', 'Un oiseau fait la course avec ta voiture volante. Tu le laisses gagner.', 'Le contrôle technique de ta voiture volante coûte plus cher qu’un studio. Mais la vue…']
    },
    montre: {
      ia: { n: 'Montrer ta montre de luxe (l’air de rien)', ko: 0.3, kot: '{X.n} te demande l’heure exprès. Tu comprends que tu en fais trop.',
        t: ['Tu regardes l’heure toutes les 30 secondes devant {x}. {X.il} finit par demander : « Elle est neuve, ta montre ? » Victoire.', '{X.n} remarque ta montre de luxe. Tu fais semblant que c’est un vieux truc sans importance.'], fx: { c: 1 } },
      an: ['Ta montre de luxe retarde de deux minutes. Elle coûte 12 000 €. Tu ne le dis à personne.', 'Tu remontes ta manche toutes les cinq minutes pour que les gens voient ta montre.', 'Tu poses ta montre de luxe sur la table du restaurant. Le serveur te sert en premier.', 'Tu te réveilles en pleine nuit pour vérifier que ta montre de luxe est toujours là.', 'Ta montre de luxe est étanche jusqu’à 300 m. Tu ne vas jamais plus loin que ta baignoire.']
    },
    banane: {
      ia: { n: 'Débattre : la banane scotchée, c’est de l’art ?', t: ['Grand débat avec {x} devant ta banane scotchée. Conclusion : c’est de l’art, mais elle commence à sentir.', '{X.n} propose de manger ton œuvre à 40 000 €. Tu y réfléchis sérieusement.'] },
      an: ['Ta banane scotchée commence à noircir. Un critique d’art parle de « période sombre ».', 'Quelqu’un mange ta banane à 40 000 €. Tu la remplaces par une banane du supermarché. Personne ne voit la différence.', 'Un musée te demande de prêter ta banane pour une exposition. Tu hésites.', 'Ta banane scotchée attire les moucherons. C’est de l’art vivant, maintenant.', 'Tu expliques le sens profond de ta banane scotchée à tes invités. Tu ne le connais pas.']
    },
    yacht: {
      ia: { n: 'Inviter à une croisière sur ton yacht', t: ['Croisière sur ton yacht avec {x}. Champagne, soleil, et {x.n} qui a le mal de mer.', 'Tu invites {x} sur ton yacht. {X.il} prend 400 photos et les publie toutes.'], fx: { b: 3 }, rq: [10, 16] },
      an: ['Tu as le mal de mer sur ton propre yacht. Tu restes au port, mais en tenue de capitaine.', 'Ton yacht est si grand que tu t’y perds. Tu retrouves la cuisine au bout d’une heure.', 'Un dauphin suit ton yacht toute la journée. Tu décides qu’il s’appelle Michel.', 'Le plein de ton yacht coûte le prix d’une voiture. Tu fais semblant de ne pas voir le montant.', 'Tu organises une fête sur ton yacht. Quelqu’un tombe à l’eau. C’était toi.']
    },
    ile: {
      ia: { n: 'Inviter sur ton île privée', t: ['Week-end sur ton île privée avec {x}. Vous jouez à Robinson, mais avec un chef cuisinier.', '{X.n} découvre ton île privée et demande s’il y a du réseau. Il n’y en a pas. Panique.'], fx: { b: 4 }, rq: [12, 18] },
      an: ['Sur ton île privée, un crabe te vole ta serviette. Tu n’oses pas la réclamer.', 'Tu donnes un nom à chaque palmier de ton île privée. Ils sont 312.', 'Une noix de coco tombe à 30 cm de ta tête. Ton île te rappelle qui commande.', 'Tu cherches le wifi sur ton île privée. Tu trouves une tortue à la place.', 'Feu de camp en solitaire sur ton île privée. Le silence est immense. Tu adores.']
    }
  };

  // ---------- cinéma ----------
  D.GENRES = {
    comedie: { n: 'Comédie', tr: 'drole', ink: 'y' },
    drame: { n: 'Drame', tr: 'bienveillant', ink: 'b' },
    horreur: { n: 'Horreur', tr: 'calme', ink: 'r', kid: 1 },
    action: { n: 'Action', tr: 'ambitieux', ink: 'r' },
    romance: { n: 'Comédie romantique', tr: 'charismatique', ink: 'm' },
    sf: { n: 'Science-fiction', tr: 'curieux', ink: 'c' },
    anim: { n: 'Animation', tr: 'creatif', ink: 'g' },
    docu: { n: 'Documentaire', tr: 'discipline', ink: 'g' },
    polar: { n: 'Polar', tr: 'honnete', ink: 'b' },
    auteur: { n: 'Film d’auteur', tr: 'creatif', ink: 'c', sk: { art: 1 } },
    musical: { n: 'Comédie musicale', tr: 'drole', ink: 'm', sk: { musique: 1 } }
  };
  D.FILMS = [
    ['Boucle d’argent au pays des boutons d’or', 'anim'], ['Papa, l’avion est en retard', 'comedie'], ['Retraite tardive 2', 'comedie'], ['Professeur Oloff : le retour', 'sf'],
    ['La Soupe miso de trop', 'drame'], ['Apéro dînatoire 4', 'comedie'], ['Ravager : et les temps modernes', 'action'], ['Tapisserie 3', 'horreur'],
    ['Corde de guitare et les cryptes sataniques', 'horreur'], ['Le Grille-pain qui en savait trop', 'polar'], ['Mamie Turbo', 'action'], ['Les Chaussettes orphelines', 'drame'],
    ['Brocoli galactique', 'sf'], ['Le Dernier Rond-point', 'auteur'], ['Silence, on tricote', 'auteur'], ['Un pigeon à Venise', 'romance'],
    ['La Nuit des escargots vivants', 'horreur'], ['Opération Croissant', 'action'], ['Fromage de minuit', 'romance'], ['Les Aventures de Gérard le cactus', 'anim'],
    ['Quinze ans de parking', 'auteur'], ['Cœur de radiateur', 'romance'], ['Le Retour du fils du neveu', 'action'], ['Mission : lave-vaisselle', 'action'],
    ['Robots en vacances', 'anim'], ['La Comptable de l’espace', 'sf'], ['L’Ascenseur 6', 'horreur'], ['Vol au-dessus d’un nid de mouettes', 'comedie'],
    ['Les Loutres : un destin', 'docu'], ['Le Secret des nouilles', 'docu'], ['Pourquoi les pigeons ?', 'docu'], ['Ma belle-mère est un vampire', 'comedie'],
    ['Danse avec les poireaux', 'musical'], ['Chantons sous la bruine', 'musical'], ['La Mélodie du radiateur', 'musical'], ['Bisous à distance', 'romance'],
    ['Le Commissaire Maigrelet', 'polar'], ['Meurtre au rayon fromage', 'polar'], ['Qui a volé la Joconde (encore) ?', 'polar'], ['Planète Lasagne', 'sf'],
    ['Le Cri du parpaing', 'horreur'], ['2084 : l’odyssée du wifi', 'sf'], ['Les Bronzés font du ski de fond', 'comedie'], ['Tonton Fusée', 'anim'],
    ['La Grande Vadrouille des moules', 'comedie'], ['Un été sans clim', 'drame'], ['La Ballade du lampadaire', 'auteur'], ['L’Homme qui murmurait à l’oreille des radiateurs', 'drame'],
    ['Turbo Mamies 3 : déambulateur drift', 'action'], ['Le Château des chaussons', 'anim'], ['Les Larmes du yaourt', 'drame'], ['Embrouille à Mulhouse', 'polar'],
    ['La Valse des parapluies', 'musical'], ['Les Marmottes de l’apocalypse', 'horreur'], ['Tout le monde aime Bernard', 'comedie'], ['Le Mystère du placard', 'polar'],
    ['Super Débris spatial', 'sf'], ['Mon père, le papa', 'drame'], ['Riz : le retour de l’autocuiseur', 'action'], ['Aspirateur 5', 'horreur'],
    ['Foufou & Fofolle', 'comedie'], ['Miroir blanc', 'sf'], ['Voilà, voilà', 'auteur'], ['L’Épopée de moi', 'auteur'],
    ['Le Coiffeur de l’apocalypse', 'action'], ['Trois mariages et un parking', 'romance'], ['La Revanche des fougères', 'horreur'], ['Pingouins en CDD', 'anim']
  ].map(function (f) { return { t: f[0], g: f[1] }; });

  // ---------- jeux vidéo (il faut une console ou un PC gaming) ----------
  D.VG_GENRES = {
    plateforme: { n: 'Plateforme', tr: 'discipline', ink: 'y' },
    rpg: { n: 'Jeu de rôle', tr: 'curieux', ink: 'b', sk: { langues: 0.5 } },
    course: { n: 'Course', tr: 'ambitieux', ink: 'r' },
    combat: { n: 'Combat', tr: 'colerique', ink: 'r' },
    simulation: { n: 'Simulation', tr: 'creatif', ink: 'g' },
    horreur: { n: 'Horreur', tr: 'calme', ink: 'b', kid: 1 },
    puzzle: { n: 'Puzzle', tr: 'calme', ink: 'c', sk: { logique: 1 } },
    strategie: { n: 'Stratégie', tr: 'ambitieux', ink: 'c', sk: { logique: 1 } },
    sport: { n: 'Sport', tr: 'charismatique', ink: 'g' },
    rythme: { n: 'Rythme', tr: 'drole', ink: 'm', sk: { musique: 1 } },
    aventure: { n: 'Aventure', tr: 'curieux', ink: 'y' }
  };
  D.VGAMES = [
    ['La Légende du fromage', 'aventure'], ['Super Vagabond Ultra', 'plateforme'], ['L’Appel des ours', 'aventure'], ['Brico & Drama II', 'simulation'],
    ['Tir & Pulsation', 'rythme'], ['Petit vol de scooters', 'course'], ['Star Lézards', 'combat'], ['Lenz l’apothicaire', 'rpg'],
    ['Pouldar : le jeu', 'sport'], ['Extra Maroquinerie', 'simulation'], ['LifePPF 2', 'simulation'], ['Les Sables larvaires', 'horreur'],
    ['Gé Mode : mannequinat', 'simulation'], ['Mamie Kart Turbo', 'course'], ['Le Donjon du lave-linge', 'rpg'], ['Pigeon Simulator 3000', 'simulation'],
    ['Tétris de cartons', 'puzzle'], ['Baguette Royale', 'combat'], ['Les Chroniques de Kevin', 'rpg'], ['Rond-point infini', 'course'],
    ['Zombies au supermarché', 'horreur'], ['Football de couloir', 'sport'], ['Danse Danse Raclette', 'rythme'], ['Civilisation des moules', 'strategie'],
    ['Cueillette extrême', 'simulation'], ['Le Mystère du grenier', 'aventure'], ['Super Escargot Bros', 'plateforme'], ['La Guerre des taupes', 'strategie'],
    ['Pétanque galactique', 'sport'], ['Ninja fonctionnaire', 'combat'], ['Labyrinthe de chaussettes', 'puzzle'], ['Halloween au camping', 'horreur'],
    ['L’Odyssée du hamster', 'plateforme'], ['Karaoké Hero : édition Tonton', 'rythme'], ['Boulangerie Tycoon', 'simulation'], ['Le Dernier Pixel', 'aventure'],
    ['Le Tournoi des grands-mères', 'combat'], ['Planète Tracteur', 'simulation'], ['Le Fantôme du wifi', 'horreur'], ['Échecs & Mâts de cocagne', 'strategie'],
    ['Rallye des brocantes', 'course'], ['Golf de bureau', 'sport'], ['Mots croisés de l’apocalypse', 'puzzle'], ['Le Royaume des radiateurs', 'strategie'],
    ['Piou piou, je recharge', 'combat'], ['Prise Jack III', 'puzzle'], ['Kung-Fu groenlandais', 'combat'], ['Paris Simulator {an}', 'simulation'],
    ['Plaque d’égout Simulator', 'simulation'], ['Simulation de simulation', 'simulation'], ['Super Salade & Pancakes', 'plateforme'],
    ['Tracteur Royale', 'course'], ['Le Bal des fantômes timides', 'horreur'], ['Sudoku : édition cauchemar', 'puzzle'], ['La Guerre des chaussettes', 'strategie'],
    ['Curling extrême', 'sport'], ['Les Ombres du lavomatic', 'aventure']
  ].map(function (g) { return { t: g[0], g: g[1] }; });

  // ---------- livres ----------
  D.BOOK_GENRES = {
    roman: { n: 'Roman', tr: 'bienveillant', ink: 'y', sk: { langues: 1 } },
    polar: { n: 'Polar', tr: 'honnete', ink: 'b', sk: { logique: 0.8 } },
    sf: { n: 'Science-fiction', tr: 'curieux', ink: 'c', sk: { sciences: 0.8 } },
    fantasy: { n: 'Fantasy', tr: 'creatif', ink: 'm' },
    poesie: { n: 'Poésie', tr: 'creatif', ink: 'm', sk: { langues: 1 } },
    devperso: { n: 'Développement personnel', tr: 'ambitieux', ink: 'g' },
    bd: { n: 'BD', tr: 'drole', ink: 'y', sk: { art: 1 } },
    cuisine: { n: 'Cuisine', tr: 'calme', ink: 'g', sk: { cuisine: 1.5 } },
    histoire: { n: 'Histoire', tr: 'curieux', ink: 'b', sk: { langues: 0.8 } },
    horreur: { n: 'Horreur', tr: 'calme', ink: 'r', kid: 1 },
    romance: { n: 'Romance', tr: 'charismatique', ink: 'm' },
    essai: { n: 'Essai', tr: 'curieux', ink: 'c', sk: { eloquence: 1 } },
    aventure: { n: 'Aventure', tr: 'curieux', ink: 'y' }
  };
  D.BOOKS = [
    ['Toi & moi… et lui', 'romance'], ['La Triste Histoire d’une histoire drôle', 'roman'], ['100 façons de couper des patates', 'cuisine'], ['Je me souviens, un samedi', 'roman'],
    ['Le Golfe aquatique', 'aventure'], ['Pourquoi rêver mieux, si on a déjà mieux', 'devperso'], ['Comment avoir de la virilité ?', 'devperso'], ['Péter pue, mais roter… ?', 'essai'],
    ['Le tabac, c’est tabou', 'essai'], ['Le Chat qui lisait Kant', 'essai'], ['Meurtre à la médiathèque', 'polar'], ['Mémoires d’un lampadaire', 'roman'],
    ['Le Micro-ondes pour les nuls', 'cuisine'], ['Les Étoiles du parking', 'poesie'], ['Galaxie Moutarde', 'sf'], ['Le Dragon végétarien', 'bd'],
    ['Ma vie de pigeon', 'bd'], ['Comment parler aux plantes', 'devperso'], ['L’Histoire de France racontée par un croissant', 'histoire'], ['Sonnets pour un radiateur', 'poesie'],
    ['Le Fantôme du CDI', 'horreur'], ['Les Robots aussi pleurent', 'sf'], ['Le Commissaire Maigrelet enquête', 'polar'], ['Brève histoire du fromage', 'histoire'],
    ['Réussir sa sieste en 10 leçons', 'devperso'], ['Le Petit Prince de Saint-Étienne', 'roman'], ['Les Sorcières du RER B', 'fantasy'], ['Les Recettes de mamie Ginette', 'cuisine'],
    ['Amour, gloire et barbecue', 'romance'], ['Journal d’un hamster', 'bd'], ['L’Art de ne rien faire', 'essai'], ['Le Labyrinthe des boulangers', 'aventure'],
    ['Cent ans de pluie', 'roman'], ['La Nuit des taupes', 'horreur'], ['L’Elfe du rond-point', 'fantasy'], ['Mars, la planète qui boude', 'sf'],
    ['Couscous simple pour 2', 'cuisine'], ['La vie, voilà, c’est tout', 'essai'], ['Trilogie en 1 tome', 'fantasy'], ['L’Aventure d’un bilboquet', 'aventure'],
    ['Le Tricot de l’extrême', 'devperso'], ['Les Mystères du rond-point', 'polar'], ['Lettres à mon frigo', 'poesie'], ['La Planète des chaussons', 'sf'], ['Le Cœur en promo', 'romance']
  ].map(function (b) { return { t: b[0], g: b[1] }; });

  // ---------- concerts et festivals ----------
  D.DJS = ['DJ-Fox', 'DJ-Anticyclonique', 'DJ-Poil', 'DJ-Hématome', 'DJ-Chromosome', 'DJ-Okay', 'DJ-Satourne', 'DJ-JupiTerre', 'DJ-x3D', 'DJ-UWU', 'DJ-Artichaud', 'DJ-Bolognaise',
    'DJ-Brumisateur', 'DJ-Tartiflette', 'DJ-Cumulonimbus', 'DJ-Molécule', 'DJ-Pétanque', 'DJ-Gyrophare', 'DJ-Roquefort', 'DJ-Mammouth', 'DJ-Kiwi', 'DJ-Périphérique', 'DJ-Spaghetti', 'DJ-Néon', 'DJ-Pingouin', 'DJ-Clafoutis', 'DJ-Sismique', 'DJ-Cornichon',
    'DJ-Pastis', 'DJ-DJ', 'DJ-Phare', 'DJ-Chose', 'DJ-Y’apa', 'DJ-Wifi', 'DJ-Moustache', 'DJ-Escabeau', 'DJ-Brocante'];
  D.DJ_STYLES = ['techno', 'house', 'électro-swing', 'drum’n’bass', 'synthwave', 'hardstyle', 'lo-fi', 'disco', 'dubstep', 'trance', 'eurodance'];
  D.FESTS = ['Festival des Arbres', 'Festival du Soleil', 'Festival de la Lune', 'Festival Forestière', 'Festival Sauce Béchamel', 'Festival des Druides', 'Festival Voodoo', 'Festival Médiéval', 'Festival des Festivités', 'Festival du Coin de Table', 'Festival du Val',
    'Festival des Nuages', 'Festival de la Marée Basse', 'Festival du Rond-Point', 'Festival Crème Brûlée', 'Festival des Lucioles', 'Festival du Grand Bazar', 'Festival des Volcans', 'Festival Mille Bougies', 'Festival du Pont-Levis', 'Festival Choucroute Cosmique', 'Festival des Mouettes', 'Festival du Dernier Métro',
    'Festival des Sergents-Chefs', 'Festival des Ennemis', 'Festival dans le noir', 'Festival sans musique', 'Festival de la Raclette', 'Festival des 3 dents de lait',
    'Festival du Parking', 'Festival des Pantoufles', 'Festival de la Sieste', 'Festival des Voisins Bruyants'];
  D.FEST_STYLES = ['rock', 'électro', 'folk', 'métal', 'reggae', 'pop', 'rap', 'jazz', 'musiques du monde', 'chanson française'];

  // ---------- centres d'intérêt (2 au maximum) ----------
  // ag : petits traits des proches qui adorent ce sujet ; new : depuis quelle année ça existe ; young : les plus de 60 ans accrochent moins
  D.INTERESTS = [
    { id: 'weeb', n: 'Weeb', sub: 'la culture japonaise et des animés', sk: 'langues', ag: ['Geek', 'Bizarre'], new: 1990, young: 1, ok: 'Tu parles d’animés avec {x}. {X.il} te recommande une série de 1 200 épisodes. Rendez-vous dans six mois.', ko: 'Tu expliques à {x} pourquoi ton personnage préféré a « une vraie profondeur ». {X.il} décroche au deuxième flash-back.' },
    { id: 'otaku', n: 'Otaku', sub: 'les mangas et figurines', sk: 'art', ag: ['Geek', 'Timide'], new: 1985, young: 1, ok: 'Tu montres ta collection de figurines à {x}. {X.il} n’ose plus rien toucher, mais adore.', ko: '{X.n} demande pourquoi tes figurines ont « des yeux si grands ». Tu soupires très fort.' },
    { id: 'furry', n: 'Furry', sub: 'ton fursona', sk: 'art', ag: ['Bizarre', 'Gentil', 'Geek'], new: 1990, young: 1, ok: 'Tu présentes ton fursona à {x} : un renard violet nommé Paprika. {X.il} veut créer le sien.', ko: '{X.n} ne comprend pas trop ton costume de renard, mais te fait un câlin quand même.' },
    { id: 'airsoft', n: 'Airsoft', sub: 'l’airsoft', sk: 'sport', ag: ['Sportif', 'Fêtard'], new: 1985, ok: 'Tu racontes ta dernière partie d’airsoft à {x}, bruitages compris. {X.il} veut venir la prochaine fois.', ko: 'Tu décris ta stratégie d’airsoft à {x} pendant 40 minutes. {X.il} a fait une petite sieste.' },
    { id: 'auto', n: 'Féru d’auto', sub: 'les voitures', sk: 'bricolage', ag: ['Sportif', 'Râleur'], ok: 'Tu parles moteurs et jantes avec {x}. Vous imitez le bruit d’un V8 en même temps.', ko: 'Tu expliques une boîte de vitesses à {x}. {X.il} pensait qu’il n’y avait qu’une vitesse : « vite ».' },
    { id: 'kpop', n: 'K-Pop Stan', sub: 'ton groupe de K-pop préféré', sk: 'musique', ag: ['Fêtard', 'Bavard', 'Dramatique'], new: 2010, young: 1, ok: 'Tu fais découvrir ton groupe de K-pop à {x}. Une heure plus tard, vous apprenez la chorégraphie dans le salon.', ko: '{X.n} confond tous les membres de ton groupe préféré. Tu le prends comme une attaque personnelle.' },
    { id: 'streaming', n: 'Streaming', sub: 'tes streamers préférés', sk: 'info', ag: ['Geek', 'Bavard'], new: 2012, young: 1, ok: 'Tu racontes à {x} le dernier live légendaire de ton streamer préféré. Vous rejouez la scène du « rage quit ».', ko: '{X.n} ne comprend pas pourquoi tu regardes quelqu’un jouer au lieu de jouer toi-même. Débat philosophique.' },
    { id: 'retro', n: 'Jeux rétro', sub: 'les vieux jeux vidéo', sk: 'info', ag: ['Geek'], new: 1995, ok: 'Tu ressors une vieille console avec {x}. Vous soufflez dans les cartouches comme à l’ancienne.', ko: '{X.n} trouve que tes jeux rétro « piquent les yeux ». Sacrilège.' },
    { id: 'jdr', n: 'Jeux de rôle', sub: 'ta campagne de jeu de rôle', sk: 'eloquence', ag: ['Geek', 'Bizarre'], new: 1975, ok: 'Tu racontes ta campagne de jeu de rôle à {x}. {X.il} veut jouer un nain barde. Nouveau joueur recruté.', ko: 'Tu expliques les règles du jeu de rôle à {x}. Au troisième dé à 20 faces, {x.il} abandonne.' },
    { id: 'cosplay', n: 'Cosplay', sub: 'ton prochain cosplay', sk: 'art', ag: ['Geek', 'Dramatique'], new: 1990, young: 1, ok: 'Tu montres ton cosplay en cours à {x} : 80 heures de couture. {X.il} est bluffé{x.e}.', ko: '{X.n} demande si ton cosplay est « un déguisement de carnaval ». Tu restes digne.' },
    { id: 'astro', n: 'Astronomie', sub: 'les étoiles et les planètes', sk: 'sciences', ag: ['Zen', 'Sérieux'], ok: 'Soirée étoiles avec {x} : tu lui montres Saturne au télescope. {X.il} en reste bouche bée.', ko: 'Tu expliques les trous noirs à {x}. {X.il} commence à avoir le vertige existentiel.' },
    { id: 'jardin', n: 'Jardinage', sub: 'ton potager', sk: 'sciences', ag: ['Zen', 'Gourmand'], ok: 'Tu fais visiter ton potager à {x}. Vous repartez chacun avec une courgette géante.', ko: 'Tu parles de compost à {x} pendant le dîner. Mauvais timing.' },
    { id: 'rando', n: 'Randonnée', sub: 'tes randonnées', sk: 'sport', ag: ['Sportif', 'Zen'], ok: 'Tu racontes ta dernière randonnée à {x}, photos de cailloux à l’appui. {X.il} veut t’accompagner la prochaine fois.', ko: '{X.n} ne voit pas l’intérêt de marcher 20 km pour « voir une vue ».' },
    { id: 'skate', n: 'Skate', sub: 'le skate', sk: 'sport', ag: ['Sportif', 'Fêtard'], young: 1, ok: 'Tu montres ton nouveau trick de skate à {x}. Tu le réussis du premier coup, devant témoin. Rarissime.', ko: 'Tu montres ton nouveau trick à {x}. Tu tombes. {X.il} filme.' },
    { id: 'photo', n: 'Photographie', sub: 'la photographie', sk: 'art', ag: ['Snob', 'Zen'], ok: 'Tu montres tes plus belles photos à {x}. {X.il} veut que tu fasses son portrait.', ko: 'Tu montres 300 photos de feuilles mortes à {x}. À la 40e, {x.il} fait semblant de recevoir un appel.' },
    { id: 'mode', n: 'Mode', sub: 'la mode', c: 1, ag: ['Snob', 'Fêtard', 'Dramatique'], ok: 'Séance relooking improvisée avec {x}. Vous créez des tenues improbables avec les vieux vêtements du placard.', ko: '{X.n} porte des chaussettes avec des sandales pendant que tu lui parles de mode. Dialogue impossible.' },
    { id: 'peche', n: 'Pêche', sub: 'la pêche', ag: ['Zen', 'Râleur'], ok: 'Tu racontes ta plus belle prise à {x}. Le poisson grandit de 10 cm à chaque fois.', ko: 'Tu parles d’hameçons à {x} pendant une heure. {X.il} a mordu… à l’ennui.' },
    { id: 'echecs', n: 'Échecs', sub: 'les échecs', sk: 'logique', ag: ['Sérieux', 'Geek'], ok: 'Partie d’échecs avec {x}. Tu gagnes grâce à un roque spectaculaire. Vous rejouez la partie trois fois.', ko: '{X.n} déplace son cavalier en ligne droite. Tu n’as pas le courage de corriger.' },
    { id: 'truecrime', n: 'True crime', sub: 'les grandes affaires criminelles', ag: ['Complotiste', 'Bavard'], ok: 'Tu racontes une affaire non résolue à {x}. Vous échafaudez une théorie jusqu’à 2 h du matin.', ko: '{X.n} trouve un peu inquiétant que tu en saches autant sur les empoisonnements.' },
    { id: 'metal', n: 'Métal', sub: 'le métal', sk: 'musique', ag: ['Râleur', 'Fêtard'], ok: 'Tu fais écouter ton groupe de métal préféré à {x}. Vous headbanguez dans la cuisine.', ko: '{X.n} demande si le chanteur « va bien ». Tu soupires.' },
    { id: 'astrologie', n: 'Astrologie', sub: 'l’astrologie', ag: ['Dramatique', 'Bavard', 'Zen'], ok: 'Tu calcules le thème astral de {x}. Tout correspond. Ça vous trouble tous les deux.', ko: '{X.n} est Balance ascendant sceptique. La discussion tourne court.' },
    { id: 'ornitho', n: 'Ornithologie', sub: 'les oiseaux', sk: 'sciences', ag: ['Zen', 'Bizarre'], ok: 'Tu apprends à {x} à reconnaître le chant de la mésange. {X.il} siffle mieux que toi.', ko: 'Tu parles de pigeons à {x} pendant 30 minutes. {X.il} ne les regardera plus jamais pareil.' },
    { id: 'jds', n: 'Jeux de société', sub: 'les jeux de société', sk: 'logique', ag: ['Gentil', 'Bavard'], ok: 'Soirée jeux de société avec {x}. La partie dure cinq heures. L’amitié survit.', ko: 'Partie de jeu de société avec {x}. Vous vous disputez sur une règle, et la notice tranche contre toi.' },
    { id: 'medieval', n: 'Histoire médiévale', sub: 'le Moyen Âge', sk: 'langues', ag: ['Sérieux', 'Bizarre'], ok: 'Tu racontes la vie des chevaliers à {x}. Ça finit en duel à la baguette de pain.', ko: 'Tu expliques à {x} que non, au Moyen Âge, les gens ne vivaient pas « tous dans des châteaux ». Ambiance.' },
    { id: 'gothique', n: 'Gothique', sub: 'la culture gothique', sk: 'art', ag: ['Bizarre', 'Dramatique', 'Timide'], ok: 'Tu parles de culture gothique avec {x}. Vous écoutez de la musique sombre à la bougie. {X.il} adore l’ambiance.', ko: '{X.n} te demande si tu es triste parce que tu es tout en noir. Pour la 14e fois.' },
    { id: 'punk', n: 'Punk', sub: 'le punk', sk: 'musique', ag: ['Râleur', 'Fêtard'], ok: 'Tu fais écouter tes vinyles punk à {x}. Vous criez les refrains en sautant sur le canapé.', ko: '{X.n} trouve que le punk, « c’est juste du bruit avec des épingles à nourrice ».' },
    { id: 'sorcellerie', n: 'Sorcellerie', sub: 'la sorcellerie', ag: ['Bizarre', 'Zen', 'Complotiste'], ok: 'Tu montres ton grimoire à {x}. Vous préparez une potion porte-bonheur (une tisane menthe-citron).', ko: '{X.n} recule doucement quand tu sors ta collection de bougies et de cristaux.' },
    { id: 'voyance', n: 'Voyance', sub: 'la voyance', ag: ['Dramatique', 'Bavard', 'Complotiste'], ok: 'Tu tires les cartes à {x}. Tu lui prédis un grand voyage. {X.il} part le lendemain… au supermarché. Ça compte.', ko: '{X.n} te demande les numéros du loto. Les cartes restent muettes.' },
    { id: 'peinture', n: 'Peinture', sub: 'la peinture', sk: 'art', ag: ['Zen', 'Snob'], ok: 'Tu montres tes dernières toiles à {x}. {X.il} veut en accrocher une dans son salon.', ko: '{X.n} tient ton tableau à l’envers et le trouve « intéressant ».' },
    { id: 'cirque', n: 'Cirque', sub: 'le cirque', sk: 'sport', ag: ['Fêtard', 'Sportif', 'Drôle'], ok: 'Tu apprends à {x} à jongler avec trois oranges. Au bout d’une heure, vous en tenez deux.', ko: 'Tu fais une démonstration de monocycle devant {x}. Le salon s’en souviendra.' },
    { id: 'danse', n: 'Danse', sub: 'la danse', sk: 'sport', ag: ['Fêtard', 'Sportif', 'Dramatique'], ok: 'Cours de danse improvisé avec {x} dans la cuisine. Vous inventez une chorégraphie avec des louches.', ko: '{X.n} danse comme un frigo qu’on déménage. Tu n’oses rien dire.' },
    { id: 'origami', n: 'Origami', sub: 'l’origami', sk: 'art', ag: ['Zen', 'Timide', 'Sérieux'], ok: 'Tu apprends à {x} à plier une grue en papier. La sienne ressemble à un pigeon, mais vous êtes fiers.', ko: '{X.n} utilise ta grue en papier pour noter sa liste de courses.' },
    { id: 'rap', n: 'Rap', sub: 'le rap', sk: 'eloquence', ag: ['Fêtard', 'Bavard', 'Râleur'], new: 1985, young: 1, ok: 'Tu rappes ton dernier couplet à {x}. {X.il} fait le beatbox. Le duo de l’année est né.', ko: '{X.n} pense que ta rime avec « baguette » est « un peu facile ».' },
    { id: 'lego', n: 'Lego',
 sub: 'tes constructions Lego', sk: 'bricolage', ag: ['Geek', 'Gentil'], ok: 'Tu montres ta ville en Lego de 8 000 pièces à {x}. {X.il} veut construire un quartier.', ko: '{X.n} marche pieds nus sur un Lego pendant que tu lui parles. Le sujet est clos.' }
  ];
  D.interest = function (id) { return D.INTERESTS.find(function (x) { return x.id === id; }); };

  // ---------- découverte d'un centre d'intérêt (chaque événement peut arriver 2 fois par vie) ----------
  // a : âge minimum ; t : ce qui arrive ; q : la question posée au joueur
  D.INT_EV = {
    weeb: { a: 9, t: 'Un soir, {prenom} tombe sur le premier épisode d’un animé japonais. Douze épisodes plus tard, il fait jour.', q: 'Est-ce que {prenom} plonge dans la culture japonaise et les animés ?' },
    otaku: { a: 10, t: 'Dans une boutique, {prenom} reste bloqué{e} une heure devant une vitrine de figurines et de mangas. Le vendeur finit par lui apporter une chaise.', q: 'Est-ce que {prenom} devient otaku ?' },
    furry: { a: 12, t: 'Lors d’une convention, {prenom} croise une foule de gens en costumes d’animaux géants, tous plus gentils les uns que les autres. Un renard bleu lui offre un câlin.', q: 'Est-ce que {prenom} se crée un fursona et rejoint la communauté furry ?' },
    airsoft: { a: 12, t: 'Un copain emmène {prenom} à une partie d’airsoft dans une forêt. Billes en plastique, stratégie, cris de guerre : {prenom} adore chaque seconde.', q: 'Est-ce que {prenom} se met à l’airsoft ?' },
    auto: { a: 8, t: 'Une voiture de collection passe dans la rue en vrombissant. {prenom} reste [planté|plantée] sur le trottoir, le cœur à 6 000 tours par minute.', q: 'Est-ce que {prenom} devient [un passionné|une passionnée] d’automobiles ?' },
    kpop: { a: 10, t: 'Une vidéo de K-pop passe à la télé : chorégraphie parfaite, refrains imparables. {prenom} la regarde 40 fois de suite.', q: 'Est-ce que {prenom} devient fan de K-pop ?' },
    streaming: { a: 10, t: '{prenom} découvre un streamer qui joue en direct devant 20 000 personnes en parlant à son chat. Tu ne décroches plus de l’écran.', q: 'Est-ce que {prenom} se passionne pour le streaming ?' },
    retro: { a: 8, t: 'Au grenier de {Gp.n}, {prenom} trouve une vieille console poussiéreuse. Elle marche encore. Les pixels, c’est magique.', q: 'Est-ce que {prenom} se lance dans les jeux rétro ?', need: 'gp' },
    jdr: { a: 11, t: 'Un camarade invite {prenom} à une partie de jeu de rôle. Tu joues un nain barde. Ton personnage meurt dans un puits, et tu n’as jamais autant ri.', q: 'Est-ce que {prenom} devient [rôliste|rôliste] ?' },
    cosplay: { a: 10, t: 'Lors d’une convention japonaise, {prenom} voit des gens porter des tenues incroyablement fidèles de héros et d’héroïnes d’animés. {prenom} tombe [follement amoureux|follement amoureuse] de cette sous-culture !', q: 'Est-ce que {prenom} développe un intérêt pour le cosplay ?' },
    astro: { a: 7, t: 'Nuit d’été à la campagne : {prenom} voit pour la première fois la Voie lactée. Tu as l’impression d’être minuscule, et c’est merveilleux.', q: 'Est-ce que {prenom} se passionne pour l’astronomie ?' },
    jardin: { a: 7, t: '{prenom} plante une graine de tomate dans un pot de yaourt. Trois semaines plus tard, une tomate. Tu te sens [tout-puissant|toute-puissante].', q: 'Est-ce que {prenom} attrape le virus du jardinage ?' },
    rando: { a: 8, t: 'Randonnée en montagne avec la famille : {prenom} râle les deux premières heures, puis découvre la vue au sommet. Silence total.', q: 'Est-ce que {prenom} devient [un fou|une folle] de randonnée ?' },
    skate: { a: 9, t: 'Au skatepark, une bande de jeunes enchaîne les figures. L’un d’eux prête sa planche à {prenom}. Chute, rire, recommence.', q: 'Est-ce que {prenom} se met au skate ?' },
    photo: { a: 10, t: '{prenom} trouve un vieil appareil photo argentique dans une brocante. La première pellicule est floue. Elle est parfaite.', q: 'Est-ce que {prenom} se passionne pour la photographie ?' },
    mode: { a: 11, t: 'En feuilletant un magazine, {prenom} découvre un défilé complètement fou : manteaux en papier bulle, chapeaux en forme de nuage. Révélation.', q: 'Est-ce que {prenom} s’intéresse à la mode ?' },
    peche: { a: 7, t: '{Par} emmène {prenom} pêcher au lever du soleil. Brume, silence, une truite. Tu comprends enfin pourquoi les gens se lèvent à 5 h.', q: 'Est-ce que {prenom} devient [un pêcheur|une pêcheuse] [passionné|passionnée] ?', need: 'par' },
    echecs: { a: 7, t: 'Dans un parc, un vieux monsieur bat {prenom} aux échecs en 4 coups. Puis t’explique comment. Tu veux ta revanche.', q: 'Est-ce que {prenom} se met sérieusement aux échecs ?' },
    truecrime: { a: 13, t: '{prenom} écoute un podcast sur une affaire criminelle jamais résolue. À 3 h du matin, tu as un tableau rempli de fils rouges dans ta chambre.', q: 'Est-ce que {prenom} devient [accro|accro] au true crime ?' },
    metal: { a: 11, t: 'Premier concert de métal : {prenom} se retrouve au milieu d’une foule qui saute, crie, et s’aide à se relever. Que du respect.', q: 'Est-ce que {prenom} devient [un métalleux|une métalleuse] ?' },
    astrologie: { a: 11, t: 'Un horoscope décrit la semaine de {prenom} avec une précision troublante. Coïncidence ? Tu achètes un livre sur les signes.', q: 'Est-ce que {prenom} se passionne pour l’astrologie ?' },
    ornitho: { a: 8, t: 'Une mésange se pose sur la fenêtre de {prenom} tous les matins à 7 h 12. Pile. Tu commences à noter ses horaires.', q: 'Est-ce que {prenom} devient [ornithologue amateur|ornithologue amatrice] ?' },
    jds: { a: 6, t: 'Soirée jeux de société en famille : {prenom} gagne une partie de stratégie contre tous les adultes. Tu en parles pendant une semaine.', q: 'Est-ce que {prenom} devient fan de jeux de société ?' },
    medieval: { a: 8, t: 'Visite d’un château fort : remparts, catapulte, banquet costumé. {prenom} refuse de repartir sans une épée en bois.', q: 'Est-ce que {prenom} se passionne pour le Moyen Âge ?' },
    lego: { a: 6, t: '{prenom} reçoit une boîte de briques de construction. Une semaine plus tard, ta chambre est une ville de 400 habitants.', q: 'Est-ce que {prenom} se lance dans les Lego ?' },
    gothique: { a: 12, t: '{prenom} découvre un groupe gothique en écoutant la radio la nuit. Velours noir, chandelles, poésie mélancolique : tout te parle.', q: 'Est-ce que {prenom} embrasse la culture gothique ?' },
    punk: { a: 12, t: 'Un concert punk improvisé dans une cave : trois accords, beaucoup d’énergie, zéro règle. {prenom} ressort avec une épingle à nourrice à l’oreille.', q: 'Est-ce que {prenom} devient punk ?' },
    sorcellerie: { a: 10, t: 'Dans une brocante, {prenom} trouve un vieux grimoire rempli de recettes de potions et de rituels de pleine lune. La couverture est tiède.', q: 'Est-ce que {prenom} s’initie à la sorcellerie ?' },
    voyance: { a: 12, t: 'Une voyante de fête foraine prédit à {prenom} trois choses. Deux se réalisent dans la semaine. La troisième parlait d’un pigeon.', q: 'Est-ce que {prenom} s’intéresse à la voyance ?' },
    peinture: { a: 6, t: '{prenom} renverse un pot de peinture sur une feuille. Le résultat est si beau que {Par.n} l’encadre dans le salon.', q: 'Est-ce que {prenom} se met à la peinture ?', need: 'par' },
    cirque: { a: 6, t: 'Sous un chapiteau, {prenom} voit des acrobates voler, un jongleur à 7 balles et un clown triste. Tu rentres en essayant de faire la roue.', q: 'Est-ce que {prenom} se passionne pour le cirque ?' },
    danse: { a: 6, t: 'À un mariage, {prenom} danse toute la nuit. Les adultes forment un cercle autour de toi. Tu es né{e} pour ça.', q: 'Est-ce que {prenom} se met à la danse ?' },
    origami: { a: 7, t: 'Un livre sur l’origami traîne à la bibliothèque. Une feuille, trente plis, une grue. {prenom} n’en revient pas.', q: 'Est-ce que {prenom} se lance dans l’origami ?' },
    rap: { a: 11, t: '{prenom} écrit un couplet sur son goûter et le rappe dans la cour de récré. Un attroupement se forme. Le goûter devient légendaire.', q: 'Est-ce que {prenom} se met au rap ?' }
  };


  // ---------- éducation de tes enfants ----------
  D.EDU_STYLES = [
    { id: 'douce', n: 'Bienveillante', d: 'Écoute, câlins, règles expliquées.', tr: { bienveillant: 1.5, calme: 1 }, sk: { eloquence: 0.8 }, rq: 1 },
    { id: 'stricte', n: 'Stricte', d: 'Devoirs, horaires, discipline.', tr: { discipline: 1.6, ambitieux: 0.6 }, sk: { logique: 1, langues: 1 }, rq: -1, g: 0.6 },
    { id: 'cool', n: 'Cool', d: 'Liberté totale, très peu de règles.', tr: { nonchalant: 1.4, rebelle: 1, creatif: 0.5 }, sk: {}, rq: 1.5, g: -0.4 },
    { id: 'creative', n: 'Créative', d: 'Musique, dessin, imagination.', tr: { creatif: 1.6, curieux: 0.6 }, sk: { art: 1.4, musique: 1.4 }, rq: 0.5 },
    { id: 'sportive', n: 'Sportive', d: 'Sport tous les week-ends.', tr: { discipline: 0.8, charismatique: 0.6 }, sk: { sport: 2 }, rq: 0.5 },
    { id: 'studieuse', n: 'Studieuse', d: 'Livres, musées, questions.', tr: { curieux: 1.6, ambitieux: 0.6 }, sk: { sciences: 1.2, langues: 1 }, rq: 0, g: 0.4 }
  ];
  D.eduStyle = function (id) { return D.EDU_STYLES.find(function (x) { return x.id === id; }) || D.EDU_STYLES[0]; };

  // ---------- justice : délits, peines, interrogatoires ----------
  // y : peine de base en années de prison (0 = amende) ; fine : amende de base ; grave : passe toujours devant un juge
  D.CRIMES = {
    vol: { n: 'vol à l’étalage', y: 0, fine: 400 },
    graffiti: { n: 'dégradation (graffiti)', y: 0, fine: 600 },
    bagarre: { n: 'rixe sur la voie publique', y: 0.6, fine: 900 },
    violence: { n: 'violences volontaires', y: 1, fine: 1500 },
    arme: { n: 'détention illégale d’arme à feu', y: 1.5, fine: 3000, grave: 1 },
    tentative: { n: 'tentative de meurtre', y: 9, grave: 1 },
    meurtre: { n: 'meurtre', y: 20, grave: 1 },
    commandite: { n: 'assassinat commandité', y: 24, grave: 1 }
  };
  const isT = function (t) { return L.G.is(t); };
  // chaque réponse : d = effet sur la peine (négatif = mieux), r = réaction, aveu = reconnaît les faits
  D.INTERRO = {
    meurtre: [
      { q: 'Où étiez-vous la nuit de la mort de {y.n} ?', a: [
        { l: '« Chez moi, devant un documentaire sur les loutres. »', d: function () { return isT('menteur') ? -0.3 : 0.15; }, r: 'L’enquêteur note ton alibi… et cherche quelle chaîne diffusait des loutres ce soir-là.' },
        { l: '« Je ne dirai rien sans mon avocat. »', d: -0.1, r: 'Silence total. L’enquêteur fixe le plafond avec toi pendant une heure.' },
        { l: '« D’accord… c’était moi. »', d: function () { return isT('honnete') ? -0.3 : -0.15; }, aveu: 1, r: 'Tes aveux sont signés. Ta franchise sera prise en compte par le juge.' }] },
      { q: 'Pourquoi en vouliez-vous à {y.n} ?', a: [
        { l: '« {Y:Il|Elle} m’avait volé ma dernière part de pizza en 2009. »', d: 0.4, r: 'L’enquêteur écrit « mobile : pizza » et le souligne deux fois.' },
        { l: '« Je ne lui en voulais pas du tout ! »', d: function () { return isT('menteur') ? -0.2 : 0.2; }, r: 'L’enquêteur sort un carnet rempli de tes messages pas très gentils. Il hausse un sourcil.' },
        { l: '« C’est compliqué… »', d: 0, r: 'L’enquêteur adore les histoires compliquées. Il a toute la nuit.' }] },
      { q: 'Comment expliquez-vous vos empreintes sur les lieux ?', a: [
        { l: '« Je touche beaucoup de choses. C’est un trait de caractère. »', d: 0.25, r: 'L’enquêteur ne rit pas. Le stylo, lui, tremble un peu.' },
        { l: '« Quelqu’un a dû me piéger ! »', d: function () { return isT('colerique') ? 0.4 : 0.15; }, r: 'Tu tapes du poing sur la table. Ça ne t’aide pas.' },
        { l: '« Pas de commentaire. »', d: -0.05, r: 'L’enquêteur coche une case. Tu ne sauras jamais laquelle.' }] },
      { q: 'Avez-vous des remords ?', a: [
        { l: '« Oui. Je pense à {y.n} toutes les nuits. »', d: -0.3, r: 'Un long silence. L’enquêteur referme doucement son dossier.' },
        { l: '« Des remords ? Je ne connais pas ce mot. »', d: 0.5, r: 'L’enquêteur te tend un dictionnaire. Puis il appelle le juge.' },
        { l: '« Je regrette surtout de m’être fait prendre. »', d: 0.35, r: 'Honnête. Mais très mal vu.' }] }
    ],
    commandite: [
      { q: 'Connaissez-vous un certain « Le Fantôme » ?', a: [
        { l: '« Jamais entendu parler. »', d: function () { return isT('menteur') ? -0.2 : 0.2; }, r: 'L’enquêteur pose sur la table une photo de vous deux en train de manger une crêpe.' },
        { l: '« C’est un cousin. On joue à la pétanque. »', d: 0.3, r: '« À la pétanque. » L’enquêteur répète la phrase très lentement.' },
        { l: '« Il m’a coûté 15 600 €, alors oui. »', d: -0.1, aveu: 1, r: 'La franchise désarçonne l’enquêteur. Les aveux sont enregistrés.' }] },
      { q: 'À quoi correspond ce virement de 15 600 € ?', a: [
        { l: '« Des cours de piano. Très intensifs. »', d: function () { return isT('menteur') ? -0.15 : 0.25; }, r: 'L’enquêteur te demande de jouer quelque chose. Il n’y a pas de piano.' },
        { l: '« Un cadeau d’anniversaire. »', d: 0.2, r: '« Joyeux anniversaire », répond l’enquêteur, glacial.' },
        { l: '« Je préfère me taire. »', d: -0.05, r: 'C’est ton droit. L’enquêteur le note.' }] },
      { q: 'Le tueur vous a dénoncé. Une réaction ?', a: [
        { l: '« Ce traître ! »', d: 0.4, aveu: 1, r: 'Tu viens d’avouer. L’enquêteur sourit pour la première fois de la journée.' },
        { l: '« Je ne vois pas de qui vous parlez. »', d: 0, r: 'L’enquêteur soupire et commande un café.' },
        { l: '« Je coopère : voici tout ce que je sais. »', d: -0.35, aveu: 1, r: 'Ta coopération est notée noir sur blanc. Ça comptera.' }] },
      { q: 'Que ressentez-vous en apprenant la mort de {y.n} ?', a: [
        { l: '« Une immense tristesse. »', d: function () { return isT('menteur') ? -0.1 : 0.1; }, r: 'Tes yeux restent secs. L’enquêteur le remarque.' },
        { l: '« Du soulagement, je l’avoue. »', d: 0.35, r: 'L’enquêteur écrit vite, très vite.' },
        { l: '« Je ne réalise pas encore. »', d: 0, r: 'L’enquêteur hoche la tête, neutre.' }] }
    ],
    tentative: [
      { q: 'Vous avez agressé {y.n}. Pourquoi ?', a: [
        { l: '« J’ai perdu le contrôle. Je le regrette. »', d: -0.25, aveu: 1, r: 'L’enquêteur note « regrets sincères ».' },
        { l: '« {Y:Il|Elle} l’avait cherché. »', d: 0.4, r: 'Mauvaise réponse. Vraiment mauvaise.' },
        { l: '« Agressé ? Je lui ai juste fait peur. »', d: 0.15, r: 'L’enquêteur montre le certificat médical. Long silence.' }] },
      { q: 'Aviez-vous prémédité votre geste ?', a: [
        { l: '« Non, c’est arrivé d’un coup. »', d: -0.1, r: 'L’enquêteur semble te croire. À moitié.' },
        { l: '« J’avais un plan en 12 étapes. »', d: 0.5, r: 'L’enquêteur te demande de détailler les 12 étapes. Tu n’aurais pas dû.' },
        { l: '« Je refuse de répondre. »', d: 0.05, r: 'Noté.' }] },
      { q: 'Accepteriez-vous un suivi psychologique ?', a: [
        { l: '« Oui, j’en ai besoin. »', d: -0.25, r: 'Le juge appréciera.' },
        { l: '« C’est vous qui en avez besoin. »', d: 0.35, r: 'L’enquêteur ne trouve pas ça drôle.' },
        { l: '« Seulement s’il y a des croissants. »', d: 0, r: 'L’enquêteur, malgré lui, note « croissants ».' }] }
    ],
    violence: [
      { q: 'Pourquoi avez-vous frappé {y.n} ?', a: [
        { l: '« {Y:Il|Elle} m’a provoqué{e}. »', d: 0.1, r: 'L’enquêteur demande comment. Tu ne t’en souviens plus.' },
        { l: '« Je ne sais pas ce qui m’a pris. Je regrette. »', d: -0.25, aveu: 1, r: 'L’enquêteur note « remords ». C’est bon signe.' },
        { l: '« {Y:Il|Elle} l’avait bien cherché. »', d: 0.4, r: 'L’enquêteur referme son stylo d’un geste sec.' }] },
      { q: 'Êtes-vous souvent en colère ?', a: [
        { l: '« JAMAIS ! »', d: function () { return isT('colerique') ? 0.4 : 0.1; }, r: 'Tu l’as crié si fort que la vitre a tremblé.' },
        { l: '« Je fais de la méditation. »', d: function () { return isT('calme') ? -0.25 : 0.05; }, r: 'L’enquêteur te demande une démonstration. Tu fermes les yeux. Ça a l’air de marcher.' },
        { l: '« Seulement le lundi. »', d: 0.1, r: 'Nous sommes lundi. L’enquêteur recule sa chaise.' }] },
      { q: 'Accepteriez-vous un stage de gestion de la colère ?', a: [
        { l: '« Oui, avec plaisir. »', d: -0.25, r: 'Le juge en tiendra compte.' },
        { l: '« Seulement s’il y a des croissants. »', d: 0, r: 'Il y aura des croissants. Ils sont durs.' },
        { l: '« C’est vous qui avez besoin d’un stage. »', d: 0.4, r: 'L’enquêteur respire profondément. Il a fait le stage, lui.' }] }
    ],
    bagarre: [
      { q: 'Qui a commencé la bagarre ?', a: [
        { l: '« {Y:Lui|Elle} ! »', d: 0, r: '« C’est ce qu’{y:il|elle} dit aussi », répond l’enquêteur.' },
        { l: '« Moi, mais c’était un malentendu. »', d: -0.15, aveu: 1, r: 'L’enquêteur apprécie ta franchise.' },
        { l: '« On s’en fiche, j’ai gagné. »', d: 0.35, r: 'Ce n’était pas la question.' }] },
      { q: 'Aviez-vous bu ?', a: [
        { l: '« Juste un jus de pomme. »', d: -0.05, r: 'L’éthylotest confirme. Jus de pomme.' },
        { l: '« Un peu. Beaucoup. Passionnément. »', d: 0.2, r: 'L’enquêteur ne rit pas, mais il a failli.' },
        { l: '« Je refuse de répondre. »', d: 0.1, r: 'Ça ressemble à un oui.' }] },
      { q: 'Que voulez-vous dire à {y.n} ?', a: [
        { l: '« Pardon. Sincèrement. »', d: -0.25, r: 'L’enquêteur transmettra.' },
        { l: '« Revanche quand tu veux. »', d: 0.45, r: 'L’enquêteur transmettra aussi. Au juge.' },
        { l: '« Rien. »', d: 0.1, r: 'Noté : « rien ».' }] }
    ],
    arme: [
      { q: 'D’où vient cette arme ?', a: [
        { l: '« Je l’ai trouvée. »', d: 0.2, r: '« Dans un parking, avec une notice ? » L’enquêteur n’y croit pas.' },
        { l: '« D’un type louche sur un parking. »', d: function () { return isT('honnete') ? -0.15 : 0; }, aveu: 1, r: 'L’enquêteur prend des notes sur le type louche.' },
        { l: '« C’est un pistolet à eau très réaliste. »', d: 0.3, r: 'L’expert balistique n’est pas d’accord.' }] },
      { q: 'Pourquoi aviez-vous une arme ?', a: [
        { l: '« Pour me défendre. »', d: -0.05, r: 'L’enquêteur te parle longuement de la police.' },
        { l: '« Pour impressionner. »', d: 0.2, r: 'Tu impressionnes surtout le procureur.' },
        { l: '« Pour la chasse aux moustiques. »', d: 0.3, r: 'L’enquêteur écrase un moustique avec son dossier. « Comme ça. »' }] },
      { q: 'En avez-vous d’autres ?', a: [
        { l: '« Non, juré. »', d: 0, r: 'La perquisition le confirme.' },
        { l: '« Juste un lance-pierre. »', d: -0.05, r: 'Le lance-pierre est saisi aussi. Par principe.' },
        { l: '« Ça dépend de ce que vous appelez une arme. »', d: 0.35, r: 'Mauvaise réponse.' }] }
    ],
    vol: [
      { q: 'Pourquoi avoir volé ?', a: [
        { l: '« J’avais faim. »', d: -0.15, r: 'L’enquêteur note « circonstances atténuantes ».' },
        { l: '« Pour le frisson. »', d: 0.25, r: 'Le frisson te coûtera cher.' },
        { l: '« Quel vol ? »', d: function () { return isT('menteur') ? -0.15 : 0.3; }, r: 'L’enquêteur lance la vidéo de surveillance.' }] },
      { q: 'Comptez-vous recommencer ?', a: [
        { l: '« Jamais. »', d: -0.15, r: 'L’enquêteur veut bien te croire. Une dernière fois.' },
        { l: '« Peut-être pendant les soldes. »', d: 0.2, r: 'L’enquêteur souligne « soldes ».' },
        { l: '« On verra. »', d: 0.15, r: 'Ça ne rassure personne.' }] },
      { q: 'Pouvez-vous rembourser le magasin ?', a: [
        { l: '« Oui, tout de suite. »', d: -0.2, r: 'Le magasin accepte. Le juge aussi, presque.' },
        { l: '« Avec quel argent ? »', d: 0.1, r: 'Question légitime. Pas la bonne.' },
        { l: '« Je vous fais un chèque… en chocolat. »', d: 0.25, r: 'Le chèque fond sur le bureau.' }] }
    ],
    graffiti: [
      { q: 'Que représente ce graffiti ?', a: [
        { l: '« Un message d’amour pour la ville. »', d: -0.1, r: 'L’enquêteur trouve ça presque beau.' },
        { l: '« Le visage du maire en pigeon. »', d: 0.3, r: 'Le maire porte plainte. Le pigeon aussi.' },
        { l: '« C’est de l’art, vous ne pouvez pas comprendre. »', d: 0.15, r: 'L’enquêteur a un diplôme d’histoire de l’art. Ambiance.' }] },
      { q: 'Allez-vous nettoyer le mur ?', a: [
        { l: '« Oui, à la brosse à dents s’il le faut. »', d: -0.25, r: 'Il le faudra.' },
        { l: '« Il est plus beau comme ça. »', d: 0.25, r: 'Le propriétaire du mur n’est pas d’accord.' },
        { l: '« Je le repeindrai en mieux. »', d: 0.1, r: 'Ce n’est pas ce qu’on te demande.' }] }
    ]
  };
  D.JUGES = ['Martine Ferrand', 'Gérard Vasseur', 'Sylvie Moreau-Dulac', 'Jean-Paul Brochard', 'Nadia Belkacem', 'Hervé Pochon', 'Catherine Lemoine', 'Bernard Tissot'];

})(window.LP);
