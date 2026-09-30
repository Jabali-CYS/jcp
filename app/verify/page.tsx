import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Award, CheckCircle2, XCircle, Calendar, User, BookOpen, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'التحقق من صحة الشهادة | الأكاديمية الحزبية',
  description: 'بوابة التحقق الرسمية من صحة الشهادات الصادرة عن الأكاديمية الحزبية لحزب المحافظين الأردني.',
}

async function VerifyContent({ serial }: { serial?: string }) {
  if (!serial) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-kufi text-slate-800 dark:text-slate-200">بوابة التحقق من الشهادات</h2>
        <p className="text-sm font-cairo text-slate-600 dark:text-slate-400 leading-relaxed">
          يرجى إدخال الرقم التسلسلي للشهادة أو مسح رمز الاستجابة السريعة (QR Code) الموجود على وثيقة التخرج للتحقق من صحتها.
        </p>
        <form method="GET" action="/verify" className="flex gap-2 max-w-md mx-auto pt-2">
          <input
            type="text"
            name="serial"
            placeholder="مثال: JCP-ACAD-2026-..."
            required
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm focus:outline-none focus:ring-2 focus:ring-jcp-navy"
            dir="ltr"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-jcp-navy text-white rounded-xl font-bold font-cairo text-sm hover:bg-opacity-90 transition-all shadow-sm"
          >
            تحقق
          </button>
        </form>
      </div>
    )
  }

  const supabase = await createClient()

  // Query certificate by serial number
  const { data: cert, error } = await supabase
    .from('certificates')
    .select(`
      id,
      type,
      issue_date,
      serial_number,
      enrollments (
        profiles ( full_name ),
        programs ( title )
      )
    `)
    .eq('serial_number', serial.trim())
    .maybeSingle()

  if (error || !cert) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-red-200 dark:border-red-900/30 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-kufi text-red-600">شهادة غير مسجلة</h2>
        <p className="text-sm font-cairo text-slate-600 dark:text-slate-400 leading-relaxed">
          لم يتم العثور على وثيقة رسمية مسجلة بهذا الرقم التسلسلي (<span className="font-mono font-bold text-slate-800 dark:text-slate-200">{serial}</span>). يرجى التأكد من صحة الرقم أو التواصل مع إدارة الأكاديمية الحزبية.
        </p>
        <div className="pt-4">
          <Link href="/verify" className="inline-block text-xs font-bold text-jcp-navy dark:text-jcp-gold underline font-cairo">
            إعادة المحاولة برقم آخر
          </Link>
        </div>
      </div>
    )
  }

  const enrollment = Array.isArray(cert.enrollments) ? cert.enrollments[0] : cert.enrollments
  const profile = Array.isArray(enrollment?.profiles) ? enrollment?.profiles[0] : enrollment?.profiles
  const program = Array.isArray(enrollment?.programs) ? enrollment?.programs[0] : enrollment?.programs

  const participantName = profile?.full_name || 'عضو الأكاديمية'
  const programTitle = program?.title || 'برنامج تأهيلي معتمد'
  const formattedDate = new Date(cert.issue_date).toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const typeText = cert.type === 'completion' ? 'شهادة إتمام دورة تدريبية' : 'شهادة مشاركة في دورة تدريبية'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border-2 border-emerald-500/40 text-right max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-cairo flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              وثيقة معتمدة وموثقة رسميًا
            </span>
            <h2 className="text-xl font-bold font-kufi text-slate-900 dark:text-white">
              {typeText}
            </h2>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300">
          {cert.serial_number}
        </span>
      </div>

      <div className="space-y-4 font-cairo">
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <User className="w-5 h-5 text-jcp-gold shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-slate-500">اسم الحاصل على الشهادة:</span>
            <p className="font-bold text-base text-slate-900 dark:text-white">{participantName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <BookOpen className="w-5 h-5 text-jcp-gold shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-slate-500">البرنامج التدريبي المعتمد:</span>
            <p className="font-bold text-base text-slate-900 dark:text-white">{programTitle}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
          <Calendar className="w-5 h-5 text-jcp-gold shrink-0 mt-0.5" />
          <div>
            <span className="text-xs text-slate-500">تاريخ التحرير والإصدار:</span>
            <p className="font-bold text-base text-slate-900 dark:text-white">{formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
        <p className="text-xs text-slate-500 font-cairo">
          صادرة عن الأكاديمية الحزبية — حزب المحافظين الأردني ومقيدة في سجلات الاعتماد الرسمي.
        </p>
      </div>
    </div>
  )
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ serial?: string }>
}) {
  const { serial } = await searchParams

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-jcp-navy dark:text-white font-kufi">
            التحقق من صحة الوثائق والشهادات
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-cairo">
            نظام التوثيق الرقمي للأكاديمية الحزبية — حزب المحافظين الأردني
          </p>
        </header>

        <Suspense fallback={<div className="text-center font-cairo py-12">جاري التحقق...</div>}>
          <VerifyContent serial={serial} />
        </Suspense>
      </div>
    </div>
  )
}
