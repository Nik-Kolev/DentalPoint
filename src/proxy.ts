import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ['/statistics', '/admin'];
const noIntlPaths = ['/statistics', '/admin', '/auth'];

// Deliberately not using the `auth((req) => {...})` wrapper here: it mutates the request's
// perceived origin (to match NEXTAUTH_URL) before this callback runs, which caused next-intl's
// middleware to build an absolute rewrite URL instead of a relative one — Next.js then treats
// that as a real cross-origin redirect instead of an internal rewrite, producing an infinite
// redirect loop in production behind nginx/Cloudflare (never visible locally, or even with
// `next start` locally, unless NEXTAUTH_URL is set to a different origin than the request).
// getToken() reads the session cookie directly without touching req.nextUrl.
export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (protectedPaths.some((path) => pathname.startsWith(path))) {
        // getToken()'s secureCookie option defaults to false (confirmed in @auth/core/src/jwt.ts),
        // which makes it look for the unprefixed `authjs.session-token` cookie — but production
        // always runs over HTTPS, so Auth.js actually sets `__Secure-authjs.session-token`.
        // Without this, getToken() silently never finds a valid session (auth()'s full request
        // pipeline detects this correctly elsewhere, which is why the site "looked" logged in
        // while this middleware check kept bouncing back to signin).
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === 'production' });
        if (!token) {
            const signInUrl = new URL('/auth/signin', req.url);
            // Relative path only, not the absolute req.url — req.nextUrl's origin is Next.js's
            // internal server address (e.g. http://localhost:3000), not the public domain, for
            // the same reason the redirect-loop bug happened. next-auth resolves a relative
            // callbackUrl against its own configured base correctly.
            signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
            return NextResponse.redirect(signInUrl);
        }
    }

    // Routes outside [locale] must bypass intl rewriting
    if (noIntlPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    return intlMiddleware(req);
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
};
