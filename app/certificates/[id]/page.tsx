import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import CertificateView from '@/components/CertificateView'

export const metadata = {
  title: 'الشهادة المعتمدة | الأكاديمية الحزبية',
  description: 'عرض الشهادة الرسمية المعتمدة الصادرة عن الأكاديمية الحزبية لحزب المحافظين الأردني.',
}

async function CertificateContent({ id, autoExport }: { id: string; autoExport?: boolean }) {
  const supabase = createAdminClient()

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
    .eq('id', id)
    .maybeSingle()

  if (error || !cert) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-red-200 dark:border-red-900/30 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-kufi text-red-600">شهادة غير متوفرة</h2>
        <p className="text-sm font-cairo text-slate-600 dark:text-slate-400 leading-relaxed">
          لم يتم العثور على وثيقة رسمية بهذا المعرف. يرجى التأكد من صحة الرابط أو مراجعة إدارة الأكاديمية.
        </p>
        <div className="pt-4">
          <Link href="/verify" className="inline-block text-xs font-bold text-jcp-navy dark:text-jcp-gold underline font-cairo">
            الانتقال لبوابة التحقق
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
    console.warn('QR generation in certificate page failed:', qrErr)
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
      autoExport={autoExport}
    />
  )
}

export default async function CertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ export?: string; print?: string }>
}) {
  const { id } = await params
  const { export: exportParam, print: printParam } = await searchParams
  const shouldAutoExport = exportParam === '1' || printParam === '1'

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-slate-50/70 dark:bg-slate-950 px-3 sm:px-6 lg:px-8 transition-colors flex flex-col justify-center">
      <div className="w-full max-w-5xl mx-auto">
        <Suspense fallback={<div className="text-center font-cairo py-24 text-slate-600 dark:text-slate-300 font-bold">جاري تحميل وتوثيق الشهادة الرسمية...</div>}>
          <CertificateContent id={id} autoExport={shouldAutoExport} />
        </Suspense>
      </div>
    </div>
  )
}
