"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft, Sparkles, Eye } from "lucide-react";
import Link from "next/link";

interface GallerySlide {
  id: number;
  src: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
}

const SLIDES: GallerySlide[] = [
  {
    id: 1,
    src: "/gallery/extra-1.jpeg",
    titleAr: "لقاءات قيادة وكوادر حزب المحافظين",
    titleEn: "JCP Leadership & Cadres Meeting",
    categoryAr: "فعاليات حزبية",
    categoryEn: "Party Activities",
  },
  {
    id: 2,
    src: "/gallery/extra-2.jpeg",
    titleAr: "جلسات الحوار والتثقيف السياسي والبرامجي",
    titleEn: "Political & Policy Dialogues",
    categoryAr: "ندوات فكرية",
    categoryEn: "Symposiums",
  },
  {
    id: 3,
    src: "/gallery/extra-3.jpeg",
    titleAr: "ورشات العمل والتدريب التفاعلي للأكاديمية",
    titleEn: "Academy Interactive Workshops",
    categoryAr: "التدريب والتأهيل",
    categoryEn: "Training Sessions",
  },
  {
    id: 4,
    src: "/gallery/extra-4.jpeg",
    titleAr: "بناء قادة المستقبل والمشاركة الوطنية الفاعلة",
    titleEn: "Building Future Leaders",
    categoryAr: "تمكين الشباب",
    categoryEn: "Youth Empowerment",
  },
  {
    id: 5,
    src: "/gallery/extra-6.jpeg",
    titleAr: "تخريج وتكريم الدفعات والبرامج المعتمدة",
    titleEn: "Graduation & Recognition Ceremony",
    categoryAr: "تكريم الإنجاز",
    categoryEn: "Achievements",
  },
  {
    id: 6,
    src: "/gallery/extra-8.jpeg",
    titleAr: "المؤتمرات الموسعة والعمل الميداني المنظم",
    titleEn: "Conferences & Organized Field Work",
    categoryAr: "العمل الميداني",
    categoryEn: "Fieldwork",
  },
];

export function HeroImageRotator({ isAr = true }: { isAr?: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay rotation every 3.8 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 3800);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Next preview index (the side peeking card)
  const nextIndex = (currentIndex + 1) % total;

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      isAr ? prevSlide() : nextSlide();
    } else if (diff < -45) {
      isAr ? nextSlide() : prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div 
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-jcp-gold/15 via-transparent to-white/5 rounded-3xl blur-2xl pointer-events-none -z-10"></div>

      {/* Main Stage: Center active card + Left/Side peeking card */}
      <div className="relative h-72 sm:h-84 md:h-96 w-full flex items-center overflow-hidden rounded-2xl p-2 sm:p-3 bg-white/5 backdrop-blur-md border border-white/15 shadow-2xl">
        
        {/* Active Main Card (In Focus) */}
        <div className="relative w-[78%] sm:w-[80%] h-full rounded-xl sm:rounded-2xl overflow-hidden border-2 border-jcp-gold/50 shadow-2xl z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={SLIDES[currentIndex].id}
            src={SLIDES[currentIndex].src}
            alt={isAr ? SLIDES[currentIndex].titleAr : SLIDES[currentIndex].titleEn}
            className="w-full h-full object-cover object-center animate-fadeIn"
          />

          {/* Gradients & Badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-jcp-navy/95 via-jcp-navy/30 to-transparent"></div>

          {/* Top Badge */}
          <div className="absolute top-3 right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-jcp-navy/80 backdrop-blur-md text-jcp-gold text-xs font-bold border border-jcp-gold/30 shadow-md">
              <Sparkles className="w-3 h-3 text-jcp-gold animate-spin-slow" />
              <span>{isAr ? SLIDES[currentIndex].categoryAr : SLIDES[currentIndex].categoryEn}</span>
            </span>
          </div>

          {/* Bottom Caption */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10">
            <h3 className="text-white text-base sm:text-lg font-bold font-readex line-clamp-1 drop-shadow-md">
              {isAr ? SLIDES[currentIndex].titleAr : SLIDES[currentIndex].titleEn}
            </h3>
            <p className="text-slate-300 text-xs mt-1 font-almarai flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-jcp-gold"></span>
              <span>الأكاديمية الحزبية – حزب المحافظين الأردني</span>
            </p>
          </div>
        </div>

        {/* Side Peeking Card (Slightly blurred, partially dimmed, waiting to rotate) */}
        <div 
          onClick={nextSlide}
          title={isAr ? "اضغط لعرض الصورة التالية" : "Click to view next image"}
          className="absolute -left-4 sm:-left-2 rtl:-left-4 rtl:sm:-left-2 ltr:-right-4 ltr:sm:-right-2 w-[42%] sm:w-[38%] h-[82%] sm:h-[85%] rounded-xl overflow-hidden border border-white/20 shadow-xl z-10 cursor-pointer transform scale-90 opacity-60 hover:opacity-85 hover:scale-95 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] filter blur-[1.2px] hover:blur-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={SLIDES[nextIndex].id}
            src={SLIDES[nextIndex].src}
            alt={isAr ? SLIDES[nextIndex].titleAr : SLIDES[nextIndex].titleEn}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-jcp-navy/40 hover:bg-transparent transition-colors"></div>
          
          {/* Subtle Peek Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm shadow-md">
              <Eye className="w-5 h-5 text-jcp-gold" />
            </span>
          </div>
        </div>

      </div>

      {/* Navigation & Controls Bar */}
      <div className="mt-3 flex items-center justify-between px-2">
        {/* Indicators / Dots */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-7 bg-jcp-gold shadow-sm"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Counter and Gallery Link */}
        <div className="flex items-center gap-3">
          <Link
            href="/news-gallery?tab=gallery"
            className="text-xs font-almarai font-bold text-jcp-gold hover:text-white transition-colors"
          >
            <span>{isAr ? "معرض الصور الكامل ←" : "Full Gallery →"}</span>
          </Link>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-1.5 rtl:flex-row-reverse">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
