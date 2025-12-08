import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Hardcoded credentials
                const validEmail = 'kolev93@abv.bg';
                const validPassword = 'test1234';

                if (credentials?.email === validEmail && credentials?.password === validPassword) {
                    return {
                        id: '1',
                        email: validEmail,
                        name: 'Admin User',
                    };
                }

                return null; // Invalid credentials
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // Add user id to session if needed
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
