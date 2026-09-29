"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { academyInfo } from "@/data/mock";

export default function AboutPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const t = {
    title: isAr ? "من نحن" : "About Us",
    subtitle: isAr ? "تعرف على هويتنا، رؤيتنا، ورسالتنا التي نؤمن بها ونسعى لتحقيقها." : "Learn about our identity, vision, and the mission we believe in and strive to achieve.",
    academyTitle: isAr ? "عن الأكاديمية" : "About the Academy",
    academyText: isAr ? academyInfo.aboutAcademy : (academyInfo.aboutAcademyEn || academyInfo.aboutAcademy),
    visionTitle: isAr ? "الرؤية" : "Vision",
    visionText: isAr ? academyInfo.vision : (academyInfo.visionEn || academyInfo.vision),
    missionTitle: isAr ? "الرسالة" : "Mission",
    missionText: isAr ? academyInfo.mission : (academyInfo.missionEn || academyInfo.mission),
    principlesTitle: isAr ? "المبادئ הـ 13" : "13 Principles",
    goalsTitle: isAr ? "الأهداف الـ 14" : "14 Goals",
    logoTitle: isAr ? "دلالة الشعار" : "Logo Significance",
    logoText: isAr ? academyInfo.logoSignificance : (academyInfo.logoSignificanceEn || academyInfo.logoSignificance),
    principles: isAr ? academyInfo.principles : (academyInfo.principlesEn || academyInfo.principles),
    goals: isAr ? academyInfo.goals : (academyInfo.goalsEn || academyInfo.goals),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 lg:py-20 transition-colors">
      <div className="container mx-auto px-4 max-w-5xl">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-jcp-navy dark:text-white mb-6 font-readex transition-colors">
            {t.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-almarai max-w-2xl mx-auto transition-colors">
            {t.subtitle}
          </p>
        </header>

        <div className="space-y-12">
          
          {/* About the Academy Section */}
          <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-8 rounded-full bg-jcp-red"></span>
              <h2 className="text-2xl font-bold text-jcp-navy dark:text-white font-readex transition-colors">
                {t.academyTitle}
              </h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-almarai leading-relaxed text-lg transition-colors">
              {t.academyText}
            </p>
          </section>

          {/* Party Vision & Mission Sections */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-8 rounded-full bg-jcp-gold"></span>
                <h2 className="text-2xl font-bold text-jcp-navy dark:text-white font-readex transition-colors">
                  {t.visionTitle}
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-almarai leading-relaxed text-lg transition-colors">
                {t.visionText}
              </p>
            </section>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-8 rounded-full bg-jcp-green"></span>
                <h2 className="text-2xl font-bold text-jcp-navy dark:text-white font-readex transition-colors">
                  {t.missionTitle}
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-almarai leading-relaxed text-lg transition-colors">
                {t.missionText}
              </p>
            </section>
          </div>

          {/* 13 Principles Section */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-jcp-navy dark:text-white mb-8 font-readex text-center">
              {t.principlesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.principles.map((principle, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xl font-bold text-jcp-red opacity-80 font-readex shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className={`font-almarai leading-relaxed ${principle.includes("Placeholder") || principle.includes("لاحقاً") ? "text-slate-400 dark:text-slate-500 italic text-sm" : "text-slate-700 dark:text-slate-300"}`}>
                    {principle}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 14 Goals Section */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-jcp-navy dark:text-white mb-8 font-readex text-center">
              {t.goalsTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.goals.map((goal, index) => (
                <div key={index} className="p-5 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="block text-lg font-bold text-jcp-green mb-2 font-readex">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className={`font-almarai ${goal.includes("Placeholder") || goal.includes("لاحقاً") ? "text-slate-400 dark:text-slate-500 italic text-sm" : "text-slate-700 dark:text-slate-300"}`}>
                    {goal}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Logo Significance Section */}
          <section className="mt-16 bg-jcp-navy dark:bg-slate-900 text-white p-8 md:p-12 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="relative z-10 text-center">
              <h2 className="text-2xl font-bold mb-6 font-readex text-white">
                {t.logoTitle}
              </h2>
              <p className="text-slate-300 font-almarai leading-relaxed text-lg max-w-2xl mx-auto italic">
                {t.logoText}
              </p>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
