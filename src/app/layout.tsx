import { Inter } from 'next/font/google';
import Script from 'next/script';
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
                <link rel='icon' href='/favicon.png' type='image/jpg' />
                <link rel='apple-touch-icon' href='/favicon.png' />
                <link rel='manifest' href='/manifest.json' />
                {/* Preload critical images for instant loading - only logo and LCP image */}
                {/* Note: Next.js Image component with priority automatically preloads optimized images */}
                {process.env.NEXT_PUBLIC_IMAGE_VERSION && (
                    <link rel='preload' as='image' href={`/Images/logo/header_logo.jpg?v=${process.env.NEXT_PUBLIC_IMAGE_VERSION}`} fetchPriority='high' />
                )}
                {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                    <>
                        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} strategy='lazyOnload' />
                        <Script id='ga4-init' strategy='lazyOnload'>
                            {`
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { anonymize_ip: true });
                            `}
                        </Script>
                    </>
                )}
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <SessionProvider>{children}</SessionProvider>
            </body>
        </html>
    );
}
