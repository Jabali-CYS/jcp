import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'
import { LogOut } from 'lucide-react'

export const metadata = {
  title: 'الإدارة | JCP Academy',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Authorize via RLS check
  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (roleData?.role !== 'admin') {
    redirect('/dashboard') // unauthorized users go to normal dashboard
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <div className="flex gap-4 sm:gap-8 overflow-x-auto py-2">
              <Link href="/admin" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 font-kufi shrink-0">
                الرئيسية
              </Link>
              <Link href="/admin/users" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 font-kufi shrink-0">
                المستخدمون
              </Link>
              <Link href="/admin/programs" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 font-kufi shrink-0">
                البرامج والجلسات
              </Link>
              <Link href="/admin/content" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 font-kufi shrink-0">
                المحتوى الرقمي
              </Link>
              <Link href="/admin/certificates" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 font-kufi shrink-0">
                الشهادات
              </Link>
              <Link href="/verify" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:border-emerald-300 dark:text-emerald-400 dark:hover:text-emerald-300 font-kufi shrink-0 gap-1.5">
                <span>التحقق من الشهادات</span>
                <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono">/verify</span>
              </Link>
              <Link href="/admin/audit" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 font-kufi shrink-0">
                سجل التدقيق
              </Link>
            </div>
            <div className="shrink-0">
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-kufi"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل الخروج</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <main>
        {children}
      </main>
    </div>
  )
}
