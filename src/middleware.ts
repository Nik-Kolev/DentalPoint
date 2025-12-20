import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        // You can add additional logic here if needed
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Only allow access if user has a valid token (session)
                return !!token;
            },
        },
    }
);

// Protect routes that start with /admin or /statistics
// You can add more routes here as needed
export const config = {
    matcher: ['/admin/:path*', '/statistics/:path*'],
};
