import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ['/statistics', '/admin'];
const noIntlPaths = ['/statistics', '/admin', '/auth'];

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

    if (isProtected) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token) {
            const signInUrl = new URL('/auth/signin', request.url);
            signInUrl.searchParams.set('callbackUrl', request.url);
            return NextResponse.redirect(signInUrl);
        }
    }

    // Routes outside [locale] must bypass intl rewriting
    if (noIntlPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    return intlMiddleware(request);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
