import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';

export const metadata = {
  title: 'الملف الشخصي | JCP Academy',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: rolesData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);

  const roles = (rolesData && rolesData.length > 0) 
    ? rolesData.map((r: { role: string }) => r.role) 
    : ['trainee'];

  const initialData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || 'مستخدم جديد',
    age: profile?.age ?? null,
    experience: profile?.experience ?? null,
    party_affiliation: profile?.party_affiliation ?? null,
    email: user.email || '',
    roles: roles,
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            الملف الشخصي والحساب
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            إدارة بياناتك الشخصية والاطلاع على رتبتك وصلاحياتك المعتمدة في الأكاديمية الحزبية.
          </p>
        </div>

        <ProfileForm initialData={initialData} />
      </div>
    </div>
  );
}
