"use client";

import { useState } from 'react';
import { Download, Printer, Copy, Check, ShieldCheck, Award } from 'lucide-react';

interface CertificateViewProps {
  serialNumber: string;
  participantName: string;
  programTitle: string;
  issueDate: string;
  certificateType: 'completion' | 'participation';
  qrDataUrl?: string;
  certificateId?: string;
}

export default function CertificateView({
  serialNumber,
  participantName,
  programTitle,
  issueDate,
  certificateType,
  qrDataUrl,
  certificateId,
}: CertificateViewProps) {
  const [copied, setCopied] = useState(false);

  const typeName = certificateType === 'completion' ? 'شهـادة إتـمام وتأهيـل معتمـدة' : 'شهـادة مشاركـة معتمـدة';

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : `https://jcpacademy.com/verify?serial=${serialNumber}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-cairo block">
              وثيقة رسمية موثقة
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              {serialNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct PDF Download if certificateId available */}
          {certificateId && (
            <a
              href={`/api/certificates/${certificateId}/download`}
              download
              className="inline-flex items-center gap-1.5 bg-jcp-navy hover:bg-opacity-90 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-cairo shadow-sm transition-all"
              title="تحميل ملف PDF"
            >
              <Download className="w-4 h-4 text-jcp-gold" />
              <span>تحميل PDF</span>
            </a>
          )}

          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-105 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-cairo shadow-sm transition-all"
            title="طباعة أو حفظ بصيغة PDF"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة / حفظ كـ PDF</span>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold font-cairo transition-all border border-slate-200 dark:border-slate-700"
            title="نسخ رابط التحقق"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* The Printable Royal Certificate Sheet */}
      <div 
        id="printable-certificate"
        className="certificate-print-root bg-white text-slate-900 rounded-3xl shadow-2xl border-[6px] border-[#0e1e38] p-6 sm:p-10 md:p-12 relative overflow-hidden transition-all"
        style={{
          boxShadow: '0 20px 50px -10px rgba(14, 30, 56, 0.25)',
        }}
      >
        {/* Inner Golden Ornamental Frame */}
        <div className="absolute inset-2 sm:inset-3 border-2 border-[#c5a059] rounded-2xl pointer-events-none opacity-80" />
        <div className="absolute inset-3 sm:inset-4 border border-[#c5a059]/40 rounded-xl pointer-events-none" />

        {/* Corner Ornaments */}
        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#c5a059] rounded-tr pointer-events-none" />
        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#c5a059] rounded-tl pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#c5a059] rounded-br pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#c5a059] rounded-bl pointer-events-none" />

        {/* Subtle Watermark in Center Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/academy-logo.png" alt="Watermark" className="w-[420px] h-[420px] object-contain" />
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 text-center space-y-6 sm:space-y-8">
          
          {/* Header Logos & Royal Slogan */}
          <div className="flex items-center justify-between border-b border-[#c5a059]/30 pb-4 px-2 sm:px-6">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/academy-logo.png" 
                alt="شعار الأكاديمية الحزبية" 
                className="h-16 sm:h-20 w-auto object-contain"
              />
              <div className="text-right hidden sm:block">
                <div className="font-kufi font-black text-xs text-[#0e1e38]">الأكاديمية الحزبية</div>
                <div className="font-cairo text-[11px] text-[#c5a059] font-bold">حزب المحافظين الأردني</div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="font-kufi font-black text-xs sm:text-sm text-[#0e1e38] tracking-wider">
                المملكة الأردنية الهاشمية
              </div>
              <div className="font-cairo text-[11px] sm:text-xs text-slate-500 font-semibold">
                حزب المحافظين الأردني
              </div>
              <div className="inline-block px-3 py-0.5 bg-amber-50 border border-[#c5a059]/40 rounded-full text-[10px] font-bold font-cairo text-[#0e1e38]">
                هويّة – انتماء – مواطنة
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-left hidden sm:block">
                <div className="font-kufi font-black text-xs text-[#0e1e38]">Jordanian Conservative Party</div>
                <div className="font-cairo text-[11px] text-[#c5a059] font-bold">Party Academy</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/party-logo.png" 
                alt="شعار حزب المحافظين الأردني" 
                className="h-14 sm:h-18 w-auto object-contain"
              />
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="space-y-2 pt-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-kufi text-[#0e1e38] tracking-wide drop-shadow-sm">
              {typeName}
            </h1>
            <p className="text-xs sm:text-sm font-cairo font-bold text-[#c5a059] tracking-widest">
              CERTIFICATE OF RECOGNITION & QUALIFICATION
            </p>
          </div>

          {/* Testimonial Statement */}
          <div className="max-w-2xl mx-auto space-y-4 font-cairo text-slate-700 leading-relaxed px-2">
            <p className="text-sm sm:text-base font-medium">
              تشهد إدارة الأكاديمية الحزبية في حزب المحافظين الأردني بأنّ الزميل / الزميلة:
            </p>

            {/* Recipient Name in large dignified calligraphy */}
            <div className="py-2">
              <div className="inline-block border-b-2 border-[#c5a059] pb-2 px-8">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black font-kufi text-[#0e1e38]">
                  {participantName}
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base font-medium">
              قد اجتاز/ت بنجاح واستحقاق متطلبات البرنامج التدريبي المعتمد:
            </p>

            {/* Program Name */}
            <div className="py-1">
              <div className="inline-block bg-slate-50 border border-slate-200/80 px-6 py-2 rounded-xl">
                <span className="text-base sm:text-xl md:text-2xl font-black font-kufi text-emerald-800">
                  {programTitle}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              وتقديراً لما أظهره من التزام وتميز علمي وميداني، مُنح هذه الشهادة المعتمدة والمقيدة في السجلات السيادية للأكاديمية.
            </p>
          </div>

          {/* Bottom Accreditation & Signatures Row */}
          <div className="pt-6 sm:pt-8 border-t border-[#c5a059]/30 grid grid-cols-3 items-end gap-3 sm:gap-6 text-center font-cairo">
            
            {/* Right: Date & Verification QR */}
            <div className="flex flex-col items-center justify-center space-y-2 text-right">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={qrDataUrl} 
                  alt="رمز التحقق الرقمي" 
                  className="w-16 h-16 sm:w-20 sm:h-20 border border-slate-300 p-1 rounded-lg bg-white shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-300">
                  <ShieldCheck className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="text-[10px] sm:text-xs font-semibold text-slate-600">
                <div>تاريخ التحرير: {issueDate}</div>
                <div className="font-mono font-bold text-slate-800 dir-ltr">{serialNumber}</div>
              </div>
            </div>

            {/* Center: Official Golden Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-[#c5a059] bg-gradient-to-br from-amber-50 to-amber-100/60 p-2 flex flex-col items-center justify-center shadow-md">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#c5a059]" />
                <span className="text-[8px] sm:text-[9px] font-black font-kufi text-[#0e1e38] mt-0.5 leading-tight">
                  الختم الرسمي
                </span>
                <span className="text-[7px] font-bold text-emerald-700">
                  معتمد وموثق
                </span>
              </div>
            </div>

            {/* Left: Official Signatures */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-bold font-kufi text-[#0e1e38]">
                  عميد الأكاديمية الحزبية
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500">
                  الأكاديمية الحزبية
                </div>
              </div>
              <div className="w-24 sm:w-32 border-b-2 border-slate-400 mx-auto" />
            </div>

          </div>

          {/* Bottom Bar Code & Security Hash */}
          <div className="pt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100 px-2">
            <span>وثيقة رسمية صادرة عن حزب المحافظين الأردني</span>
            <span>بوابة التوثيق: jcpacademy.com/verify</span>
          </div>

        </div>
      </div>

      {/* Print Specific CSS to format A4 Landscape on Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: 8px solid #0e1e38 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
