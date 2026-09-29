'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function issueCertificate(enrollmentId: string, type: 'completion' | 'participation') {
  const supabase = await createClient()

  // 1. Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Authorize — server-side role check
  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
  if (roleData?.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  // 3. Validate input
  if (!enrollmentId || enrollmentId.length !== 36) {
    return { success: false, error: 'Invalid enrollment ID' }
  }
  if (type !== 'completion' && type !== 'participation') {
    return { success: false, error: 'Invalid certificate type' }
  }

  // Check if certificate already exists (duplicate guard)
  const { data: existingCert } = await supabase
    .from('certificates')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .single()

  if (existingCert) {
    return { success: false, error: 'Certificate already exists for this enrollment' }
  }

  // 4. Privileged operation — insert certificate
  const { data: newCert, error } = await supabase
    .from('certificates')
    .insert({
      enrollment_id: enrollmentId,
      type,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error issuing certificate:', error)
    return { success: false, error: 'Failed to issue certificate' }
  }

  // 5. Audit log — only after confirmed successful issuance.
  //    actor_id is derived from the authenticated server session (user.id),
  //    never from the client. Uses adminClient to bypass audit_logs RLS
  //    (which blocks non-service-role writes).
  const adminClient = createAdminClient()
  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: 'certificate_issued',
    target_table: 'certificates',
    target_id: newCert.id,
    details: {
      enrollment_id: enrollmentId,
      type,
    },
  })

  revalidatePath('/admin/certificates')

  return { success: true, certificateId: newCert.id }
}
