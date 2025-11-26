import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle .html extension - strip it before processing
  if (pathname.endsWith('.html')) {
    const newPathname = pathname.slice(0, -5); // Remove .html
    const url = request.nextUrl.clone();
    url.pathname = newPathname;

    // Let next-intl middleware handle the locale logic
    return intlMiddleware(new NextRequest(url, request));
  }

  // Process normally with next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(vi|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
