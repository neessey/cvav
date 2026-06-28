/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  QrCode, UserPlus, ShieldCheck, Mail, Phone, Heart, ClipboardCheck, ArrowRight, Sparkles, Check, Copy, Printer, Award, FileText, Smartphone, X, Share2, MessageSquare
} from "lucide-react";
import { Member, MemberGrade } from "../types";
import { uploadToCloudinary } from "../lib/upload";

interface EnrollmentModuleProps {
  onRegisterMember: (newMember: Member) => void;
  appUrl: string; // Dynamic URL of the app
}

export default function EnrollmentModule({ onRegisterMember, appUrl }: EnrollmentModuleProps) {
  // Navigation query check or current origin URL
  const [currentUrl, setCurrentUrl] = useState("https://ais-dev-22aqnmasfhw6xiqxmfwrci-137092896099.europe-west1.run.app");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loc = window.location;
      // Extract origin and path, then append client-side routing param for the enrollment tab
      const cleanUrl = `${loc.origin}${loc.pathname}?tab=enroll`;
      setCurrentUrl(cleanUrl);
    } else if (appUrl) {
      setCurrentUrl(`${appUrl}?tab=enroll`);
    }
  }, [appUrl]);

  // Form Field States
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [genre, setGenre] = useState<"Garçon" | "Fille">("Garçon");
  const [dateNaissance, setDateNaissance] = useState("");
  const [lieuNaissance, setLieuNaissance] = useState("");
  const [lieuHabitation, setLieuHabitation] = useState("");
  const [anneeCatechese, setAnneeCatechese] = useState("1ère Année Communion");
  const [baptise, setBaptise] = useState(true);
  const [confirme, setConfirme] = useState(false);
  
  // Constant defaults since section 3 is omitted
  const maladieParticuliere = "Aucune";
  const groupeSanguin = "Inconnu";
  const allergie = "Aucune";

  const [parentType, setParentType] = useState<"Père" | "Mère" | "Tuteur/Tutrice">("Père");
  const [parentNom, setParentNom] = useState("");
  const [parentPrenoms, setParentPrenoms] = useState("");
  const [parentHabitation, setParentHabitation] = useState("");
  const [parentProfession, setParentProfession] = useState("");
  const [parentTelephone, setParentTelephone] = useState("");
  const [parentWhatsApp, setParentWhatsApp] = useState("");

  const [grade, setGrade] = useState<MemberGrade>(MemberGrade.BENJAMIN);

  // Child Photo upload states
  const [childPhoto, setChildPhoto] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const uploadedUrl = await uploadToCloudinary(base64String);
        setChildPhoto(uploadedUrl);
      } catch (err) {
        console.error("Error uploading child photo:", err);
        // Fallback to base64
        setChildPhoto(base64String);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Result success state
  const [showMemberCardId, setShowMemberCardId] = useState<string | null>(null);
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  // Helper to dynamically calculate grade and age from date of birth
  const getGradeFromBirthdate = (birthdate: string) => {
    if (!birthdate) {
      return {
        grade: MemberGrade.BENJAMIN,
        age: null,
        label: "Non calculé",
        explanation: "Saisir une date de naissance"
      };
    }
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }

    if (age >= 16) {
      return {
        grade: MemberGrade.MENEUR,
        age,
        label: "Meneur",
        explanation: `Foulard Jaune et Blanc (${age} ans) • Grade des jeunes animateurs et encadreurs (16 ans et plus).`
      };
    } else if (age >= 13) {
      return {
        grade: MemberGrade.AINE,
        age,
        label: "Aîné",
        explanation: `Foulard Jaune (${age} ans) • Le grand âge de l'action de grâce (13 à 15 ans).`
      };
    } else if (age >= 10) {
      return {
        grade: MemberGrade.CADET,
        age,
        label: "Cadet",
        explanation: `Foulard Vert (${age} ans) • L'âge du courage et de la fidélité d'action (10 à 12 ans).`
      };
    } else {
      return {
        grade: MemberGrade.BENJAMIN,
        age,
        label: "Benjamin",
        explanation: age < 6
          ? `(${age} ans) • Trop jeune (sera accueilli comme sympathisant).`
          : `Foulard Bleu (${age} ans) • L'âge de l'obéissance et de l'écoute en équipe (6 à 9 ans).`
      };
    }
  };

  const currentCalculation = getGradeFromBirthdate(dateNaissance);

  // Black high-contrast QR Code generated from the exact live URL of this form
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=000000&bgColor=ffffff&data=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const textMsg = `Bonjour ! Voici le lien direct pour remplir le formulaire d'inscription en ligne des Cœurs Vaillants / Âmes Vaillantes de la section Saint Jean-Paul II : ${currentUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
    window.open(waUrl, "_blank");
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inscription SJP2",
          text: "Bulletin d'Adhésion Numérique CV-AV Saint Jean-Paul II",
          url: currentUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !prenoms || !dateNaissance || !parentTelephone) {
      alert("Veuillez remplir les informations obligatoires de l'enfant et des parents.");
      return;
    }

    const calculatedResult = getGradeFromBirthdate(dateNaissance);
    const targetGrade = calculatedResult.grade;

    const generatedId = `CVAV-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomAvatarIdx = Math.floor(1 + Math.random() * 4);
    const avatarSelection = [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    ];

    const currentYearStr = new Date().getFullYear().toString();

    const newMember: Member = {
      id: generatedId,
      nom: nom.toUpperCase().trim(),
      prenoms: prenoms.trim(),
      genre,
      dateNaissance,
      lieuNaissance: lieuNaissance.trim() || "Abidjan",
      lieuHabitation: lieuHabitation.trim() || parentHabitation,
      anneeCatechese,
      baptise,
      confirme,
      maladieParticuliere,
      groupeSanguin,
      allergie,
      parentType,
      parentNom: parentNom.toUpperCase().trim(),
      parentPrenoms: parentPrenoms.trim(),
      parentHabitation: parentHabitation.trim(),
      parentProfession: parentProfession.trim(),
      parentTelephone: parentTelephone.trim(),
      parentWhatsApp: parentWhatsApp.trim() || parentTelephone.trim(),
      dateAdhesion: new Date().toISOString().split('T')[0],
      grade: targetGrade,
      anneeAdhesion: currentYearStr,
      section: "Saint Jean-Paul II",
      doyenne: "Mgr Blaise Anoh",
      numeroUrgence: parentTelephone.trim(),
      status: "En attente",
      photoUrl: childPhoto || avatarSelection[randomAvatarIdx - 1],
      absences: [],
      sanctions: [],
      presences: {},
      evolution: [
        { grade: targetGrade, annee: currentYearStr, formateur: "Administrateur Section" }
      ]
    };

    onRegisterMember(newMember);
    setCreatedMember(newMember);

    // Reset fields
    setNom("");
    setPrenoms("");
    setGenre("Garçon");
    setDateNaissance("");
    setLieuNaissance("");
    setLieuHabitation("");
    setParentNom("");
    setParentPrenoms("");
    setParentHabitation("");
    setParentProfession("");
    setParentTelephone("");
    setParentWhatsApp("");
    setChildPhoto("");

    setShowMemberCardId(generatedId);
  };

  const triggerPrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-8 select-none max-w-4xl mx-auto py-4">
      
      {/* Sleek Design Form Header and Control Band */}
      <div className="border border-black/10 bg-transparent p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[#C62828] font-mono text-[9px] uppercase tracking-widest block font-black mb-1">
             adhésion rentrée pastorale
          </span>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-black leading-none lowercase">
            bulletin d'inscription numérique
          </h2>
          <p className="text-black/60 text-xs mt-2 max-w-lg leading-relaxed font-medium">
            Remplissez directement la fiche pour les cœurs &amp; âmes vaillantes. Vous pouvez aussi détacher un mini code QR pour le faire remplir à d'autres parents depuis leur smartphone.
          </p>
        </div>

        {/* Small Elegant QR Code Action Button */}
        <button
          onClick={() => setQrModalOpen(true)}
          className="shrink-0 flex items-center gap-2.5 px-5 py-3 bg-[#1B2E8A] hover:bg-[#C62828] text-white text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer border border-transparent"
          data-cursor-text="qr code"
        >
          <QrCode className="w-4 h-4" />
          partager par qr code
        </button>
      </div>

      {/* Main Core Form Block */}
      <div className="border border-black/10 bg-transparent p-6 sm:p-10 space-y-8">
        <form onSubmit={handleRegister} className="space-y-10 text-xs">
          
          {/* Group 1: Enfant */}
          <div className="space-y-6">
            <div className="border-b border-black/10 pb-3 flex items-center justify-between">
              <h4 className="font-mono font-black text-[10px] text-[#C62828] uppercase tracking-widest">
                01 / renseignements de l'enfant
              </h4>
              <span className="text-black/30 font-mono text-[9px] uppercase">[ requis * ]</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  nom de famille <span className="text-[#C62828] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: ADOU"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200 uppercase"
                />
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  prénoms de l'enfant <span className="text-[#C62828] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: ANGE NOËL"
                  value={prenoms}
                  onChange={(e) => setPrenoms(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  sexe de l'enfant <span className="text-[#C62828] font-bold">*</span>
                </label>
                <div className="flex gap-2">
                  {["Garçon", "Fille"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g as any)}
                      className={`flex-1 py-3 text-center text-[9px] font-mono font-bold uppercase tracking-widest border transition-all duration-300 ${
                        genre === g
                          ? "bg-[#1B2E8A] text-white border-[#1B2E8A]"
                          : "bg-transparent text-black/50 border-black/10 hover:border-black/30"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  date de naissance <span className="text-[#C62828] font-bold">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-black/10 hover:border-black/30 focus:border-black outline-hidden font-sans font-medium hover:cursor-pointer"
                />
              </div>

              {/* Real-time calculated Grade & Age display banner */}
              {dateNaissance && (
                <div className="col-span-1 md:col-span-3 border border-[#C62828]/20 bg-black text-white p-5 space-y-2 mt-2 transition-all duration-350 ease-out">
                  <div className="flex items-center justify-between">
                    <span className="text-[#C62828] font-mono text-[9px] uppercase tracking-widest font-black">
                       GRADE SJP2 AUTOMATIQUEMENT CALCULÉ
                    </span>
                    <span className="bg-[#C62828] text-white text-[8.5px] font-mono font-bold uppercase py-0.5 px-2">
                      ÂGE PRÉCIS : {currentCalculation.age} ANS
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 pt-1">
                    <div className="w-10 h-10 border border-white/20 bg-white/5 flex items-center justify-center font-mono font-bold text-[#C62828] text-sm shrink-0">
                      {currentCalculation.grade.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-serif font-black text-lg lowercase leading-none">
                        grade : {currentCalculation.label}
                      </h5>
                      <p className="text-white/60 text-[10.5px] font-medium font-sans mt-1 leading-normal">
                        {currentCalculation.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  lieu de naissance
                </label>
                <input
                  type="text"
                  placeholder="Cocody, Abidjan"
                  value={lieuNaissance}
                  onChange={(e) => setLieuNaissance(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  lieu d'habitation précis / quartier
                </label>
                <input
                  type="text"
                  placeholder="Angré 8ème Tranche, Château d'Eau"
                  value={lieuHabitation}
                  onChange={(e) => setLieuHabitation(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200"
                />
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  année de catéchèse actuelle
                </label>
                <select
                  value={anneeCatechese}
                  onChange={(e) => setAnneeCatechese(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black outline-hidden font-sans font-medium hover:cursor-pointer transition duration-200"
                >
                  <option value="Éveil Religieux">Éveil Religieux</option>
                  <option value="1ère Année Communion">1ère Année Communion</option>
                  <option value="2ème Année Communion">2ème Année Communion</option>
                  <option value="Profession de foi">Profession de foi (Communion Solennelle)</option>
                  <option value="1ère Confirmations">1ère Confirmations</option>
                  <option value="2ème Confirmations">2ème Confirmations</option>
                  <option value="Pas de Catéchèse (Trop jeune)">Pas encore de catéchèse</option>
                </select>
              </div>
            </div>

            {/* Sacraments checkboxes inside elegant line frames */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-black/10 p-5 mt-2 bg-black/[0.01]">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={baptise}
                  onChange={(e) => setBaptise(e.target.checked)}
                  className="w-4.5 h-4.5 text-black border-black/20 focus:ring-0 rounded-none bg-white cursor-pointer accent-black"
                />
                <div>
                  <span className="font-mono font-bold uppercase text-[9px] text-black">l'enfant est baptisé</span>
                  <p className="text-[10px] text-black/40 font-medium font-sans">A déjà reçu le sacrement de baptême.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirme}
                  onChange={(e) => setConfirme(e.target.checked)}
                  className="w-4.5 h-4.5 text-black border-black/20 focus:ring-0 rounded-none bg-white cursor-pointer accent-black"
                />
                <div>
                  <span className="font-mono font-bold uppercase text-[9px] text-black">l'enfant est confirmé</span>
                  <p className="text-[10px] text-black/40 font-medium font-sans">A déjà reçu le sacrement de confirmation.</p>
                </div>
              </label>
            </div>

            {/* Photo de l'enfant avec intégration Cloudinary */}
            <div className="border border-black/10 p-5 bg-black/[0.01] space-y-4">
              <div>
                <span className="font-mono font-bold uppercase text-[9px] text-[#C62828] block mb-1">
                  Photo de l'enfant <span className="text-black/30 font-mono text-[9px] lowercase">[ optionnelle mais recommandée * ]</span>
                </span>
                <p className="text-[10px] text-black/40 font-medium font-sans">
                  Téléversez un portrait clair de l'enfant pour son carnet et sa carte officielle de membre.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Boîte d'aperçu */}
                <div className="w-20 h-20 border border-black/15 bg-white shrink-0 overflow-hidden flex items-center justify-center relative">
                  {childPhoto ? (
                    <img src={childPhoto} className="w-full h-full object-cover" alt="Aperçu de l'enfant" />
                  ) : (
                    <div className="text-center p-2 select-none">
                      <span className="text-[9px] font-mono text-black/30 uppercase">pas de photo</span>
                    </div>
                  )}
                  {childPhoto && (
                    <button
                      type="button"
                      onClick={() => setChildPhoto("")}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-xs hover:bg-red-700 transition"
                      title="Supprimer la photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Bouton d'action de téléversement */}
                <div className="flex-1 w-full space-y-2">
                  <label className="inline-block px-4 py-2.5 bg-[#1B2E8A] hover:bg-[#C62828] text-white text-[9px] font-mono font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer border border-transparent">
                    Choisir une photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {isUploading ? (
                    <p className="text-[9px] font-mono text-blue-600 uppercase tracking-wider animate-pulse font-bold">
                      Téléversement en cours...
                    </p>
                  ) : childPhoto ? (
                    <p className="text-[9px] font-mono text-green-600 uppercase tracking-wider font-bold">
                      ✓ Photo prête à l'enregistrement
                    </p>
                  ) : (
                    <p className="text-[9px] font-mono text-black/30 uppercase">
                      Fichiers JPG, PNG supportés
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Parents */}
          <div className="space-y-6">
            <div className="border-b border-black/10 pb-3">
              <h4 className="font-mono font-black text-[10px] text-[#C62828] uppercase tracking-widest">
                02 / responsables légaux &amp; contacts parentaux
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  lien de parenté
                </label>
                <div className="flex gap-1 border border-black/10 p-1 bg-white">
                  {["Père", "Mère", "Tuteur/Tutrice"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setParentType(type as any)}
                      className={`flex-1 py-1.5 text-center font-mono text-[8.5px] font-bold uppercase tracking-widest transition-all duration-300 ${
                        parentType === type
                          ? "bg-[#1B2E8A] text-white"
                          : "text-black/50 hover:text-black hover:bg-black/[0.03]"
                      }`}
                    >
                      {type.split("/")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  nom du parent <span className="text-[#C62828] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="EX: ADOU"
                  value={parentNom}
                  onChange={(e) => setParentNom(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200 uppercase"
                />
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  prénoms du parent <span className="text-[#C62828] font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Auguste"
                  value={parentPrenoms}
                  onChange={(e) => setParentPrenoms(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  résidence principale du parent
                </label>
                <input
                  type="text"
                  placeholder="Angré 8ème Tranche, Côte d'Ivoire"
                  value={parentHabitation}
                  onChange={(e) => setParentHabitation(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200"
                />
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  profession exerçée
                </label>
                <input
                  type="text"
                  placeholder="Enseignant, Ingénieur, Administrateur..."
                  value={parentProfession}
                  onChange={(e) => setParentProfession(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-sans font-medium transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  téléphone principal <span className="text-[#C62828] font-bold">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 shrink-0" />
                  <input
                    type="tel"
                    required
                    placeholder="+225 07 00 00 00 00"
                    value={parentTelephone}
                    onChange={(e) => setParentTelephone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-mono font-medium transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono tracking-wider text-[9px] uppercase font-black text-black/50 mb-2">
                  contact whatsapp du parent
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/70 shrink-0" />
                  <input
                    type="tel"
                    placeholder="+225 07 00 00 00 00"
                    value={parentWhatsApp}
                    onChange={(e) => setParentWhatsApp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-black/10 hover:border-black/30 focus:border-black focus:bg-transparent outline-hidden font-mono font-medium transition duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Elegant Submission CTA with visual feedback */}
          <div className="pt-6 border-t border-black/15 flex justify-end">
            <button
              type="submit"
              className="px-8 py-4 bg-[#1B2E8A] hover:bg-[#C62828] text-white font-mono font-extrabold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              data-cursor-text="valider"
            >
              valider &amp; enregistrer l'adhésion [⟶]
            </button>
          </div>
        </form>
      </div>

      {/* RETHINK CELLPHONE SHARING DIALOG POPUP MODAL (THE SLEEK INTERACTIVE OVERLAY) */}
      <AnimatePresence>
        {qrModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#FAF9F6] text-black w-full max-w-sm rounded-none border border-black p-6 md:p-8 space-y-6 relative selection:bg-black selection:text-white"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setQrModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 border border-black/10 hover:border-black text-black transition-all cursor-pointer"
                aria-label="Fermer le dialogue"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1.5 pr-6">
                <span className="text-[#C62828] font-mono text-[9px] uppercase tracking-widest block font-black">
                  accès mobile rapide
                </span>
                <h3 className="font-serif font-bold text-xl text-black lowercase">
                  flashez pour vous inscrire
                </h3>
                <p className="text-black/60 text-[11px] leading-relaxed font-sans font-medium">
                  Scannez ce vrai code QR avec l'appareil photo de n'importe quel smartphone pour remplir directement le formulaire sur votre appareil mobile.
                </p>
              </div>

              {/* QR High Contrast Frame design */}
              <div className="relative w-52 h-52 mx-auto border border-black/10 p-4 bg-white flex items-center justify-center shadow-xs">
                <img 
                  referrerPolicy="no-referrer"
                  src={qrCodeUrl} 
                  alt="QR Code d'inscription direct" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Quick sharing action cards inside panel */}
              <div className="space-y-2.5">
                
                {/* Form URL Link read card with direct copy button */}
                <div className="bg-white border border-black/10 p-3 flex items-center justify-between gap-3 text-left">
                  <div className="truncate flex-1">
                    <span className="text-[8px] font-mono text-black/40 uppercase tracking-widest block font-bold">url du formulaire</span>
                    <span className="text-black font-mono text-[9.5px] truncate block mt-0.5">{currentUrl}</span>
                  </div>
                  
                  <button
                    onClick={handleCopyLink}
                    className="p-2 border border-black/5 hover:border-black text-black bg-black/[0.02] hover:bg-black/5 transition-all shrink-0 cursor-pointer"
                    title="Copier le lien"
                  >
                    {linkCopied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-black/70" />
                    )}
                  </button>
                </div>

                {/* WhatsApp native routing link button */}
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[8.5px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition duration-300 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                  partager par WhatsApp
                </button>

                {/* System standard native Web Share API */}
                <button
                  onClick={handleWebShare}
                  className="w-full py-2.5 px-4 border border-[#1B2E8A] hover:bg-[#1B2E8A] hover:text-white text-[#1B2E8A] font-mono text-[8.5px] uppercase tracking-widest font-black flex items-center justify-center gap-2 transition duration-300 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  autres options de partage
                </button>

              </div>

              <div className="text-[9px] font-mono font-semibold text-black/40 text-center uppercase tracking-widest">
                saint jean-paul ii • @2026
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal showing completed Member Registration Card */}
      <AnimatePresence>
        {showMemberCardId && createdMember && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-none max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-black text-center relative font-sans"
            >
              
              <div className="space-y-1">
                <div className="w-11 h-11 rounded-none border border-emerald-600/20 bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 select-none">
                  <Check className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-emerald-700 font-mono text-[9px] uppercase tracking-widest block font-black">
                  congratulations / validation réussie
                </span>
                <h3 className="text-2xl font-serif font-black text-black lowercase leading-none">
                  inscription prise en compte
                </h3>
                <p className="text-black/50 text-[11px] leading-relaxed font-sans max-w-sm mx-auto">
                  Le profil membre numérique est désormais généré. Vous recevrez une notification d'approbation sur votre numéro.
                </p>
              </div>

              {/* Physical/Digital Card component matching beautiful high-status details */}
              <div className="bg-[#111] text-white p-6 border border-white/10 text-left space-y-4 font-sans relative overflow-hidden">
                <div className="absolute right-[-40px] bottom-[-40px] w-40 h-40 bg-[radial-gradient(circle_at_center,_white_10%,transparent_60%)] opacity-10 rounded-full"></div>
                
                {/* Header card info */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <div>
                    <h4 className="text-[8px] font-mono font-black tracking-widest text-[#C62828] uppercase"> paroisse saint jean-paul ii</h4>
                    <p className="text-[9px] text-white/50 font-mono uppercase tracking-wider">section cv-av • abidjan, CI</p>
                  </div>
                  <span className="text-[8.5px] font-mono bg-white/10 border border-white/10 text-white font-extrabold px-2.5 py-1">
                    {createdMember.id}
                  </span>
                </div>

                {/* Main Card body */}
                <div className="flex gap-4 relative z-10">
                  {/* Photo area with placeholder */}
                  <div className="w-18 h-18 rounded-none bg-white/5 border border-white/10 overflow-hidden shrink-0 relative">
                    {createdMember.photoUrl ? (
                      <img 
                        referrerPolicy="no-referrer"
                        src={createdMember.photoUrl} 
                        alt={createdMember.nom} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 bg-zinc-850">
                        <UserPlus className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0 text-xs">
                    <div>
                      <p className="text-[7.5px] uppercase tracking-widest text-white/40 font-mono">nom &amp; prénoms membre</p>
                      <h3 className="font-serif font-black text-white leading-none text-base truncate uppercase">{createdMember.nom}</h3>
                      <p className="text-white/70 text-[11px] font-medium truncate mt-0.5">{createdMember.prenoms}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10 mt-2">
                      <div>
                        <p className="text-[7.5px] uppercase tracking-widest text-white/40 font-mono">grade attribué</p>
                        <p className="text-[10px] font-mono font-black text-[#C62828] uppercase">{createdMember.grade}</p>
                      </div>
                      <div>
                        <p className="text-[7.5px] uppercase tracking-widest text-white/40 font-mono">ligne d'urgence</p>
                        <p className="text-[10px] text-white/80 font-mono font-medium leading-none">{createdMember.numeroUrgence}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings or notices */}
                <div className="text-[8.5px] font-mono text-white/40 bg-white/[0.03] p-2.5 border border-white/5 leading-relaxed">
                  * Statut : <strong className="text-amber-500 uppercase">En attente</strong>. Veuillez présenter cette fiche d'adhésion pour confirmation définitive par le bureau des formateurs.
                </div>
              </div>

              {/* Action controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={triggerPrintReceipt}
                  className="flex-1 py-3 px-4 bg-transparent hover:bg-[#1B2E8A]/5 text-[#1B2E8A] font-mono tracking-wider font-bold text-[9px] uppercase border border-[#1B2E8A]/10 hover:border-[#1B2E8A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  imprimer la fiche
                </button>
                <button
                  onClick={() => setShowMemberCardId(null)}
                  className="flex-1 py-3 px-4 bg-[#1B2E8A] hover:bg-[#C62828] text-white font-mono tracking-widest font-extrabold text-[9px] uppercase transition-all duration-300 cursor-pointer"
                >
                  quitter l'aperçu
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
