"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { galleryData } from "@/data/gallery";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

export default function GalleryPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const t = {
    title: isAr ? "معرض الصور" : "Photo Gallery",
    intro: isAr ? "توثيق بصري لأنشطة وفعاليات الأكاديمية" : "Visual documentation of Academy activities and events",
    close: isAr ? "إغلاق" : "Close",
    next: isAr ? "التالي" : "Next",
    prev: isAr ? "السابق" : "Previous",
  };

  const handleNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev !== null && prev < galleryData.length - 1 ? prev + 1 : 0));
    }
  }, [selectedIndex]);

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryData.length - 1));
    }
  }, [selectedIndex]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") {
        if (isAr) handlePrev(); else handleNext();
      }
      if (e.key === "ArrowLeft") {
        if (isAr) handleNext(); else handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev, handleClose, isAr]);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 lg:py-24 transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-jcp-navy dark:text-white mb-6 font-readex">
            {t.title}
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-almarai leading-relaxed max-w-3xl mx-auto py-2">
            {t.intro}
          </p>
        </header>

        {/* Masonry-like Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {galleryData.map((asset, index) => {
            const altText = isAr ? asset.alt : (asset.altEn || asset.alt);
            
            // Assign varying aspect ratios to create an editorial feel
            // 0: square, 1: 4/3, 2: video, 3: video, 4: 4/3, 5: square
            const aspectClass = 
              index % 6 === 0 ? "aspect-square" :
              index % 6 === 1 ? "aspect-[4/3]" :
              index % 6 === 2 ? "aspect-video md:col-span-2 lg:col-span-1" :
              index % 6 === 3 ? "aspect-video" :
              index % 6 === 4 ? "aspect-[4/3] md:col-span-2 lg:col-span-1" :
              "aspect-square";

            return (
              <button
                key={asset.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-full ${aspectClass} overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-jcp-navy/50 dark:focus:ring-white/50 group`}
                aria-label={altText}
              >
                <Image
                  src={asset.src}
                  alt={altText}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 end-4 md:top-8 md:end-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white z-50"
              aria-label={t.close}
            >
              <X size={24} />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute rtl:right-4 ltr:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white z-50 hidden md:block"
              aria-label={t.prev}
            >
              {isAr ? <ChevronRight size={32} /> : <ChevronLeft size={32} />}
            </button>
            
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute rtl:left-4 ltr:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white z-50 hidden md:block"
              aria-label={t.next}
            >
              {isAr ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
            </button>

            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full">
                <Image
                  src={galleryData[selectedIndex].src}
                  alt={isAr ? galleryData[selectedIndex].alt : (galleryData[selectedIndex].altEn || galleryData[selectedIndex].alt)}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
