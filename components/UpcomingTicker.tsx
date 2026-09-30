"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

interface TickerItem {
  id: number;
  badgeAr: string;
  badgeEn: string;
  textAr: string;
  textEn: string;
  href: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: 1,
    badgeAr: "تسجيل متاح",
    badgeEn: "Open Now",
    textAr: "فتح باب التسجيل في دورة: حزبي مبتدئ – الدفعة الرابعة (سجل الآن عبر المنصة)",
    textEn: "Registration open for 'Novice Party Member' - Batch 4",
    href: "/programs",
  },
  {
    id: 2,
    badgeAr: "مؤتمر وطني",
    badgeEn: "Conference",
    textAr: "الاستعداد لإطلاق المؤتمر الشبابي الحزبي السنوي تحت مظلة الأكاديمية الحزبية",
    textEn: "Preparing for the Annual Party Youth Conference",
    href: "/news-gallery",
  },
  {
    id: 3,
    badgeAr: "برنامج قيادي",
    badgeEn: "Leadership",
    textAr: "بدء استقبال الترشيحات لبرنامج: مدرسة الكوادر القيادية المتقدمة للمحافظات",
    textEn: "Accepting nominations for the Leadership Cadres School program",
    href: "/programs",
  },
  {
    id: 4,
    badgeAr: "اعتماد رقمي",
    badgeEn: "Verification",
    textAr: "التحقق المباشر من موثوقية الشهادات الرسمية برمز QR الرقمي المعتمد دولياً",
    textEn: "Instant verification of official certificates via digital QR codes",
    href: "/verify",
  },
];

export function UpcomingTicker({ isAr = true }: { isAr?: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((prev) => (prev - 1 + TICKER_ITEMS.length) % TICKER_ITEMS.length);
  const next = () => setActiveIdx((prev) => (prev + 1) % TICKER_ITEMS.length);

  const item = TICKER_ITEMS[activeIdx];

  return (
    <aside 
      aria-label={isAr ? "شريط الأخبار والفعاليات" : "News & Events Bar"}
      className="bg-navy-950/90 text-white border-b border-white/10 backdrop-blur-md relative z-30"
    >
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          
          {/* Label Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-jcp-red text-white text-[11px] font-black font-almarai shadow-sm tracking-wide">
              <Bell className="w-3 h-3 animate-bounce" />
              <span>{isAr ? "مواعيد وفعاليات" : "Upcoming"}</span>
            </span>
          </div>

          {/* Active Announcement Text */}
          <div className="flex-1 truncate flex items-center gap-2 px-2">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-jcp-gold/20 text-jcp-gold text-[10px] font-bold font-almarai border border-jcp-gold/30">
              {isAr ? item.badgeAr : item.badgeEn}
            </span>
            <Link
              href={item.href}
              className="text-slate-100 hover:text-jcp-gold transition-colors font-almarai truncate font-medium hover:underline flex items-center gap-1.5"
            >
              <span>{isAr ? item.textAr : item.textEn}</span>
              <ArrowLeft className="w-3.5 h-3.5 text-jcp-gold shrink-0 rtl:rotate-0 ltr:rotate-180" />
            </Link>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 shrink-0 rtl:flex-row-reverse">
            <button
              onClick={prev}
              aria-label="Previous announcement"
              className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
            <span className="text-[11px] text-slate-400 font-mono px-1">
              {activeIdx + 1}/{TICKER_ITEMS.length}
            </span>
            <button
              onClick={next}
              aria-label="Next announcement"
              className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
}
