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
    .single();

  if (!profile) {
    redirect('/dashboard');
  }

  const initialData = {
    full_name: profile.full_name,
    age: profile.age,
    experience: profile.experience,
    party_affiliation: profile.party_affiliation,
    email: user.email || '',
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-kufi">
            الملف الشخصي
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 font-cairo">
            إدارة بياناتك الشخصية في الأكاديمية الحزبية.
          </p>
        </div>

        <ProfileForm initialData={initialData} />
      </div>
    </div>
  );
}
