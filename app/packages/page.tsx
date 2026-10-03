"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { trainingPackages } from "@/data/mock";
import React from "react";

export default function PackagesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const verifiedPackages = trainingPackages.filter(p => p.provenance === 'SOURCE_VERIFIED');

  const t = {
    title: isAr ? "الحقائب التدريبية" : "Training Packages",
    intro: isAr ? "الحقائب التثقيفية المعتمدة في الأكاديمية" : "Approved Educational Packages at the Academy",
    count: isAr ? `${verifiedPackages.length} حقيبة تدريبية` : `${verifiedPackages.length} Training Packages`,
    slides: isAr ? "الشرائح" : "Slides",
  };

  return (
    <div className="min-h-screen bg-transparent py-12 lg:py-24 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-jcp-navy dark:text-white mb-6 font-readex">
            {t.title}
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-almarai leading-relaxed max-w-3xl mx-auto py-2">
            {t.intro}
          </p>
          <div className="mt-6 inline-flex items-center justify-center px-6 py-2 bg-slate-200 dark:bg-slate-800 text-jcp-navy dark:text-slate-200 font-bold font-almarai rounded-full">
            {t.count}
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800" role="list" aria-label={t.title}>
            {verifiedPackages.map((pkg, index) => {
              const pTitle = isAr ? pkg.title : (pkg.titleEn || pkg.title);
              const number = String(index + 1).padStart(2, '0');
              const rangeText = pkg.slideRange ? `${pkg.slideRange.from}–${pkg.slideRange.to}` : '';

              return (
                <li key={pkg.id} className="p-6 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-start sm:items-center gap-6">
                    <span className="text-2xl font-bold text-slate-300 dark:text-slate-700 font-readex select-none" aria-hidden="true">
                      {number}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-jcp-navy dark:text-slate-100 font-readex">
                      {pTitle}
                    </h2>
                  </div>
                  {rangeText && (
                    <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-jcp-red font-almarai bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg" aria-label={`${t.slides} ${rangeText}`}>
                      <span aria-hidden="true">{t.slides}</span>
                      <span className="font-readex tracking-widest" aria-hidden="true">{rangeText}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
