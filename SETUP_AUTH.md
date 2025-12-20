# Authentication Setup Guide

## Simple Email/Password Authentication

The authentication system uses hardcoded credentials for simplicity. No Google OAuth setup required.

## Credentials

-   **Email**: `kolev93@abv.bg`
-   **Password**: `test1234`

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```

**Note**: For production, make sure to set a strong `NEXTAUTH_SECRET`. You can generate one using:

-   `openssl rand -base64 32` (on Mac/Linux)
-   Or use an online generator: https://generate-secret.vercel.app/32

## How It Works

-   **Session Management**: NextAuth uses JWT tokens stored in HTTP-only cookies, so sessions persist across page refreshes
-   **Protected Routes**: Routes matching `/admin/*` or `/statistics/*` are automatically protected by middleware
-   **Session Duration**: Sessions last 30 days by default
-   **Login Path**: `/auth/signin` - Simple email/password form with blue styling (#005baa)
-   **After Login**: Redirects to `/en/statistics` (or callback URL if provided)
-   **Logout**: Button available on the statistics page

## Usage

-   **Sign In**: Navigate to `/auth/signin` or try to access a protected route
-   **Sign Out**: Click the "Logout" button on the statistics page
-   **Check Session**: Use `useSession()` hook in client components or `getSession()` in server components
-   **Protected Pages**: Wrap pages with `<ProtectedRoute>` component or use server-side `getSession()` check

## Routes

-   `/auth/signin` - Login page
-   `/auth/error` - Error page (for auth errors)
-   `/[locale]/statistics` - Protected statistics dashboard (e.g., `/en/statistics`, `/bg/statistics`)
-   `/admin/*` - Protected admin routes (ready for future use)

## Future: Adding Google OAuth

When you're ready to add Google OAuth and GA integration later, you can:

1. Add Google OAuth provider back to the NextAuth config
2. Update the sign-in page to support both methods
3. Integrate Google Analytics API for statistics
