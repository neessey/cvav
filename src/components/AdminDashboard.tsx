/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users as UsersIcon, ShieldAlert as AlertIcon, Calendar as CalendarIcon, 
  Settings, CheckCircle2, TrendingUp, Award as AwardIcon, MapPin, Sparkles, Map, LockKeyhole,
  Lock, Trash2, Edit, X, Plus, Search, UserCheck, FileText, Download, Check, FileSpreadsheet,
  Image as ImageIcon, UploadCloud, Link as LinkIcon, CalendarRange,
  Key,
  Save,
  ShieldAlert
} from "lucide-react";
import { 
  BarChart as RecBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Member, MemberGrade, Activity, NewsArticle, GalleryItem } from "../types";

interface AdminDashboardProps {
  members: Member[];
  activities: Activity[];
  galleryItems?: GalleryItem[];
  onApproveMember: (id: string) => void;
  onDeleteMember: (id: string) => void;
  onUpdateMember: (member: Member) => void;
  onAddActivity: (activity: Activity) => void;
  onToggleActivityStatus: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivity?: (activity: Activity) => void;
  onUploadGalleryItem?: (item: GalleryItem) => void;
  onDeleteGalleryItem?: (id: string) => void;
}

export default function AdminDashboard({
  members,
  activities,
  galleryItems = [],
  onApproveMember,
  onDeleteMember,
  onUpdateMember,
  onAddActivity,
  onToggleActivityStatus,
  onDeleteActivity,
  onUpdateActivity,
  onUploadGalleryItem,
  onDeleteGalleryItem
}: AdminDashboardProps) {
  // Secured access passcode
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Navigation inside Admin Panel
  const [currentSection, setCurrentSection] = useState<"stats" | "members" | "activities" | "followup" | "gallery" | "settings">("stats");
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  // Admin Gallery management states
  const [galleryCategory, setGalleryCategory] = useState("Activité");
  const [galleryYear, setGalleryYear] = useState("2026");
  const [galleryBatchTitle, setGalleryBatchTitle] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<{ id: string; url: string; title: string; file?: File }[]>([]);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<string | null>(null);
  const [galleryFilterCategory, setGalleryFilterCategory] = useState("Tous");
  const [galleryFilterYear, setGalleryFilterYear] = useState("Tous");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [galleryUrlTitle, setGalleryUrlTitle] = useState("");

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setGalleryFiles(prev => [
          ...prev,
          {
            id: "gal-temp-" + Math.random().toString(36).substr(2, 9),
            url: base64String,
            title: file.name.split(".")[0] || "Nouvelle photo",
            file: file
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddUrlImage = () => {
    if (!galleryUrlInput) return;
    setGalleryFiles(prev => [
      ...prev,
      {
        id: "gal-temp-" + Math.random().toString(36).substr(2, 9),
        url: galleryUrlInput,
        title: galleryUrlTitle || "Photo par lien"
      }
    ]);
    setGalleryUrlInput("");
    setGalleryUrlTitle("");
    showToast("Photo ajoutée à la file d'attente.");
  };

  const handlePublishGalleryBatch = async () => {
    if (galleryFiles.length === 0) {
      showToast("Veuillez d'abord ajouter au moins une photo.");
      return;
    }
    if (!onUploadGalleryItem) {
      showToast("Service de galerie indisponible.");
      return;
    }

    setGalleryUploadProgress("Publication en cours...");
    
    try {
      for (let i = 0; i < galleryFiles.length; i++) {
        const item = galleryFiles[i];
        
        let finalTitle = item.title;
        if (galleryBatchTitle.trim() !== "") {
          finalTitle = galleryFiles.length > 1 
            ? `${galleryBatchTitle} - ${i + 1}`
            : galleryBatchTitle;
        }

        const newItem: GalleryItem = {
          id: "gal-" + Date.now() + "-" + i,
          url: item.url,
          title: finalTitle,
          category: galleryCategory,
          year: galleryYear,
          originalFile: "",
          size: 0,
          type: ""
        };

        await onUploadGalleryItem(newItem);
      }

      setGalleryFiles([]);
      setGalleryBatchTitle("");
      setGalleryUploadProgress(null);
      showToast(`Publication réussie ! ${galleryFiles.length} photo(s) ajoutée(s) à la Galerie.`);
    } catch (err) {
      setGalleryUploadProgress(null);
      showToast("Une erreur s'est produite lors de la publication.");
    }
  };
  
  // Follow-up child selection state
  const [selectedFollowupMemberId, setSelectedFollowupMemberId] = useState<string>("");
  const [newAbsenceReason, setNewAbsenceReason] = useState("");
  const [newAbsenceDate, setNewAbsenceDate] = useState("");
  const [newSanctionReason, setNewSanctionReason] = useState("");
  const [newSanctionPenalty, setNewSanctionPenalty] = useState("");
  const [newSanctionDate, setNewSanctionDate] = useState("");

  // Editor states for members
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // New activity form state - MODIFIED with start and end dates
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityStartDate, setActivityStartDate] = useState("");
  const [activityEndDate, setActivityEndDate] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityMaxParticipants, setActivityMaxParticipants] = useState(60);
  const [activityPrice, setActivityPrice] = useState(0);

  const [notification, setNotification] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  if (passcode === storedPassword) {
    setIsAuthenticated(true);
    setAuthError("");
    setPasscode("");
  } else {
    setAuthError("Code d'accès incorrect. Veuillez réessayer.");
  }
};
  // Trigger Notifications helper
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // 📈 STATS COMPILATION
  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === "Actif").length;
  const pendingCount = members.filter(m => m.status === "En attente").length;

  // 1. Gender distribution
  const boysCount = members.filter(m => m.genre === "Garçon").length;
  const girlsCount = members.filter(m => m.genre === "Fille").length;
  
  const genderData = [
    { name: "Garçons", value: boysCount },
    { name: "Filles", value: girlsCount }
  ];
  const GENDER_COLORS = ["#00ACED", "#C62828"];

  // 2. Grade distribution
  const gradeDistribution = Object.values(MemberGrade).map(grd => {
    return {
      grade: grd,
      count: members.filter(m => m.grade === grd).length
    };
  }).filter(g => g.count > 0);

  // 3. Address distribution (Quarters)
  const quarterCounts: { [key: string]: number } = {};
  members.forEach(m => {
    const loc = m.lieuHabitation.toLowerCase();
    let normalized = "Autre Quartier";
    if (loc.includes("cnps")) normalized = "Cité CNPS";
    else if (loc.includes("star")) normalized = "Angré Star";
    else if (loc.includes("château") || loc.includes("chateau")) normalized = "Château d'Eau";
    else if (loc.includes("paroisse") || loc.includes("tranche")) normalized = "Près Paroisse";
    
    quarterCounts[normalized] = (quarterCounts[normalized] || 0) + 1;
  });
  const quarterData = Object.keys(quarterCounts).map(q => ({ name: q, membres: quarterCounts[q] }));

  // 4. Age distribution
  const calculateAge = (bday: string) => {
    const today = new Date();
    const birth = new Date(bday);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const ageGroups = {
    "6 - 8 ans": 0,
    "9 - 11 ans": 0,
    "12 - 14 ans": 0,
    "15 ans+": 0
  };

  members.forEach(m => {
    const age = calculateAge(m.dateNaissance);
    if (age <= 8) ageGroups["6 - 8 ans"]++;
    else if (age <= 11) ageGroups["9 - 11 ans"]++;
    else if (age <= 14) ageGroups["12 - 14 ans"]++;
    else ageGroups["15 ans+"]++;
  });

  const ageData = Object.keys(ageGroups).map(group => ({
    name: group,
    membres: ageGroups[group as keyof typeof ageGroups]
  }));

  // CSV Exporter for Members and Event participants
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(hdr => JSON.stringify(row[hdr] !== undefined ? row[hdr] : '')).join(','))
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Fichier exporté avec succès !");
  };

  const handleExportMembers = () => {
    const exportData = members.map(m => ({
      ID: m.id,
      Nom: m.nom,
      Prénoms: m.prenoms,
      Sexe: m.genre,
      Grade: m.grade,
      "Date Naissance": m.dateNaissance,
      Quartier: m.lieuHabitation,
      Sacrements: `${m.baptise ? "Baptisé(e)" : "Non baptisé(e)"} / ${m.confirme ? "Confirmé(e)" : "Non confirmé(e)"}`,
      Parent: `${m.parentType}: ${m.parentNom} ${m.parentPrenoms}`,
      "Téléphone Parent": m.parentTelephone,
      WhatsApp: m.parentWhatsApp,
      Statut: m.status
    }));
    exportToCSV(exportData, "Membres_CVAV_JP2");
  };

  const handleExportParticipants = (activity: Activity) => {
    const enrolledMembers = members.filter(m => activity.participantIds.includes(m.id));
    const exportData = enrolledMembers.map(m => ({
      ID: m.id,
      Nom: m.nom,
      Prénoms: m.prenoms,
      Sexe: m.genre,
      Grade: m.grade,
      ContactParent: m.parentTelephone,
      WhatsApp: m.parentWhatsApp,
      Quartier: m.lieuHabitation,
      GroupeSanguin: m.groupeSanguin
    }));
    exportToCSV(exportData, `Inscrits_${activity.title.substring(0,25)}`);
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      onUpdateMember(editingMember);
      setEditingMember(null);
      showToast("La fiche du membre a été mise à jour !");
    }
  };

  // MODIFIED: Handle add activity with start and end dates
  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle || !activityStartDate || !activityEndDate) {
      showToast("Veuillez renseigner le titre, la date de début et la date de fin.");
      return;
    }

    // Validate that end date is after start date
    if (new Date(activityEndDate) < new Date(activityStartDate)) {
      showToast("La date de fin doit être postérieure à la date de début.");
      return;
    }

    const newActivity: Activity = {
      id: "act-" + Date.now(),
      title: activityTitle,
      description: activityDescription,
      date: activityStartDate, // Keep for backward compatibility
      startDate: activityStartDate,
      endDate: activityEndDate,
      location: activityLocation || "Paroisse",
      isOpen: true,
      maxParticipants: Number(activityMaxParticipants) || 60,
      participantsCount: 0,
      participantIds: [],
      price: Number(activityPrice) ,
      payments: {}
    };

    onAddActivity(newActivity);
    setIsCreatingActivity(false);
    
    // Reset Form
    setActivityTitle("");
    setActivityDescription("");
    setActivityStartDate("");
    setActivityEndDate("");
    setActivityLocation("");
    setActivityPrice(0);
    
    showToast("Activité d'agenda créée ! Inscriptions ouvertes.");
  };
