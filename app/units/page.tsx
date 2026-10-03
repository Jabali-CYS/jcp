"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { academyUnits, academyInfo } from "@/data/mock";
import React from "react";

export default function UnitsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const t = {
    title: isAr ? "الوحدات الإدارية" : "Administrative Units",
    intro: isAr ? academyInfo.unitsIntro : (academyInfo.unitsIntroEn || academyInfo.unitsIntro),
    responsibilitiesTitle: isAr ? "الاختصاصات والمهام:" : "Responsibilities & Tasks:",
  };

  return (
    <div className="min-h-screen bg-transparent py-12 lg:py-24 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-jcp-navy dark:text-white mb-6 font-readex">
            {t.title}
          </h1>
          {t.intro && (
            <p className="text-lg text-slate-700 dark:text-slate-300 font-almarai leading-relaxed max-w-3xl mx-auto border-t border-b border-slate-200 dark:border-slate-800 py-6">
              {t.intro}
            </p>
          )}
        </header>

        <div className="space-y-8" role="list" aria-label={t.title}>
          {academyUnits.map((unit, index) => {
            const unitName = isAr ? unit.name : (unit.nameEn || unit.name);
            const responsibilities = isAr ? unit.responsibilities : (unit.responsibilitiesEn || unit.responsibilities);
            const number = String(index + 1).padStart(2, '0');

            return (
              <section 
                key={unit.id} 
                className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                role="listitem"
              >
                {/* Visual marker */}
                <div className="absolute top-0 right-0 w-2 h-full bg-jcp-red/80" aria-hidden="true"></div>
                
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700" aria-hidden="true">
                    <span className="text-xl font-bold text-jcp-navy dark:text-white font-readex">{number}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-jcp-navy dark:text-white mb-4 font-readex">
                      {unitName}
                    </h2>
                    
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider font-readex">
                      {t.responsibilitiesTitle}
                    </h3>
                    
                    <ul className="space-y-3" role="list">
                      {responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-almarai leading-relaxed">
                          <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-jcp-gold" aria-hidden="true"></span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
