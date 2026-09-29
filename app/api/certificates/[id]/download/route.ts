import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCertificatePdf, CertificateData } from '@/lib/pdf/generator'

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Authenticate user implicitly via createClient, then query the certificate.
    // RLS will enforce that only the owning trainee or an admin can read the certificate.
    const { data: cert, error } = await supabase
      .from('certificates')
      .select(`
        id,
        type,
        issue_date,
        serial_number,
        enrollment_id,
        enrollments (
          profiles ( full_name ),
          programs ( title )
        )
      `)
      .eq('id', id)
      .single()

    if (error || !cert) {
      console.error('Certificate fetch error:', error)
      return NextResponse.json({ error: 'Certificate not found or access denied' }, { status: 404 })
    }

    // Safely extract data
    const enrollments = Array.isArray(cert.enrollments) ? cert.enrollments[0] : cert.enrollments
    if (!enrollments) {
      return NextResponse.json({ error: 'Data integrity error: Enrollment not found' }, { status: 500 })
    }
    
    const profile = Array.isArray(enrollments.profiles) ? enrollments.profiles[0] : enrollments.profiles
    const program = Array.isArray(enrollments.programs) ? enrollments.programs[0] : enrollments.programs

    if (!profile?.full_name || !program?.title) {
      return NextResponse.json({ error: 'Data integrity error: Profile or Program not found' }, { status: 500 })
    }

    // Format date properly in Arabic
    const issueDate = new Date(cert.issue_date || new Date()).toLocaleDateString('ar-JO', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    // Construct trusted CertificateData
    const data: CertificateData = {
      participantName: profile.full_name,
      programName: program.title,
      certificateType: cert.type as 'completion' | 'participation',
      issueDate: issueDate,
      serialNumber: cert.serial_number,
    }

    // Generate PDF Buffer
    const pdfBuffer = await generateCertificatePdf(data)

    const cleanParticipantName = sanitizeFilename(data.participantName)
    const cleanProgramName = sanitizeFilename(data.programName)
    const filename = `Certificate_${cleanParticipantName}_${cleanProgramName}.pdf`

    // Return the PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        // Prevent caching of sensitive personal data
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (err: any) {
    console.error('PDF Generation Exception:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
