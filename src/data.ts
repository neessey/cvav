/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Member, MemberGrade, NewsArticle, ParishEvent, GalleryItem, Activity } from "./types";

export const OFFICIAL_PRAYER = `Seigneur Jésus, qui aime tant les CV-AV,
bénis tous nos frères et sœurs d’Afrique et du monde entier.
Donne-nous la grâce d’avoir toujours le sourire
et de n’avoir jamais peur de faire un sacrifice.
Apprends-nous à faire de notre vie, quelque chose de beau avec les autres.
Donne-nous le courage de ne jamais rien te refuser
Et de faire ta volonté.
Aide-nous à faire le bonheur de tous ceux qui nous entourent
Et à passer notre vie à aimer les autres.
Sainte Vierge Marie, douce maman des CV-AV,
Garde notre cœur bien pur
Et fidèle à Jésus, ton Fils.

Amen.`;

export const OFFICIAL_HYMN = {
  title: "Notre Hymne CV-AV",
  stanzas: [
    {
      number: 1,
      lines: [
        "Debout l'avenir nous appelle,",
        "Nous ferons fleurir la paix.",
        "Nous sommes la sève nouvelle,",
        "Dans un monde qui renaît."
      ]
    },
    {
      number: 2,
      lines: [
        "Marchons sans faiblir sur la route,",
        "Du devoir qui nous attend.",
        "Portons à nos frères qui doutent",
        "L'espérance du printemps."
      ]
    },
    {
      number: 3,
      lines: [
        "Demain notre joie sur le monde",
        "Brillera comme un matin.",
        "Les peuples feront une ronde,",
        "En chantant avec entrain."
      ]
    }
  ],
  chorus: [
    "Tous unis c'est notre devise,",
    "Dans les beaux jours ou dans la nuit,",
    "Pas de haine qui paralyse,",
    "Unis toujours, amis."
  ]
};

export const OFFICIAL_CHANTS = [
  {
    title: "Chant des Cœurs Vaillants (Garçons)",
    lyrics: `Ohé les gars, chantons en chœur !
C'est nous les petits gars d'Afrique;
Ecoutez nos joyeuses chansons!
L'avenir sera magnifique,
Car nous sommes les Coeurs Vaillants!`
  },
  {
    title: "Chant des Âmes Vaillantes (Filles)",
    lyrics: `Ohé les gos, chantons en chœur !
C'est nous les petites dames d'Afrique;
Ecoutez nos joyeuses chansons!
L'avenir sera magnifique,
Car nous sommes les Âmes Vaillantes!`
  }
];

export const OFFICIAL_COUTUMES = [
  { question: "Notre loi ?", answer: "C'est de nous aimer les uns les autres comme le CHRIST nous a aimé." },
  { question: "Notre signe ?", answer: "C'est le signe de la croix au nom du Père, du Fils et du Saint Esprit." },
  { question: "Notre salut ?", answer: "Tous unis ; Tous frère." },
  { question: "Notre devise ?", answer: "A Cœur Vaillant... rien d'impossible, joie, vaillance, charité." },
  { question: "Les choses dures ?", answer: "Ça nous plaît !" },
  { question: "Le sourire ?", answer: "Toujours !" },
  { question: "Qui sommes-nous ?", answer: "Des enfants de Dieu." },
  { question: "Que faisons-nous ensemble ?", answer: "Nous bâtissons un monde où l’on s’aime." },
  { question: "Qui est notre chef ?", answer: "Le CHRIST." }
];

