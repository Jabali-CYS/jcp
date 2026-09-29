'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAttendance(sessionId: string, enrollmentId: string, status: 'present' | 'absent') {
  const supabase = await createClient()

  // Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح لك' }

  // Verify Trainer Role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'trainer')
    .single()

  if (!roleData) return { error: 'غير مصرح لك' }

  // Verify session belongs to the trainer
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('trainer_id', user.id)
    .single()

  if (!sessionData) return { error: 'جلسة غير صالحة' }

  // Verify enrollment belongs to this session
  const { data: enrollmentData } = await supabase
    .from('enrollments')
    .select('id')
    .eq('id', enrollmentId)
    .eq('session_id', sessionId)
    .single()

  if (!enrollmentData) return { error: 'متدرب غير صالح' }

  // Perform mutation (Upsert based on enrollment_id and session_id)
  // Wait, Supabase unique constraint is (enrollment_id, session_id). We can use upsert or query first.
  const { data: existingAtt } = await supabase
    .from('attendance')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .eq('session_id', sessionId)
    .single()

  if (existingAtt) {
    const { error } = await supabase
      .from('attendance')
      .update({ status })
      .eq('id', existingAtt.id)
    
    if (error) return { error: 'فشل تحديث الحضور' }
  } else {
    const { error } = await supabase
      .from('attendance')
      .insert({
        enrollment_id: enrollmentId,
        session_id: sessionId,
        status
      })
    
    if (error) return { error: 'فشل تسجيل الحضور' }
  }

  revalidatePath(`/trainer/sessions/${sessionId}`)
  return { success: true }
}

export async function submitEvaluation(sessionId: string, enrollmentId: string, type: 'pre' | 'post', feedback: string) {
  const supabase = await createClient()

  // Authenticate
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح لك' }

  // Verify Trainer Role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'trainer')
    .single()

  if (!roleData) return { error: 'غير مصرح لك' }

  // Verify session belongs to the trainer
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('trainer_id', user.id)
    .single()

  if (!sessionData) return { error: 'جلسة غير صالحة' }

  // Verify enrollment belongs to this session
  const { data: enrollmentData } = await supabase
    .from('enrollments')
    .select('id')
    .eq('id', enrollmentId)
    .eq('session_id', sessionId)
    .single()

  if (!enrollmentData) return { error: 'متدرب غير صالح' }

  // In this system, is there a unique constraint on evaluations? 
  // Initial schema has NO unique constraint on evaluations.
  // So a trainee might have multiple evaluations, or maybe one per type per enrollment.
  // We'll upsert based on enrollment_id and type. We can query first.
  const { data: existingEval } = await supabase
    .from('evaluations')
    .select('id')
    .eq('enrollment_id', enrollmentId)
    .eq('type', type)
    .single()

  if (existingEval) {
    const { error } = await supabase
      .from('evaluations')
      .update({ feedback })
      .eq('id', existingEval.id)
    
    if (error) return { error: 'فشل تحديث التقييم' }
  } else {
    const { error } = await supabase
      .from('evaluations')
      .insert({
        enrollment_id: enrollmentId,
        type,
        feedback
      })
    
    if (error) return { error: 'فشل تسجيل التقييم' }
  }

  revalidatePath(`/trainer/sessions/${sessionId}`)
  return { success: true }
}
