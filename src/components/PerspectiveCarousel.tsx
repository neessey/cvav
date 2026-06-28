import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface CardItem {
  type: string;
  url: string;

}

const BASE_CARDS: CardItem[] = [
  {
    type: "image",
    url: "/assets/home1.jpg",
 
  },
  {
    type: "image",
    url: "/assets/home2.JPEG",
   
  },
  {
    type: "image",
    url: "/assets/home3.JPG",
   
  },
  {
    type: "image",
    url: "/assets/home4.JPG",
    
  },
  {
    type: "image",
    url: "/assets/home5.JPG",
    
  },
  {
    type: "image",
    url: "/assets/home6.PNG",
    
  }
];

// We triple the base list to enable a smooth, infinite sliding loop
const ITEMS_COUNT = BASE_CARDS.length;
const INFINITE_CARDS = [...BASE_CARDS, ...BASE_CARDS, ...BASE_CARDS];
const START_INDEX = ITEMS_COUNT; // point to the start of the middle set

export default function PerspectiveCarousel() {
  const [currentIndex, setCurrentIndex] = useState(START_INDEX);
  const [isPlaying, setIsPlaying] = useState(true);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling interval: scrolls from right to left (increases index)
  useEffect(() => {
    if (isPlaying && !isDragging) {
      autoPlayTimer.current = setInterval(() => {
        handleNext();
      }, 3500);
    }
    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    };
  }, [isPlaying, currentIndex, isDragging]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIdx = prev + 1;
      // If we go towards the end of the third set, snap back to the middle set without flashing
      if (nextIdx >= ITEMS_COUNT * 2) {
        // We delay the snap to let the transition animate first
        setTimeout(() => {
          setCurrentIndex(nextIdx - ITEMS_COUNT);
        }, 300);
      }
      return nextIdx;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const prevIdx = prev - 1;
      // If we go towards the beginning of the first set, snap back to the middle set
      if (prevIdx < ITEMS_COUNT) {
        setTimeout(() => {
          setCurrentIndex(prevIdx + ITEMS_COUNT);
        }, 300);
      }
      return prevIdx;
    });
  };

  const handleCardClick = (index: number) => {
    // If the clicked card is not the active one, center it!
    if (index !== currentIndex) {
      setCurrentIndex(index);
      // Snap adjustment if clicked near the boundaries
      if (index >= ITEMS_COUNT * 2) {
        setTimeout(() => setCurrentIndex(index - ITEMS_COUNT), 300);
      } else if (index < ITEMS_COUNT) {
        setTimeout(() => setCurrentIndex(index + ITEMS_COUNT), 300);
      }
    }
  };

  // Drag Gesture Handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const dragDistance = clientX - dragStartX;

    // Threshold of 50px for manual swipe triggers
    if (dragDistance > 55) {
      handlePrev();
    } else if (dragDistance < -55) {
      handleNext();
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden py-12 px-4 select-none"
      aria-label="Carousel de Vaillance"
    >
      
      {/* 3D Perspective Stage Wrapper */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-7xl mx-auto h-[450px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ perspective: "1200px" }}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={() => {
          setIsDragging(false);
        }}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        
        {/* Curved Track */}
        <div 
          className="relative flex items-center justify-center h-full transition-transform duration-500 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `translateX(0px)`, // Each card handles its own offset in coordinate space
          }}
        >
          {INFINITE_CARDS.map((card, idx) => {
            const offset = idx - currentIndex;
            
            // Render only cards that are within view range for maximum performance
            if (Math.abs(offset) > 4) return null;

            // Mathematical curve variables to mimic the reference image:
            // 1. rotateY: Left cards rotate right (+Y), Right cards rotate left (-Y), facing the center.
            let rotateY = -offset * 14;
            // Cap the rotation to prevent clipping and keep the gorgeous clean concave path
            rotateY = Math.min(32, Math.max(-32, rotateY));

            // 2. scale: Shrinks nicely as they drift outwards
            const scale = Math.max(0.72, 1 - Math.abs(offset) * 0.09);

            // 3. translateZ: Drifts backward as cards go left/right, contributing to depth
            const translateZ = -Math.abs(offset) * 75;

            // 4. translateY: Lift sides of the cards UPWARDS slowly, rendering a smooth parabolic crown (Concave Smile)
            const translateY = -Math.pow(offset, 2) * 6;

            // 5. translateX: Pull outer columns closer to center to intensify the curved ribbon overlaps
            const translateX = offset * 230 - (offset !== 0 ? Math.sign(offset) * Math.pow(Math.abs(offset), 1.2) * 14 : 0);

            // 6. opacity: Fade out far extremes to give studio spotlight focus
            const opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.22);
            
            const isCenter = offset === 0;

            return (
              <motion.div
                key={`${idx}`}
                onClick={() => handleCardClick(idx)}
                className="absolute w-56 sm:w-64 h-[320px] sm:h-[350px] origin-center shadow-md select-none border border-black/10 bg-[#F4F8FD] flex flex-col justify-end p-5 transition-shadow duration-300"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: 20 - Math.abs(offset),
                  cursor: isCenter ? "default" : "pointer",
                }}
                animate={{
                  x: translateX,
                  y: translateY,
                  z: translateZ,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 17,
                  mass: 0.9
                }}
              >
                {/* Background media elements */}
                <div className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none overflow-hidden bg-[#EAE8E4]">
                  {card.type === "video" ? (
                    <video
                      src={card.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full  object-cover z-0 transition-all duration-700 pointer-events-none"
                    />
                  ) : (
                    <img
                      src={card.url}
                     
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-700 pointer-events-none"
                    />
                  )}
                </div>

                {/* Card Gradient Shadows */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 rounded-2xl to-transparent z-1 pointer-events-none" />

                {/* Text Content */}
                <div className="relative z-10 flex flex-col justify-end h-full select-none text-left pointer-events-none">
                  <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-1 font-mono text-[9px] text-white/50">
                    <span className="font-bold">SECTION SAINT JEAN PAUL II</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Manual Controls & Auto-play toggle row */}
      <div className="flex items-center justify-center gap-6 mt-4 relative z-20">
        
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="w-10 h-10 border border-black/10 hover:border-black rounded-full flex items-center justify-center bg-white hover:bg-black/5 text-[#111] transition-all cursor-pointer active:scale-95"
          aria-label="Carte précédente"
          data-cursor-text="précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="w-10 h-10 border border-black/10 hover:border-black rounded-full flex items-center justify-center bg-white hover:bg-black/5 text-[#111] transition-all cursor-pointer active:scale-95"
          aria-label="Carte suivante"
          data-cursor-text="suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination bullets visual mockup */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {BASE_CARDS.map((_, idx) => {
          const isCenter = (currentIndex % ITEMS_COUNT) === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                const step = idx - (currentIndex % ITEMS_COUNT);
                setCurrentIndex(currentIndex + step);
              }}
              className={`h-1.5 transition-all duration-300 cursor-pointer ${
                isCenter ? "w-6 bg-[#C62828]" : "w-1.5 bg-black/15 hover:bg-black/40"
              }`}
              aria-label={`Aller au slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
