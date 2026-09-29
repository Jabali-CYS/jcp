import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowRight, Users, FileText } from 'lucide-react'
import TrainerSessionManager from './TrainerSessionManager'

export const metadata = {
  title: 'إدارة الجلسة | JCP Academy',
}

export default async function TrainerSessionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sessionId = params.id
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Authorize: check if trainer owns this session
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      id,
      session_date,
      programs ( title ),
      training_packages ( title )
    `)
    .eq('id', sessionId)
    .eq('trainer_id', user.id)
    .single()

  if (sessionError || !session) {
    // Unauthorized or not found
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-kufi mb-4">غير مصرح لك بالوصول</h1>
        <p className="text-gray-600 dark:text-gray-400 font-cairo mb-6">هذه الجلسة غير موجودة أو غير مسندة لك.</p>
        <Link href="/trainer" className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-cairo font-bold transition-colors">
          العودة للوحة المدرب
        </Link>
      </div>
    )
  }

  // Fetch enrollments
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, profile_id, status')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  // Fetch trainee names securely via view
  const { data: traineeNames } = await supabase
    .from('trainer_trainee_names')
    .select('id, full_name')

  // Map names to enrollments
  const traineeMap = new Map((traineeNames || []).map(t => [t.id, t.full_name]))
  const trainees = (enrollments || []).map(enr => ({
    ...enr,
    full_name: traineeMap.get(enr.profile_id) || 'غير معروف'
  }))

  const enrollmentIds = trainees.map(t => t.id)

  let attendanceData: any[] = []
  let evaluationData: any[] = []

  if (enrollmentIds.length > 0) {
    const [attRes, evalRes] = await Promise.all([
      supabase.from('attendance').select('id, enrollment_id, status').in('enrollment_id', enrollmentIds),
      supabase.from('evaluations').select('id, enrollment_id, type, feedback').in('enrollment_id', enrollmentIds)
    ])
    attendanceData = attRes.data || []
    evaluationData = evalRes.data || []
  }

  const sessionAny = session as any

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/trainer" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold font-cairo mb-6 gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للوحة المدرب
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            {sessionAny.programs?.title || 'إدارة الجلسة'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo text-lg">
            {sessionAny.training_packages?.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-4">معلومات الجلسة</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo">تاريخ الجلسة</p>
                    <p className="text-gray-900 dark:text-white font-cairo font-bold mt-1">
                      {new Date(session.session_date).toLocaleDateString('ar-JO', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold font-cairo">عدد المسجلين</p>
                    <p className="text-gray-900 dark:text-white font-cairo font-bold mt-1">
                      {trainees.length} متدرب
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mt-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-primary-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi">المحتوى الرقمي</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-4">
                الوصول إلى المواد الرقمية المرتبطة بهذا البرنامج.
              </p>
              <Link href="/trainer/content" className="flex items-center justify-center w-full py-2.5 px-4 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold font-cairo rounded-xl transition-colors gap-2">
                تصفح المحتوى الرقمي
              </Link>
            </div>
          </div>
            
          <div className="lg:col-span-2">
            <TrainerSessionManager 
              sessionId={sessionId} 
              trainees={trainees} 
              attendanceData={attendanceData} 
              evaluationData={evaluationData} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
