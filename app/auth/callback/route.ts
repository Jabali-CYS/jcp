import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerEnv } from '@/lib/supabase/env'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') || '/dashboard'

  // Strict internal relative path validation:
  // Must start with single '/', must not start with '//' (scheme-relative),
  // and must not contain backslashes, control characters, or null bytes.
  const isSafeInternal =
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.includes('\\') &&
    !rawNext.includes('\0')
  const next = isSafeInternal ? rawNext : '/dashboard'

  // Canonical origin validation:
  // Fallback origin is strictly the verified production root.
  const DEFAULT_PROD_ORIGIN = 'https://jcpacademy.com'
  const EXPECTED_PROD_HOSTNAME = 'jcpacademy.com'
  const isDev = process.env.NODE_ENV === 'development'

  let canonicalOrigin = DEFAULT_PROD_ORIGIN

  // getServerEnv safely reads Cloudflare Worker context and process.env without throwing
  const rawSiteUrl = getServerEnv('NEXT_PUBLIC_SITE_URL')

  if (rawSiteUrl) {
    try {
      const parsed = new URL(rawSiteUrl)
      const isHttps = parsed.protocol === 'https:'
      const hasNoAuth = !parsed.username && !parsed.password
      const isExpectedHost = parsed.hostname === EXPECTED_PROD_HOSTNAME

      if (isHttps && hasNoAuth && isExpectedHost) {
        canonicalOrigin = parsed.origin
      } else if (isDev && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
        canonicalOrigin = parsed.origin
      }
    } catch {
      // In case of any URL parsing failure, retain the safe default origin
      canonicalOrigin = DEFAULT_PROD_ORIGIN
    }
  } else if (isDev) {
    canonicalOrigin = request.nextUrl.origin
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${canonicalOrigin}${next}`)
    }
    console.error('Code exchange error in auth callback:', error.message)
  }

  // Return user to login with error notice if code is invalid or exchange fails
  return NextResponse.redirect(`${canonicalOrigin}/login?error=invalid_link`)
}
