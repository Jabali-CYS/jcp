import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Download, ArrowRight, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'رمز QR الرسمي للأكاديمية | JCP Academy',
  description: 'امسح رمز الاستجابة السريعة للوصول المباشر إلى المنصة التدريبية للأكاديمية الحزبية – حزب المحافظين الأردني.',
}

export default function QrPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-transparent px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-xl mx-auto text-center space-y-8">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jcp-navy/10 dark:bg-jcp-gold/10 text-jcp-navy dark:text-jcp-gold text-xs font-bold font-cairo">
          <ShieldCheck size={16} />
          <span>الرابط المعتمد لمنصة الأكاديمية الحزبية</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-kufi text-slate-900 dark:text-white">
            رمز الاستجابة السريع (QR Code)
          </h1>
          <p className="mt-3 text-sm sm:text-base font-cairo text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            امسح الرمز بكاميرا هاتفك المحمول للانتقال الفوري والمباشر إلى المنصة الإلكترونية لحزب المحافظين الأردني دون الحاجة لكتابة الدومين.
          </p>
        </div>

        {/* QR Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner inline-block">
            <Image
              src="/jcpacademy-qr.png"
              alt="JCP Academy QR Code"
              width={300}
              height={300}
              className="w-64 h-64 sm:w-72 sm:h-72 object-contain mx-auto"
              priority
            />
          </div>

          <div>
            <span className="font-mono text-base font-bold text-jcp-navy dark:text-jcp-gold tracking-wider">
              https://jcpacademy.com
            </span>
            <p className="text-xs font-cairo text-slate-500 mt-1">
              المنصة التدريبية — حزب المحافظين الأردني
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="/jcpacademy-qr.png"
              download="jcpacademy-qr.png"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-jcp-navy hover:bg-jcp-green text-white font-bold font-cairo text-sm transition-all shadow-md hover:shadow-lg"
            >
              <Download size={18} />
              <span>تحميل الصورة للطباعة والمشاركة</span>
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold font-cairo text-sm transition-colors border border-slate-200 dark:border-slate-700"
            >
              <span>الرئيسية</span>
              <ArrowRight size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
