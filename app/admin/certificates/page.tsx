import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Award } from 'lucide-react'
import { CertificateIssuer } from './CertificateIssuer'

export const metadata = {
  title: 'إصدار الشهادات | إدارة الأكاديمية',
}

export default async function AdminCertificatesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch enrollments that are completed (or active, admin decides)
  // Include their existing certificates if any
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      status,
      profiles ( full_name ),
      sessions (
        programs ( title )
      ),
      certificates (
        id,
        type,
        issue_date,
        serial_number
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <Link href="/admin" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold font-cairo mb-6 gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للوحة التحكم
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi flex items-center gap-3">
            <Award className="w-8 h-8 text-gold-500" />
            إصدار الشهادات
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            إصدار وتنزيل الشهادات للمتدربين.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">المتدرب</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">البرنامج</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">الحالة</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">إجراءات الشهادة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {enrollments?.map((enr: any) => {
                  const participantName = Array.isArray(enr.profiles) ? enr.profiles[0]?.full_name : enr.profiles?.full_name
                  const programTitle = Array.isArray(enr.sessions?.programs) ? enr.sessions?.programs[0]?.title : enr.sessions?.programs?.title
                  const cert = Array.isArray(enr.certificates) ? enr.certificates[0] : enr.certificates

                  return (
                    <tr key={enr.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/25">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white font-cairo">{participantName || 'غير معروف'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-cairo">{programTitle || 'غير محدد'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold font-cairo ${
                          enr.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enr.status === 'completed' ? 'مكتمل' : 'نشط/منسحب'}
                        </span>
                      </td>
                      <td className="px-6 py-4 w-64">
                        <CertificateIssuer 
                          enrollmentId={enr.id}
                          participantName={participantName || ''}
                          programTitle={programTitle || ''}
                          existingCertificate={cert}
                        />
                      </td>
                    </tr>
                  )
                })}
                {(!enrollments || enrollments.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-cairo">
                      لا يوجد متدربين مسجلين.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
