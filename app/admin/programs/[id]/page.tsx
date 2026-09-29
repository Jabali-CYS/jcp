import { createClient } from '@/lib/supabase/server'
import { createSession, updateSessionAssignment } from './actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'إدارة جلسات البرنامج | JCP Academy',
}

export default async function ProgramSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = await params

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') redirect('/dashboard')

  // Fetch Program
  const { data: program, error: progErr } = await supabase
    .from('programs')
    .select('id, title, status')
    .eq('id', programId)
    .single()

  if (progErr || !program) {
    return <div className="p-8 text-center text-red-500 font-cairo">لم يتم العثور على البرنامج.</div>
  }

  // Fetch Sessions
  const { data: sessionsData } = await supabase
    .from('sessions')
    .select(`
      id,
      session_date,
      created_at,
      package_id,
      trainer_id,
      training_packages ( title ),
      profiles ( full_name )
    `)
    .eq('program_id', programId)
    .order('session_date', { ascending: true })

  const sessions = sessionsData || []

  // Fetch Training Packages for the dropdown
  const { data: packagesData } = await supabase
    .from('training_packages')
    .select('id, title')
    .order('created_at', { ascending: true })
  
  const packages = packagesData || []

  // Fetch Trainers
  const { data: trainersData } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      user_roles!inner ( role )
    `)
    .eq('user_roles.role', 'trainer')

  const trainers = trainersData || []

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin/programs" className="text-gray-500 hover:text-primary-600 font-cairo text-sm">
                البرامج
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white font-cairo text-sm font-bold truncate max-w-xs">{program.title}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
              إدارة الجلسات
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
              تعيين المدربين وتحديد المواعيد للجلسات التدريبية في هذا البرنامج.
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
            program.status === 'active' ? 'bg-green-100 text-green-800' :
            program.status === 'archived' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            الحالة: {program.status === 'active' ? 'مفعل' : program.status === 'archived' ? 'مؤرشف' : 'مسودة'}
          </div>
        </div>

        {/* Create Session Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-6">إضافة جلسة تدريبية</h2>
          <form action={createSession} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <input type="hidden" name="programId" value={program.id} />
            
            <div>
              <label htmlFor="packageId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">الحقيبة التدريبية</label>
              <select
                name="packageId"
                id="packageId"
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
              >
                <option value="" disabled selected>-- اختر الحقيبة --</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sessionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">الموعد</label>
              <input
                type="datetime-local"
                name="sessionDate"
                id="sessionDate"
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
              />
            </div>

            <div>
              <label htmlFor="trainerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">المدرب (اختياري)</label>
              <select
                name="trainerId"
                id="trainerId"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
              >
                <option value="">-- بدون مدرب حالياً --</option>
                {trainers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-md hover:bg-primary-700 font-cairo h-[38px]"
            >
              إضافة الجلسة
            </button>
          </form>
        </div>

        {/* Sessions List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">الحقيبة التدريبية</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">الموعد</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">المدرب</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">تحديث</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 font-cairo">
                      لا توجد جلسات تدريبية مدرجة في هذا البرنامج بعد.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session: any) => {
                    const sessionDateStr = new Date(session.session_date).toISOString().slice(0, 16)
                    return (
                      <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-cairo">
                          {session.training_packages?.title || 'حقيبة غير معروفة'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-cairo">
                          <form id={`form-${session.id}`} action={updateSessionAssignment} className="flex flex-col gap-2">
                            <input type="hidden" name="sessionId" value={session.id} />
                            <input type="hidden" name="programId" value={programId} />
                            <input
                              type="datetime-local"
                              name="sessionDate"
                              defaultValue={sessionDateStr}
                              required
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-xs dark:bg-gray-700 font-cairo"
                            />
                          </form>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-cairo">
                          <select
                            form={`form-${session.id}`}
                            name="trainerId"
                            defaultValue={session.trainer_id || ""}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-xs dark:bg-gray-700 font-cairo"
                          >
                            <option value="">-- غير معين --</option>
                            {trainers.map((t: any) => (
                              <option key={t.id} value={t.id}>{t.full_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-cairo">
                          <button
                            form={`form-${session.id}`}
                            type="submit"
                            className="px-3 py-1 bg-gold-600 text-white text-xs font-bold rounded hover:bg-gold-700 transition-colors"
                          >
                            حفظ
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
