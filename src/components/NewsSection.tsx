/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, User, Tag, ArrowRight, X, FileText, Play, Download, Search, Check,
  CreditCard, Smartphone, Coins, Clock, CheckCircle2, AlertCircle, Info, QrCode, Loader2
} from "lucide-react";
import { Activity, Member } from "../types";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";


interface NewsSectionProps {
  activities: Activity[];
  members: Member[];
  onUpdateActivity?: (activity: Activity) => void;
  isAdminMode?: boolean;
}

export default function NewsSection({ 
  activities = [], 
  members = [], 
  onUpdateActivity,
  isAdminMode = false 
}: NewsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"Tous" | "Ouverts" | "Payants" | "Gratuits">("Tous");
  
  // Registration and payment states
  const [registeringActivity, setRegisteringActivity] = useState<Activity | null>(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [childSearch, setChildSearch] = useState("");
  const [paymentStep, setPaymentStep] = useState<"select_child" | "select_method" | "processing" | "receipt">("select_child");
  const [paymentMethod, setPaymentMethod] = useState<"Orange" | "MTN" | "Wave" | "Moov" | "Espèces">("Wave");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // General alerts
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter and search activities
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isPaid = (act.price ?? 0) > 0;
    
    if (selectedFilter === "Ouverts") return matchesSearch && act.isOpen;
    if (selectedFilter === "Payants") return matchesSearch && isPaid;
    if (selectedFilter === "Gratuits") return matchesSearch && !isPaid;
    return matchesSearch;
  });

  // Filter members registered in the database for the search dropdown
  const eligibleChildren = members.filter(m => {
    const fullname = `${m.nom} ${m.prenoms}`.toLowerCase();
    return fullname.includes(childSearch.toLowerCase()) || m.id.toLowerCase().includes(childSearch.toLowerCase());
  });

  // Handle registration wizard start
  const handleStartRegistration = (activity: Activity) => {
    if (!activity.isOpen) {
      triggerError("Les inscriptions pour cette activité sont clôturées.");
      return;
    }
    if (activity.participantIds.length >= activity.maxParticipants) {
      triggerError("Désolé, cette activité a atteint sa capacité maximale.");
      return;
    }
    setRegisteringActivity(activity);
    setSelectedChildId("");
    setChildSearch("");
    setPaymentStep("select_child");
    setPaymentMethod(activity.price && activity.price > 0 ? "Wave" : "Espèces");
    setPaymentPhone("");
    setPaymentReference(null);
  };

  const triggerError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 4000);
  };

  const triggerSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Start payment process
 // Générer le lien de paiement selon l'opérateur
const generatePaymentLink = (method: string, phone: string, amount: number, description: string) => {
  const cleanPhone = phone.replace(/\s/g, "");
  
  switch (method) {
    case "Wave":
      // Wave CI : lien web direct (le seul avec un vrai deep link)
      // Format : https://pay.wave.com/m/{merchant_alias}?amount={montant}
      // Sans merchant ID configuré, on génère un lien tel: comme fallback
  return `https://pay.wave.com/m/M_ci_waw-9EveeQZb/c/ci/?amount=${amount}`;
      
    
    case "Orange":
      
      return null;
    
    case "MTN":
      
      return null;
    
    default:
      return null;
  }
};

