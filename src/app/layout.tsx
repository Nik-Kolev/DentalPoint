import { Inter, Playfair_Display, Montserrat } from 'next/font/google';
import './globals.css';
import SessionProvider from '../components/shared/SessionProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    variable: '--font-inter',
});

const playfair = Playfair_Display({
    subsets: ['latin', 'cyrillic'],
    display: 'swap',
    weight: ['400', '700'],
    preload: false,
    variable: '--font-playfair',
});

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['700'],
    display: 'swap',
    preload: false,
    variable: '--font-montserrat',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} className={`${inter.variable} ${playfair.variable} ${montserrat.variable}`} suppressHydrationWarning>
            <head>
                <link rel='icon' href='/new_favicon.png' type='image/png' />
                <link rel='apple-touch-icon' href='/new_favicon.png' />
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <SessionProvider>{children}</SessionProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
