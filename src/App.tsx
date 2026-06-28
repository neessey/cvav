/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Calendar, Award, Newspaper, Image, Layers, HelpCircle, ArrowRight, BookOpen, Clock, 
  MapPin, CheckCircle, Shield, UserPlus, Flame, Heart, AlertCircle, Phone, Menu, X, ArrowUpRight,
  Lock
} from "lucide-react";
import { 
  Member, NewsArticle, ParishEvent, GalleryItem, Activity, MemberGrade 
} from "./types";
import { 
  INITIAL_MEMBERS, INITIAL_NEWS, INITIAL_PARISH_EVENTS, INITIAL_GALLERY, INITIAL_ACTIVITIES 
} from "./data";
import { db } from "./lib/firebase";
import { 
  collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, writeBatch 
} from "firebase/firestore";
import { uploadToCloudinary } from "./lib/upload";
// Ensure ImportMeta.env typing for Vite env vars
declare global {
  interface ImportMetaEnv {
    VITE_ADMIN_SECRET_KEY?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Minimal OperationType enum and error handler used across the file
enum OperationType {
  GET = "GET",
  WRITE = "WRITE",
  DELETE = "DELETE",
}

function handleFirestoreError(err: unknown, op: OperationType, path?: string) {
  // Minimal safe error handler: log to console for debugging
  console.error(`Firestore ${op} error${path ? ` on ${path}` : ""}:`, err);
}

// Sub components import
import WhoWeAre from "./components/WhoWeAre";
import NewsSection from "./components/NewsSection";
import GallerySection from "./components/GallerySection";
import EnrollmentModule from "./components/EnrollmentModule";
import AdminDashboard from "./components/AdminDashboard";
import PerspectiveCarousel from "./components/PerspectiveCarousel";

// Composant de protection Admin
function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Vérifier la session existante
    const session = sessionStorage.getItem('admin_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        if (data.expiry > Date.now()) {
          setIsAuthorized(true);
          return;
        }
      } catch (e) {
        // Session invalide
      }
    }

    // Vérifier le token dans l'URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('auth');
    const secretKey = import.meta.env.VITE_ADMIN_SECRET_KEY;
    
    if (token && secretKey && token === secretKey) {
      // Créer une session de 2 heures
      sessionStorage.setItem('admin_session', JSON.stringify({
        expiry: Date.now() + 2 * 60 * 60 * 1000 // 2 heures
      }));
      setIsAuthorized(true);
      
      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
    } else {
      setIsAuthorized(false);
    }
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBF3FC]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B2E8A] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EBF3FC] px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-[#C62828] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Restreint</h2>
          <p className="text-gray-500 text-sm mb-6">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#1B2E8A] text-white rounded-xl font-bold hover:bg-[#C62828] transition"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  // Navigation active tab: "home" | "who" | "news"  | "gallery" | "enroll" | "admin"
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Exquisite design cursor tracker following Felix Nieto portfolio traits
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorHovered, setCursorHovered] = useState(false);
  const [cursorText, setCursorText] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable = target.closest("a, button, select, input, [role='button'], .cursor-pointer");
      if (isHoverable) {
        setCursorHovered(true);
        const txt = isHoverable.getAttribute("data-cursor-text") || "";
        setCursorText(txt);
      } else {
        setCursorHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Unified State Engine synced in real-time with Google Firestore
  const [members, setMembers] = useState<Member[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Check URL Search query on mount/load for easy shortcuts
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      // Gérer le paramètre "tab"
      const tabParam = params.get("tab");
      if (tabParam && ["home", "who", "news", "parish", "gallery", "enroll", "admin"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      
      // Gérer le paramètre "access" pour l'admin (backward compatibility)
      const accessKey = params.get("access");
      const adminKey = import.meta.env.VITE_ADMIN_SECRET_KEY;
      if (accessKey && adminKey && accessKey === adminKey) {
        setActiveTab("admin");
        setIsAdminMode(true);
        // Nettoyer l'URL
        const url = new URL(window.location.href);
        url.searchParams.delete("access");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  // Real-time Firestore synchronization and background seeding check
  useEffect(() => {
    const syncCollection = async <T extends { id: string }>(
      colName: string,
      initialData: T[],
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const colRef = collection(db, colName);
      try {
        const snap = await getDocs(colRef);
        if (snap.empty) {
          console.log(`Firestore collection '${colName}' is empty. Seeding...`);
          const batch = writeBatch(db);
          initialData.forEach((item) => {
            const docRef = doc(db, colName, item.id);
            batch.set(docRef, item);
          });
          await batch.commit();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, colName);
      }

      return onSnapshot(colRef, (snapshot) => {
        const loaded: T[] = [];
        snapshot.forEach((docDoc) => {
          loaded.push(docDoc.data() as T);
        });
        setter(loaded);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, colName);
      });
    };

    let unsubMembers: (() => void) | undefined;
    let unsubNews: (() => void) | undefined;
    let unsubGallery: (() => void) | undefined;
    let unsubActivities: (() => void) | undefined;

    const initAll = async () => {
      unsubMembers = await syncCollection("cvav_members", INITIAL_MEMBERS, setMembers);
      unsubNews = await syncCollection("cvav_news", INITIAL_NEWS, setNews);
      unsubGallery = await syncCollection("cvav_gallery", INITIAL_GALLERY, setGalleryItems);
      unsubActivities = await syncCollection("cvav_activities", INITIAL_ACTIVITIES, setActivities);
    };

    initAll();

    return () => {
      if (unsubMembers) unsubMembers();
      if (unsubNews) unsubNews();
      if (unsubGallery) unsubGallery();
      if (unsubActivities) unsubActivities();
    };
  }, []);

  // 1-Click Enrollment Modal State for activities
  const [registrationActivity, setRegistrationActivity] = useState<Activity | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [oneClickProgressMsg, setOneClickProgressMsg] = useState<string | null>(null);

  // STATE MODIFIERS (performing real-time async writes to Cloud Firestore)
  const handleRegisterMember = async (newMember: Member) => {
    try {
      await setDoc(doc(db, "cvav_members", newMember.id), newMember);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_members/${newMember.id}`);
    }
  };

  const handleApproveMember = async (id: string) => {
    try {
      const match = members.find(m => m.id === id);
      if (match) {
        await setDoc(doc(db, "cvav_members", id), { ...match, status: "Actif" as const });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_members/${id}`);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "cvav_members", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cvav_members/${id}`);
    }
  };

  const handleUpdateMember = async (updated: Member) => {
    try {
      await setDoc(doc(db, "cvav_members", updated.id), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_members/${updated.id}`);
    }
  };

  // Actus/News
  const handleCreateArticle = async (art: NewsArticle) => {
    try {
      await setDoc(doc(db, "cvav_news", art.id), art);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_news/${art.id}`);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, "cvav_news", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cvav_news/${id}`);
    }
  };


  // Gallery
  const handleUploadItem = async (item: GalleryItem) => {
    try {
 const cloudinaryUrl = await uploadToCloudinary(item.url);
      const updatedItem = { ...item, url: cloudinaryUrl };
      await setDoc(doc(db, "cvav_gallery", item.id), updatedItem);    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_gallery/${item.id}`);
    }
  };

  // Activities Agenda
  const handleAddActivity = async (act: Activity) => {
    try {
      await setDoc(doc(db, "cvav_activities", act.id), act);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_activities/${act.id}`);
    }
  };

  const handleToggleActivityStatus = async (id: string) => {
    try {
      const match = activities.find(a => a.id === id);
      if (match) {
        await setDoc(doc(db, "cvav_activities", id), { ...match, isOpen: !match.isOpen });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `cvav_activities/${id}`);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      await deleteDoc(doc(db, "cvav_activities", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `cvav_activities/${id}`);
    }
  };

  const handleUpdateActivity = async (act: Activity) => {
  try {
    await setDoc(doc(db, "cvav_activities", act.id), act);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `cvav_activities/${act.id}`);
  }
};
const handleDeleteGalleryItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, "cvav_gallery", id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `cvav_gallery/${id}`);
  }
};
  const handleOneClickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationActivity || !selectedChildId) return;

    // Check if member already in activity participants list
    if (registrationActivity.participantIds.includes(selectedChildId)) {
      alert("Cet enfant est déjà inscrit à cette activité.");
      setRegistrationActivity(null);
      return;
    }

    setOneClickProgressMsg("Génération de l'inscription et synchronisation...");

    try {
      const updatedActivity = {
        ...registrationActivity,
        participantsCount: registrationActivity.participantsCount + 1,
        participantIds: [...registrationActivity.participantIds, selectedChildId]
      };
      await setDoc(doc(db, "cvav_activities", registrationActivity.id), updatedActivity);
      
      setOneClickProgressMsg(null);
      setRegistrationActivity(null);
      setSelectedChildId("");
      alert("L'enfant a été inscrit de manière instantanée ! Retrouvez le sur la liste d'appel de l'animateur.");
    } catch (err) {
      setOneClickProgressMsg(null);
      handleFirestoreError(err, OperationType.WRITE, `cvav_activities/${registrationActivity.id}`);
    }
  };

  // APP GENERAL LAYOUT RENDER
  return (
    <div className="min-h-screen bg-[#EBF3FC] text-[#1E1E20] flex flex-col font-sans selection:bg-[#C62828] selection:text-white relative">
      
      {/* Noise Overlay for tangible retro film paper simulation */}
      <div className="noise-overlay" />

      {/* EXQUISITE INTERACTIVE CURSOR FOLLOWER IN THE STYLE OF FELIX NIETO */}
      {typeof window !== "undefined" && (
        <motion.div
          className="hidden md:flex fixed top-0 left-0 pointer-events-none z-50 items-center justify-center rounded-full border border-[#1B2E8A]/30 bg-white/10 backdrop-blur-[2px]"
          animate={{
            x: mousePos.x - (cursorHovered ? 28 : 8),
            y: mousePos.y - (cursorHovered ? 28 : 8),
            width: cursorHovered ? 56 : 16,
            height: cursorHovered ? 56 : 16,
            borderColor: cursorHovered ? "#C62828" : "#1B2E8A",
            backgroundColor: cursorHovered ? "rgba(198, 40, 40, 0.05)" : "rgba(27, 46, 138, 0.02)"
          }}
          transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
        >
          {cursorHovered && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 bg-[#C62828] rounded-full"
            />
          )}
        </motion.div>
      )}

    

      {/* HEADER MASTER DIVISION PORTRAYING A MUSEUM/AGENCY HEADER GRID CELL */}
      <header className="sticky top-0 z-40 bg-[#EBF3FC]/90 backdrop-blur-md border-b border-black/5 select-none transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Elegant Serif Logo area in Felix style */}
           <div
  onClick={() => setActiveTab("home")}
  className="flex items-center gap-3.5 cursor-pointer shrink-0 group"
  data-cursor-text="accueil"
>
  <div className="w-16 h-16 rounded-full border border-black/10 bg-[#F4F8FD] flex items-center justify-center transition-all duration-500 shadow-3xs overflow-hidden">
    <img
      src="/assets/logo.png"
      alt="logo-SJP2"
      className="w-full h-full object-cover rounded-full"
    />
  </div>
</div>
            {/* Desktop Navigation links - split by thin editorial borders */}
            <nav className="hidden lg:flex items-center h-20 border-l border-r border-black/5">
              {[
                { id: "home", label: "accueil" },
                { id: "who", label: "notre identité" },
                { id: "news", label: "programmes" },
                { id: "gallery", label: "galerie" },
              ].map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-full px-6 font-display text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border-r border-black/5 cursor-pointer hover:bg-black/2 relative ${
                      isActive 
                        ? "bg-black/5 text-[#C62828] font-black" 
                        : "text-black/60 hover:text-black"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTabUnder" 
                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#C62828]" 
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Action CTA & mobile toggle toggler */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("enroll")}
                className="hidden sm:inline-flex items-center gap-1.5 px-5 py-3 bg-[#1B2E8A] hover:bg-[#C62828] text-white text-[10px] font-bold uppercase tracking-widest rounded-none border border-black/10 transition-all duration-300 cursor-pointer shadow-xs active:scale-95"
                data-cursor-text="inscription"
              >
                inscrire un enfant
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-none border border-black/5 bg-white/50 hover:bg-gray-100 text-gray-800 transition"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panel drawer overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-black/5 bg-[#F6F5F2] text-xs"
            >
              <div className="px-4 pt-2 pb-6 space-y-1 uppercase font-bold tracking-widest text-black">
                {[
                  { id: "home", label: " accueil" },
                  { id: "who", label: "notre identité" },
                  { id: "news", label: "programmes" },
                  { id: "gallery", label: "galerie" },
                  { id: "enroll", label: "inscrire un enfant" },
                ].map((mTab) => (
                  <button
                    key={mTab.id}
                    onClick={() => {
                      setActiveTab(mTab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left p-3.5 rounded-none border-b border-black/5 transition-all duration-200 uppercase tracking-widest text-[10px] font-bold ${
                      activeTab === mTab.id ? "bg-[#1B2E8A] text-white" : "hover:bg-black/5 text-black/70"
                    }`}
                  >
                    {mTab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* RENDER CURRENT TAB SECTION */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="focus:outline-hidden"
          >
            
            {/* 1. HOME DASHBOARD TAB VIEW */}
            {activeTab === "home" && (
              <div className="space-y-16 relative">
                
                {/* Architectural Vertical Grid Lines (Felix Nieto design framework styling signature) */}
                <div className="absolute inset-y-0 left-0 right-0 pointer-events-none z-0 hidden lg:flex justify-between select-none">
                  <div className="w-[1px] h-full bg-black/[0.04]" />
                  <div className="w-[1px] h-full bg-black/[0.04]" />
                  <div className="w-[1px] h-full bg-black/[0.04]" />
                  <div className="w-[1px] h-full bg-black/[0.04]" />
                </div>

                {/* THE ICONIC SWISS AGENCY HERO BANNER */}
                <div id="hero-interactive" className="relative select-none overflow-hidden bg-transparent pt-12 pb-16 flex flex-col items-center z-10">
                  
                  {/* UPPER GLIDING CONTINUOUS MARQUEE BACKGROUND TICKER */}
                  <div className="w-full overflow-hidden bg-transparent py-4 border-t border-b border-black/8 select-none relative z-0 mb-12">
                    <div className="flex gap-2 whitespace-nowrap animate-marquee font-display font-bold tracking-widest text-black/5 text-4xl md:text-6xl leading-none uppercase select-none">
                      <span> A cœur vaillant rien d’impossible • joix • vaillance • charité •&nbsp;</span>
                      <span> A cœur vaillant rien d’impossible • joix • vaillance • charité •&nbsp;</span>
                    </div>
                  </div>

                  {/* DISPLAY TITLE & COPYWRITING COMPONENT IN THE STYLE OF FELIX-NIETO.COM */}
                  <div className="text-center space-y-6 max-w-5xl mx-auto px-4 relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.03] text-black text-[9px] font-mono tracking-widest uppercase font-bold border border-black/5">
                      <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                     Paroisse Saint Jean Paul II
                    </span>
                    
                    <h2 className="leading-none tracking-tight select-none pt-4">
                      <span className="font-serif italic font-light lowercase text-5xl sm:text-7xl md:text-9xl block text-[#C62828] leading-none mb-1">
                        au cvav
                      </span>
                      <span className="font-display font-black text-4xl sm:text-6xl md:text-8xl tracking-tight uppercase block text-black/90">
TOUS UNIS TOUS FRERE 
                      </span>
                    </h2>
                    
                    <p className="text-black/70 font-sans text-xs sm:text-sm md:text-base max-w-3xl mx-auto leading-relaxed pt-2 font-medium">
Ici à Jean Paul II, la vie se construit ensemble, comme une famille.  
  On apprend à se connaître, à se respecter et à grandir dans la fraternité.  
  C’est ce milieu de vie qui forge les valeurs, le caractère et le sens du partage.       
               </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                      <button
                        onClick={() => setActiveTab("enroll")}
                        className="px-8 py-4.5 bg-[#C62828] hover:bg-[#1B2E8A] text-white font-black text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-md active:scale-95 border border-transparent hover:border-white/10"
                        data-cursor-text="c'est parti !"
                      >
                        Inscrire mon enfant
                      </button>
                      <button
                        onClick={() => setActiveTab("who")}
                        className="px-8 py-4.5 bg-transparent hover:bg-[#1B2E8A]/10 text-black font-bold text-xs uppercase tracking-widest border border-black/10 transition-all duration-300"
                        data-cursor-text="découvrir"
                      >
                        Notre Identité
                      </button>
                    </div>
                  </div>

                  {/* FLOWING CAROUSEL RIBBON OF SLIDING TILTED GALLERY CARDS (IMAGES & VIDEOS) */}
                  <PerspectiveCarousel />

                </div>

                </div>
            )}

            {/* 2. QUI SOMMES NOUS ? */}
            {activeTab === "who" && <WhoWeAre />}

            {/* 3. ACTUALITES SECTION */}
           {activeTab === "news" && (
  <NewsSection
    activities={activities}
    members={members}
    onUpdateActivity={handleUpdateActivity}
  />
)}

            {/* 4. DIVERS PAROISSE NOTES */}
           

            {/* 5. GALLERY SECTION */}
            {activeTab === "gallery" && (
              <GallerySection
                items={galleryItems}
                onUploadItem={handleUploadItem}
              />
            )}

            {/* 6. ENROLLMENT MODULE (CORE) */}
            {activeTab === "enroll" && (
              <EnrollmentModule
                onRegisterMember={handleRegisterMember}
                appUrl=""
              />
            )}

{/* 7. ADMIN DASHBOARD PRO - AVEC PROTECTION */}
{activeTab === "admin" && (
  <AdminGuard>
    <AdminDashboard
      members={members}
      activities={activities}
      galleryItems={galleryItems} 
      onApproveMember={handleApproveMember}
      onDeleteMember={handleDeleteMember}
      onUpdateMember={handleUpdateMember}
      onAddActivity={handleAddActivity}
      onToggleActivityStatus={handleToggleActivityStatus}
      onDeleteActivity={handleDeleteActivity}
      onUpdateActivity={handleUpdateActivity}
      onUploadGalleryItem={handleUploadItem} 
      onDeleteGalleryItem={handleDeleteGalleryItem}
    />
  </AdminGuard>
)}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 1-CLICK ACTIVITY MEMBER SIGNUP ASSISTANT MODAL */}
      <AnimatePresence>
        {registrationActivity && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-gray-100 text-left select-none relative"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-sans font-extrabold text-sm text-gray-900">
                  Inscription Instantanée Activité
                </h3>
                <button onClick={() => setRegistrationActivity(null)} className="p-1 bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-1 bg-blue-50/50 p-3.5 rounded-xl border border-blue-50 text-xs">
                <p className="font-bold text-[#1B2E8A]">{registrationActivity.title}</p>
                <div className="flex gap-4 text-[10.5px] font-mono text-gray-500 font-semibold pt-1">
                  <span>📅 {registrationActivity.date}</span>
                  <span>📍 {registrationActivity.location}</span>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">
                  ⚠️ Aucun membre rattaché à cette section n'est enregistré. Veuillez inscrire votre enfant d'abord.
                </div>
              ) : (
                <form onSubmit={handleOneClickRegisterSubmit} className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Sélectionnez votre enfant <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={selectedChildId}
                      onChange={e => setSelectedChildId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-hidden cursor-pointer"
                    >
                      <option value="">-- Sélectionnez l'enfant --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          [{m.id}] {m.nom.toUpperCase()} {m.prenoms} ({m.grade})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Si votre enfant n'apparaît pas, veuillez utiliser le module parent d'Adhésion Numérique.
                    </p>
                  </div>

                  {oneClickProgressMsg && (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] rounded-lg animate-pulse font-bold">
                      {oneClickProgressMsg}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegistrationActivity(null)}
                      className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 bg-[#1B2E8A] hover:bg-[#00ACED] text-white text-xs font-extrabold rounded-xl transition tracking-wide shadow-xs"
                      disabled={!selectedChildId}
                    >
                      Confirmer Inscription
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER MASTER CANVAS */}
    <footer className="relative bg-[#0E0E0E] overflow-hidden text-white">

  {/* Texture */}
  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:28px_28px]" />

  <div className="relative max-w-7xl mx-auto px-6 py-20">

    {/* Top */}
    <div className="grid lg:grid-cols-3 gap-16 pb-16 border-b border-white/10">

      {/* Identité */}
      <div className="space-y-6">

        <img
          src="/assets/logo.png"
          className="w-20 h-20 object-contain"
          alt=""
        />

        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C62828] font-bold">
            Mouvement d'action catholique
          </p>

          <h2 className="font-serif text-4xl italic leading-none mt-4">
            Cœurs Vaillants<br />
            Âmes Vaillantes
          </h2>

          <p className="mt-6 text-sm text-white/60 leading-relaxed max-w-sm">
            Section Saint Jean-Paul II – Angré 8ème tranche.
           <br />Aider les enfants a vivre pus Chrétiennement dans leur milieu de vie.
          </p>
        </div>

      </div>

      {/* Citation */}
      <div className="flex flex-col justify-center">

        <div className="space-y-10">

          <div>
            <p className="uppercase tracking-[0.3em] text-[10px] text-white/40">
              devise
            </p>

            <h3 className="font-serif italic text-3xl leading-relaxed">
              À cœur vaillant,
              <br />rien d'impossible. 
               <br />Joix, Vaillance, Charité.
            </h3>
          </div>

          <div>
            <h3 className="font-serif italic text-3xl leading-relaxed">
             
            </h3>
          </div>

        </div>

      </div>

      {/* Infos */}
      <div className="space-y-8">

        <div>
          <p className="uppercase tracking-[0.3em] text-[10px] text-[#C62828]">
            rassemblements
          </p>

          <div className="mt-4 space-y-4 text-sm text-white/70">

            <div>
              <p className="text-white">Lieu</p>
              <p>Paroisse Saint Jean-Paul II, Angré 8ème tranche</p>
            </div>

            <div>
              <p className="text-white">Horaires</p>
              <p>Tous les samedis • 16h30 - 18h00</p>
            </div>

            <div>
              <p className="text-white">Encadrement</p>
              <p>Accompagnateur et Aspirant Accompagnateur.</p>
            </div>

          </div>
        </div>

        <div>

          <p className="uppercase tracking-[0.3em] text-[10px] text-[#C62828]">
            contact
          </p>

          <div className="mt-4 space-y-2 text-sm">

            <p className="font-medium">
              +225 07 48 92 10 32
            </p>

            <p className="text-white/50">
              Archidiocèse d'Abidjan • Côte d'Ivoire
            </p>

          </div>

        </div>

      </div>

    </div>

    {/* Centre */}
    <div className="py-20 text-center">

      <div className="w-20 h-[1px] bg-[#C62828] mx-auto mb-10" />

      <p className="uppercase tracking-[0.7em] text-[10px] text-white/40 mb-8">
        saint jean-paul ii
      </p>

      <h1 className="font-serif italic text-5xl md:text-7xl leading-none">
        Voir.<br />
        Juger.<br />
        Agir.<br />
        Evaluer.<br />
        Célébrer.
      </h1>

    </div>

    {/* Bottom */}
    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/30">

      <p>
        © 2026 Cœurs Vaillants & Âmes Vaillantes • Saint Jean-Paul II
      </p>

      <p>
        Archidiocèse d'Abidjan • Doyenné Mgr Blaise Anoh
      </p>

    </div>

  </div>

</footer>

    </div>
  );
}
