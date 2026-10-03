"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'غير مصرح لك بإجراء هذا التعديل' };
  }

  // Explicit allowlist of fields
  const fullName = formData.get('full_name')?.toString()?.trim();
  const ageStr = formData.get('age')?.toString()?.trim();
  const experience = formData.get('experience')?.toString()?.trim() || null;

  if (!fullName) {
    return { error: 'الاسم الكامل مطلوب' };
  }

  // Reject names with digits
  if (/[\d\u0660-\u0669]/.test(fullName)) {
    return { error: 'الاسم يجب أن يحتوي على أحرف نصية فقط دون أي أرقام' };
  }

  let age: number | null = null;
  if (ageStr) {
    age = parseInt(ageStr, 10);
    if (isNaN(age) || age < 18 || age > 100) {
      return { error: 'العمر غير صالح' };
    }
  }

  // Prevent mass-assignment by only updating allowed fields
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      age: age,
      experience: experience,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'حدث خطأ أثناء تحديث الملف الشخصي' };
  }

  revalidatePath('/dashboard/profile');
  revalidatePath('/dashboard');
  
  return { success: true };
}
