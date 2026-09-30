"use client";

import { useState } from "react";
import { Quote, Star, Award, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  governorate: string;
  program: string;
  quote: string;
  avatarBg: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "م. سيف النعيمات",
    role: "عضو متدرب – الدفعة الأولى",
    governorate: "إربد",
    program: "برنامج مدرسة الكوادر القيادية",
    quote: "شكّلت برامج الأكاديمية الحزبية نقلة نوعية في فهمي للعمل السياسي والبرامجي الوطني، واكتسبت أدوات التخطيط الاستراتيجي والمواطنة الفاعلة بأسلوب علمي ومنهجي رصين.",
    avatarBg: "bg-emerald-600",
  },
  {
    id: 2,
    name: "د. رانية المجالي",
    role: "خريجة الورش المركزية",
    governorate: "عمّان",
    program: "الحقائب التثقيفية المعتمدة",
    quote: "المناهج المعتمدة في الحقائب التثقيفية الاثنتي عشرة مبنية على أحدث المعايير الدولية في إعداد القادة، وتمنح المشاركين ثقة ومقدرة عالية على الحوار وصناعة المبادرات الوطنية.",
    avatarBg: "bg-jcp-navy",
  },
  {
    id: 3,
    name: "الأستاذ طارق الرواشدة",
    role: "مدرب معتمد حزبي",
    governorate: "الكرك",
    program: "برنامج مدرب معتمد وإعداد الكوادر",
    quote: "فخور بحصولي على شهادة إتمام الدورة المعتمدة بنظام الـ QR الرقمي الموثق. البيئة التدريبية التفاعلية والدعم المؤسسي من إدارة الأكاديمية يعكس رؤية وطنية متميزة.",
    avatarBg: "bg-amber-600",
  },
  {
    id: 4,
    name: "نور الخصاونة",
    role: "ناشطة شبابية وخريجة دورة حزبي مبتدئ",
    governorate: "الزرقاء",
    program: "دورة حزبي مبتدئ – تأسيسي",
    quote: "وجدت في الأكاديمية منصة حقيقية لتمكين الشباب وكسر الحواجز أمام المشاركة السياسية النزيهة. الشهادة المعتمدة عززت سيرتي الذاتية وفتحت لي آفاقاً قيادية واسعة.",
    avatarBg: "bg-rose-600",
  },
];

export function TestimonialsSection({ isAr = true }: { isAr?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setActiveIndex((p) => (p + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[activeIndex];

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 transition-colors relative overflow-hidden">
      {/* Subtle background ambient lights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-jcp-gold/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-jcp-navy/10 dark:bg-jcp-navy/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-jcp-gold/15 text-jcp-gold text-xs font-bold font-almarai mb-3 border border-jcp-gold/30">
            <Award className="w-3.5 h-3.5 text-jcp-gold" />
            <span>{isAr ? "أثر التدريب والتأهيل" : "Impact & Testimonials"}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-jcp-navy dark:text-white font-readex mb-4">
            {isAr ? "شهادات وآراء كوادر وخريجي الأكاديمية" : "What Our Cadres & Graduates Say"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-almarai text-base sm:text-lg">
            {isAr 
              ? "قصص نجاح واقعية وتجارب ملهمة لأعضاء الحزب الذين أتموا البرامج والحقائب التدريبية بنجاح." 
              : "Real success stories and inspiring experiences from party members who completed our programs."}
          </p>
        </div>

        {/* Featured Testimonial Card */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-xl relative backdrop-blur-sm max-w-4xl mx-auto transition-all">
          <Quote className="absolute top-6 left-6 rtl:left-6 rtl:right-auto ltr:right-6 ltr:left-auto w-16 h-16 text-jcp-gold/20 pointer-events-none" />

          {/* Stars */}
          <div className="flex items-center gap-1 mb-6 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Quote Body */}
          <blockquote className="text-lg sm:text-2xl text-slate-800 dark:text-slate-100 font-readex font-medium leading-relaxed mb-8">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Author Details & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${t.avatarBg} text-white flex items-center justify-center font-bold text-xl font-readex shadow-md shrink-0`}>
                {t.name.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-jcp-navy dark:text-white font-almarai flex items-center gap-2">
                  <span>{t.name}</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-almarai">
                  {t.role} • <span className="font-semibold text-jcp-gold">{t.governorate}</span>
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {t.program}
                </p>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-2 self-end sm:self-center rtl:flex-row-reverse">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-jcp-gold hover:text-navy-950 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180" />
              </button>
              <span className="text-sm font-bold font-mono px-3 text-slate-600 dark:text-slate-300">
                0{activeIndex + 1} / 0{TESTIMONIALS.length}
              </span>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-jcp-gold hover:text-navy-950 text-slate-700 dark:text-slate-200 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Small avatar preview selectors */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {TESTIMONIALS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className={`text-xs px-4 py-2 rounded-full font-almarai font-bold transition-all ${
                idx === activeIndex
                  ? "bg-jcp-navy dark:bg-jcp-gold text-white dark:text-navy-950 shadow-md scale-105"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {item.name} ({item.governorate})
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