const handleProceedToPayment = async () => {
  if (!selectedChildId) {
    triggerError("Veuillez sélectionner un enfant pour l'inscription.");
    return;
  }

  if (registeringActivity?.participantIds.includes(selectedChildId)) {
    triggerError("Cet enfant est déjà inscrit à cette activité.");
    return;
  }

  const price = registeringActivity?.price ?? 0;
  const child = members.find(m => m.id === selectedChildId);

  if (!child || !registeringActivity) {
    triggerError("Données introuvables. Veuillez réessayer.");
    return;
  }

  if (price === 0 || paymentMethod === "Espèces") {
    // Gratuit ou espèces → inscription directe
    await completeRegistrationAndSave(paymentMethod === "Espèces" ? "pending" : "paid");
  } else {
    // Paiement mobile money → afficher le lien
    if (!paymentPhone || paymentPhone.length < 8) {
      triggerError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    const description = `Inscription ${child.nom} ${child.prenoms} - ${registeringActivity.title}`;
    const link = generatePaymentLink(paymentMethod, paymentPhone, price, description);
    
    // Générer une référence locale
    const ref = `CVAV-${Date.now().toString().slice(-8)}`;
    setPaymentReference(ref);
    setPaymentStep("processing");
  }
};

  // Complete registration and save to database
  const completeRegistrationAndSave = async (paymentStatus: "paid" | "pending") => {
    if (!registeringActivity || !selectedChildId) return;

    const child = members.find(m => m.id === selectedChildId);
    if (!child) return;

    try {
      const price = registeringActivity.price ?? 0;
      
      const updatedActivity: Activity = {
        ...registeringActivity,
        participantsCount: (registeringActivity.participantIds.length || 0) + 1,
        participantIds: [...(registeringActivity.participantIds || []), selectedChildId],
        payments: {
          ...(registeringActivity.payments || {}),
          [selectedChildId]: {
            status: paymentStatus,
            amount: price,
            date: new Date().toISOString().split("T")[0],
            method: paymentMethod,
            ...(paymentPhone ? { phoneNumber: paymentPhone } : {}),
            ...(paymentReference ? { transactionReference: paymentReference } : {})
          } as any
        }
      };

      await setDoc(doc(db, "cvav_activities", registeringActivity.id), updatedActivity);

      if (onUpdateActivity) {
        onUpdateActivity(updatedActivity);
      }

      setPaymentStep("receipt");
      triggerSuccess(`Inscription de ${child.nom} ${child.prenoms} enregistrée avec succès !`);
      setIsProcessingPayment(false);
    } catch (err: any) {
      console.error(err);
      triggerError("Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer.");
      setPaymentStep("select_child");
      setIsProcessingPayment(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Banner / Header Title Cell */}
      <div className="relative overflow-hidden rounded-[40px] bg-white border border-black/5 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFD] via-white to-white" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div
            className="absolute top-1/2 right-0 -translate-y-1/2 w-[24rem] h-[24rem] bg-contain bg-no-repeat bg-right"
            style={{ backgroundImage: "url('/assets/logo.png')" }}
          />
        </div>

        <div className="relative z-10 p-8 md:p-14">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C62828] text-white text-[10px] font-black uppercase tracking-[0.3em]">
              programme & adhésions
            </span>
          </div>

          <div className="max-w-4xl">
            <h2 className="leading-none">
              <span className="block font-serif italic font-light text-[#1B2E8A] text-5xl md:text-7xl xl:text-[6rem]">
                activités
              </span>
              <span className="block font-serif italic font-light text-[#00ACED] text-4xl md:text-6xl xl:text-[5rem] -mt-2">
                officielles CVAV
              </span>
            </h2>
            <div className="w-24 h-[2px] bg-[#C62828] mt-8 mb-8" />
            <p className="max-w-3xl text-black/70 text-lg leading-relaxed">
              Planifiez vos moments de répit. Inscrivez vos enfants aux sorties,
              camps, rassemblements diocésains et activités de formation.
              Effectuez vos paiements Mobile Money en toute sécurité .
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une sortie, camp, topo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#1B2E8A] focus:bg-white transition-all font-sans"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {(["Tous", "Ouverts", "Payants", "Gratuits"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold select-none transition-all ${
                selectedFilter === filter
                  ? "bg-[#1B2E8A] text-white shadow-xs"
                  : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Toast Alert popups */}
      <AnimatePresence>
        {errorToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 shadow-md text-xs z-50 max-w-md"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-semibold">{errorToast}</span>
          </motion.div>
        )}
        
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-2 shadow-md text-xs z-50 max-w-md"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Program list / Activity cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredActivities.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-gray-400 font-sans border border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm">
            <p className="text-sm tracking-wide">
              Aucun événement pastoral ou sortie ne correspond à vos filtres.
            </p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const hasCost = (act.price ?? 0) > 0;
            const spotsRemaining = act.maxParticipants - act.participantIds.length;
            const isFull = spotsRemaining <= 0;

            return (
              <div
                key={act.id}
                className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#1B2E8A]/5 via-transparent to-[#C62828]/5 pointer-events-none" />

                <div className="p-7 space-y-5 relative">
                  
                  <div className="flex items-center justify-between">
                    <span className="bg-[#EBF3FC] text-[#1B2E8A] text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full shadow-sm">
                      {hasCost ? `${act.price} FCFA` : "GRATUIT"}
                    </span>

                    <span
                      className={`text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full ${
                        act.isOpen && !isFull
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {act.isOpen
                        ? isFull
                          ? "COMPLET"
                          : "OUVERT"
                        : "CLÔTURÉ"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-sans font-bold text-gray-900 text-lg leading-snug group-hover:text-[#1B2E8A] transition">
                      {act.title}
                    </h3>

                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {act.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-3 text-[11px] text-gray-600 font-medium">
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C62828]" />
                      <span>{act.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-[#1B2E8A]" />
                      <span className="truncate">{act.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span>
                        {act.participantIds.length} / {act.maxParticipants} inscrits
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-white px-7 py-5 border-t border-gray-100">
                  <button
                    onClick={() => handleStartRegistration(act)}
                    disabled={!act.isOpen || isFull}
                    className={`w-full py-3 rounded-2xl text-xs font-bold tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
                      act.isOpen && !isFull
                        ? "bg-[#1B2E8A] text-white hover:bg-[#C62828] shadow-md group-hover:shadow-lg"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span>
                      {isFull
                        ? "ACTIVITÉ COMPLÈTE"
                        : hasCost
                        ? "S'INSCRIRE & PAYER"
                        : "S'INSCRIRE GRATUITEMENT"}
                    </span>

                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REGISTRATION & SECURE PAYMENT MODAL OVERLAY */}
      <AnimatePresence>
        {registeringActivity && (
          <div className="fixed inset-0 bg-gray-950/45 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="bg-[#1B2E8A] text-white p-5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-serif font-black text-sm lowercase tracking-wider">
                    formulaire d'adhésion d'activité
                  </h3>
                  <p className="text-[10px] font-mono text-white/70 mt-0.5 truncate max-w-xs sm:max-w-md">
                    {registeringActivity.title}
                  </p>
                </div>
                <button
                  onClick={() => setRegisteringActivity(null)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body based on Wizard step */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* STEP 1: Select Enrolled child/member */}
                {paymentStep === "select_child" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#EBF3FC] border border-[#1B2E8A]/10 rounded-xl flex items-start gap-2.5 text-xs text-[#1B2E8A]">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="font-medium">
                        Pour inscrire un enfant, il doit d'abord être enregistré au secrétariat. Sélectionnez son profil ci-dessous.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Rechercher l'enfant par Nom ou Identifiant CVAV :
                      </label>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Saisir le nom de famille ou l'ID (ex: CVAV-...)"
                          value={childSearch}
                          onChange={(e) => {
                            setChildSearch(e.target.value);
                            setSelectedChildId("");
                          }}
                          className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50 bg-white">
                        {eligibleChildren.length === 0 ? (
                          <div className="p-3 text-center text-gray-400 text-xs">
                            Aucun enfant trouvé. Vérifiez l'orthographe ou inscrivez le au secrétariat.
                          </div>
                        ) : (
                          eligibleChildren.map((m) => {
                            const isSelected = selectedChildId === m.id;
                            const isAlreadyEnrolled = registeringActivity.participantIds.includes(m.id);
                            
                            return (
                              <button
                                key={m.id}
                                disabled={isAlreadyEnrolled}
                                onClick={() => {
                                  setSelectedChildId(m.id);
                                  setChildSearch(`${m.nom} ${m.prenoms}`);
                                }}
                                className={`w-full p-3 text-left text-xs flex items-center justify-between transition-colors ${
                                  isAlreadyEnrolled 
                                    ? "bg-gray-50 text-gray-400 cursor-not-allowed" 
                                    : isSelected 
                                      ? "bg-[#1B2E8A]/5 text-[#1B2E8A] font-bold" 
                                      : "hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div>
                                  <span className="font-mono font-bold text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md mr-1.5">
                                    {m.id}
                                  </span>
                                  <span className="font-bold uppercase">{m.nom}</span> {m.prenoms}
                                  <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{m.grade} • Parent : {m.parentNom} ({m.parentTelephone})</span>
                                </div>
                                {isAlreadyEnrolled ? (
                                  <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold">Déjà inscrit</span>
                                ) : isSelected ? (
                                  <Check className="w-4 h-4 text-[#1B2E8A]" />
                                ) : null}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Payment method selection */}
                {paymentStep === "select_method" && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100 text-xs">
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Enfant à inscrire</p>
                        <p className="font-bold text-gray-900 uppercase">
                          {members.find(m => m.id === selectedChildId)?.nom} {members.find(m => m.id === selectedChildId)?.prenoms}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Frais de participation</p>
                        <p className="text-base font-black text-[#C62828]">{registeringActivity.price ?? 0} FCFA</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Sélectionner le mode de paiement :
                      </label>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                          onClick={() => setPaymentMethod("Wave")}
                          className={`p-3.5 border rounded-xl flex items-center gap-2.5 transition-all text-left ${
                            paymentMethod === "Wave" 
                              ? "border-[#00ACED] bg-[#00ACED]/5 font-bold" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-7 h-7 bg-[#00ACED] text-white rounded-lg flex items-center justify-center font-bold font-mono">W</div>
                          <div>
                            <p className="text-gray-900 leading-tight">Wave</p>
                            <p className="text-[10px] text-gray-400 font-normal">Sans frais</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setPaymentMethod("Orange")}
                          className={`p-3.5 border rounded-xl flex items-center gap-2.5 transition-all text-left ${
                            paymentMethod === "Orange" 
                              ? "border-orange-500 bg-orange-50 font-bold" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-7 h-7 bg-[#FF6600] text-white rounded-lg flex items-center justify-center font-bold font-mono">OM</div>
                          <div>
                            <p className="text-gray-900 leading-tight">Orange Money</p>
                            <p className="text-[10px] text-gray-400 font-normal">Instantané</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setPaymentMethod("MTN")}
                          className={`p-3.5 border rounded-xl flex items-center gap-2.5 transition-all text-left ${
                            paymentMethod === "MTN" 
                              ? "border-yellow-500 bg-yellow-50 font-bold" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-7 h-7 bg-[#FFCC00] text-blue-900 rounded-lg flex items-center justify-center font-bold font-mono">M</div>
                          <div>
                            <p className="text-gray-900 leading-tight">MTN MoMo</p>
                            <p className="text-[10px] text-gray-400 font-normal">Sécurisé</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setPaymentMethod("Espèces")}
                          className={`p-3.5 border rounded-xl flex items-center gap-2.5 transition-all text-left ${
                            paymentMethod === "Espèces" 
                              ? "border-green-600 bg-green-50 font-bold" 
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-7 h-7 bg-green-600 text-white rounded-lg flex items-center justify-center"><Coins className="w-4 h-4" /></div>
                          <div>
                            <p className="text-gray-900 leading-tight">Espèces</p>
                            <p className="text-[10px] text-gray-400 font-normal">Visa Secrétariat</p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {paymentMethod !== "Espèces" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Numéro de téléphone mobile money :
                        </label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                          <input
                            type="tel"
                            placeholder="Ex: 07 08 09 10 11"
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden font-mono font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Processing Payment */}
               {/* STEP 3: Lien de paiement */}
{paymentStep === "processing" && (() => {
  const child = members.find(m => m.id === selectedChildId);
  const price = registeringActivity?.price ?? 0;
  const description = `Inscription ${child?.nom} ${child?.prenoms} - ${registeringActivity?.title}`;
  const link = generatePaymentLink(paymentMethod, paymentPhone, price, description);
  
  return (
    <div className="space-y-5">
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-[#1B2E8A] flex items-start gap-2.5">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p className="font-medium">
          Cliquez sur le bouton ci-dessous pour ouvrir votre application {paymentMethod} et finaliser le paiement de <b>{price} FCFA</b>. 
          Une fois le paiement effectué, revenez ici et confirmez.
        </p>
      </div>

      <div className="border border-gray-100 rounded-2xl p-4 space-y-3 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Montant</span>
          <span className="font-black text-[#C62828]">{price} FCFA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Moyen</span>
          <span className="font-bold">{paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Téléphone</span>
          <span className="font-mono font-bold">{paymentPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Réf. locale</span>
          <span className="font-mono text-[10px] text-gray-400">{paymentReference}</span>
        </div>
      </div>

      {/* Bouton d'ouverture du lien */}
      <a
        href={link ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-[#1B2E8A] text-white hover:bg-[#C62828] transition"
      >
        <Smartphone className="w-4 h-4" />
        Payer {price} FCFA via {paymentMethod}
      </a>

      {paymentMethod === "Wave" && (
        <p className="text-[10px] text-gray-400 text-center">
          Vous allez être redirigé vers Wave CI pour finaliser le paiement.
        </p>
      )}
      {(paymentMethod === "Orange" || paymentMethod === "MTN") && (
  <div className="space-y-3">
    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs space-y-3">
      <p className="font-bold text-orange-800 uppercase tracking-wider text-[10px]">
        Instructions de paiement {paymentMethod === "Orange" ? "Orange Money" : "MTN MoMo"}
      </p>
      
      <ol className="space-y-2 text-orange-900 font-medium">
        <li className="flex gap-2">
          <span className="font-black">1.</span>
          <span>
            Composez{" "}
            <span className="font-mono font-black bg-orange-100 px-1.5 py-0.5 rounded">
              {paymentMethod === "Orange" ? "*144#" : "*133#"}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-black">2.</span>
          <span>Choisissez <b>Paiement marchand</b> ou <b>Transfert</b></span>
        </li>
        <li className="flex gap-2">
          <span className="font-black">3.</span>
          <span>
            Entrez le numéro CVAV :{" "}
            <span className="font-mono font-black bg-orange-100 px-1.5 py-0.5 rounded">
              {paymentMethod === "Orange" ? "07 XX XX XX XX" : "05 04 27 28 27"}
            </span>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-black">4.</span>
          <span>
            Montant :{" "}
            <span className="font-black text-[#C62828]">{registeringActivity?.price} FCFA</span>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="font-black">5.</span>
          <span>Validez avec votre code PIN</span>
        </li>
      </ol>

      <p className="text-[10px] text-orange-600 border-t border-orange-200 pt-2">
        ⚠ Gardez votre SMS de confirmation — il vous sera demandé au secrétariat.
      </p>
    </div>
  </div>
)}
    </div>
  );
})()}

                {/* STEP 4: Registration Receipt */}
                {paymentStep === "receipt" && (
                  <div className="space-y-6">
                    <div className="border-4 border-dashed border-gray-100 p-6 rounded-3xl space-y-5 bg-white shadow-3xs" id="printable-area">
                      <div className="text-center border-b border-gray-100 pb-4 space-y-1">
                        <span className="text-[9px] font-mono text-[#C62828] font-black uppercase tracking-widest">// fiche officielle d'adhésion d'activité</span>
                        <h4 className="text-lg font-serif font-black text-gray-900 leading-tight">CVAV ST JEAN-PAUL II ANGRÉ</h4>
                        <p className="text-[10px] text-gray-400">Reçu d'inscription officiel du participant</p>
                        {paymentReference && (
                          <p className="text-[9px] text-green-600 font-mono">Réf. Génius Pay: {paymentReference}</p>
                        )}
                      </div>

                      {(() => {
                        const child = members.find(m => m.id === selectedChildId);
                        const price = registeringActivity.price ?? 0;
                        const isCash = paymentMethod === "Espèces";
                        
                        return (
                          <div className="space-y-4 text-xs font-mono">
                            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Activité :</span>
                                <span className="text-gray-900 font-bold">{registeringActivity.title}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Date Activité :</span>
                                <span className="text-gray-900 font-bold">{registeringActivity.date}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Enfant Inscrit :</span>
                                <span className="text-gray-900 font-bold uppercase">{child?.nom} {child?.prenoms}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">ID Unique :</span>
                                <span className="text-gray-900 font-bold text-blue-700">{child?.id}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Frais :</span>
                                <span className="text-gray-900 font-bold">{price} FCFA</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Statut :</span>
                                <span className={`font-bold uppercase ${isCash ? "text-orange-600" : "text-green-600"}`}>
                                  {isCash ? "🔴 En attente (espèces)" : "🟢 Payé"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Moyen :</span>
                                <span className="text-gray-900 font-bold">{paymentMethod}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[9px] font-bold uppercase">Date :</span>
                                <span className="text-gray-900 font-bold">{new Date().toISOString().split('T')[0]}</span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex flex-col items-center gap-2">
                              <QrCode className="w-16 h-16 text-gray-800" />
                              <span className="text-[9px] text-gray-400">ID-TX-{Date.now().toString().slice(-8)}</span>
                            </div>

                            {isCash && (
                              <p className="text-[10.5px] text-orange-600 text-center leading-normal border border-orange-100 bg-orange-50/50 p-2.5 rounded-xl font-sans font-medium">
                                ⚠ <b>À SAVOIR :</b> Veuillez vous rendre au secrétariat avec la somme de <b>{price} FCFA</b> pour faire valider définitivement votre ticket.
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer control buttons */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between gap-3 shrink-0">
                {paymentStep === "select_child" && (
                  <>
                    <button
                      onClick={() => setRegisteringActivity(null)}
                      className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedChildId) {
                          triggerError("Veuillez d'abord choisir un enfant.");
                          return;
                        }
                        setPaymentStep("select_method");
                      }}
                      disabled={!selectedChildId}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer ${
                        selectedChildId 
                          ? "bg-[#1B2E8A] hover:bg-[#C62828] text-white" 
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Étape suivante
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {paymentStep === "select_method" && (
                  <>
                    <button
                      onClick={() => setPaymentStep("select_child")}
                      className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={isProcessingPayment}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer ${
                        isProcessingPayment
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Traitement...
                        </>
                      ) : (
                        <>
                          Confirmer l'inscription
                          <Check className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                )}

                {paymentStep === "processing" && (
  <>
    <button
      onClick={() => setPaymentStep("select_method")}
      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold"
    >
      Retour
    </button>
    <button
      onClick={() => completeRegistrationAndSave("pending")}
      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
    >
      J'ai payé, confirmer l'inscription
      <Check className="w-4 h-4" />
    </button>
  </>
)}

                {paymentStep === "receipt" && (
                  <>
                    <button
                      onClick={handlePrintReceipt}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Imprimer le reçu
                    </button>
                    <button
                      onClick={() => setRegisteringActivity(null)}
                      className="px-5 py-2 bg-[#1B2E8A] hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Terminer
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}