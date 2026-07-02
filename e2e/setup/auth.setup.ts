import { test as setup } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import { randomUUID } from 'crypto';

const authFile = 'e2e/.auth/admin.json';

// Mints a valid Auth.js session JWT directly, bypassing the real Google OAuth
// consent screen (which Playwright cannot click through). Zero changes to
// auth.ts — this only ever runs in the test runner's own Node process, using
// the same secret/salt Auth.js itself uses to encode a session-token cookie
// (salt = cookie name, confirmed from @auth/core's callback handler).
setup('authenticate as admin', async ({ context }) => {
    const email = process.env.ALLOWED_EMAIL!;
    const secret = process.env.NEXTAUTH_SECRET!;
    const maxAge = 30 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);

    const sessionToken = await encode({
        secret,
        salt: 'authjs.session-token',
        maxAge,
        token: {
            name: 'Admin',
            email,
            picture: null,
            sub: 'e2e-admin',
            id: 'e2e-admin',
            iat: now,
            exp: now + maxAge,
            jti: randomUUID(),
        },
    });

    await context.addCookies([
        {
            name: 'authjs.session-token',
            value: sessionToken,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
            secure: false,
            expires: now + maxAge,
        },
    ]);

    await context.storageState({ path: authFile });
});
