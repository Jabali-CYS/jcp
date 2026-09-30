"use client";

import Link from "next/link";
import { academyInfo, operationalTargets, trainingPackages } from "@/data/mock";
import { ArrowLeft, BookOpen, Target, Building2, GraduationCap, TrendingUp, Newspaper, Briefcase, Laptop, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const t = {
    platform: isAr ? "المنصة التدريبية للأكاديمية الحزبية" : "JCP Academy Training Platform",
    heroTitle: isAr ? "هويَّة – انتماء – مواطنة" : "Identity – Belonging – Citizenship",
    explore: isAr ? "استكشف الحقائب التثقيفية" : "Explore Training Packages",
    about: isAr ? "تعرف على الأكاديمية" : "Learn About the Academy",
    visionTitle: isAr ? "الرؤية المؤسسية" : "Institutional Vision",
    visionHeading: isAr ? "نحو مشاركة سياسية فاعلة وبرامجية" : "Towards Active and Programmatic Political Participation",
    readMore: isAr ? "قراءة المبادئ والأهداف كاملة" : "Read all principles and objectives",
    targetsTitle: isAr ? "مستهدفات الخطة التشغيلية" : "Operational Plan Targets",
    packagesTitle: isAr ? "الحقائب التثقيفية المعتمدة" : "Accredited Training Packages",
    packagesDesc: isAr ? "برامج ومناهج معتمدة تهدف إلى تأهيل الكوادر الحزبية وتطوير الفكر المحافظ وفق أسس علمية ومؤسسية." : "Accredited programs and curricula aimed at qualifying party cadres and developing conservative thought according to scientific and institutional foundations.",
    slideRange: isAr ? "نطاق الشرائح:" : "Slide Range:",
    viewAll: isAr ? "عرض جميع الحقائب التثقيفية (12 حقيبة)" : "View all training packages (12 packages)",
    adminUnits: isAr ? "الوحدات الإدارية" : "Administrative Units",
    trainingPrograms: isAr ? "البرامج التدريبية" : "Training Programs",
    skillsDev: isAr ? "تطوير المهارات" : "Skills Development",
    newsGallery: isAr ? "الأخبار والمعرض" : "News & Gallery",
    services: isAr ? "الخدمات" : "Services",
    onlineCourses: isAr ? "الدورات الأونلاين" : "Online Courses",
    contactUs: isAr ? "تواصل معنا" : "Contact Us",
  };

  const featuresGrid = [
    { label: t.adminUnits, icon: <Building2 size={32} />, href: "/units" },
    { label: isAr ? "الحقائب التثقيفية" : "Training Packages", icon: <BookOpen size={32} />, href: "/packages" },
    { label: t.trainingPrograms, icon: <GraduationCap size={32} />, href: "/programs" },
    { label: t.skillsDev, icon: <TrendingUp size={32} />, href: "/skills" },
    { label: t.newsGallery, icon: <Newspaper size={32} />, href: "/news-gallery" },
    { label: t.services, icon: <Briefcase size={32} />, href: "/services" },
    { label: t.onlineCourses, icon: <Laptop size={32} />, href: "/online-courses" },
    { label: t.contactUs, icon: <MessageSquare size={32} />, href: "/contact" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-jcp-navy text-white overflow-hidden border-b-4 border-jcp-red">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Text Column */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-jcp-gold text-sm font-bold font-almarai mb-6 backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-jcp-gold animate-pulse"></span>
                {t.platform}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-readex leading-tight mb-6">
                {t.heroTitle}
              </h1>
              <p className="text-lg md:text-xl text-slate-200 font-almarai mb-10 max-w-2xl leading-relaxed">
                {isAr ? academyInfo.mission : academyInfo.missionEn}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/packages" 
                  className="inline-flex items-center gap-2 bg-jcp-gold text-jcp-navy px-8 py-4 rounded-md font-bold font-almarai hover:bg-white transition-colors focus:outline-none focus:ring-4 focus:ring-jcp-gold/50 shadow-lg"
                >
                  {t.explore}
                  <ArrowLeft size={20} className="rtl:rotate-180" />
                </Link>
                <Link 
                  href="/about" 
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-md font-bold font-almarai hover:bg-white/20 backdrop-blur-sm transition-colors border border-white/20 focus:outline-none focus:ring-4 focus:ring-white/20"
                >
                  {t.about}
                </Link>
              </div>
            </div>

            {/* Photo Strip / Collage Column */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-2 sm:p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/15 shadow-2xl">
                <div className="relative group overflow-hidden rounded-xl h-36 sm:h-44 border border-white/10 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/gallery/extra-1.jpeg" 
                    alt={isAr ? "أنشطة ولقاءات حزب المحافظين" : "JCP Activities"}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative group overflow-hidden rounded-xl h-36 sm:h-44 border border-white/10 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/gallery/extra-2.jpeg" 
                    alt={isAr ? "ندوات وورش عمل الحزب" : "JCP Workshops"}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative group overflow-hidden rounded-xl h-36 sm:h-44 border border-white/10 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/gallery/extra-3.jpeg" 
                    alt={isAr ? "التدريب الميداني والكوادر" : "Cadre Training"}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative group overflow-hidden rounded-xl h-36 sm:h-44 border border-white/10 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/gallery/extra-4.jpeg" 
                    alt={isAr ? "اجتماعات الأكاديمية الحزبية" : "Academy Meetings"}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <Link 
                  href="/news-gallery?tab=gallery"
                  className="inline-flex items-center gap-1.5 text-xs font-almarai font-bold text-jcp-gold hover:text-white transition-colors"
                >
                  <span>{isAr ? "استعرض المزيد في معرض الصور والفعاليات ←" : "Explore more in the photo gallery →"}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features/Icons Grid */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {featuresGrid.map((feature, idx) => (
              <Link 
                key={idx} 
                href={feature.href}
                className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-jcp-navy hover:text-white dark:hover:bg-jcp-gold dark:hover:text-jcp-navy transition-all group border border-transparent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-jcp-navy"
              >
                <div className="text-jcp-red mb-4 group-hover:text-white dark:group-hover:text-jcp-navy transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-almarai font-bold text-center text-slate-800 dark:text-slate-200 group-hover:text-white dark:group-hover:text-jcp-navy transition-colors">
                  {feature.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Academy Intro Snippet */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-sm font-bold text-jcp-red tracking-widest uppercase mb-2 font-almarai">{t.visionTitle}</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-jcp-navy dark:text-white mb-6 font-readex leading-snug transition-colors">
                {t.visionHeading}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-almarai text-lg leading-relaxed mb-6 transition-colors">
                {isAr ? academyInfo.vision : academyInfo.visionEn}
              </p>
              <ul className="space-y-3 font-almarai text-slate-700 dark:text-slate-300 transition-colors">
                {(isAr ? academyInfo.principles : academyInfo.principlesEn)?.slice(0, 3).map((principle, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-jcp-green mt-1">✓</span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
              <Link href="/about" className="inline-block mt-8 text-jcp-navy dark:text-white font-bold font-almarai hover:text-jcp-red dark:hover:text-jcp-red transition-colors underline decoration-2 underline-offset-4">
                {t.readMore}
              </Link>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
               <div className="absolute top-0 end-0 p-8 opacity-5 dark:opacity-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/party-logo.png" alt="" className="w-auto h-auto max-w-[300px]" />
               </div>
               <div className="relative z-10">
                 <h4 className="text-xl font-bold text-jcp-navy dark:text-white mb-6 font-readex flex items-center gap-2 transition-colors">
                   <Target className="text-jcp-red" />
                   {t.targetsTitle}
                 </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {operationalTargets.map(target => (
                     <div key={target.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                       <div className="text-3xl font-bold text-jcp-navy dark:text-white mb-2 transition-colors">{target.targetValue}</div>
                       <div className="text-sm text-slate-600 dark:text-slate-400 font-almarai font-medium transition-colors">{isAr ? target.label : target.labelEn}</div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Entry */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-jcp-navy dark:text-white mb-4 font-readex transition-colors">{t.packagesTitle}</h2>
            <p className="text-slate-600 dark:text-slate-400 font-almarai text-lg transition-colors">
              {t.packagesDesc}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {trainingPackages.slice(0, 6).map((pkg) => (
              <div key={pkg.id} className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-jcp-gold dark:hover:border-jcp-gold hover:shadow-md transition-all group flex items-start gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-jcp-navy dark:text-white group-hover:bg-jcp-gold group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-jcp-navy dark:text-white font-almarai mb-1 group-hover:text-jcp-red transition-colors">{isAr ? pkg.title : pkg.titleEn}</h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-almarai">{t.slideRange} <span className="font-semibold text-slate-700 dark:text-slate-300">{pkg.slideRange ? `${pkg.slideRange.from}–${pkg.slideRange.to}` : ''}</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/packages" 
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-jcp-navy dark:text-white border-2 border-jcp-navy dark:border-white px-8 py-3 rounded-md font-bold font-almarai hover:bg-jcp-navy hover:text-white dark:hover:bg-white dark:hover:text-jcp-navy transition-colors focus:outline-none focus:ring-4 focus:ring-jcp-navy/30 dark:focus:ring-white/30"
            >
              {t.viewAll}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
