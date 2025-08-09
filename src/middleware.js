import { NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/_next',
  '/favicon.ico',
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function base64UrlToBytes(base64url) {
  try {
    const padLen = (4 - (base64url.length % 4)) % 4;
    const padded = base64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLen);
    const str = atob(padded);
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function verifyJwtHmacSha256(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigBytes = base64UrlToBytes(signatureB64);
    if (!sigBytes) return null;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, data);
    if (!ok) return null;
    const payloadJson = new TextDecoder().decode(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth_token')?.value || '';
  const payload = token ? await verifyJwtHmacSha256(token) : null;
  const isAuthed = !!payload;

  console.log(`Middleware: ${pathname}, token: ${token ? 'present' : 'none'}, isAuthed: ${isAuthed}`);

  // Root path: default to login page unless authenticated
  if (pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Allow access to /login regardless of auth status
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Allow public assets and auth endpoints
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Protect app routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/map') ||
    pathname.startsWith('/datatable') ||
    pathname.startsWith('/network')
  ) {
    if (!isAuthed) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|icons|gifs|public).*)',
  ],
};
