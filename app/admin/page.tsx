import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { processApplication } from './actions'

export const metadata = {
  title: 'لوحة تحكم الإدارة | JCP Academy',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Layout handles authentication and authorization

  // Fetch all pending applications
  const { data: pendingApps } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      program_id,
      profiles ( full_name ),
      programs ( title )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch available sessions for matching
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      program_id,
      session_date,
      training_packages ( title ),
      profiles ( full_name )
    `)
    .order('session_date', { ascending: true })

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            إدارة طلبات الالتحاق
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            مراجعة الطلبات المعلقة وتحديد المقبولين وإصدار الشهادات.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/certificates" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-gold-300 transition-colors group">
            <div className="w-12 h-12 bg-gold-50 dark:bg-gold-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gold-600 dark:text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi group-hover:text-gold-600 transition-colors">إصدار الشهادات</h2>
              <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm mt-1">إصدار وتحميل شهادات التدريب</p>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          {!pendingApps || pendingApps.length === 0 ? (
            <p className="text-gray-500 font-cairo text-center py-8">لا توجد طلبات معلقة حالياً.</p>
          ) : (
            <div className="space-y-6">
              {pendingApps.map((app: any) => {
                const programSessions = sessions?.filter(s => s.program_id === app.program_id) || []

                return (
                  <div key={app.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white font-cairo">المتدرب: {app.profiles?.full_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-cairo">البرنامج: {app.programs?.title}</p>
                      <p className="text-xs text-gray-500 font-cairo mt-1">تاريخ الطلب: {new Date(app.created_at).toLocaleDateString('ar-JO')}</p>
                    </div>

                    <form action={processApplication} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <input type="hidden" name="applicationId" value={app.id} />
                      
                      <div className="flex-1">
                        <select 
                          name="sessionId" 
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
                          defaultValue=""
                        >
                          <option value="" disabled>-- اختر الجلسة للموافقة --</option>
                          {programSessions.map((session: any) => (
                            <option key={session.id} value={session.id}>
                              {session.training_packages?.title} ({new Date(session.session_date).toLocaleDateString('ar-JO')}) - المدرب: {session.profiles?.full_name || 'غير محدد'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          name="action" 
                          value="approve" 
                          className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 font-cairo"
                        >
                          موافقة وتسجيل
                        </button>
                        <button 
                          type="submit" 
                          name="action" 
                          value="reject"
                          className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 font-cairo"
                        >
                          رفض الطلب
                        </button>
                      </div>
                    </form>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
