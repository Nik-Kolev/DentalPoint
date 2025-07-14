import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import { getTranslation } from '../lib/useTranslation';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });

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

    // Pre-compute translations for navigation
    const translations = {
        home: t('layout', 'menuHome'),
        contact: t('layout', 'menuContact'),
        team: t('layout', 'menuTeam'),
        licenses: t('layout', 'menuLicenses'),
        reviews: t('layout', 'menuReviews'),
    };

    return (
        <html lang={locale}>
            <head>
                <link rel='icon' href='/favicon.ico' />
                <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
                <link rel='manifest' href='/manifest.json' />
            </head>
            <body className={inter.className}>
                <header className='w-full shadow-sm bg-white'>
                    <nav className='mx-auto flex items-center justify-between h-16 md:h-20 lg:h-24 px-4 sm:px-6 lg:px-8'>
                        {/* Logo and Clinic Name - Flexible on mobile, fixed on desktop */}
                        <div className='flex items-center space-x-2 sm:space-x-3 flex-shrink-0 lg:w-64'>
                            <Image
                                src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                                alt='Dental Point Logo'
                                width={40}
                                height={40}
                                className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg border border-gray-200 shadow-sm bg-white object-cover'
                            />
                            <div className='flex flex-col'>
                                <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-[#111111] ${playfair.className}`}>
                                    Dental Point
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation - Perfectly centered */}
                        <div className='hidden lg:flex flex-1 justify-center'>
                            <Navigation locale={locale} translations={translations} />
                        </div>

                        {/* Right side - Flexible on mobile, fixed on desktop */}
                        <div className='flex items-center justify-end space-x-3 flex-shrink-0 lg:w-64'>
                            {/* Language Switcher - Only visible on desktop */}
                            <div className='hidden lg:block'>
                                <LanguageSwitcher locale={locale} />
                            </div>

                            {/* Mobile/Tablet Navigation */}
                            <div className='lg:hidden'>
                                <Navigation locale={locale} translations={translations} />
                            </div>
                        </div>
                    </nav>
                </header>
                <main>{children}</main>
                <footer className='bg-white border-t border-gray-200 mt-16'>
                    <div className='max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8'>
                        <div className='flex flex-col items-center space-y-4'>
                            {/* Social Media Links */}
                            <div className='flex space-x-4 md:space-x-6'>
                                <a
                                    href='https://www.facebook.com/people/Dental-Point-%D0%B4-%D1%80-%D0%AF%D0%B2%D0%BE%D1%80-%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2/61553440213240/'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-gray-600 hover:text-[#1877F2] transition-colors duration-200'
                                    aria-label='Facebook'
                                >
                                    <svg className='w-6 h-6 md:w-8 md:h-8' fill='currentColor' viewBox='0 0 24 24'>
                                        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                                    </svg>
                                </a>
                                <a
                                    href='https://instagram.com/dentalpoint'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-gray-600 hover:text-[#E4405F] transition-colors duration-200'
                                    aria-label='Instagram'
                                >
                                    <svg className='w-6 h-6 md:w-8 md:h-8' fill='currentColor' viewBox='0 0 24 24'>
                                        <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                                    </svg>
                                </a>
                            </div>

                            {/* Copyright */}
                            <div className='text-center text-gray-700 text-sm md:text-base'>
                                <p>&copy; 2025 Dental Point</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
