"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface SiteQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SiteQrModal({ isOpen, onClose }: SiteQrModalProps) {
  const [copied, setCopied] = useState(false);
  const siteUrl = "https://jcpacademy.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="w-14 h-14 bg-jcp-navy/10 dark:bg-jcp-gold/10 text-jcp-navy dark:text-jcp-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode size={28} />
            </div>
            <h3 className="text-xl font-bold font-kufi text-slate-900 dark:text-white">
              رمز QR الرسمي للمنصة
            </h3>
            <p className="text-xs sm:text-sm font-cairo text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              امسح الرمز بكاميرا الهاتف للوصول السريع إلى منصة الأكاديمية الحزبية مباشرة دون الحاجة لكتابة العنوان.
            </p>

            {/* QR Code Container */}
            <div className="my-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-inner inline-block">
              <Image
                src="/jcpacademy-qr.png"
                alt="JCP Academy QR Code"
                width={220}
                height={220}
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain mx-auto"
                priority
              />
              <span className="block mt-2 font-mono text-xs font-bold text-slate-700 tracking-wider">
                jcpacademy.com
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href="/jcpacademy-qr.png"
                download="jcpacademy-qr.png"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-jcp-navy hover:bg-jcp-green text-white font-bold font-cairo text-xs sm:text-sm transition-colors shadow-sm"
              >
                <Download size={16} />
                <span>تحميل الصورة (PNG)</span>
              </a>
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold font-cairo text-xs sm:text-sm transition-colors border border-slate-200 dark:border-slate-700"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                <span>{copied ? "تم النسخ!" : "نسخ الرابط"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
