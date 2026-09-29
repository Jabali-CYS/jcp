import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, BookOpen, FileText } from 'lucide-react'

export const metadata = {
  title: 'لوحة المدرب | JCP Academy',
}

export default async function TrainerDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify Trainer Role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'trainer')
    .single()

  if (!roleData) {
    // Not a trainer
    redirect('/dashboard')
  }

  // Fetch Trainer's Sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      session_date,
      programs ( title ),
      training_packages ( title )
    `)
    .eq('trainer_id', user.id)
    .order('session_date', { ascending: false })

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            لوحة المدرب
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            مرحباً بك. هنا يمكنك إدارة الجلسات التدريبية الخاصة بك والوصول إلى المحتوى الرقمي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/trainer/content" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-primary-300 transition-colors group">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi group-hover:text-primary-600 transition-colors">المحتوى الرقمي</h2>
              <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm mt-1">المواد الرقمية المتاحة للبرامج التي تدرسها</p>
            </div>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-500" />
            الجلسات التدريبية الخاصة بك
          </h2>
          
          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-cairo">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg">لا توجد جلسات تدريبية مرتبطة بحسابك حالياً.</p>
              <p className="text-sm mt-2">يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session: Record<string, any>) => (
                <div key={session.id} className="p-5 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all bg-gray-50 dark:bg-gray-900/50 flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white font-kufi mb-1">
                      {session.programs?.title || 'جلسة تدريبية'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-cairo mb-4">
                      {session.training_packages?.title}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-cairo gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span>{new Date(session.session_date).toLocaleDateString('ar-JO', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href={`/trainer/sessions/${session.id}`} className="flex items-center justify-center w-full py-2 px-4 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold font-cairo rounded-lg transition-colors gap-2">
                      <Users className="w-4 h-4" />
                      إدارة الجلسة
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
