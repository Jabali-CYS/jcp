import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Award, Download, Calendar } from 'lucide-react'

export const metadata = {
  title: 'شهاداتي | JCP Academy',
}

export default async function TraineeCertificatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch certificates via RLS. Since certificates are linked to enrollments, 
  // Trainee will only see certificates for their enrollments.
  const { data: certificates, error } = await supabase
    .from('certificates')
    .select(`
      id,
      type,
      issue_date,
      serial_number,
      enrollments (
        programs ( title )
      )
    `)
    .order('issue_date', { ascending: false })

  if (error) {
    console.error('Error fetching certificates:', error)
  }

  const getTypeName = (type: string) => {
    return type === 'completion' ? 'إتمام دورة تدريبية' : 'مشاركة في دورة تدريبية'
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold font-cairo mb-6 gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للوحة المعلومات
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            شهاداتي
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo text-lg">
            الشهادات المعتمدة التي حصلت عليها من الأكاديمية الحزبية.
          </p>
        </div>

        {!certificates || certificates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <Award className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-2">لا توجد شهادات</h2>
            <p className="text-gray-500 dark:text-gray-400 font-cairo text-lg">
              لم تحصل على أي شهادات حتى الآن. ستظهر شهاداتك هنا بمجرد إصدارها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert: any) => {
              const programTitle = Array.isArray(cert.enrollments) 
                ? cert.enrollments[0]?.programs?.title 
                : cert.enrollments?.programs?.title

              return (
                <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col hover:border-gold-300 transition-all">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gold-50 dark:bg-gold-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 rounded text-xs font-bold font-cairo mb-2">
                          شهادة {getTypeName(cert.type)}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-kufi leading-tight">
                          {programTitle || 'برنامج تدريبي'}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex flex-col text-sm text-gray-500 dark:text-gray-400 font-cairo gap-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>الإصدار: {new Date(cert.issue_date).toLocaleDateString('ar-JO')}</span>
                        </div>
                        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded self-start tracking-wider">
                          {cert.serial_number}
                        </div>
                      </div>
                      
                      <a 
                        href={`/api/certificates/${cert.id}/download`} 
                        download
                        className="inline-flex items-center gap-2 bg-navy-800 dark:bg-navy-900 hover:bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-bold font-cairo transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4 text-gold-400" />
                        تحميل PDF
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
