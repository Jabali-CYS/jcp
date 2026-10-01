"use client";

import { useState, useRef } from "react";
import { Play, Clock, Sparkles } from "lucide-react";

interface PartyVideoPlayerProps {
  isAr?: boolean;
  className?: string;
  autoPlayOnClick?: boolean;
}

export function PartyVideoPlayer({ isAr = true, className = "", autoPlayOnClick = true }: PartyVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleStartPlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.log("Video play error:", err));
      }
    }, 100);
  };

  const t = {
    badge: isAr ? "الفيلم الوثائقي الرسمي" : "Official Documentary Film",
    duration: isAr ? "5:58 دقيقة" : "5:58 Min",
    title: isAr ? "مسيرة حزب المحافظين الأردني" : "Jordanian Conservative Party Journey",
    academy: isAr ? "الأكاديمية الحزبية – الذراع التدريبي" : "Party Academy – Training Arm",
    playBtn: isAr ? "تشغيل الفيلم" : "Play Video",
    watchNow: isAr ? "شاهد الفيلم التعريفي" : "Watch Full Documentary",
  };

  return (
    <div className={`relative w-full max-w-[210px] sm:max-w-[230px] md:max-w-[245px] max-h-[410px] sm:max-h-[435px] mx-auto rounded-2xl overflow-hidden border-2 border-jcp-gold/60 shadow-2xl shadow-jcp-gold/15 bg-slate-950 text-white group ${className}`}>
      {/* Ambient Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-jcp-gold/30 via-transparent to-jcp-red/20 rounded-2xl blur-lg pointer-events-none -z-10 group-hover:from-jcp-gold/40 transition-all duration-700"></div>

      {/* Aspect Ratio Container: 464:832 (9:16 vertical ratio of local video) */}
      <div className="relative aspect-[464/832] w-full h-full overflow-hidden bg-black flex items-center justify-center">
        {!isPlaying ? (
          /* Vertical Cover Poster & Play Trigger */
          <div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-between p-3.5 sm:p-4 text-center cursor-pointer select-none" 
            onClick={handleStartPlay}
          >
            {/* Ambient Background with subtle blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950 z-0"></div>
            
            {/* Watermark Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/party-logo.png" alt="" className="w-56 h-56 object-contain scale-125" />
            </div>

            {/* Top Badges */}
            <div className="relative z-10 w-full flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-jcp-gold/15 border border-jcp-gold/40 text-jcp-gold text-[10px] font-bold font-almarai shadow-md backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 text-jcp-gold" />
                <span>{t.badge}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 border border-white/15 text-slate-300 text-[10px] font-almarai backdrop-blur-md">
                <Clock className="w-2.5 h-2.5 text-jcp-gold" />
                <span dir="ltr">5:58</span>
              </span>
            </div>

            {/* Center: Party Emblem + Glowing Royal Play Button */}
            <div className="relative z-10 flex flex-col items-center my-auto py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/party-logo.png" 
                alt="حزب المحافظين الأردني" 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-xl mb-3 transform group-hover:scale-105 transition-transform duration-500" 
              />

              <button
                type="button"
                aria-label={t.playBtn}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-jcp-gold via-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-xl shadow-jcp-gold/50 transform group-hover:scale-110 group-hover:shadow-jcp-gold/70 transition-all duration-300 ring-2 ring-white/20 active:scale-95"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5 rtl:-translate-x-0.5" />
                {/* Pulsing golden wave ring */}
                <span className="absolute inset-0 rounded-full border-2 border-jcp-gold animate-ping opacity-35 pointer-events-none"></span>
              </button>

              <span className="mt-2 text-[11px] font-bold font-almarai text-jcp-gold tracking-wide">
                {t.watchNow}
              </span>
            </div>

            {/* Bottom Captions */}
            <div className="relative z-10 w-full pt-2 border-t border-white/10">
              <h3 className="text-xs sm:text-sm font-bold font-readex text-white drop-shadow-md leading-tight">
                {t.title}
              </h3>
              <p className="text-[10px] text-slate-300 font-almarai mt-0.5">
                {t.academy}
              </p>
            </div>
          </div>
        ) : (
          /* Live HTML5 Video Player from local Cloudflare Pages assets */
          <video
            ref={videoRef}
            src="/videos/party-video.mp4"
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full object-cover bg-black"
            onEnded={() => setIsPlaying(false)}
          >
            <source src="/videos/party-video.mp4" type="video/mp4" />
            {isAr ? "متصفحك لا يدعم تشغيل الفيديو." : "Your browser does not support HTML5 video."}
          </video>
        )}
      </div>
    </div>
  );
}
