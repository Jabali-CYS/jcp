"use client";

import { timelinePhases } from "@/data/mock";
import { Calendar, CheckCircle2, Milestone, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function TimelineSection({ isAr = true }: { isAr?: boolean }) {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-jcp-navy/10 dark:bg-white/10 text-jcp-navy dark:text-jcp-gold text-xs font-bold font-almarai mb-3 border border-jcp-navy/20 dark:border-white/15">
            <Milestone className="w-3.5 h-3.5 text-jcp-red" />
            <span>{isAr ? "الخطة التشغيلية المعتمدة" : "Operational Plan"}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-jcp-navy dark:text-white font-readex mb-4">
            {isAr ? "المراحل الزمنية ومخرجات الخطة التشغيلية" : "Operational Phases & Key Outputs"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-almarai text-base sm:text-lg">
            {isAr 
              ? "خارطة طريق مدروسة وموثقة تنقل العمل الحزبي من التأسيس إلى التشغيل والتوسع والتمكين الوطني الشامل." 
              : "A structured roadmap advancing partisan work from foundational launch to nationwide impact."}
          </p>
        </div>

        {/* 4 Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {timelinePhases.map((phase, idx) => {
            const phaseTitle = isAr ? phase.phase : (phase.phaseEn || phase.phase);
            const duration = isAr ? phase.duration : (phase.durationEn || phase.duration);
            const goal = isAr ? phase.goal : (phase.goalEn || phase.goal);
            const activities = isAr ? phase.activities : (phase.activitiesEn || phase.activities);
            const outputs = isAr ? phase.outputs : (phase.outputsEn || phase.outputs);

            return (
              <div 
                key={phase.id}
                className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-jcp-gold dark:hover:border-jcp-gold hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="w-8 h-8 rounded-xl bg-jcp-navy dark:bg-jcp-gold text-white dark:text-navy-950 flex items-center justify-center font-bold text-sm font-readex shadow-sm">
                    0{idx + 1}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold font-almarai px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    <Calendar className="w-3 h-3 text-jcp-gold" />
                    <span>{duration}</span>
                  </span>
                </div>

                {/* Title & Goal */}
                <h3 className="text-lg font-bold text-jcp-navy dark:text-white font-readex mb-2 group-hover:text-jcp-red transition-colors">
                  {phaseTitle}
                </h3>
                <p className="text-xs sm:text-sm text-jcp-gold font-bold font-almarai mb-4">
                  {isAr ? "الهدف:" : "Goal:"} {goal}
                </p>

                {/* Activities List */}
                <div className="space-y-2 mb-6 flex-1">
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-almarai">
                    {isAr ? "الأنشطة والمهام:" : "Key Activities:"}
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-almarai">
                    {activities?.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-jcp-red shrink-0">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs Box */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-almarai mb-2">
                    {isAr ? "المخرجات المستهدفة:" : "Target Outputs:"}
                  </h4>
                  <ul className="space-y-1 text-xs font-semibold text-slate-800 dark:text-slate-200 font-almarai">
                    {outputs?.map((out, j) => (
                      <li key={j} className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 bg-jcp-navy hover:bg-jcp-navy/90 dark:bg-jcp-gold dark:hover:bg-jcp-gold/90 text-white dark:text-navy-950 px-8 py-3 rounded-xl font-bold font-almarai shadow-md transition-all hover:scale-105"
          >
            <span>{isAr ? "استكشف البرامج المتاحة للتسجيل" : "Explore Available Programs"}</span>
            <ArrowUpRight className="w-4 h-4 rtl:rotate-90" />
          </Link>
        </div>

      </div>
    </section>
  );
}
