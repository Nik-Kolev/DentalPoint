import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <link rel='icon' href='/new_favicon.png' type='image/png' />
                <link rel='apple-touch-icon' href='/new_favicon.png' />
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
