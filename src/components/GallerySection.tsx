/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Image as ImageIcon, Filter, ZoomIn, X, Calendar, UploadCloud, Check, HelpCircle, Link as LinkIcon, Download,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { GalleryItem } from "../types";

interface GallerySectionProps {
  items: GalleryItem[];
  onUploadItem?: (item: GalleryItem) => void;
  isAdminMode?: boolean;
}

export default function GallerySection({ items, onUploadItem, isAdminMode = false }: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [selectedYear, setSelectedYear] = useState<string>("Tous");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  // States for uploading
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Activité");
  const [uploadYear, setUploadYear] = useState("2026");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic values
  const categories = ["Tous", "Activité", "Réunion", "Camp"];
  const years = ["Tous", "2026", "2025", "2024"];

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === "Tous" || item.category === selectedCategory || (item.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesYr = selectedYear === "Tous" || item.year === selectedYear;
    return matchesCat && matchesYr;
  });

  // Fonction pour gérer le téléchargement de fichier
  const handleFileUpload = (file: File) => {
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSimulatedDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSimulatedDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        alert("Veuillez déposer une image valide (JPG, PNG, etc.)");
      }
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        alert("Veuillez sélectionner une image valide");
      }
    }
  };

  const handleCreateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl || !uploadTitle) {
      alert("Veuillez renseigner un titre et choisir/fournir une image.");
      return;
    }

    let imageUrl = uploadUrl;
    if (uploadFile) {
      imageUrl = uploadUrl;
    }

    const newItem: GalleryItem = {
      id: "gal-" + Date.now(),
      url: imageUrl,
      title: uploadTitle,
      category: uploadCategory,
      year: uploadYear,
      originalFile: uploadFile ? JSON.stringify({
        size: uploadFile.size,
        type: uploadFile.type
      }) : "",
      size: 0,
      type: ""
    };

    if (onUploadItem) {
      onUploadItem(newItem);
    }

    setUploadTitle("");
    setUploadUrl("");
    setUploadFile(null);
    setIsUploading(false);
    
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleDownloadImage = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.url;
    const extension = item.url.split(';')[0].split('/').pop()?.split('.')?.pop() || 'jpg';
    const fileName = `${item.title || 'image'}.${extension}`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Navigation functions
  const goToPrevious = () => {
    if (lightboxIndex > 0) {
      const newIndex = lightboxIndex - 1;
      setLightboxIndex(newIndex);
      setLightboxItem(filteredItems[newIndex]);
    }
  };

  const goToNext = () => {
    if (lightboxIndex < filteredItems.length - 1) {
      const newIndex = lightboxIndex + 1;
      setLightboxIndex(newIndex);
      setLightboxItem(filteredItems[newIndex]);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxItem) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        setLightboxItem(null);
        setLightboxIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem, lightboxIndex, filteredItems]);

  // Ouvrir la lightbox avec l'index correct
  const openLightbox = (item: GalleryItem) => {
    const index = filteredItems.findIndex(i => i.id === item.id);
    setLightboxIndex(index);
    setLightboxItem(item);
  };

  return (
    <div className="space-y-8">
      {/* Input file caché */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-3xs">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold select-none transition-all ${
                selectedCategory === cat
                  ? "bg-[#1B2E8A] text-white shadow-3xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 font-mono font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span> :</span>
          </div>
          <div className="flex gap-1 bg-[#FAF9F6] p-1 border border-gray-200/50 rounded-xl">
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedYear === yr
                    ? "bg-white text-gray-900 shadow-2xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {isAdminMode && (
            <button
              onClick={() => setIsUploading(!isUploading)}
              className="ml-2 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              Téléverser média
            </button>
          )}
        </div>
      </div>

      {/* Upload Toast and Box */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-2 shadow-3xs text-xs"
          >
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="font-bold">Succès !</span> Média ajouté à l'album interactif.
          </motion.div>
        )}
      </AnimatePresence>

      {isUploading && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-white border-2 border-blue-100 p-6 rounded-2xl shadow-xs space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-sans font-bold text-gray-900 text-sm flex items-center gap-2">
              <UploadCloud className="w-4.5 h-4.5 text-blue-600" />
              Téléverser une Photo / Vidéo interactive dans la Galerie CV-AV
            </h3>
            <button 
              onClick={() => setIsUploading(false)}
              className="text-gray-400 hover:text-gray-600 p-1 bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateImage} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              onDragOver={handleSimulatedDragOver}
              onDrop={handleSimulatedDrop}
              onClick={handleDropZoneClick}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all space-y-3 shadow-3xs"
            >
              <UploadCloud className="w-10 h-10 text-gray-400" />
              <div className="space-y-1">
                <p className="font-bold text-gray-700">Glissez-déposez une photo ici ou cliquez pour sélectionner un fichier</p>
                <p className="text-[10px] text-gray-400">Taille max : 10 Mo • JPG, PNG, WEBP</p>
              </div>
              
              {uploadUrl && uploadFile && (
                <div className="space-y-2 w-full">
                  <div className="p-2 border border-green-100 bg-green-50 text-green-800 text-[10px] rounded-lg font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    Fichier chargé : {uploadFile.name}
                  </div>
                  <div className="relative w-full h-24 rounded-lg overflow-hidden">
                    <img 
                      src={uploadUrl} 
                      alt="Aperçu" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Titre de la photo / Activité</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Randonnée spirituelle de la rentrée"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Catégorie</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                  >
                    <option value="Activité">Activité</option>
                    <option value="Réunion">Réunion</option>
                    <option value="Camp">Camp</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Millésime / Année</label>
                  <select
                    value={uploadYear}
                    onChange={e => setUploadYear(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-center"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">Lien direct vers l'image / URL d'hébergement (optionnel)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/your-photo"
                    value={uploadUrl}
                    onChange={e => setUploadUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs transition-all inline-flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Publier l'image
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Photo feed column grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-400 font-sans border border-dashed border-gray-100 rounded-2xl">
            Aucun cliché disponible pour ces critères d'années ou d'activités.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => openLightbox(item)}
              className="bg-white rounded-xl overflow-hidden border border-gray-100/60 shadow-3xs hover:shadow-md transition-all cursor-zoom-in relative group aspect-square select-none"
            >
              <img 
                referrerPolicy="no-referrer"
                src={item.url} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      {item.category}
                    </span>
                    
                  </div>
                  <ZoomIn className="w-4 h-4 text-white shrink-0 ml-1.5" />
                </div>
              </div>

              <span className="absolute bottom-2.5 right-2.5 text-[9px] font-mono font-bold text-white bg-gray-950/55 px-1.5 py-0.5 rounded-md group-hover:opacity-0 transition-opacity">
                {item.year}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Full screen Lightbox display with navigation */}
      <AnimatePresence>
        {lightboxItem && (
          <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-black"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setLightboxItem(null);
                  setLightboxIndex(-1);
                }}
                className="absolute top-4 right-4 bg-gray-900/60 text-white p-2.5 hover:bg-gray-900 rounded-full transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Download button */}
              <button
                onClick={() => handleDownloadImage(lightboxItem)}
                className="absolute top-4 right-16 bg-gray-900/60 text-white p-2.5 hover:bg-gray-900 rounded-full transition-all z-20 flex items-center gap-2"
                title="Télécharger l'image"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium hidden sm:inline">Télécharger</span>
              </button>

              {/* Counter */}
              <div className="absolute top-4 left-4 bg-gray-900/60 text-white px-3 py-1.5 rounded-full text-xs font-medium z-20">
                {lightboxIndex + 1} / {filteredItems.length}
              </div>

              {/* Navigation buttons */}
              {lightboxIndex > 0 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/60 text-white p-3 hover:bg-gray-900 rounded-full transition-all z-20 group"
                  title="Photo précédente (←)"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              )}

              {lightboxIndex < filteredItems.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/60 text-white p-3 hover:bg-gray-900 rounded-full transition-all z-20 group"
                  title="Photo suivante (→)"
                >
                  <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
              )}

              {/* Image container */}
              <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
                <img 
                  referrerPolicy="no-referrer"
                  src={lightboxItem.url} 
                  alt={lightboxItem.title} 
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}