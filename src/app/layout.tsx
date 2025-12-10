import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' suppressHydrationWarning>
            <head>
                <link rel='icon' href='/favicon.png' type='image/jpg' />
                <link rel='apple-touch-icon' href='/favicon.png' />
                <link rel='manifest' href='/manifest.json' />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
