import { auth } from '@/auth';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ['/statistics', '/admin'];
const noIntlPaths = ['/statistics', '/admin', '/auth'];

export default auth((req) => {
    const { pathname } = req.nextUrl;

    if (protectedPaths.some((path) => pathname.startsWith(path)) && !req.auth) {
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signInUrl);
    }

    // Routes outside [locale] must bypass intl rewriting
    if (noIntlPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    return intlMiddleware(req);
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
