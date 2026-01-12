import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/SessionProvider';

// Inter for body text - more readable, heavier weight
const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    variable: '--font-inter',
});

// Playfair for elegant headings
const playfair = Playfair_Display({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    weight: ['400', '600', '700'],
    variable: '--font-playfair',
});

// Montserrat for bold titles like "Dental Point"
const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    weight: ['600', '700'],
    display: 'swap',
    variable: '--font-montserrat',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className={`${inter.variable} ${playfair.variable} ${montserrat.variable}`} suppressHydrationWarning>
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
