"use client";

import { useLanguage } from "@/components/LanguageProvider";
import Link from "next/link";
import React from "react";
import { ArrowRight, Building2, Users, FileText, Settings, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function EcosystemPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const t = {
    title: isAr ? "منظومة الأكاديمية" : "Academy Ecosystem",
    intro: isAr ? "الهيكل التنظيمي والمؤسسي للأكاديمية الحزبية، من المرجعية السياسية إلى المحتوى التدريبي المعتمد." : "The organizational and institutional structure of the Party Academy, from political reference to approved training content.",
    layers: [
      {
        id: "party",
        title: isAr ? "حزب المحافظين الأردني" : "Jordanian Conservatives Party",
        subtitle: isAr ? "المكتب السياسي" : "Political Bureau",
        desc: isAr ? "المرجعية السياسية والقانونية التي تستظل الأكاديمية بمظلتها ونظامها الأساسي." : "The political and legal reference under which the Academy operates.",
        icon: <Building2 className="text-jcp-navy dark:text-slate-300" size={24} />,
        href: "/about"
      },
      {
        id: "academy",
        title: isAr ? "الأكاديمية الحزبية" : "The Party Academy",
        subtitle: isAr ? "الذراع المعرفي والتنظيمي" : "Cognitive and Organizational Arm",
        desc: isAr ? "تتمتع بالاستقلال الإداري والتشغيلي في حدود ما يقره الحزب." : "Enjoys administrative and operational independence within the limits approved by the party.",
        icon: <BookOpen className="text-jcp-red dark:text-jcp-red" size={24} />
      },
      {
        id: "board",
        title: isAr ? "مجلس الأمناء (المجلس الأعلى)" : "Board of Trustees (Supreme Council)",
        subtitle: isAr ? "اللجنة المشرفة" : "Supervisory Committee",
        desc: isAr ? "يشرف على توجيه الأكاديمية وضمان التزامها بالرؤية الوطنية للحزب." : "Supervises the Academy's direction and ensures adherence to the party's national vision.",
        icon: <Users className="text-jcp-green dark:text-jcp-green" size={24} />
      },
      {
        id: "exec",
        title: isAr ? "المدير التنفيذي" : "Executive Director",
        subtitle: isAr ? "الإدارة والتنفيذ" : "Management & Execution",
        desc: isAr ? "الشخص المعين لإدارة الأكاديمية وتنفيذ سياساتها اليومية." : "The appointed person to manage the Academy and execute its daily policies.",
        icon: <Settings className="text-slate-600 dark:text-slate-400" size={24} />
      },
      {
        id: "units",
        title: isAr ? "الوحدات الداخلية" : "Internal Units",
        subtitle: isAr ? "5 وحدات إدارية" : "5 Administrative Units",
        desc: isAr ? "تدير العمليات المختلفة من مناهج، تدريب، سياسات، إعلام، وشراكات." : "Manages operations: curriculum, training, policies, media, and partnerships.",
        icon: <Users className="text-jcp-navy dark:text-white" size={24} />,
        href: "/units"
      },
      {
        id: "programs",
        title: isAr ? "البرامج التشغيلية" : "Operational Programs",
        subtitle: isAr ? "الورش والمؤتمرات" : "Workshops and Conferences",
        desc: isAr ? "الدورات والحقائب والورش التي تنفذها الأكاديمية لتدريب وتمكين الكوادر." : "Courses and workshops executed by the Academy to train cadres.",
        icon: <Settings className="text-jcp-navy dark:text-white" size={24} />,
        href: "/programs"
      },
      {
        id: "packages",
        title: isAr ? "الحقائب التدريبية" : "Training Packages",
        subtitle: isAr ? "12 حقيبة معتمدة" : "12 Approved Packages",
        desc: isAr ? "المحتوى التثقيفي المعتمد الذي يغطي محاور الفكر المحافظ." : "Approved educational content covering the pillars of conservative thought.",
        icon: <FileText className="text-jcp-navy dark:text-white" size={24} />,
        href: "/packages"
      }
    ]
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 lg:py-24 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.header 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-16 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-jcp-navy dark:text-white mb-6 font-readex">
            {t.title}
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-almarai leading-relaxed max-w-2xl mx-auto py-2">
            {t.intro}
          </p>
        </motion.header>

        <div className="relative pt-8 pb-16">
          {/* Vertical Connector Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block"></div>
          <div className="absolute top-0 bottom-0 rtl:right-8 ltr:left-8 w-0.5 bg-slate-200 dark:bg-slate-800 md:hidden"></div>

          <div className="space-y-8 md:space-y-16">
            {t.layers.map((layer, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={layer.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  className="relative flex flex-col md:flex-row items-center justify-between w-full"
                >
                  {/* Left Side (Empty on even, content on odd) */}
                  <div className={`w-full md:w-[45%] mb-4 md:mb-0 ${isEven ? 'md:invisible hidden md:block' : 'md:text-left rtl:md:text-right ml-16 rtl:ml-0 rtl:mr-16 md:ml-0 md:mr-0'}`}>
                    {!isEven && (
                      <EcosystemCard layer={layer} isAr={isAr} />
                    )}
                  </div>

                  {/* Center Node */}
                  <div className="absolute rtl:right-[18px] ltr:left-[18px] md:static md:left-auto md:right-auto z-10 w-12 h-12 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm">
                    {layer.icon}
                  </div>

                  {/* Right Side (Content on even, empty on odd) */}
                  <div className={`w-full md:w-[45%] ${!isEven ? 'md:invisible hidden md:block' : 'md:text-left rtl:md:text-right ml-16 rtl:ml-0 rtl:mr-16 md:ml-0 md:mr-0'}`}>
                    {isEven && (
                      <EcosystemCard layer={layer} isAr={isAr} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EcosystemCard({ layer, isAr }: { layer: { id: string, title: string, subtitle: string, desc: string, icon: React.ReactNode, href?: string }, isAr: boolean }) {
  const content = (
    <div className={`bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow ${layer.href ? 'hover:border-jcp-navy dark:hover:border-jcp-navy group cursor-pointer' : ''}`}>
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-xl font-bold text-jcp-navy dark:text-white font-readex group-hover:text-jcp-red transition-colors">
          {layer.title}
        </h2>
        <span className="text-sm font-bold text-jcp-gold font-almarai tracking-wider uppercase">
          {layer.subtitle}
        </span>
      </div>
      <p className="text-slate-600 dark:text-slate-400 font-almarai text-sm leading-relaxed mb-4">
        {layer.desc}
      </p>
      
      {layer.href && (
        <div className="mt-4 flex items-center gap-2 text-jcp-navy dark:text-slate-200 font-bold font-almarai text-sm group-hover:text-jcp-red transition-colors">
          <span>{isAr ? "استكشف" : "Explore"}</span>
          <ArrowRight size={16} className={`transform ${isAr ? 'rotate-180' : ''}`} />
        </div>
      )}
    </div>
  );

  if (layer.href) {
    return (
      <Link href={layer.href} className="block w-full focus:outline-none focus:ring-2 focus:ring-jcp-navy dark:focus:ring-white rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
