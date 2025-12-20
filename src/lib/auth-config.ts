import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Check if email is in allowed list
            const allowedEmail = process.env.ALLOWED_EMAIL;
            if (!allowedEmail) {
                return false;
            }

            const userEmail = user.email?.toLowerCase();
            const allowedEmailLower = allowedEmail.toLowerCase();

            return userEmail === allowedEmailLower;
        },
        async session({ session, token }) {
            // Add user id to session if needed
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
        async jwt({ token, user, trigger }) {
            // If user signs in, add user data to token
            if (user) {
                token.email = user.email;
                token.lastActivity = Date.now();
            }
            // Refresh token expiration on each access to extend session
            if (trigger !== 'signIn') {
                token.lastActivity = Date.now();
            }
            return token;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
