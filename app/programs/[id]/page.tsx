import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, Info } from 'lucide-react'
import ApplicationForm from './ApplicationForm'

export default async function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch program details
  const { data: program, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !program) {
    notFound()
  }

  // 2. Fetch authenticated user (if any)
  const { data: { user } } = await supabase.auth.getUser()

  // 3. If authenticated, check if they already have an application
  let existingApplication = null
  if (user) {
    const { data: app } = await supabase
      .from('applications')
      .select('*')
      .eq('program_id', id)
      .eq('profile_id', user.id)
      .single()
    existingApplication = app
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm font-cairo text-gray-500 dark:text-gray-400">
          <Link href="/programs" className="hover:text-primary-600 transition-colors">البرامج التدريبية</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-gray-900 dark:text-white font-medium">{program.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi mb-4">
                {program.title}
              </h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-cairo mb-8">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإضافة: {new Date(program.created_at).toLocaleDateString('ar-JO')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {program.status === 'active' ? 'متاح للتسجيل' : 'مغلق'}
                  </span>
                </div>
              </div>

              <div className="prose dark:prose-invert font-cairo max-w-none">
                <p>هذا البرنامج التدريبي يهدف إلى تطوير المهارات الأساسية. سيتم إضافة المزيد من التفاصيل لاحقاً بناءً على الحزم التدريبية والجلسات المخصصة.</p>
              </div>
            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="lg:col-span-1 space-y-6">
            {program.status === 'active' ? (
              user ? (
                <ApplicationForm programId={program.id} existingApplication={existingApplication} />
              ) : (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <Info className="w-8 h-8 text-primary-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-cairo mb-4">
                    يجب عليك تسجيل الدخول لتتمكن من تقديم طلب التحاق في هذا البرنامج.
                  </p>
                  <Link 
                    href="/login" 
                    className="block w-full py-2 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors font-cairo"
                  >
                    تسجيل الدخول
                  </Link>
                </div>
              )
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl text-center">
                <p className="text-gray-600 dark:text-gray-400 font-cairo font-medium">التسجيل مغلق لهذا البرنامج</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
