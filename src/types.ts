/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MemberGrade {
  BENJAMIN = "Benjamin",
  CADET = "Cadet",
  AINE = "Aîné",
  MENEUR = "Meneur",
  AA = "Aspirant Accompagnateur (AA)",
  AC = "Accompagnateur (AC)",
  AP = "Accompagnateur Principal (AP)"
}

export interface AbsenceRecord {
  id: string;
  date: string;
  reason: string;
  signedParent: boolean;
  signedRespo: boolean;
}

export interface SanctionRecord {
  id: string;
  date: string;
  reason: string;
  penalty: string;
  signedRespo: boolean;
}

export interface AttendanceMonth {
  month: string; // "JAN", "FEV", etc.
  checked: boolean[]; // 5 weeks per month max
}

export interface Member {
  id: string;
  nom: string;
  prenoms: string;
  genre: "Garçon" | "Fille";
  dateNaissance: string;
  lieuNaissance: string;
  lieuHabitation: string;
  anneeCatechese: string;
  baptise: boolean;
  confirme: boolean;
  maladieParticuliere: string;
  groupeSanguin: string;
  allergie: string;
  
  // Parent info
  parentType: "Père" | "Mère" | "Tuteur/Tutrice";
  parentNom: string;
  parentPrenoms: string;
  parentHabitation: string;
  parentProfession: string;
  parentTelephone: string;
  parentWhatsApp: string;
  
  // CVAV Info
  dateAdhesion: string;
  grade: MemberGrade;
  anneeAdhesion: string;
  section: string;
  doyenne: string;
  numeroUrgence: string;
  status: "En attente" | "Actif";
  photoUrl?: string;

  // Correspondence notebook features
  absences: AbsenceRecord[];
  sanctions: SanctionRecord[];
  presences: { [key: string]: boolean[] }; // e.g. { "JAN": [true, false, true, true], "FEV": [...] }
  evolution: {
    grade: MemberGrade;
    annee: string;
    formateur: string;
    note?: string;
  }[];
}

export type NewsCategory = "Réunion" | "Sortie" | "Camp de formation" | "Journée spéciale";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: NewsCategory;
  date: string;
  photoUrl: string;
  videoUrl?: string;
  pdfUrl?: string;
  author: string;
}

export type ParishCategory = "Annonces paroissiales" | "Événements diocésains" | "Calendrier liturgique";

export interface ParishEvent {
  id: string;
  title: string;
  category: ParishCategory;
  date: string;
  description: string;
  year: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
  year: string;
  originalFile: string;
  size: number;
  type: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  startDate: string;
  endDate: string;
  location: string;
  isOpen: boolean;
  maxParticipants: number;
  participantsCount: number;
  participantIds: string[]; // List of enrolled Member IDs
  price?: number; // Optional price for the activity in FCFA
  payments?: { [memberId: string]: { status: "paid" | "pending"; amount: number; date: string; method: string } }; // Payment tracking per participant
}
