import { createClient } from '@/lib/supabase/server'
import { createContent, deleteContent } from './actions'

export const metadata = {
  title: 'إدارة المحتوى الرقمي | JCP Academy',
}

export default async function AdminContentPage() {
  const supabase = await createClient()

  // Fetch all content with their program associations
  const { data: contentsData, error: contentsErr } = await supabase
    .from('digital_content')
    .select(`
      id,
      title,
      file_url,
      created_at,
      program_id,
      programs ( title )
    `)
    .order('created_at', { ascending: false })

  if (contentsErr) {
    console.error('Error fetching digital content:', contentsErr)
  }

  const contents = contentsData || []

  // Fetch all active programs to populate the create form dropdown
  const { data: programsData } = await supabase
    .from('programs')
    .select('id, title')
    .order('created_at', { ascending: false })

  const programs = programsData || []

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            المحتوى الرقمي
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            إدارة روابط ومواد المحتوى الرقمي المرفقة بالبرامج التدريبية.
          </p>
        </div>

        {/* Create Content Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white font-kufi mb-4">إضافة محتوى جديد</h2>
          <form action={createContent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="programId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">البرنامج المرتبط</label>
              <select
                name="programId"
                id="programId"
                required
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
              >
                <option value="" disabled selected>-- اختر البرنامج --</option>
                {programs.map((prog: any) => (
                  <option key={prog.id} value={prog.id}>{prog.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">عنوان المحتوى</label>
              <input
                type="text"
                name="title"
                id="title"
                required
                placeholder="مثال: عرض تقديمي..."
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo"
              />
            </div>

            <div>
              <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">رابط الملف</label>
              <input
                type="url"
                name="fileUrl"
                id="fileUrl"
                required
                placeholder="https://..."
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 font-cairo text-left"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-md hover:bg-primary-700 font-cairo h-[38px]"
            >
              حفظ المحتوى
            </button>
          </form>
        </div>

        {/* Content List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">البرنامج</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">العنوان</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">الرابط</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">تاريخ الإضافة</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">حذف</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {contents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 font-cairo">
                      لا يوجد محتوى رقمي مضاف حالياً.
                    </td>
                  </tr>
                ) : (
                  contents.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-cairo font-medium">
                        {item.programs?.title || 'برنامج غير معروف'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-cairo">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-cairo" dir="ltr">
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 truncate block max-w-xs">
                          {item.file_url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-cairo">
                        {new Date(item.created_at).toLocaleDateString('ar-JO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-cairo">
                        <form action={deleteContent}>
                          <input type="hidden" name="contentId" value={item.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-bold"
                          >
                            حذف
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
