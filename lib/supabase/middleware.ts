import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerEnv } from './env'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = getServerEnv('NEXT_PUBLIC_SUPABASE_URL')
  const supabaseAnonKey = getServerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/register') || 
      request.nextUrl.pathname.startsWith('/forgot-password')
    
    // Basic route protection
    const protectedRoutes = ['/admin', '/dashboard', '/profile', '/trainer']
    const isProtectedRoute = protectedRoutes.some((path) => request.nextUrl.pathname.startsWith(path))

    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard' // or wherever they should go
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Middleware session update error:', error)
  }

  return supabaseResponse
}
