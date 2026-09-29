import { createClient } from '@/lib/supabase/server'
import { createProgram, updateProgramStatus } from './actions'
import Link from 'next/link'

export const metadata = {
  title: 'إدارة البرامج | JCP Academy',
}

export default async function AdminProgramsPage() {
  const supabase = await createClient()

  const { data: programsData, error } = await supabase
    .from('programs')
    .select(`
      id,
      title,
      status,
      created_at,
      sessions ( count ),
      applications ( count ),
      enrollments ( count )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching programs:', error)
  }

  const programs = programsData || []

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
              إدارة البرامج
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
              إنشاء وإدارة البرامج التدريبية المعتمدة في الأكاديمية.
            </p>
          </div>
        </div>

        {/* Create Program Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-4">برنامج جديد</h2>
          <form action={createProgram} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <label htmlFor="title" className="sr-only">عنوان البرنامج</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="أدخل عنوان البرنامج الجديد..."
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 font-cairo"
            >
              إنشاء البرنامج
            </button>
          </form>
        </div>

        {/* Programs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length === 0 ? (
            <p className="text-gray-500 font-cairo text-center col-span-full py-8">لا توجد برامج مسجلة حتى الآن.</p>
          ) : (
            programs.map((program: any) => (
              <div key={program.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white font-kufi">{program.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    program.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    program.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {program.status === 'active' ? 'مفعل' : program.status === 'archived' ? 'مؤرشف' : 'مسودة'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-6 space-y-1">
                  <p>الجلسات التدريبية: {program.sessions?.[0]?.count || 0}</p>
                  <p>طلبات الالتحاق: {program.applications?.[0]?.count || 0}</p>
                  <p>المسجلين المعتمدين: {program.enrollments?.[0]?.count || 0}</p>
                  <p className="text-xs mt-2">تاريخ الإنشاء: {new Date(program.created_at).toLocaleDateString('ar-JO')}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                  <form action={updateProgramStatus} className="flex gap-2">
                    <input type="hidden" name="programId" value={program.id} />
                    <select 
                      name="status" 
                      defaultValue={program.status}
                      className="flex-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-xs dark:bg-gray-700 font-cairo py-1"
                    >
                      <option value="draft">مسودة</option>
                      <option value="active">مفعل</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                    <button type="submit" className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-md font-cairo transition-colors">
                      تحديث الحالة
                    </button>
                  </form>
                  <Link href={`/admin/programs/${program.id}`} className="block w-full text-center px-4 py-2 bg-gold-600 hover:bg-gold-700 text-white text-sm font-bold rounded-lg font-cairo transition-colors">
                    إدارة الجلسات التفصيلية
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
