"use client";
import { useLanguage } from "@/components/LanguageProvider";
import { TrendingUp } from "lucide-react";

export default function SkillsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  return (
    <div className="flex flex-col flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center py-20 px-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-md w-full">
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 text-jcp-navy dark:text-white rounded-full flex items-center justify-center mb-6">
          <TrendingUp size={32} />
        </div>
        <h1 className="text-2xl font-bold font-readex text-jcp-navy dark:text-white mb-4">
          {isAr ? "تطوير المهارات" : "Skills Development"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-almarai text-base leading-relaxed">
          {isAr 
            ? "نعمل على تطوير المهارات بعدة برامج وسيتم عرضها قريباً" 
            : "We are developing skills through several specialized programs, which will be presented soon."}
        </p>
      </div>
    </div>
  );
}
