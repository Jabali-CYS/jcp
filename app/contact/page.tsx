"use client";

import React from "react";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";
import { contactData } from "@/data/contact";
import { MapPin, Globe, Map, Share2, ArrowRight, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const t = {
    title: isAr ? "تواصل معنا" : "Contact Us",
    intro: isAr ? "معلومات التواصل الرسمية للأكاديمية وحزب المحافظين الأردني." : "Official contact information for the Academy and the Jordanian Conservatives Party.",
    visit: isAr ? "زيارة الرابط" : "Visit link",
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "address": return <MapPin className="text-jcp-red" size={24} aria-hidden="true" />;
      case "website": return <Globe className="text-jcp-red" size={24} aria-hidden="true" />;
      case "map": return <Map className="text-jcp-red" size={24} aria-hidden="true" />;
      case "social": return <Share2 className="text-jcp-red" size={24} aria-hidden="true" />;
      default: return <MapPin className="text-jcp-red" size={24} aria-hidden="true" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 lg:py-24 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-jcp-navy dark:text-white mb-6 font-readex">
            {t.title}
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-almarai leading-relaxed max-w-2xl mx-auto py-2">
            {t.intro}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {contactData.map((item) => {
            const label = isAr ? item.labelAr : item.labelEn;
            const value = isAr ? item.valueAr : item.valueEn;
            
            const getBgImage = (type: string) => {
              switch (type) {
                case "address": return "/hq.jpg";
                case "website": return "/party-logo.png";
                case "map": return "/map-bg.png";
                case "social": return "/facebook.svg";
                default: return "";
              }
            };

            const bgImage = getBgImage(item.type);

            const cardContent = (
              <div className="relative h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between overflow-hidden min-h-[320px]">
                
                {/* 1. The Background Image (Reveals on Hover) */}
                {bgImage && (
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image 
                      src={bgImage} 
                      alt="" 
                      fill 
                      className={`scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700 ease-out pointer-events-none ${item.type === 'social' ? 'object-contain p-12' : 'object-cover'}`} 
                      sizes="(max-width: 768px) 100vw, 50vw" 
                    />
                    {/* Dark gradient overlay to make text readable over the image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>
                )}
                
                {/* 2. The Content (Moves down slightly and changes color) */}
                <div className="relative z-10 p-8 flex flex-col h-full justify-between transform transition-transform duration-500 group-hover:translate-y-2">
                  <div>
                    {/* Icon */}
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 transition-all duration-500 group-hover:bg-white/20 group-hover:border-white/30 group-hover:scale-110 group-hover:text-white">
                      {getIcon(item.type)}
                    </div>
                    {/* Title */}
                    <h3 className="text-xl font-bold text-jcp-navy dark:text-white mb-3 font-readex transition-colors duration-500 group-hover:text-white">
                      {label}
                    </h3>
                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 font-almarai leading-relaxed text-base transition-colors duration-500 group-hover:text-slate-200">
                      {value}
                    </p>
                  </div>
                  
                  {/* Footer Link */}
                  {item.href && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-jcp-green font-semibold font-almarai transition-all duration-500 group-hover:border-white/20 group-hover:text-[#4ade80]">
                      {t.visit} 
                      {isAr ? <ArrowLeft size={16} className="transform transition-transform group-hover:-translate-x-2" /> : <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-2" />}
                    </div>
                  )}
                </div>
              </div>
            );

            if (item.href) {
              return (
                <a 
                  key={item.id} 
                  href={item.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block focus:outline-none focus:ring-4 focus:ring-jcp-navy/30 dark:focus:ring-white/30 rounded-2xl"
                  aria-label={`${label}: ${value}`}
                >
                  {cardContent}
                </a>
              );
            }

            return (
              <div key={item.id} className="block">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
