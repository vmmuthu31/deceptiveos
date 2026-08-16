import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/honeypots', '/events', '/alerts', '/lures', '/settings'];

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ciphernest-dev-secret-key-998877665544'
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const token = req.cookies.get('cipher_token')?.value;

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      if (payload.isVerified === false) {
        const email = (payload.email as string) || '';
        const verifyUrl = new URL(`/verify-otp?email=${encodeURIComponent(email)}`, req.url);
        return NextResponse.redirect(verifyUrl);
      }
    } catch {
      const loginUrl = new URL('/login', req.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('cipher_token');
      return res;
    }
  }

  if ((pathname === '/login' || pathname === '/register') && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
      if (payload.isVerified === false) {
        const email = (payload.email as string) || '';
        return NextResponse.redirect(new URL(`/verify-otp?email=${encodeURIComponent(email)}`, req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } catch {
      // Token expired, allow visiting login/register
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/honeypots/:path*', '/events/:path*', '/alerts/:path*', '/lures/:path*', '/settings/:path*', '/login', '/register', '/verify-otp'],
};


