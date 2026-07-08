"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ShowcaseGalleryProps {
  images: string[];
  projectTitle: string;
}

export default function ShowcaseGallery({ images, projectTitle }: ShowcaseGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const showPrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev! - 1));
  }, [selectedIndex, images.length]);

  const showNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev! + 1));
  }, [selectedIndex, images.length]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, showPrev, showNext]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedIndex]);

  return (
    <>
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full mt-8 pb-24">
        {images.map((imgUrl: string, index: number) => (
          <div 
            key={index} 
            onClick={() => openLightbox(index)}
            className="group cursor-pointer relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-darkbrown/10 bg-darkbrown/5 transition-all duration-300 hover:-translate-y-1"
          >
            <Image 
              src={imgUrl} 
              alt={`${projectTitle} screenshot ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={true}
              priority={index < 4} // prioritize first few images
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-darkbrown/90 backdrop-blur-md p-4 sm:p-8"
            onClick={closeLightbox}
          >
            <div className="relative w-full h-full max-w-6xl max-h-screen flex items-center justify-center" onClick={e => e.stopPropagation()}>
              {/* Close Button */}
              <button 
                onClick={closeLightbox}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-cream/70 hover:text-rust transition-colors z-[110] p-2 bg-darkbrown/50 rounded-full"
                aria-label="Close"
              >
                <X size={28} />
              </button>

              {/* Prev Button */}
              {images.length > 1 && (
                <button 
                  onClick={showPrev}
                  className="absolute left-2 md:left-8 text-cream/70 hover:text-rust transition-colors z-[110] p-2 bg-darkbrown/50 rounded-full"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={36} />
                </button>
              )}

              {/* Main Image */}
              <div className="relative w-full h-[85vh]">
                <Image 
                  src={images[selectedIndex]} 
                  alt={`${projectTitle} screenshot ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  unoptimized={true}
                  priority
                />
              </div>

              {/* Next Button */}
              {images.length > 1 && (
                <button 
                  onClick={showNext}
                  className="absolute right-2 md:right-8 text-cream/70 hover:text-rust transition-colors z-[110] p-2 bg-darkbrown/50 rounded-full"
                  aria-label="Next image"
                >
                  <ChevronRight size={36} />
                </button>
              )}
              
              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-cream/70 font-mono text-sm tracking-widest bg-darkbrown/50 px-4 py-1.5 rounded-full z-[110]">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