export const OFFICIAL_PRINCIPLES = [
  "Le CV-AV a toujours le sourire",
  "Le CV-AV est propre et soigneux",
  "Le CV-AV obéit vite et bien",
  "Le CV-AV est aimable et poli",
  "Le CV-AV est ardent au travail comme au jeu",
  "Le CV-AV met sa joie à rendre service",
  "Le CV-AV n’a pas peur de faire un sacrifice",
  "Le CV-AV a le regard franc et le cœur pur",
  "Le CV-AV fait bien tout ce qu’il fait",
  "Le CV-AV agit en chrétien partout et toujours."
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: "CVAV-72049",
    nom: "KOUASSI",
    prenoms: "Jean-Eudes Kouamé",
    genre: "Garçon",
    dateNaissance: "2015-04-12",
    lieuNaissance: "Abidjan, Cocody",
    lieuHabitation: "Angré 8ème Tranche, Cité CNPS",
    anneeCatechese: "2ème Année Communion",
    baptise: true,
    confirme: false,
    maladieParticuliere: "Aucune",
    groupeSanguin: "O+",
    allergie: "Poussière",
    
    parentType: "Père",
    parentNom: "KOUASSI",
    parentPrenoms: "Augustin Koffi",
    parentHabitation: "Angré 8ème Tranche, Cité CNPS",
    parentProfession: "Ingénieur Informaticien",
    parentTelephone: "+225 07 48 92 10 32",
    parentWhatsApp: "+225 07 48 92 10 32",
    
    dateAdhesion: "2023-10-05",
    grade: MemberGrade.CADET,
    anneeAdhesion: "2023",
    section: "Saint Jean-Paul II",
    doyenne: "Mgr Blaise Anoh",
    numeroUrgence: "+225 05 66 12 40 55",
    status: "Actif",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    
    absences: [
      { id: "abs-1", date: "2026-02-14", reason: "Fête de famille hors d'Abidjan", signedParent: true, signedRespo: true }
    ],
    sanctions: [],
    presences: {
      "JAN": [true, true, false, true, true],
      "FEV": [true, false, true, true],
      "MARS": [true, true, true, true],
      "AVRIL": [true, true, false, true],
      "MAI": [true, true, true, true, true],
      "JUIN": [true, true, true, false]
    },
    evolution: [
      { grade: MemberGrade.BENJAMIN, annee: "2023", formateur: "A.C. Marc-Aurèle", note: "Très bon esprit de participation" },
      { grade: MemberGrade.CADET, annee: "2025", formateur: "A.P. Dominique", note: "Passage mérité, enfant enthousiaste" }
    ]
  },
  {
    id: "CVAV-41804",
    nom: "YAO",
    prenoms: "Marie-Grace Emmanuelle",
    genre: "Fille",
    dateNaissance: "2017-08-30",
    lieuNaissance: "Abidjan, Bingerville",
    lieuHabitation: "Angré 8ème Tranche, près de la Paroisse",
    anneeCatechese: "1ère Année Communion",
    baptise: true,
    confirme: false,
    maladieParticuliere: "Asthme léger",
    groupeSanguin: "A+",
    allergie: "Arachides",
    
    parentType: "Mère",
    parentNom: "YAO",
    parentPrenoms: "Véronique Amenan",
    parentHabitation: "Angré 8ème Tranche, près de la Paroisse",
    parentProfession: "Commerçante de pagnes",
    parentTelephone: "+225 05 54 39 12 00",
    parentWhatsApp: "+225 05 54 39 12 00",
    
    dateAdhesion: "2024-09-15",
    grade: MemberGrade.BENJAMIN,
    anneeAdhesion: "2024",
    section: "Saint Jean-Paul II",
    doyenne: "Mgr Blaise Anoh",
    numeroUrgence: "+225 01 02 03 04 05",
    status: "Actif",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    
    absences: [],
    sanctions: [],
    presences: {
      "JAN": [true, true, true, true, true],
      "FEV": [true, true, true, true],
      "MARS": [true, true, true, true],
      "AVRIL": [true, true, true, true],
      "MAI": [true, true, true, true, true],
      "JUIN": [true, true, true, true]
    },
    evolution: [
      { grade: MemberGrade.BENJAMIN, annee: "2024", formateur: "A.A. Sandrine", note: "Une âme vaillante joyeuse et motivée" }
    ]
  },
  {
    id: "CVAV-93215",
    nom: "KOFFI",
    prenoms: "Cyrille N'guessan",
    genre: "Garçon",
    dateNaissance: "2013-11-20",
    lieuNaissance: "Yamoussoukro",
    lieuHabitation: "Angré Star 11",
    anneeCatechese: "Profession de foi",
    baptise: true,
    confirme: true,
    maladieParticuliere: "Aucune",
    groupeSanguin: "B-",
    allergie: "Pénicilline",
    
    parentType: "Tuteur/Tutrice",
    parentNom: "N'GUESSAN",
    parentPrenoms: "Clarisse Yao",
    parentHabitation: "Angré Star 11",
    parentProfession: "Institutrice",
    parentTelephone: "+225 07 09 88 11 22",
    parentWhatsApp: "+225 07 09 88 11 22",
    
    dateAdhesion: "2022-10-10",
    grade: MemberGrade.AINE,
    anneeAdhesion: "2022",
    section: "Saint Jean-Paul II",
    doyenne: "Mgr Blaise Anoh",
    numeroUrgence: "+225 07 09 88 11 22",
    status: "Actif",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    
    absences: [
      { id: "abs-2", date: "2026-03-28", reason: "Préparation examen blanc", signedParent: true, signedRespo: true }
    ],
    sanctions: [
      { id: "sanc-1", date: "2026-05-16", reason: "Retard répété aux réunions", penalty: "Nettoyage de la salle de réunion", signedRespo: true }
    ],
    presences: {
      "JAN": [true, true, true, false, true],
      "FEV": [true, true, true, true],
      "MARS": [true, true, true, false],
      "AVRIL": [true, true, true, true],
      "MAI": [true, true, false, true, true],
      "JUIN": [true, true, true, true]
    },
    evolution: [
      { grade: MemberGrade.BENJAMIN, annee: "2022", formateur: "A.C. Marc-Aurèle" },
      { grade: MemberGrade.CADET, annee: "2023", formateur: "A.C. Marc-Aurèle" },
      { grade: MemberGrade.AINE, annee: "2025", formateur: "A.P. Dominique", note: "Jeune leader en devenir" }
    ]
  },
  {
    id: "CVAV-54211",
    nom: "BAMBA",
    prenoms: "Emmanuella Saliha",
    genre: "Fille",
    dateNaissance: "2016-01-08",
    lieuNaissance: "Abidjan, Marcory",
    lieuHabitation: "Angré 8ème Tranche, Cité Star 8",
    anneeCatechese: "1ère Année Communion",
    baptise: false,
    confirme: false,
    maladieParticuliere: "Aucune",
    groupeSanguin: "AB+",
    allergie: "Aucune",
    
    parentType: "Mère",
    parentNom: "BAMBA",
    parentPrenoms: "Assiatou Alice",
    parentHabitation: "Angré 8ème Tranche, Cité Star 8",
    parentProfession: "Secrétaire Médicale",
    parentTelephone: "+225 05 44 87 23 99",
    parentWhatsApp: "+225 07 10 22 45 45",
    
    dateAdhesion: "2025-10-01",
    grade: MemberGrade.BENJAMIN,
    anneeAdhesion: "2025",
    section: "Saint Jean-Paul II",
    doyenne: "Mgr Blaise Anoh",
    numeroUrgence: "+225 05 44 87 23 99",
    status: "En attente",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    
    absences: [],
    sanctions: [],
    presences: {},
    evolution: []
  },
  {
    id: "CVAV-12903",
    nom: "TOURE",
    prenoms: "Emmanuel Ismaël",
    genre: "Garçon",
    dateNaissance: "2014-06-15",
    lieuNaissance: "Bouaké",
    lieuHabitation: "Angré Château d'Eau",
    anneeCatechese: "2ème Année Communion",
    baptise: true,
    confirme: false,
    maladieParticuliere: "Aucune",
    groupeSanguin: "O-",
    allergie: "Lactose",
    
    parentType: "Père",
    parentNom: "TOURE",
    parentPrenoms: "Jean-Paul",
    parentHabitation: "Angré Château d'Eau",
    parentProfession: "Enseignant",
    parentTelephone: "+225 07 49 12 87 63",
    parentWhatsApp: "+225 07 49 12 87 63",
    
    dateAdhesion: "2024-11-12",
    grade: MemberGrade.CADET,
    anneeAdhesion: "2024",
    section: "Saint Jean-Paul II",
    doyenne: "Mgr Blaise Anoh",
    numeroUrgence: "+225 07 49 12 87 63",
    status: "Actif",
    photoUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150&auto=format&fit=crop&q=80",
    
    absences: [],
    sanctions: [],
    presences: {
      "JAN": [true, true, true, true, true],
      "FEV": [true, true, true, true],
      "MARS": [true, true, true, true],
      "AVRIL": [true, true, true, true]
    },
    evolution: [
      { grade: MemberGrade.BENJAMIN, annee: "2024", formateur: "A.A. Sandrine" },
      { grade: MemberGrade.CADET, annee: "2025", formateur: "A.C. Marc-Aurèle", note: "Enthousiaste et appliqué" }
    ]
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "Grande Rentrée Pastorale 2026-2027",
    summary: "Le coup d'envoi de la rentrée pastorale de notre section CV-AV aura lieu le dimanche 13 septembre 2026 avec une messe solennelle.",
    content: `Chers parents, cœurs vaillants et âmes vaillantes !

Nous vous informons de la reprise effective de nos activités pour la rentrée pastorale de notre section Saint Jean-Paul II d'Angré 8ème tranche.

Au programme :
1. Messe solennelle d'ouverture à 9h00, tous les membres sont priés de porter la tenue officielle CV-AV avec leur foulard de grade respectif.
2. Après la messe, rassemblement au préau pour la répartition des groupes informels et présentation des animateurs de section pour cette nouvelle année.
3. Ouverture officielle du guichet d'inscriptions physiques et d'achat des carnets de correspondance pour les nouveaux inscrits.

Les réinscriptions en ligne sont d'ores et déjà disponibles sur notre portail digital officiel. Veuillez générer votre fiche membre et procéder à sa mise à jour. Nous attendons de nombreux enfants pour bâtir ensemble un monde où l'on s'aime !`,
    category: "Réunion",
    date: "2026-06-20",
    photoUrl: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=800&auto=format&fit=crop&q=80",
    author: "A.P. Dominique"
  },
  {
    id: "news-2",
    title: "Camp de formation 2026 de nos Jeunes Cadres à Bingerville",
    summary: "Retour en images de la formation intensive de nos aînés et meneurs au centre Jean-Paul II de Bingerville du 1er au 7 juillet.",
    content: `Du 1er au 7 juillet s'est tenu le camp annuel de formation des cadres (Aînés, Meneurs et futurs Animateurs) sous le thème : "Le service christique et le sens de la responsabilité chez de jeunes apôtres".

Ce camp a réuni 35 jeunes de notre section SJP2 et des sections voisines de notre doyenné Mgr Blaise Anoh. Nos participants ont bénéficié de cours de méthodologie d'animation collective, de séances d'approfondissement de la Parole de Dieu et de techniques de commandement, de secourisme élémentaire et d'activités sportives intenses.

Le Père Aumônier de notre paroisse nous a fait l'honneur d'une visite pour célébrer la sainte messe du milieu de camp et délivrer un message d'encouragement fort : "Soyez les phares de la charité dans vos familles et vos écoles".

Félicitations spéciales à nos 8 nouveaux diplômés qui ont reçu le grade de Meneurs et d'Animateurs Adjoints à l'issue de l'examen final de camp. Rien n'est impossible à un cœur vaillant !`,
    category: "Camp de formation",
    date: "2026-07-08",
    photoUrl: "https://images.unsplash.com/photo-1510531704581-5b2870972060?w=800&auto=format&fit=crop&q=80",
    author: "A.C. Marc-Aurèle"
  },
  {
    id: "news-3",
    title: "Merveilleuse Journée de Charité à l'Orphelinat",
    summary: "Les enfants du mouvement ont partagé d'inoubliables moments de joie et de partage le samedi 12 mai avec leurs frères de l'orphelinat.",
    content: `Conformément à notre devise "A Coeur Vaillant... rien d'impossible, joie, vaillance, charité", notre section a organisé une sortie caritative de grande envergure le samedi 12 mai 2026.

Grâce aux généreuses cotisations des parents et des paroissiens de Saint Jean-Paul II, nous avons pu apporter :
* Plus de 15 sacs de riz et vivres essentiels
* Des cartons de lait, de l'huile et du savon
* Des trousses scolaires, cahiers et livres de contes
* Des jouets et vêtements triés avec soin par nos enfants

Mais au-delà des dons matériels, c'est la présence chaleureuse de nos enfants qui a marqué les esprits. Les Cœurs Vaillants et Âmes Vaillantes ont animé l'après-midi avec des chants sacrés, des séances de conte, un grand match de football amical et des ateliers de coloriage.

Nous remercions sincèrement le bureau des parents de légionnaires pour la coordination logistique très efficace de ce déplacement !`,
    category: "Journée spéciale",
    date: "2026-05-14",
    photoUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80",
    author: "A.A. Sandrine"
  }
];

