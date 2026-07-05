import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            const allowedEmail = process.env.ALLOWED_EMAIL;
            console.log('[TEMP DEBUG] signIn callback: user.email=', JSON.stringify(user.email), 'allowedEmail=', JSON.stringify(allowedEmail));
            if (!allowedEmail) return false;
            const result = user.email?.toLowerCase() === allowedEmail.toLowerCase();
            console.log('[TEMP DEBUG] signIn callback: match result=', result);
            return result;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
    debug: true, // TEMP: verbose Auth.js internal logging while diagnosing a silent callback failure — revert
});
