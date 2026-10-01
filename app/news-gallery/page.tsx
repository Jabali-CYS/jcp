"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { galleryData } from "@/data/gallery";
import { newsData, NewsItem } from "@/data/news";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Image as ImageIcon, Calendar, Tag, ChevronRight, ChevronLeft, X, ArrowLeft, Film } from "lucide-react";
import { PartyVideoPlayer } from "@/components/PartyVideoPlayer";

function NewsGalleryContent() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'news' | 'gallery'>(tabParam === 'gallery' ? 'gallery' : 'news');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (tabParam === 'gallery' || tabParam === 'news') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const switchTab = (tab: 'news' | 'gallery') => {
    setActiveTab(tab);
    router.replace(`/news-gallery?tab=${tab}`, { scroll: false });
  };

  const handleNextPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev !== null && prev < galleryData.length - 1 ? prev + 1 : 0));
    }
  }, [selectedPhotoIndex]);

  const handlePrevPhoto = useCallback(() => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryData.length - 1));
    }
  }, [selectedPhotoIndex]);

  const handleClosePhoto = useCallback(() => {
    setSelectedPhotoIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (selectedPhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClosePhoto();
      if (e.key === "ArrowRight") {
        if (isAr) handlePrevPhoto(); else handleNextPhoto();
      }
      if (e.key === "ArrowLeft") {
        if (isAr) handleNextPhoto(); else handlePrevPhoto();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, handleNextPhoto, handlePrevPhoto, handleClosePhoto, isAr]);

  return (
    <div className="min-h-screen pt-32 pb-24 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold font-cairo">
            <Newspaper className="w-4 h-4" />
            <span>{isAr ? "المركز الإعلامي والتوثيقي" : "Media & Documentation Center"}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-jcp-navy dark:text-white font-kufi">
            {isAr ? "الأخبار والمعرض" : "News & Gallery"}
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-cairo max-w-2xl mx-auto">
            {isAr 
              ? "متابعة أحدث أخبار الأكاديمية وفعاليات حزب المحافظين الأردني وتوثيقها بالصوت والصورة." 
              : "Follow the latest news and activities of the JCP Academy and party events."}
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center pt-4">
            <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm font-cairo text-sm font-bold">
              <button
                onClick={() => switchTab('news')}
                className={`flex items-center gap-2 py-2.5 px-6 rounded-xl transition-all ${
                  activeTab === 'news'
                    ? 'bg-jcp-navy text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-jcp-navy dark:hover:text-white'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                <span>{isAr ? "الأخبار الصحفية" : "News"}</span>
              </button>

              <button
                onClick={() => switchTab('gallery')}
                className={`flex items-center gap-2 py-2.5 px-6 rounded-xl transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-jcp-navy text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-jcp-navy dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isAr ? "معرض الصور" : "Photo Gallery"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tab 1: News */}
        {activeTab === 'news' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            className={`grid gap-8 ${newsData.length === 1 ? 'max-w-2xl mx-auto w-full' : 'grid-cols-1 md:grid-cols-2'}`}
          >
            {newsData.map((item) => (
              <article 
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col group"
              >
                {item.image && (
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-jcp-navy/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold font-cairo flex items-center gap-1.5 shadow-md">
                      <Tag className="w-3 h-3 text-jcp-gold" />
                      <span>{isAr ? item.category : (item.categoryEn || item.category)}</span>
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-cairo">
                      <Calendar className="w-3.5 h-3.5 text-jcp-gold" />
                      <span>{item.date}</span>
                    </div>
                    <h2 className="text-xl font-bold text-jcp-navy dark:text-white font-kufi group-hover:text-primary-600 transition-colors leading-snug">
                      {isAr ? item.title : (item.titleEn || item.title)}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-cairo leading-relaxed line-clamp-3">
                      {isAr ? item.summary : (item.summaryEn || item.summary)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => setSelectedNews(item)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-jcp-green font-cairo"
                    >
                      <span>{isAr ? "قراءة التفاصيل" : "Read More"}</span>
                      <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        )}

        {/* Tab 2: Gallery */}
        {activeTab === 'gallery' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* Featured Official Documentary Film */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-7 bg-jcp-red rounded-full"></span>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold font-readex text-jcp-navy dark:text-white">
                    {isAr ? "الفيلم الوثائقي والتعريفي الرسمي" : "Official Documentary Film"}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-almarai mt-0.5">
                    {isAr ? "شاهد الإنتاج المرئي لحزب المحافظين الأردني ومسيرة الأكاديمية الحزبية" : "Watch the official documentary of JCP and Party Academy"}
                  </p>
                </div>
              </div>

              <div className="flex justify-center py-4 bg-slate-950/40 dark:bg-slate-950/80 rounded-2xl border border-slate-100 dark:border-slate-800">
                <PartyVideoPlayer isAr={isAr} />
              </div>
            </div>

            {/* Photo Albums */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-7 bg-jcp-gold rounded-full"></span>
                <h2 className="text-xl md:text-2xl font-bold font-readex text-jcp-navy dark:text-white">
                  {isAr ? "معرض الصور والفعاليات الحزبية" : "Photo Gallery & Events"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryData.map((asset, index) => {
                const altText = isAr ? asset.alt : (asset.altEn || asset.alt);
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all aspect-video bg-slate-100 dark:bg-slate-800 group focus:outline-none focus:ring-4 focus:ring-primary-500/50 text-right"
                  >
                    <Image
                      src={asset.src}
                      alt={altText}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs md:text-sm font-cairo font-bold leading-snug drop-shadow-md">
                        {altText}
                      </p>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          </motion.div>
        )}

        {/* News Detail Modal */}
        <AnimatePresence>
          {selectedNews && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
              >
                {selectedNews.image && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="absolute top-4 left-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="p-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-cairo">
                    <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2.5 py-0.5 rounded-full font-bold">
                      {isAr ? selectedNews.category : (selectedNews.categoryEn || selectedNews.category)}
                    </span>
                    <span>{selectedNews.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-jcp-navy dark:text-white font-kufi">
                    {isAr ? selectedNews.title : (selectedNews.titleEn || selectedNews.title)}
                  </h3>
                  <p className="text-base text-slate-700 dark:text-slate-300 font-cairo leading-relaxed">
                    {isAr ? selectedNews.summary : (selectedNews.summaryEn || selectedNews.summary)}
                  </p>
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="py-2.5 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold font-cairo hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {isAr ? "إغلاق" : "Close"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Lightbox Modal */}
        <AnimatePresence>
          {selectedPhotoIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6"
            >
              <button
                onClick={handleClosePhoto}
                className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={handlePrevPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="max-w-4xl max-h-[80vh] w-full flex flex-col items-center">
                <div className="relative w-full h-[65vh]">
                  <Image
                    src={galleryData[selectedPhotoIndex].src}
                    alt={galleryData[selectedPhotoIndex].alt}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-white text-center font-cairo text-sm md:text-base mt-4 font-bold max-w-xl">
                  {isAr ? galleryData[selectedPhotoIndex].alt : (galleryData[selectedPhotoIndex].altEn || galleryData[selectedPhotoIndex].alt)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NewsGalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center font-cairo">جاري التحميل...</div>}>
      <NewsGalleryContent />
    </Suspense>
  );
}
