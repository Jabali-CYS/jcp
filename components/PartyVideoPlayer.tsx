"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, Film, Clock, Sparkles } from "lucide-react";

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
    <div className={`relative w-full max-w-[380px] sm:max-w-[420px] mx-auto rounded-3xl overflow-hidden border-2 border-jcp-gold/60 shadow-2xl shadow-jcp-gold/15 bg-slate-950 text-white group ${className}`}>
      {/* Ambient Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-jcp-gold/30 via-transparent to-jcp-red/20 rounded-3xl blur-xl pointer-events-none -z-10 group-hover:from-jcp-gold/40 transition-all duration-700"></div>

      {/* Aspect Ratio Container: Exactly 464:832 (9:16 vertical ratio of the video) */}
      <div className="relative aspect-[464/832] w-full overflow-hidden bg-black flex items-center justify-center">
        {!isPlaying ? (
          /* Vertical Cover Poster & Play Trigger */
          <div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-between p-6 sm:p-8 text-center cursor-pointer select-none" 
            onClick={handleStartPlay}
          >
            {/* Ambient Background with subtle blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950 z-0"></div>
            
            {/* Watermark Logo Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/party-logo.png" alt="" className="w-80 h-80 object-contain scale-125" />
            </div>

            {/* Top Badges */}
            <div className="relative z-10 w-full flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-jcp-gold/15 border border-jcp-gold/40 text-jcp-gold text-xs font-bold font-almarai shadow-md backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-jcp-gold" />
                <span>{t.badge}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 border border-white/15 text-slate-300 text-xs font-almarai backdrop-blur-md">
                <Clock className="w-3 h-3 text-jcp-gold" />
                <span dir="ltr">5:58</span>
              </span>
            </div>

            {/* Center: Party Emblem + Glowing Royal Play Button */}
            <div className="relative z-10 flex flex-col items-center my-auto py-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/party-logo.png" 
                alt="حزب المحافظين الأردني" 
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl mb-6 transform group-hover:scale-105 transition-transform duration-500" 
              />

              <button
                type="button"
                aria-label={t.playBtn}
                className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-jcp-gold via-amber-400 to-amber-200 text-slate-950 flex items-center justify-center shadow-2xl shadow-jcp-gold/50 transform group-hover:scale-110 group-hover:shadow-jcp-gold/70 transition-all duration-300 ring-4 ring-white/20 active:scale-95"
              >
                <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current translate-x-0.5 rtl:-translate-x-0.5" />
                {/* Pulsing golden wave ring */}
                <span className="absolute inset-0 rounded-full border-2 border-jcp-gold animate-ping opacity-40 pointer-events-none"></span>
              </button>

              <span className="mt-4 text-xs sm:text-sm font-bold font-almarai text-jcp-gold tracking-wide">
                {t.watchNow}
              </span>
            </div>

            {/* Bottom Captions */}
            <div className="relative z-10 w-full pt-4 border-t border-white/10">
              <h3 className="text-lg sm:text-xl font-bold font-readex text-white drop-shadow-md leading-tight">
                {t.title}
              </h3>
              <p className="text-xs text-slate-300 font-almarai mt-1">
                {t.academy}
              </p>
            </div>
          </div>
        ) : (
          /* Live HTML5 Video Player: Perfectly fills 464:832 vertical frame with ZERO side black bars */
          <video
            ref={videoRef}
            src="https://kmgxyhccbxgsqyxuqffe.supabase.co/storage/v1/object/public/media/party-video.mp4"
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full object-cover bg-black"
            onEnded={() => setIsPlaying(false)}
          >
            <source src="https://kmgxyhccbxgsqyxuqffe.supabase.co/storage/v1/object/public/media/party-video.mp4" type="video/mp4" />
            {isAr ? "متصفحك لا يدعم تشغيل الفيديو." : "Your browser does not support HTML5 video."}
          </video>
        )}
      </div>
    </div>
  );
}
