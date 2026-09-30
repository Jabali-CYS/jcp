import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCertificatePdf, CertificateData } from '@/lib/pdf/generator'
import { getCloudflareContext } from '@opennextjs/cloudflare'

function sanitizeFilename(name: string): string {
  return name.replace(/[\/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لتحميل الشهادة.' },
        { status: 401 }
      )
    }

    // 2. Fetch certificate data with enrollment & profile relations
    const { data: cert, error } = await supabase
      .from('certificates')
      .select(`
        id,
        type,
        issue_date,
        serial_number,
        enrollment_id,
        enrollments (
          profile_id,
          profiles ( full_name ),
          programs ( title )
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error || !cert) {
      return NextResponse.json(
        { error: 'الشهادة المطلوبة غير موجودة أو تم رفض الوصول.' },
        { status: 404 }
      )
    }

    // 3. Extract and validate enrollment
    const enrollment = Array.isArray(cert.enrollments) ? cert.enrollments[0] : cert.enrollments
    if (!enrollment) {
      return NextResponse.json(
        { error: 'بيانات التسجيل المرتبطة بالشهادة غير مكتملة.' },
        { status: 500 }
      )
    }

    // 4. Verify Authorization: Must be owner (trainee) or Admin
    const isOwner = enrollment.profile_id === user.id
    if (!isOwner) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle()

      if (!roleData) {
        return NextResponse.json(
          { error: 'غير مصرح لك بتحميل هذه الشهادة.' },
          { status: 403 }
        )
      }
    }

    const profile = Array.isArray(enrollment.profiles) ? enrollment.profiles[0] : enrollment.profiles
    const program = Array.isArray(enrollment.programs) ? enrollment.programs[0] : enrollment.programs

    const participantName = profile?.full_name || 'عضو الأكاديمية'
    const programTitle = program?.title || 'برنامج تأهيلي معتمد'

    // Format Arabic date
    const issueDate = new Date(cert.issue_date || new Date()).toLocaleDateString('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const certificateData: CertificateData = {
      participantName,
      programName: programTitle,
      certificateType: cert.type as 'completion' | 'participation',
      issueDate,
      serialNumber: cert.serial_number,
    }

    // 5. Retrieve Cloudflare Browser Binding
    let browserBinding: any = null
    try {
      const cfContext = await getCloudflareContext({ async: true })
      browserBinding = (cfContext?.env as Record<string, any>)?.BROWSER
    } catch (cfErr) {
      console.warn('Unable to get Cloudflare BROWSER binding directly:', cfErr)
    }

    // 6. Generate PDF via Cloudflare Browser Run
    const pdfBuffer = await generateCertificatePdf(certificateData, browserBinding)

    const cleanParticipantName = sanitizeFilename(participantName)
    const filename = `Certificate_${cleanParticipantName}_${cert.serial_number}.pdf`

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (err: any) {
    console.error('Certificate PDF generation error:', err)
    return NextResponse.json(
      { error: 'تعذر إنشاء الشهادة حالياً، يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    )
  }
}
