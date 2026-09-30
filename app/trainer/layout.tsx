import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'لوحة المدرب | JCP Academy',
}

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Authorize via user_roles check
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleData?.role !== 'trainer') {
    redirect('/dashboard') // unauthorized users (e.g. trainee) go to normal dashboard
  }

  return (
    <>
      {children}
    </>
  )
}
