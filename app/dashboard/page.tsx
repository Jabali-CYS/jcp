import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, CheckCircle, Clock, XCircle, BookOpen, FileText, Award, User, ClipboardList } from 'lucide-react'

export const metadata = {
  title: 'لوحة المعلومات | JCP Academy',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile for the welcome message
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      programs ( id, title )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch enrollments with evaluations
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      id,
      status,
      created_at,
      sessions (
        id,
        session_date,
        programs ( title ),
        training_packages ( title )
      ),
      evaluations (
        id,
        type,
        feedback,
        created_at
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })



  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'approved': return 'مقبول'
      case 'rejected': return 'مرفوض'
      default: return 'قيد المراجعة'
    }
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
              مرحباً، {profile?.full_name || 'أيها المتدرب'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
              هنا يمكنك متابعة طلباتك وبرامجك التدريبية والوصول إلى المحتوى الرقمي.
            </p>
          </div>
          <div>
            <Link href="/dashboard/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-bold font-cairo hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <User className="w-5 h-5" />
              الملف الشخصي
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/content" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-primary-300 transition-colors group">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi group-hover:text-primary-600 transition-colors">المحتوى الرقمي</h2>
              <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm mt-1">المواد الرقمية المتاحة للبرامج التي أنت مسجل فيها</p>
            </div>
          </Link>
          <Link href="/dashboard/certificates" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-gold-300 transition-colors group">
            <div className="w-12 h-12 bg-gold-50 dark:bg-gold-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-gold-600 dark:text-gold-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi group-hover:text-gold-600 transition-colors">شهاداتي</h2>
              <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm mt-1">الشهادات المعتمدة للبرامج التي اجتزتها</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              طلبات الالتحاق
            </h2>
            
            {!applications || applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-cairo">
                <p>لم تقم بتقديم أي طلبات التحاق بعد.</p>
                <Link href="/programs" className="text-primary-600 dark:text-primary-400 font-bold mt-2 inline-block">
                  تصفح البرامج المتاحة
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app: Record<string, any>) => (
                  <div key={app.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white font-cairo">
                        {app.programs?.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm font-bold font-cairo" title={getStatusText(app.status)}>
                        {getStatusIcon(app.status)}
                        <span className="hidden sm:inline">{getStatusText(app.status)}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-cairo gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>تاريخ الطلب: {new Date(app.created_at).toLocaleDateString('ar-JO')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrollments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              البرامج المسجل بها
            </h2>
            
            {!enrollments || enrollments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 font-cairo">
                <p>لا توجد برامج مسجل بها حالياً.</p>
                <p className="text-sm mt-1">ستظهر برامجك هنا بعد الموافقة على طلباتك.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enr: Record<string, any>) => (
                  <div key={enr.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white font-cairo">
                          {enr.sessions?.programs?.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-cairo">
                          {enr.sessions?.training_packages?.title}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${enr.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {enr.status === 'active' ? 'نشط' : enr.status === 'completed' ? 'مكتمل' : 'منسحب'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-cairo gap-1 mt-2">
                      <Calendar className="w-3 h-3" />
                      <span>موعد الجلسة: {new Date(enr.sessions?.session_date).toLocaleDateString('ar-JO')}</span>
                    </div>
                    
                    {/* Evaluations Summary */}
                    {enr.evaluations && enr.evaluations.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 font-cairo mb-2 flex items-center gap-1">
                          <ClipboardList className="w-4 h-4" />
                          نتائج التقييمات
                        </h4>
                        <div className="space-y-2">
                          {enr.evaluations.map((ev: any) => (
                            <div key={ev.id} className="text-xs text-blue-700 dark:text-blue-400 font-cairo">
                              <span className="font-bold">{ev.type === 'pre' ? 'التقييم القبلي' : 'التقييم البعدي'}:</span> {ev.feedback || 'لا توجد ملاحظات'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Link href={`/dashboard/sessions/${enr.sessions?.id}`} className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline font-cairo">
                        عرض تفاصيل الجلسة &larr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
