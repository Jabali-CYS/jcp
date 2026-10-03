import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'البرامج التدريبية | JCP Academy',
}

export default async function ProgramsPage() {
  const supabase = await createClient()

  // Only fetch active programs
  const { data: programs, error } = await supabase
    .from('programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen pt-32 pb-20 bg-transparent px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            البرامج التدريبية
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            تصفح البرامج المتاحة حالياً للتسجيل
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl text-red-600 dark:text-red-400 font-cairo">
            حدث خطأ أثناء تحميل البرامج
          </div>
        ) : !programs || programs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center font-cairo text-gray-500">
            لا توجد برامج متاحة للتسجيل حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Link 
                key={program.id} 
                href={`/programs/${program.id}`}
                className="block group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-2 group-hover:text-primary-600 transition-colors">
                    {program.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 font-cairo">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(program.created_at).toLocaleDateString('ar-JO')}</span>
                    </div>
                    <div className="flex items-center text-primary-600 dark:text-primary-400 font-bold">
                      <span>التفاصيل</span>
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
