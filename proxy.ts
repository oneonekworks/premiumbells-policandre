import {NextResponse, type NextRequest} from 'next/server';
import {resolveEnglishPath} from '@/lib/i18n/routing';

// Marks requests this proxy already rewrote. Prerendered routes run the proxy
// again on the internal /ro or /en path, which must pass through unchanged.
const REWRITTEN = 'x-rbells-lang-rewrite';

type Resolved = {internal: string} | {redirect: string};

/** Public pathname -> internal app/[lang] pathname, or a canonical redirect. */
function resolve(pathname: string): Resolved {
  if (pathname === '/ro' || pathname.startsWith('/ro/')) return {redirect: pathname.slice(3) || '/'};
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const resolved = resolveEnglishPath(pathname.slice(3) || '/');
    if ('redirect' in resolved) return resolved;
    return {internal: `/en${resolved.internal === '/' ? '' : resolved.internal}`};
  }
  return {internal: `/ro${pathname === '/' ? '' : pathname}`};
}

// Romanian stays unprefixed and English lives under /en with translated
// section names. Every request is rewritten to the internal app/[lang] tree.
export function proxy(request: NextRequest) {
  if (request.headers.has(REWRITTEN)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const resolved = resolve(url.pathname);
  if ('redirect' in resolved) {
    url.pathname = resolved.redirect;
    return NextResponse.redirect(url, 308);
  }
  url.pathname = resolved.internal;

  const headers = new Headers(request.headers);
  headers.set(REWRITTEN, '1');
  // Route interception (the project slide-over) compares the page the client
  // is on with internal route patterns, so map that URL the same way.
  const nextUrl = headers.get('next-url');
  if (nextUrl) {
    const current = resolve(nextUrl);
    if ('internal' in current) headers.set('next-url', current.internal);
  }
  return NextResponse.rewrite(url, {request: {headers}});
}

export const config = {
  // Skip Next internals, API routes, and any path with a file extension.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
