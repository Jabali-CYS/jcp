import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowRight, User, FileText } from 'lucide-react'

export const metadata = {
  title: 'تفاصيل الجلسة التدريبية | JCP Academy',
}

export default async function TraineeSessionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sessionId = params.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Authorize: check if trainee is actually enrolled in this session
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollments')
    .select(`
      id,
      status,
      sessions (
        id,
        session_date,
        programs ( title ),
        training_packages ( title ),
        profiles ( first_name, last_name )
      )
    `)
    .eq('session_id', sessionId)
    .eq('profile_id', user.id)
    .single()

  if (enrollmentError || !enrollment || !enrollment.sessions) {
    // Unauthorized or not found
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-kufi mb-4">غير مصرح لك بالوصول</h1>
        <p className="text-gray-600 dark:text-gray-400 font-cairo mb-6">لا يمكنك عرض تفاصيل جلسة لست مسجلاً فيها.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-cairo font-bold transition-colors">
          العودة للوحة المعلومات
        </Link>
      </div>
    )
  }

  const session = enrollment.sessions as any
  const trainerName = session.profiles ? `${session.profiles.first_name} ${session.profiles.last_name}` : 'غير محدد'

  // Fetch Attendance and Evaluations securely using enrollment.id
  const [attRes, evalRes] = await Promise.all([
    supabase.from('attendance').select('status').eq('enrollment_id', enrollment.id).single(),
    supabase.from('evaluations').select('type, feedback').eq('enrollment_id', enrollment.id)
  ])

  const attendance = attRes.data
  const preEval = evalRes.data?.find(e => e.type === 'pre')
  const postEval = evalRes.data?.find(e => e.type === 'post')

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold font-cairo mb-6 gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للوحة المعلومات
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            {session.programs?.title || 'جلسة تدريبية'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo text-lg">
            {session.training_packages?.title}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-6">معلومات الجلسة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <Calendar className="w-5 h-5 text-primary-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo">تاريخ الجلسة</p>
                  <p className="text-gray-900 dark:text-white font-cairo font-bold mt-1">
                    {new Date(session.session_date).toLocaleDateString('ar-JO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <User className="w-5 h-5 text-primary-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo">المدرب</p>
                  <p className="text-gray-900 dark:text-white font-cairo font-bold mt-1">
                    {trainerName}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-kufi mb-4">حالة التسجيل</h3>
              <div className="inline-flex px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold font-cairo">
                {enrollment.status === 'active' ? 'مشاركة نشطة' : enrollment.status === 'completed' ? 'مكتمل' : 'منسحب'}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-kufi mb-4">سجل الحضور والتقييمات</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo mb-2">حالة الحضور</p>
                  {attendance ? (
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${attendance.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {attendance.status === 'present' ? 'حاضر' : 'غائب'}
                    </span>
                  ) : (
                    <span className="text-gray-400 font-cairo">لم يتم رصد الحضور بعد</span>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo mb-2">التقييم القبلي</p>
                  {preEval ? (
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-cairo line-clamp-3">
                      {preEval.feedback}
                    </div>
                  ) : (
                    <span className="text-gray-400 font-cairo">لا يوجد تقييم</span>
                  )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo mb-2">التقييم البعدي</p>
                  {postEval ? (
                    <div className="text-sm text-gray-800 dark:text-gray-200 font-cairo line-clamp-3">
                      {postEval.feedback}
                    </div>
                  ) : (
                    <span className="text-gray-400 font-cairo">لا يوجد تقييم</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-kufi">المحتوى الرقمي</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-4">
                الوصول إلى المواد الرقمية المرتبطة بهذا البرنامج.
              </p>
              <Link href="/dashboard/content" className="inline-flex items-center justify-center py-2.5 px-6 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold font-cairo rounded-xl transition-colors gap-2 w-full sm:w-auto">
                تصفح المحتوى الرقمي
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
