import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'سجل التدقيق | JCP Academy',
}

export default async function AdminAuditPage() {
  const supabase = await createClient()

  // Fetch audit logs safely with a limit to prevent unbounded queries
  const { data: logsData, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      created_at,
      action,
      target_table,
      target_id,
      details,
      profiles:actor_id ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching audit logs:', error)
  }

  const logs = logsData || []

  const formatAction = (action: string) => {
    switch (action) {
      case 'role_assigned': return 'إضافة صلاحية'
      case 'role_changed': return 'تغيير صلاحية'
      case 'role_removed': return 'إزالة صلاحية'
      case 'application_status_changed': return 'تغيير حالة طلب'
      case 'certificate_issued': return 'إصدار شهادة'
      case 'enrollment_created': return 'تسجيل متدرب'
      case 'create_program': return 'إنشاء برنامج'
      case 'update_program_status': return 'تحديث حالة برنامج'
      case 'create_session': return 'إنشاء جلسة'
      case 'update_session': return 'تحديث جلسة'
      case 'create_content': return 'إضافة محتوى رقمي'
      case 'delete_content': return 'حذف محتوى رقمي'
      default: return action
    }
  }

  const formatTable = (table: string) => {
    switch (table) {
      case 'user_roles': return 'الصلاحيات'
      case 'applications': return 'الطلبات'
      default: return table
    }
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            سجل التدقيق الأمني
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            مراقبة وتتبع العمليات الإدارية الحساسة على مستوى النظام (أحدث 100 سجل).
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">التاريخ والوقت</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">المستخدم (الفاعل)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">الإجراء</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">الكيان المتأثر</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-kufi">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 font-cairo">
                      لا توجد سجلات متاحة
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-cairo" dir="ltr">
                        {new Date(log.created_at).toLocaleString('ar-JO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white font-cairo">
                        {(log.profiles as any)?.full_name || 'حساب محذوف / مجهول'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-cairo">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-cairo">
                        {formatTable(log.target_table)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-cairo max-w-xs truncate" title={log.details ? JSON.stringify(log.details) : ''}>
                        {log.details ? (
                          <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto text-left" dir="ltr">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          '-'
                        )}
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
