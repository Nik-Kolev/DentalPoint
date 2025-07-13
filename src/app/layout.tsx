import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Image from 'next/image';
import { getTranslation } from '../lib/useTranslation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        default: 'Dental Clinic - Professional Dental Care',
        template: '%s | Dental Clinic',
    },
    description:
        'Professional dental care services with experienced dentists. Modern facilities, comfortable treatment, and personalized care for you and your family.',
    keywords: ['dental clinic', 'dentist', 'dental care', 'oral health', 'dental treatment'],
    authors: [{ name: 'Dental Clinic Team' }],
    creator: 'Dental Clinic',
    publisher: 'Dental Clinic',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://your-domain.vercel.app'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Dental Clinic - Professional Dental Care',
        description: 'Professional dental care services with experienced dentists. Modern facilities, comfortable treatment, and personalized care.',
        url: 'https://your-domain.vercel.app',
        siteName: 'Dental Clinic',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Dental Clinic',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Dental Clinic - Professional Dental Care',
        description: 'Professional dental care services with experienced dentists.',
        images: ['/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
};

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
    const locale = params?.locale || 'bg';
    const t = getTranslation(locale);
    return (
        <html lang={locale}>
            <head>
                <link rel='icon' href='/favicon.ico' />
                <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
                <link rel='manifest' href='/manifest.json' />
            </head>
            <body className={inter.className}>
                <header className='w-full shadow-sm'>
                    <nav className='mx-auto flex items-center h-24 px-8'>
                        {/* Logo and Clinic Name - Far Left */}
                        <div className='flex items-center space-x-3 w-48'>
                            <Image
                                src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/cube.jpg'
                                alt='Dental Point Logo'
                                width={48}
                                height={48}
                                className='rounded-full border border-gray-200 shadow-sm bg-white'
                            />
                            <div className='flex flex-col'>
                                <span className='text-3xl font-bold text-[#005baa] whitespace-nowrap'>Dental Point</span>
                            </div>
                        </div>

                        {/* Menu - Perfectly Centered */}
                        <div className='flex-1 flex justify-center mx-6'>
                            <div className='flex space-x-8'>
                                <Link href={`/${locale}`} className='text-gray-700 hover:text-[#009fe3] font-semibold text-lg transition'>
                                    {t('menuHome') || t('home') || 'Home'}
                                </Link>
                                <Link href={`/${locale}/contact`} className='text-gray-700 hover:text-[#009fe3] font-semibold text-lg transition'>
                                    {t('menuContact') || t('contact') || 'Contact'}
                                </Link>
                                <Link href={`/${locale}/team`} className='text-gray-700 hover:text-[#009fe3] font-semibold text-lg transition'>
                                    {t('menuTeam') || t('team') || 'Team'}
                                </Link>
                                <Link href={`/${locale}/licenses`} className='text-gray-700 hover:text-[#009fe3] font-semibold text-lg transition'>
                                    {t('menuLicenses') || t('licenses') || 'Licenses'}
                                </Link>
                                <Link href={`/${locale}/reviews`} className='text-gray-700 hover:text-[#009fe3] font-semibold text-lg transition'>
                                    {t('menuReviews') || t('reviews') || 'Reviews'}
                                </Link>
                            </div>
                        </div>

                        {/* Language Switcher - Far Right */}
                        <div className='flex items-center justify-end w-48'>
                            <LanguageSwitcher locale={locale} />
                        </div>
                    </nav>
                </header>
                <main>{children}</main>
                <footer className='bg-gray-50 mt-16'>
                    <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
                        <div className='text-center text-gray-500'>
                            <p>&copy; 2024 Dental Clinic. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
