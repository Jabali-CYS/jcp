import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { makeAdmin, demoteAdmin } from '../actions'

export const metadata = {
  title: 'إدارة المستخدمين | JCP Academy',
}

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Use admin client to list all profiles with their roles.
  // We explicitly select only non-sensitive fields.
  const adminClient = createAdminClient()

  const { data: profiles, error } = await adminClient
    .from('profiles')
    .select('id, full_name, created_at, user_roles ( role )')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
  }

  const rows = profiles ?? []

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            إدارة المستخدمين
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            عرض المستخدمين المسجلين وأدوارهم وإدارة صلاحيات المسؤولين.
          </p>
        </div>

        {/* Make Admin form */}
        <section
          aria-labelledby="make-admin-heading"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          <h2
            id="make-admin-heading"
            className="text-lg font-bold text-gray-900 dark:text-white font-kufi mb-4"
          >
            ترقية مستخدم إلى مسؤول
          </h2>
          <form action={makeAdmin} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <label htmlFor="make-admin-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 font-cairo mb-1">
                البريد الإلكتروني للمستخدم
              </label>
              <input
                id="make-admin-email"
                name="email"
                type="email"
                required
                placeholder="user@example.com"
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 text-sm dark:bg-gray-700 dark:text-white font-cairo focus:outline-none focus:ring-2 focus:ring-primary-500"
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg font-cairo transition-colors"
            >
              ترقية إلى مسؤول
            </button>
          </form>
        </section>

        {/* User list */}
        <section aria-labelledby="users-table-heading">
          <h2
            id="users-table-heading"
            className="text-lg font-bold text-gray-900 dark:text-white font-kufi mb-4"
          >
            قائمة المستخدمين
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" aria-label="قائمة المستخدمين">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">الاسم الكامل</th>
                    <th scope="col" className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">الدور</th>
                    <th scope="col" className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">تاريخ التسجيل</th>
                    <th scope="col" className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white font-kufi">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-cairo">
                        لا يوجد مستخدمون مسجلون.
                      </td>
                    </tr>
                  ) : (
                    rows.map((profile: any) => {
                      const roleEntry = Array.isArray(profile.user_roles)
                        ? profile.user_roles[0]
                        : profile.user_roles
                      const role: string = roleEntry?.role ?? 'trainee'
                      const isCurrentUser = profile.id === user.id
                      const isAdmin = role === 'admin'

                      return (
                        <tr key={profile.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/25">
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 dark:text-white font-cairo">
                              {profile.full_name}
                              {isCurrentUser && (
                                <span className="mr-2 text-xs text-primary-500 font-normal font-cairo">(أنت)</span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold font-cairo ${
                              role === 'admin'
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                : role === 'trainer'
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {role === 'admin' ? 'مسؤول' : role === 'trainer' ? 'مدرب' : 'متدرب'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-cairo" dir="ltr">
                            {new Date(profile.created_at).toLocaleDateString('ar-JO')}
                          </td>
                          <td className="px-6 py-4">
                            {isAdmin && !isCurrentUser ? (
                              <form action={demoteAdmin}>
                                <input type="hidden" name="userId" value={profile.id} />
                                <button
                                  type="submit"
                                  className="px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-cairo transition-colors"
                                >
                                  إزالة صلاحية المسؤول
                                </button>
                              </form>
                            ) : (
                              <span className="text-xs text-gray-400 font-cairo">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
