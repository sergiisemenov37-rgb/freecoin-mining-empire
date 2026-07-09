/**
 * Middleware
 * Handles session refresh and authentication
 */

import { createServerClientClient } from '@/lib/supabase/client';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createServerClientClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Refresh session if expired
  if (!session && request.cookies.has('sb-access-token')) {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (!error && data.session) {
      const response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      response.cookies.set('sb-access-token', data.session.access_token, {
        path: '/',
        maxAge: data.session.expires_in,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return response;
    }
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