export const INITIAL_PARISH_EVENTS: ParishEvent[] = [
  {
    id: "parish-1",
    title: "Dates importantes pour les Sacrements 2026",
    category: "Annonces paroissiales",
    date: "2026-06-25",
    description: "Le bureau de la catéchèse de la Paroisse Saint Jean-Paul II informe que les baptêmes d'enfants d'âge scolaire auront lieu le samedi 22 août 2026, et les Premières Communions le dimanche 23 août 2026. Uniforme blanche exigée pour tous les confirmants et communiants.",
    year: 2026
  },
  {
    id: "parish-2",
    title: "Pèlerinage Diocésain de la Jeunesse",
    category: "Événements diocésains",
    date: "2026-05-20",
    description: "Le grand rassemblement de la jeunesse catholique du diocèse aura lieu sur le site de la Basilique Notre-Dame de la Paix de Yamoussoukro. Les inscriptions se font auprès du secrétariat paroissial au tarif de 12 000 FCFA par personne comprenant le voyage en car aller-retour et le kit repas.",
    year: 2026
  },
  {
    id: "parish-3",
    title: "Messe Spéciale d'Action de Grâce",
    category: "Calendrier liturgique",
    date: "2026-07-19",
    description: "La liturgie du 16ème dimanche du temps ordinaire sera dédiée à une messe d'action de grâce collective pour les examens scolaires de fin d'année (CEPE, BEPC, BAC). Les enfants du CV-AV animeront la procession d'offrandes.",
    year: 2026
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  { id: "gal-1", url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80", title: "Rassemblement Matinal & Prière", category: "Réunion", year: "2026" },
  { id: "gal-2", url: "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?w=600&auto=format&fit=crop&q=80", title: "Atelier créatif et coloriage", category: "Activité", year: "2026" },
  { id: "gal-3", url: "https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?w=600&auto=format&fit=crop&q=80", title: "Match de Football de cohésion de camp", category: "Camp", year: "2025" },
  { id: "gal-4", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80", title: "Sourire radieux d'une Ame Vaillante", category: "Activité", year: "2026" },
  { id: "gal-5", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80", title: "Distribution des cadeaux orphelinat", category: "Sortie", year: "2026" },
  { id: "gal-6", url: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80", title: "Randonnée écologique dans la forêt", category: "Sortie", year: "2024" }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    title: "Messe de Rentrée & Séance d'Inscriptions",
    description: "Célébration d'ouverture et validation des inscriptions en ligne pour la nouvelle saison 2026-2027.",
    date: "2026-09-13",
    location: "Préau paroissial, St Jean-Paul II",
    isOpen: true,
    maxParticipants: 100,
    participantsCount: 52,
    participantIds: ["CVAV-72049", "CVAV-41804", "CVAV-12903"]
  },
  {
    id: "act-2",
    title: "Camp d'Intégration d'Octobre 2026",
    description: "Camp de 3 jours destiné à l'accueil, l'initiation des nouveaux inscrits et l'évaluation des grades de départ.",
    date: "2026-10-23",
    location: "Foyer de Bingerville (Maison de Retraite)",
    isOpen: true,
    maxParticipants: 60,
    participantsCount: 24,
    participantIds: ["CVAV-72049", "CVAV-93215"]
  },
  {
    id: "act-3",
    title: "Randonnée d'Action de Grâce & Grand Jeux de Piste",
    description: "Une journée d'évasion en nature combinant topo d'orientation boussole, mimes religieux et jeux de pistes.",
    date: "2026-11-28",
    location: "Forêt du Banco (Abidjan)",
    isOpen: false,
    maxParticipants: 80,
    participantsCount: 80,
    participantIds: ["CVAV-72049", "CVAV-41804", "CVAV-93215", "CVAV-12903"]
  }
];
