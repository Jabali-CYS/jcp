'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') throw new Error('Forbidden')

  return user
}

function safeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol')
    }
    return parsed.toString()
  } catch {
    throw new Error('الرابط المدخل غير صالح')
  }
}

export async function createContent(formData: FormData): Promise<void> {
  const user = await verifyAdminAuth()

  const programId = formData.get('programId') as string
  const title = formData.get('title') as string
  const fileUrl = formData.get('fileUrl') as string

  if (!programId || !title || !title.trim() || !fileUrl || !fileUrl.trim()) {
    throw new Error('جميع الحقول مطلوبة')
  }

  const validUrl = safeUrl(fileUrl.trim())

  const adminClient = createAdminClient()

  // Verify program exists
  const { data: program, error: progErr } = await adminClient.from('programs').select('id').eq('id', programId).single()
  if (progErr || !program) throw new Error('البرنامج المحدد غير موجود')

  const { error } = await adminClient
    .from('digital_content')
    .insert({
      program_id: programId,
      title: title.trim(),
      file_url: validUrl
    })

  if (error) {
    console.error('Error creating content:', error)
    throw new Error('حدث خطأ أثناء إضافة المحتوى')
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'create_content',
    target_table: 'digital_content',
    details: { program_id: programId, title: title.trim(), url: validUrl }
  })

  revalidatePath('/admin/content')
}

export async function deleteContent(formData: FormData): Promise<void> {
  const user = await verifyAdminAuth()

  const contentId = formData.get('contentId') as string

  if (!contentId) {
    throw new Error('بيانات غير صالحة')
  }

  const adminClient = createAdminClient()

  // Verify content exists to log it accurately and prevent blind deletes if we wanted to enforce it.
  const { data: content, error: fetchErr } = await adminClient.from('digital_content').select('id, program_id, title').eq('id', contentId).single()
  if (fetchErr || !content) throw new Error('المحتوى غير موجود')

  const { error } = await adminClient
    .from('digital_content')
    .delete()
    .eq('id', contentId)

  if (error) {
    console.error('Error deleting content:', error)
    throw new Error('حدث خطأ أثناء حذف المحتوى')
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'delete_content',
    target_table: 'digital_content',
    target_id: contentId,
    details: { program_id: content.program_id, title: content.title }
  })

  revalidatePath('/admin/content')
}
