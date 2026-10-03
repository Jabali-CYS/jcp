import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BookOpen, FileText, Calendar } from 'lucide-react'

export const metadata = {
  title: 'المحتوى الرقمي | JCP Academy',
}

export default async function TraineeDigitalContentPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 1. Fetch the user's enrolled program IDs (active or completed enrollments only)
  const { data: enrollmentData } = await supabase
    .from('enrollments')
    .select('sessions ( program_id )')
    .eq('profile_id', user.id)
    .in('status', ['active', 'completed'])

  // Extract unique program IDs the user has access to
  const programIds: string[] = []
  if (enrollmentData) {
    for (const enr of enrollmentData) {
      const sessions = Array.isArray(enr.sessions) ? enr.sessions : enr.sessions ? [enr.sessions] : []
      for (const sess of sessions) {
        if (sess?.program_id && !programIds.includes(sess.program_id)) {
          programIds.push(sess.program_id)
        }
      }
    }
  }

  // 2. Fetch authorized digital content — scoped strictly to enrolled programs
  let contentData: any[] = []
  if (programIds.length > 0) {
    const { data, error } = await supabase
      .from('digital_content')
      .select(`
        id,
        title,
        file_url,
        created_at,
        program_id,
        programs ( title )
      `)
      .in('program_id', programIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching digital content:', error)
    }
    contentData = data || []
  }

  // Group content by program
  const groupedContent = contentData.reduce((acc: Record<string, any[]>, item: any) => {
    let programTitle = 'برنامج غير محدد'
    if (item.programs) {
      if (Array.isArray(item.programs) && item.programs.length > 0) {
        programTitle = item.programs[0].title
      } else if (item.programs.title) {
        programTitle = item.programs.title
      }
    }
    
    if (!acc[programTitle]) {
      acc[programTitle] = []
    }
    acc[programTitle].push(item)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 font-bold font-cairo mb-6 gap-2">
            <ArrowRight className="w-4 h-4" />
            العودة للوحة المعلومات
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            المحتوى الرقمي
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo text-lg">
            المواد الرقمية المتاحة لك ضمن البرامج التي أنت مسجل فيها.
          </p>
        </div>

        {Object.keys(groupedContent).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-2">لا توجد مواد رقمية</h2>
            <p className="text-gray-500 dark:text-gray-400 font-cairo text-lg">
              لا توجد مواد رقمية متاحة لك حاليًا.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedContent).map(([programTitle, items]) => (
              <div key={programTitle} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 p-6">
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                    {programTitle}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(items as any[]).map((item) => (
                      <div key={item.id} className="flex flex-col border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-sm transition-all bg-white dark:bg-gray-800">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white font-cairo text-lg truncate" title={item.title}>
                              {item.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 gap-1.5 font-cairo">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(item.created_at).toLocaleDateString('ar-JO', {
                                  year: 'numeric', month: 'long', day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold font-cairo rounded-lg transition-colors"
                          >
                            فتح المادة
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
