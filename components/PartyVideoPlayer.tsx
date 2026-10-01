"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Play, Pause, Volume2, VolumeX, Maximize, Film } from "lucide-react";

interface PartyVideoPlayerProps {
  isAr?: boolean;
  className?: string;
  autoPlayOnClick?: boolean;
}

export function PartyVideoPlayer({ isAr = true, className = "", autoPlayOnClick = true }: PartyVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleStartPlay = () => {
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.log("Video play error:", err));
      }
    }, 100);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const t = {
    badge: isAr ? "الفيلم الوثائقي والتعريفي الرسمي" : "Official Documentary & Introductory Film",
    title: isAr ? "مسيرة حزب المحافظين الأردني ورؤية الأكاديمية" : "Jordanian Conservative Party Journey & Academy Vision",
    subtitle: isAr 
      ? "توثيق مرئي شامل يجسد الهوية الوطنية، ومسار التمكين الحزبي، وتطلعات الشباب نحو صناعة المستقبل." 
      : "A comprehensive visual documentary embodying the national identity, partisan empowerment, and youth future vision.",
    playBtn: isAr ? "تشغيل الفيلم" : "Play Video",
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border-2 border-jcp-gold/40 shadow-2xl bg-slate-950 text-white group ${className}`}>
      {/* Aspect Ratio Container (16:9) */}
      <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
        {!isPlaying ? (
          /* Cover Poster & Play Trigger */
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none" onClick={handleStartPlay}>
            {/* Background Poster Image */}
            <Image
              src="/hq.jpg"
              alt={t.title}
              fill
              priority
              className="object-cover opacity-40 scale-105 group-hover:scale-100 transition-transform duration-700"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {/* Dark Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Glowing Royal Play Button */}
            <div className="relative z-20 flex flex-col items-center gap-4">
              <button
                type="button"
                aria-label={t.playBtn}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-jcp-gold to-amber-300 text-slate-950 flex items-center justify-center shadow-2xl shadow-jcp-gold/40 transform group-hover:scale-110 group-hover:shadow-jcp-gold/60 transition-all duration-300 ring-4 ring-white/20"
              >
                <Play className="w-8 h-8 md:w-10 md:h-10 fill-current translate-x-0.5 rtl:-translate-x-0.5" />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs md:text-sm font-almarai text-jcp-gold font-bold">
                <Film className="w-4 h-4 text-jcp-gold" />
                <span>{t.badge}</span>
              </div>

              <h3 className="text-xl md:text-3xl font-extrabold font-readex text-white drop-shadow-lg max-w-2xl px-4">
                {t.title}
              </h3>
              
              <p className="text-xs md:text-sm text-slate-300 font-almarai max-w-xl hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>
        ) : (
          /* Live HTML5 Video Player */
          <video
            ref={videoRef}
            src="https://kmgxyhccbxgsqyxuqffe.supabase.co/storage/v1/object/public/media/party-video.mp4"
            controls
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full object-contain bg-black"
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
