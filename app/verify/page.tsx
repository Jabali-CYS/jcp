import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Award, XCircle } from 'lucide-react'
import Link from 'next/link'
import CertificateView from '@/components/CertificateView'

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

  // Use admin client strictly on server for public verification by exact serial number.
  // This allows anonymous public verification without opening certificates table broad RLS.
  const supabase = createAdminClient()

  // Query certificate by serial number safely on server
  const { data: cert, error } = await supabase
    .from('certificates')
    .select(`
      id,
      type,
      issue_date,
      serial_number,
      enrollments (
        profiles ( full_name ),
        sessions (
          programs ( title )
        )
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
  const sessionObj = Array.isArray(enrollment?.sessions) ? enrollment?.sessions[0] : enrollment?.sessions
  const programObj = Array.isArray(sessionObj?.programs) ? sessionObj?.programs[0] : sessionObj?.programs

  const participantName = profile?.full_name || 'عضو الأكاديمية'
  const programTitle = programObj?.title || 'برنامج تأهيلي معتمد'
  const formattedDate = new Date(cert.issue_date).toLocaleDateString('ar-JO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let qrDataUrl = ''
  try {
    const QRCode = (await import('qrcode')).default
    qrDataUrl = await QRCode.toDataURL(`https://jcpacademy.com/verify?serial=${encodeURIComponent(cert.serial_number)}`, {
      margin: 1,
      width: 160,
      color: { dark: '#0e1e38', light: '#ffffff' },
    })
  } catch (qrErr) {
    console.warn('QR generation in verify page failed:', qrErr)
  }

  return (
    <CertificateView
      serialNumber={cert.serial_number}
      participantName={participantName}
      programTitle={programTitle}
      issueDate={formattedDate}
      certificateType={cert.type as 'completion' | 'participation'}
      qrDataUrl={qrDataUrl}
      certificateId={cert.id}
    />
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
