import {NextResponse, type NextRequest} from 'next/server';
import {resolveEnglishPath} from '@/lib/i18n/routing';

// Marks requests this proxy already rewrote. Prerendered routes run the proxy
// again on the internal /ro or /en path, which must pass through unchanged.
const REWRITTEN = 'x-rbells-lang-rewrite';

// Romanian stays unprefixed and English lives under /en with translated
// section names. Every request is rewritten to the internal app/[lang] tree.
export function proxy(request: NextRequest) {
  if (request.headers.has(REWRITTEN)) return NextResponse.next();

  const {pathname} = request.nextUrl;
  const url = request.nextUrl.clone();

  if (pathname === '/ro' || pathname.startsWith('/ro/')) {
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const resolved = resolveEnglishPath(pathname.slice(3) || '/');
    if ('redirect' in resolved) {
      url.pathname = resolved.redirect;
      return NextResponse.redirect(url, 308);
    }
    url.pathname = `/en${resolved.internal === '/' ? '' : resolved.internal}`;
  } else {
    url.pathname = `/ro${pathname === '/' ? '' : pathname}`;
  }

  const headers = new Headers(request.headers);
  headers.set(REWRITTEN, '1');
  return NextResponse.rewrite(url, {request: {headers}});
}

export const config = {
  // Skip Next internals, API routes, and any path with a file extension.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