// Password change states
const [showPasswordChange, setShowPasswordChange] = useState(false);
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");

// Stocker le mot de passe en mémoire
const [storedPassword, setStoredPassword] = useState("5jp2cv@v*");
const handlePasswordChange = (e: React.FormEvent) => {
  e.preventDefault();
  setPasswordError("");
  setPasswordSuccess("");

  // Validation
  if (!currentPassword) {
    setPasswordError("Veuillez entrer votre mot de passe actuel.");
    return;
  }
  if (currentPassword !== storedPassword) {
    setPasswordError("Le mot de passe actuel est incorrect.");
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
    return;
  }
  if (newPassword !== confirmPassword) {
    setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
    return;
  }
  if (newPassword === storedPassword) {
    setPasswordError("Le nouveau mot de passe doit être différent de l'ancien.");
    return;
  }

  // Mise à jour du mot de passe
  setStoredPassword(newPassword);
  setPasswordSuccess("✅ Mot de passe modifié avec succès !");
  
  // Réinitialiser les champs
  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");
  
  // Masquer le formulaire après 3 secondes
  setTimeout(() => {
    setShowPasswordChange(false);
    setPasswordSuccess("");
  }, 3000);
};
  // Follow-up operations
  const currentFollowupChild = members.find(m => m.id === selectedFollowupMemberId);

  const handleAddAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowupMemberId || !newAbsenceReason || !newAbsenceDate) return;

    const updatedChild = { ...currentFollowupChild! };
    updatedChild.absences = [
      ...updatedChild.absences,
      {
        id: "abs-" + Date.now(),
        date: newAbsenceDate,
        reason: newAbsenceReason,
        signedParent: true,
        signedRespo: true
      }
    ];

    onUpdateMember(updatedChild);
    setNewAbsenceReason("");
    setNewAbsenceDate("");
    showToast("Absence dûment enregistrée au carnet.");
  };

  const handleAddSanction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowupMemberId || !newSanctionReason || !newSanctionDate) return;

    const updatedChild = { ...currentFollowupChild! };
    updatedChild.sanctions = [
      ...updatedChild.sanctions,
      {
        id: "sanc-" + Date.now(),
        date: newSanctionDate,
        reason: newSanctionReason,
        penalty: newSanctionPenalty || "Avertissement",
        signedRespo: true
      }
    ];

    onUpdateMember(updatedChild);
    setNewSanctionReason("");
    setNewSanctionPenalty("");
    setNewSanctionDate("");
    showToast("Avis disciplinaire (Sanction) consigné.");
  };

  const handleToggleAttendance = (month: string, weekIdx: number) => {
    if (!selectedFollowupMemberId) return;

    const updatedChild = { ...currentFollowupChild! };
    if (!updatedChild.presences) updatedChild.presences = {};
    if (!updatedChild.presences[month]) {
      updatedChild.presences[month] = [false, false, false, false, false];
    }

    const currentWeeks = [...updatedChild.presences[month]];
    currentWeeks[weekIdx] = !currentWeeks[weekIdx];
    updatedChild.presences[month] = currentWeeks;

    onUpdateMember(updatedChild);
    showToast("Feuille de présence actualisée !");
  };

  const filteredMembersTable = members.filter(m => {
    return m.nom.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
           m.prenoms.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
           m.id.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
           m.grade.toLowerCase().includes(searchMemberQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 md:space-y-8 select-none px-4 md:px-0">
      {/* Access guard overlay */}
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-md text-center space-y-6">
          <div className="w-14 h-14 bg-red-50 text-[#C62828] flex items-center justify-center mx-auto rounded-full shadow-2xs">
            <LockKeyhole className="w-7 h-7" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="font-sans font-extrabold text-lg text-gray-900 leading-snug">
              Espace Administration Sécurisé
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Veuillez introduire le code des responsables de section (CV-AV) pour piloter la base de données paroissiale.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Introduisez le mot de passe"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                className="w-full text-center tracking-widest text-sm p-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-[#C62828] focus:outline-hidden font-mono"
              />
              {authError && (
                <p className="text-red-600 text-[10px] mt-2 font-semibold flex items-center gap-1 justify-center">
                  <AlertIcon className="w-3.5 h-3.5 shrink-0" />
                  {authError}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
             <button
  type="submit"
  className="w-full py-3 px-4 bg-[#1B2E8A] hover:bg-black text-white text-xs font-extrabold rounded-xl transition-all shadow-xs"
>
  Se connecter
</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          
          {/* Header Panel with statistics summaries */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-green-600 tracking-wider uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Connecté en tant que Super-Administrateur
              </span>
              <h2 className="text-xl md:text-2xl font-bold font-sans text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 md:w-6 md:h-6 text-gray-600 animate-spin-slow" />
                Console d'Administration & Suivi
              </h2>
            </div>

            {/* Sub navigation pills - RESPONSIVE */}
            <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F4F8FD] border border-gray-200/50 rounded-2xl self-start md:self-center">
              {[
                { id: "stats", label: "Statistiques" },
                { id: "members", label: "Membres" },
                { id: "activities", label: "Activités" },
                { id: "followup", label: "Carnet" },
                { id: "gallery", label: "Galerie" },
                { id: "settings", label: "⚙️" }
              ].map((sub) => {
                const isActive = currentSection === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setCurrentSection(sub.id as any);
                      setSelectedActivityId(null);
                    }}
                    className={`flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#1B2E8A] text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Toast box inside view */}
          <AnimatePresence>
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-3xs"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span className="break-words">{notification}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STATS SECTION CONTAINER - RESPONSIVE */}
          {currentSection === "stats" && (
            <div className="space-y-6 md:space-y-8">
              {/* Top figures cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl shadow-3xs flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-[#1B2E8A] rounded-xl flex items-center justify-center shrink-0">
                    <UsersIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Effectif</h5>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl md:text-2xl font-black text-gray-900">{totalCount}</span>
                      <span className="text-gray-400 text-xs">enfants</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl shadow-3xs flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Actifs</h5>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl md:text-2xl font-black text-gray-900">{activeCount}</span>
                      <span className="text-[#00ACED] text-[10px] font-bold font-mono">({Math.round(activeCount/totalCount * 100)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-2xl shadow-3xs flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertIcon className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">En attente</h5>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl md:text-2xl font-black text-gray-900">{pendingCount}</span>
                      <span className="text-amber-600 text-[10px] font-bold font-mono">À valider</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#1B2E8A] to-[#00ACED] text-white p-4 md:p-5 rounded-2xl shadow-3xs flex items-center justify-between">
                  <div className="min-w-0">
                    <h5 className="text-[9px] md:text-[10px] text-blue-200 font-bold uppercase tracking-wider">Inscriptions</h5>
                    <span className="text-xl md:text-2xl font-black">Actives</span>
                    <p className="text-[9px] md:text-[10px] text-blue-100 mt-0.5">QR Code direct</p>
                  </div>
                  <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-white/20 shrink-0" />
                </div>
              </div>

              {/* Graphical charts grid - RESPONSIVE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                
                {/* Charts - Responsive heights */}
                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-3xl shadow-3xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-gray-900 text-sm">Répartition Garçons / Filles</h4>
                    <span className="text-[10px] font-mono text-gray-400">Total : {totalCount}</span>
                  </div>
                  
                  <div className="h-48 md:h-60 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Garçons</span>
                      <span className="text-lg md:text-xl font-black text-[#00ACED]">{Math.round(boysCount/totalCount*100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-3xl shadow-3xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-bold text-gray-900 text-sm">Répartition par Grades</h4>
                    <span className="text-[10px] bg-blue-50 text-[#1B2E8A] px-2 py-0.5 rounded-md font-bold uppercase">Section</span>
                  </div>
                  
                  <div className="h-48 md:h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RecBarChart data={gradeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#1B2E8A" radius={[4, 4, 0, 0]} name="Inscrits" />
                      </RecBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-3xl shadow-3xs space-y-4">
                  <h4 className="font-sans font-bold text-gray-900 text-sm">Distribution par Groupes d'Ages</h4>
                  <div className="h-48 md:h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <RecBarChart data={ageData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="membres" fill="#C62828" radius={[4, 4, 0, 0]} name="Membres" />
                      </RecBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-5 rounded-3xl shadow-3xs space-y-4">
                  <h4 className="font-sans font-bold text-[#1B2E8A] text-sm flex items-center gap-1.5">
                    <Map className="w-5 h-5 text-[#00ACED]" />
                    Répartition par Quartier
                  </h4>
                  
                  {quarterData.length === 0 ? (
                    <div className="h-48 md:h-60 flex items-center justify-center text-gray-400 text-xs">
                      Aucune donnée disponible.
                    </div>
                  ) : (
                    <div className="h-48 md:h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <RecBarChart data={quarterData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={60} />
                          <Tooltip />
                          <Bar dataKey="membres" fill="#00ACED" radius={[0, 4, 4, 0]} name="Membres" />
                        </RecBarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* MEMBERS MANAGER CONTAINER - RESPONSIVE */}
          {currentSection === "members" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs">
                <div className="relative flex-1 max-w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filtrer un membre..."
                    value={searchMemberQuery}
                    onChange={e => setSearchMemberQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportMembers}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all outline-hidden whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="hidden sm:inline">Exporter CSV</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                </div>
              </div>

              {/* Members Table - Responsive */}
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-3xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100">
                        <th className="p-3 md:p-4">Membre</th>
                        <th className="p-3 md:p-4">ID / Sexe</th>
                        <th className="p-3 md:p-4">Grade</th>
                        <th className="p-3 md:p-4 hidden lg:table-cell">Parents</th>
                        <th className="p-3 md:p-4 hidden md:table-cell">Quartier</th>
                        <th className="p-3 md:p-4">Statut</th>
                        <th className="p-3 md:p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {filteredMembersTable.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-400 font-sans">
                            Aucun membre trouvé.
                          </td>
                        </tr>
                      ) : (
                        filteredMembersTable.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden bg-gray-100 relative shrink-0 border border-gray-200/50">
                                  {member.photoUrl ? (
                                    <img 
                                      referrerPolicy="no-referrer"
                                      src={member.photoUrl} 
                                      alt={member.nom} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-200">
                                      {member.nom.substring(0, 1)}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-sans font-bold text-gray-900 truncate max-w-[80px] md:max-w-[130px] uppercase">
                                    {member.nom}
                                  </h4>
                                  <p className="text-gray-500 text-[11px] truncate max-w-[100px] md:max-w-[150px]">
                                    {member.prenoms}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 md:p-4">
                              <div className="font-mono text-[10px] font-bold text-gray-400 space-y-0.5">
                                <p className="text-gray-700 text-[9px] md:text-[10px]">{member.id}</p>
                                <span className={`inline-block text-[8px] md:text-[9px] rounded-md px-1.5 py-0.2 font-bold ${
                                  member.genre === "Garçon" ? "bg-blue-50 text-[#00ACED]" : "bg-rose-50 text-[#C62828]"
                                }`}>
                                  {member.genre}
                                </span>
                              </div>
                            </td>

                            <td className="p-3 md:p-4">
                              <span className="px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-extrabold bg-[#EAF7FF] text-[#1B2E8A] border border-blue-10/20 select-none whitespace-nowrap">
                                {member.grade}
                              </span>
                            </td>

                            <td className="p-3 md:p-4 hidden lg:table-cell">
                              <p className="text-gray-700 leading-none truncate max-w-[120px]">
                                <span className="font-bold text-gray-400 text-[10px]">{member.parentType.substring(0,4)}.</span> {member.parentNom}
                              </p>
                              <p className="font-mono text-gray-500 text-[10px] font-bold">{member.parentTelephone}</p>
                            </td>

                            <td className="p-3 md:p-4 text-gray-500 max-w-[100px] truncate leading-tight hidden md:table-cell">
                              {member.lieuHabitation}
                            </td>

                            <td className="p-3 md:p-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-extrabold shadow-3xs border ${
                                member.status === "Actif"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${member.status === "Actif" ? "bg-green-500" : "bg-amber-400 animate-pulse"}`}></span>
                                {member.status}
                              </span>
                            </td>

                            <td className="p-3 md:p-4 text-center">
                              <div className="flex items-center justify-center gap-1 md:gap-1.5">
                                {member.status === "En attente" && (
                                  <button
                                    onClick={() => {
                                      onApproveMember(member.id);
                                      showToast(`Le membre ${member.prenoms} a été activé !`);
                                    }}
                                    className="p-1 px-1.5 md:px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] md:text-[10px] font-bold shadow-3xs transition-all flex items-center gap-0.5"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span className="hidden sm:inline">Activer</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => setEditingMember(member)}
                                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
                                  title="Modifier"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (confirm("Voulez-vous rayer définitivement ce membre ?")) {
                                      onDeleteMember(member.id);
                                      showToast("Fiche détruite.");
                                    }
                                  }}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-[#C62828] rounded-lg transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITIES AGENDA MANAGER - MODIFIED with start/end dates */}
          {currentSection === "activities" && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs">
                <h3 className="font-sans font-extrabold text-sm text-gray-900">
                  Activités & Suivi Nominatif
                </h3>
                
                <button
                  onClick={() => setIsCreatingActivity(!isCreatingActivity)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs whitespace-nowrap w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle activité
                </button>
              </div>

              {/* Creator block - MODIFIED with start and end dates */}
              {isCreatingActivity && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-2 border-blue-100 p-4 md:p-6 rounded-2xl shadow-xs space-y-4 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h4 className="font-bold text-gray-900 text-sm">Organiser une nouvelle activité</h4>
                    <button onClick={() => setIsCreatingActivity(false)} className="bg-gray-100 rounded-full p-1"><X className="w-4 h-4" /></button>
                  </div>

                  <form onSubmit={handleAddActivitySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left column */}
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Titre de l'activité *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Camp de cohésion de Toussaint"
                            value={activityTitle}
                            onChange={e => setActivityTitle(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-gray-700 mb-1">Date de début *</label>
                            <input
                              type="date"
                              required
                              value={activityStartDate}
                              onChange={e => setActivityStartDate(e.target.value)}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-gray-700 mb-1">Date de fin *</label>
                            <input
                              type="date"
                              required
                              value={activityEndDate}
                              onChange={e => setActivityEndDate(e.target.value)}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-gray-700 mb-1">Frais (FCFA)</label>
                            <input
                              type="number"
                              placeholder="0 (gratuit)"
                              value={activityPrice}
                              onChange={e => setActivityPrice(Number(e.target.value))}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-center"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-gray-700 mb-1">Quota max</label>
                            <input
                              type="number"
                              value={activityMaxParticipants}
                              onChange={e => setActivityMaxParticipants(Number(e.target.value))}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-center"
                              min={10}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right column */}
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Lieu</label>
                          <input
                            type="text"
                            placeholder="Ex: Préau paroissial"
                            value={activityLocation}
                            onChange={e => setActivityLocation(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">Description</label>
                          <textarea
                            placeholder="Ex: Topo d'intégration et mimes religieux..."
                            rows={3}
                            value={activityDescription}
                            onChange={e => setActivityDescription(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                      >
                        Ouvrir les inscriptions
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Grid lists activities summary - RESPONSIVE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {activities.map((act) => {
                  const isSelected = selectedActivityId === act.id;
                  
                  return (
                    <div 
                      key={act.id}
                      className={`bg-white border rounded-2xl p-4 md:p-5 shadow-3xs flex flex-col justify-between transition-all ${
                        isSelected ? "border-2 border-blue-600 ring-2 ring-blue-50 bg-[#EAF7FF]/10" : "border-gray-100"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <span className="text-[10px] font-mono text-gray-400 font-bold flex items-center gap-1">
                            <CalendarRange className="w-3.5 h-3.5" />
                            {act.startDate || act.date} {act.endDate && `→ ${act.endDate}`}
                          </span>
                          
                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => {
                                onToggleActivityStatus(act.id);
                                showToast("Statut basculé !");
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-extrabold select-none ${
                                act.isOpen 
                                  ? "bg-green-50 text-green-700 border border-green-200" 
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {act.isOpen ? "Ouvert" : "Fermé"}
                            </button>

                            <button
                              onClick={() => {
                                if(confirm("Supprimer l'activité ?")) {
                                  onDeleteActivity(act.id);
                                  setSelectedActivityId(null);
                                  showToast("Activité supprimée.");
                                }
                              }}
                              className="text-red-500 hover:bg-red-50 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-sans font-bold text-gray-900 text-sm">{act.title}</h4>
                          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{act.description}</p>
                        </div>
                        
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 font-mono gap-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{act.location}</span>
                          </span>
                          <span className="font-bold text-gray-700">
                            {act.participantIds.length} / {act.maxParticipants} inscrits
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setSelectedActivityId(isSelected ? null : act.id)}
                          className="flex-1 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-lg text-center"
                        >
                          {isSelected ? "Masquer" : "Voir les inscrits"}
                        </button>
                        
                        <button
                          onClick={() => handleExportParticipants(act)}
                          className="py-1.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-1"
                          disabled={act.participantIds.length === 0}
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span className="hidden sm:inline">Export</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sub list inside active activity - RESPONSIVE */}
              {selectedActivityId && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#F4F8FD] border border-gray-200/60 rounded-3xl p-4 md:p-6 shadow-3xs space-y-4 overflow-x-auto"
                >
                  {(() => {
                    const activeActObj = activities.find(a => a.id === selectedActivityId)!;
                    const enrolledChildren = members.filter(m => activeActObj.participantIds.includes(m.id));
                    
                    return (
                      <div className="space-y-4 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/50 pb-3">
                          <div>
                            <h4 className="font-sans font-bold text-gray-900 text-sm">
                              Inscrits : <span className="text-[#1B2E8A]">{activeActObj.title}</span>
                            </h4>
                            <p className="text-gray-400 text-[10px] mt-0.5">Total : {enrolledChildren.length} participants</p>
                          </div>
                          
                          <button
                            onClick={() => handleExportParticipants(activeActObj)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-3xs whitespace-nowrap"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Télécharger (.CSV)
                          </button>
                        </div>

                        {enrolledChildren.length === 0 ? (
                          <p className="text-center py-6 text-gray-400">Aucun enfant inscrit.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left bg-white rounded-2xl overflow-hidden border border-gray-100 min-w-[600px]">
                              <thead>
                                <tr className="bg-gray-100/70 border-b border-gray-100 text-gray-500 font-bold text-[10px] md:text-xs">
                                  <th className="p-2 md:p-3">ID</th>
                                  <th className="p-2 md:p-3">Nom complet</th>
                                  <th className="p-2 md:p-3 hidden sm:table-cell">Grade</th>
                                  <th className="p-2 md:p-3 hidden md:table-cell">Téléphone</th>
                                  <th className="p-2 md:p-3">Frais</th>
                                  <th className="p-2 md:p-3">Paiement</th>
                                  <th className="p-2 md:p-3 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="font-medium text-gray-700 divide-y divide-gray-100">
                                {enrolledChildren.map(c => {
                                  const payment = activeActObj.payments?.[c.id];
                                  const price = activeActObj.price ?? 0;
                                  const isFree = price === 0;
                                  
                                  const status = isFree ? "paid" : (payment?.status || "pending");
                                  const method = isFree ? "Gratuit" : (payment?.method || "Non spécifié");

                                  const handleValidatePayment = () => {
                                    if (!onUpdateActivity) {
                                      showToast("Erreur de configuration.");
                                      return;
                                    }
                                    const updatedActivity: Activity = {
                                      ...activeActObj,
                                      payments: {
                                        ...(activeActObj.payments || {}),
                                        [c.id]: {
                                          status: "paid",
                                          amount: price,
                                          date: new Date().toISOString().split("T")[0],
                                          method: "Espèces (Secrétariat)"
                                        } as any
                                      }
                                    };
                                    onUpdateActivity(updatedActivity);
                                    showToast(`Paiement de ${c.nom} validé.`);
                                  };

                                  return (
                                    <tr key={c.id} className="hover:bg-gray-50/50">
                                      <td className="p-2 md:p-3 font-mono font-bold text-blue-700 text-[9px] md:text-xs">{c.id}</td>
                                      <td className="p-2 md:p-3 font-bold uppercase text-[10px] md:text-xs">{c.nom} <span className="normal-case font-medium text-gray-500 hidden sm:inline">{c.prenoms}</span></td>
                                      <td className="p-2 md:p-3 hidden sm:table-cell">{c.grade}</td>
                                      <td className="p-2 md:p-3 font-mono font-bold text-[9px] md:text-xs hidden md:table-cell">{c.parentTelephone}</td>
                                      <td className="p-2 md:p-3 font-bold text-gray-900">{price} FCFA</td>
                                      <td className="p-2 md:p-3">
                                        <span className={`inline-flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                                          status === "paid" 
                                            ? "bg-green-50 text-green-700" 
                                            : "bg-orange-50 text-orange-700"
                                        }`}>
                                          {status === "paid" ? `✓ Payé` : "🔴 En attente"}
                                        </span>
                                      </td>
                                      <td className="p-2 md:p-3 text-center">
                                        {status !== "paid" && !isFree ? (
                                          <button
                                            onClick={handleValidatePayment}
                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-[9px] md:text-[10px] font-bold rounded-lg transition-colors"
                                          >
                                            Valider
                                          </button>
                                        ) : (
                                          <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">Confirmé</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          )}

          {/* VIRTUAL CARNET CORRESPONDANCE - RESPONSIVE */}
          {currentSection === "followup" && (
            <div className="space-y-6">
              
              <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-gray-900 text-sm">
                    Carnet de Correspondance Virtuel
                  </h3>
                  <p className="text-gray-400 text-[10px]">
                    Sélectionnez un membre pour inscrire absences, sanctions ou présences.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-1">Sélectionner l'enfant</label>
                  <select
                    value={selectedFollowupMemberId}
                    onChange={e => setSelectedFollowupMemberId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden font-bold text-xs"
                  >
                    <option value="">-- Choisissez un membre --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        [{m.id}] {m.nom.toUpperCase()} {m.prenoms} ({m.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentFollowupChild ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                  
                  {/* Left Column: Presence sheets */}
                  <div className="bg-white border border-gray-100 rounded-3xl p-4 md:p-6 shadow-3xs space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="font-sans font-bold text-[#1B2E8A] text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Présence aux Réunions
                      </h4>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {["JAN", "FEV", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET"].map(month => {
                        const attendances = currentFollowupChild.presences[month] || [false, false, false, false, false];
                        
                        return (
                          <div 
                            key={month}
                            className="bg-gray-50/70 py-2.5 px-3 md:px-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <span className="font-sans font-bold text-[#1B2E8A] text-xs w-12">{month}</span>
                            
                            <div className="flex items-center gap-3 md:gap-4">
                              {attendances.map((checked, checkIdx) => (
                                <label 
                                  key={checkIdx}
                                  className="flex flex-col items-center gap-0.5 cursor-pointer"
                                  title={`Semaine ${checkIdx + 1}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleAttendance(month, checkIdx)}
                                    className="w-4 h-4 md:w-4.5 md:h-4.5 text-[#1B2E8A] rounded-sm focus:ring-0 cursor-pointer"
                                  />
                                  <span className="text-[7px] md:text-[8px] font-mono text-gray-400">S{checkIdx + 1}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Sanction and Absences */}
                  <div className="space-y-6">
                    
                    <div className="bg-white border border-gray-100 rounded-3xl p-4 md:p-5 shadow-3xs space-y-4 text-xs">
                      <h4 className="font-sans font-bold text-gray-900 text-sm">Déclarer une Absence</h4>

                      <form onSubmit={handleAddAbsence} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold mb-1">Date</label>
                            <input
                              type="date"
                              required
                              value={newAbsenceDate}
                              onChange={e => setNewAbsenceDate(e.target.value)}
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold mb-1">Signatures</label>
                            <input
                              type="text"
                              disabled
                              value="Automatique"
                              className="w-full p-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold mb-1">Motif</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Événement familial..."
                            value={newAbsenceReason}
                            onChange={e => setNewAbsenceReason(e.target.value)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white outline-hidden text-xs"
                          />
                        </div>

                        <div className="text-right">
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#1B2E8A] text-white font-bold rounded-lg hover:bg-black transition-all text-xs"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-4 md:p-5 shadow-3xs space-y-4 text-xs">
                      <h4 className="font-sans font-bold text-gray-900 text-sm">Sanction / Avis disciplinaire</h4>

                      <form onSubmit={handleAddSanction} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold mb-1">Date</label>
                            <input
                              type="date"
                              required
                              value={newSanctionDate}
                              onChange={e => setNewSanctionDate(e.target.value)}
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold mb-1">Pénalité</label>
                            <input
                              type="text"
                              placeholder="Ex: Nettoyage"
                              value={newSanctionPenalty}
                              onChange={e => setNewSanctionPenalty(e.target.value)}
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white outline-hidden text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold mb-1">Manquement</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Retards répétitifs..."
                            value={newSanctionReason}
                            onChange={e => setNewSanctionReason(e.target.value)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white outline-hidden text-xs"
                          />
                        </div>

                        <div className="text-right">
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-800 transition-all text-xs"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 font-sans border-2 border-dashed border-gray-100 rounded-2xl bg-white text-sm">
                  Veuillez sélectionner un membre pour administrer son carnet.
                </div>
              )}
            </div>
          )}

          {/* GALLERY SECTION - RESPONSIVE */}
          {currentSection === "gallery" && (
            <div className="space-y-6">
              
              <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-3xl shadow-3xs space-y-6">
                
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-bold text-[#1B2E8A] tracking-wider uppercase flex items-center gap-1 mb-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    Ajouter des photos
                  </span>
                  <h3 className="text-base md:text-lg font-bold font-sans text-gray-900">
                    Téléversement en Lot
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Sélectionnez plusieurs photos ou ajoutez-les par lien.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Catégorie</label>
                      <select
                        value={galleryCategory}
                        onChange={e => setGalleryCategory(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                      >
                        <option value="Activité">Activité</option>
                        <option value="Réunion">Réunion</option>
                        <option value="Camp">Camp</option>
                        <option value="Sortie">Sortie</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Année</label>
                      <select
                        value={galleryYear}
                        onChange={e => setGalleryYear(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Titre Général</label>
                      <input
                        type="text"
                        placeholder="Ex: Camp SJP2 2026"
                        value={galleryBatchTitle}
                        onChange={e => setGalleryBatchTitle(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishGalleryBatch}
                      disabled={galleryFiles.length === 0 || !!galleryUploadProgress}
                      className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2 ${
                        galleryFiles.length === 0 || !!galleryUploadProgress
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-[#1B2E8A] hover:bg-[#C62828] cursor-pointer"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {galleryUploadProgress ? "Publication..." : `Publier ${galleryFiles.length} photo(s)`}
                    </button>
                  </div>

                  <div className="space-y-4 text-xs lg:col-span-2">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <label 
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-[#1B2E8A] transition-all space-y-2 shadow-3xs"
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryFilesChange}
                          className="hidden"
                        />
                        <UploadCloud className="w-8 h-8 text-[#1B2E8A]" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-gray-700 text-xs">Choisir des photos</p>
                          <p className="text-[9px] text-gray-400">Sélection multiple</p>
                        </div>
                      </label>
                    </div>

                    {galleryFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                          <span>File d'attente ({galleryFiles.length})</span>
                          <button 
                            type="button" 
                            onClick={() => setGalleryFiles([])}
                            className="text-red-500 hover:underline"
                          >
                            Vider
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100">
                          {galleryFiles.map((file) => (
                            <div key={file.id} className="relative group bg-white rounded-xl overflow-hidden border border-gray-150 p-1.5 flex flex-col justify-between shadow-3xs">
                              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-50 relative shrink-0">
                                <img src={file.url} className="w-full h-full object-cover" alt="" />
                                <button
                                  type="button"
                                  onClick={() => setGalleryFiles(prev => prev.filter(f => f.id !== file.id))}
                                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition shadow-2xs"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="mt-1.5">
                                <input
                                  type="text"
                                  value={file.title}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setGalleryFiles(prev => prev.map(f => f.id === file.id ? { ...f, title: val } : f));
                                  }}
                                  className="w-full p-1 bg-gray-50 border border-gray-200 rounded-md focus:outline-hidden text-[9px] font-semibold text-gray-800"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Gallery items grid - RESPONSIVE */}
              <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-3xl shadow-3xs space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold font-sans text-gray-900">Galerie Publique</h3>
                    <p className="text-gray-400 text-xs mt-0.5">Visualisez et gérez les clichés.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <select
                      value={galleryFilterCategory}
                      onChange={e => setGalleryFilterCategory(e.target.value)}
                      className="p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-xs"
                    >
                      <option value="Tous">Toutes Catégories</option>
                      <option value="Activité">Activité</option>
                      <option value="Réunion">Réunion</option>
                      <option value="Camp">Camp</option>
                      <option value="Sortie">Sortie</option>
                    </select>

                    <select
                      value={galleryFilterYear}
                      onChange={e => setGalleryFilterYear(e.target.value)}
                      className="p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-xs"
                    >
                      <option value="Tous">Tous Millésimes</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>

                {(() => {
                  const filtered = galleryItems.filter(item => {
                    const matchesCat = galleryFilterCategory === "Tous" || item.category === galleryFilterCategory;
                    const matchesYr = galleryFilterYear === "Tous" || item.year === galleryFilterYear;
                    return matchesCat && matchesYr;
                  });

                  if (filtered.length === 0) {
                    return (
                      <p className="text-center py-12 text-gray-400 text-xs font-sans border-2 border-dashed border-gray-50 rounded-2xl bg-gray-50/50">
                        Aucune photo ne correspond aux filtres.
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                      {filtered.map(item => (
                        <div key={item.id} className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-3xs group flex flex-col justify-between h-40 md:h-48 select-none">
                          <div className="relative flex-1 bg-gray-100 overflow-hidden">
                            <img src={item.url} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" alt="" />
                            
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onDeleteGalleryItem && confirm(`Supprimer "${item.title}" ?`)) {
                                    onDeleteGalleryItem(item.id);
                                    showToast("Photo supprimée.");
                                  }
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md hover:scale-105 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="p-2 md:p-3 bg-gray-50 shrink-0 border-t border-gray-100 text-[9px] md:text-[10px]">
                            <h4 className="font-bold text-gray-900 truncate" title={item.title}>
                              {item.title}
                            </h4>
                            <div className="flex justify-between text-gray-400 mt-0.5 font-semibold font-mono text-[8px] md:text-[9px]">
                              <span>{item.category}</span>
                              <span>{item.year}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

              </div>

            </div>
          )}
{/* SECTION PARAMÈTRES - NOUVEAU */}
{currentSection === "settings" && (
  <div className="space-y-6">
    <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-3xs">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
        <Key className="w-6 h-6 text-[#1B2E8A]" />
        <h3 className="font-sans font-bold text-lg text-gray-900">Changement de Mot de Passe</h3>
      </div>

      {!showPasswordChange ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-6">
            Pour des raisons de sécurité, vous pouvez modifier votre mot de passe d'accès à la console d'administration.
          </p>
          <button
            onClick={() => setShowPasswordChange(true)}
            className="px-6 py-3 bg-[#1B2E8A] hover:bg-[#C62828] text-white font-bold rounded-xl transition-all shadow-xs"
          >
            <Key className="w-4 h-4 inline mr-2" />
            Changer le mot de passe
          </button>
        </div>
      ) : (
        <form onSubmit={handlePasswordChange} className="max-w-md mx-auto space-y-4">
          {/* Champs du formulaire */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#1B2E8A] focus:outline-hidden font-mono"
              placeholder="Entrez votre mot de passe actuel"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#1B2E8A] focus:outline-hidden font-mono"
              placeholder="Minimum 6 caractères"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#1B2E8A] focus:outline-hidden font-mono"
              placeholder="Répétez le nouveau mot de passe"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowPasswordChange(false);
                setPasswordError("");
                setPasswordSuccess("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      )}
    </div>

    {/* Informations de sécurité */}
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 md:p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-800 text-sm">Conseils de sécurité</h4>
          <ul className="text-blue-700 text-xs space-y-1 mt-2">
            <li>• Utilisez un mot de passe d'au moins 8 caractères</li>
            <li>• Mélangez lettres majuscules, minuscules, chiffres et symboles</li>
            <li>• Ne partagez jamais votre mot de passe</li>
            <li>• Changez votre mot de passe régulièrement</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)}
        </div>
      )}

      {/* Editor Modal - RESPONSIVE */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-4 md:p-6 space-y-6 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] text-left"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
                <h3 className="font-sans font-bold text-gray-950 text-sm md:text-base">
                  Modifier : {editingMember.nom.toUpperCase()} {editingMember.prenoms}
                </h3>
                <button onClick={() => setEditingMember(null)} className="p-1 bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSaveMemberEdit} className="space-y-4 overflow-y-auto pr-1 md:pr-2 text-xs flex-1">
                <div className="space-y-3">
                  <h4 className="font-sans font-bold text-xs text-[#1B2E8A] border-l-2 border-[#00ACED] pl-1.5 uppercase">Informations Enfant</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Nom</label>
                      <input
                        type="text"
                        value={editingMember.nom}
                        onChange={e => setEditingMember({ ...editingMember, nom: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden uppercase text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Prénoms</label>
                      <input
                        type="text"
                        value={editingMember.prenoms}
                        onChange={e => setEditingMember({ ...editingMember, prenoms: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Quartier</label>
                      <input
                        type="text"
                        value={editingMember.lieuHabitation}
                        onChange={e => setEditingMember({ ...editingMember, lieuHabitation: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Grade</label>
                      <select
                        value={editingMember.grade}
                        onChange={e => setEditingMember({ ...editingMember, grade: e.target.value as MemberGrade })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden text-xs"
                      >
                        <option value={MemberGrade.BENJAMIN}>Benjamin</option>
                        <option value={MemberGrade.CADET}>Cadet</option>
                        <option value={MemberGrade.AINE}>Aîné</option>
                        <option value={MemberGrade.MENEUR}>Meneur</option>
                        <option value={MemberGrade.AA}>Animateur Adjoint</option>
                        <option value={MemberGrade.AC}>Animateur Confirmé</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="font-sans font-bold text-xs text-[#C62828] border-l-2 border-[#C62828] pl-1.5 uppercase">Parents</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Lien</label>
                      <select
                        value={editingMember.parentType}
                        onChange={e => setEditingMember({ ...editingMember, parentType: e.target.value as any })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      >
                        <option value="Père">Père</option>
                        <option value="Mère">Mère</option>
                        <option value="Tuteur/Tutrice">Tuteur</option>
                      </select>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Nom complet</label>
                      <input
                        type="text"
                        value={`${editingMember.parentNom} ${editingMember.parentPrenoms}`}
                        onChange={e => {
                          const val = e.target.value.split(" ");
                          const last = val[0] || "";
                          const first = val.slice(1).join(" ") || "";
                          setEditingMember({ ...editingMember, parentNom: last, parentPrenoms: first });
                        }}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">Téléphone</label>
                      <input
                        type="text"
                        value={editingMember.parentTelephone}
                        onChange={e => setEditingMember({ ...editingMember, parentTelephone: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-bold uppercase tracking-wider mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={editingMember.parentWhatsApp}
                        onChange={e => setEditingMember({ ...editingMember, parentWhatsApp: e.target.value })}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-hidden font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-center text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#1B2E8A] hover:bg-black text-white rounded-xl font-bold shadow-xs text-xs"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}