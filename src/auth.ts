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
            const allowedEmails = process.env.ALLOWED_EMAILS?.split(',')
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean);
            if (!allowedEmails?.length) return false;
            return allowedEmails.includes(user.email?.toLowerCase() ?? '');
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
});
