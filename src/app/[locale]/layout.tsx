import type { Metadata, Viewport } from 'next';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import Navigation from '@/components/layout/Navigation';
import StatisticsLink from '@/components/shared/StatisticsLink';
import DeferredWidgets from '@/components/layout/DeferredWidgets';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

export async function generateViewport(): Promise<Viewport> {
    return {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        themeColor: '#009fe3',
        colorScheme: 'light',
    };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations('metadata');
    const isBulgarian = locale === 'bg';

    return {
        title: {
            default: t('title'),
            template: t('titleTemplate'),
        },
        description: t('description'),
        keywords: t('keywords').split(', '),
        authors: [{ name: 'Dr. Yavor Ivanov and Dr. Ekaterina Ivanova - Dental Point' }],
        creator: 'Dental Point',
        publisher: 'Dental Point',
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dentalpoint.bg'),
        alternates: {
            canonical: '/',
        },
        openGraph: {
            title: t('ogTitle'),
            description: t('ogDescription'),
            url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dentalpoint.bg',
            siteName: 'Dental Point',
            images: [
                {
                    url: '/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: t('ogAlt'),
                },
            ],
            locale: isBulgarian ? 'bg_BG' : 'en_US',
            type: 'website',
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
        category: 'health',
        classification: 'dental care',
        referrer: 'origin-when-cross-origin',
        other: {
            'geo.region': 'BG',
            'geo.placename': 'Varna',
            'geo.position': '43.22171865355527;27.91822750627432',
            ICBM: '43.22171865355527, 27.91822750627432',
        },
    };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('layout');
    const tMeta = await getTranslations('metadata');

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dentalpoint.bg';
    const isBulgarian = locale === 'bg';

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'DentalClinic',
        name: 'Dental Point',
        description: tMeta('description'),
        url: baseUrl,
        logo: `${baseUrl}/Images/logo/cropped_logo_dp.jpg`,
        image: `${baseUrl}/og-image.jpg`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: isBulgarian ? 'ул. "Ген. Гурко" 5' : '5 "Gen. Gurko" St.',
            addressLocality: 'Varna',
            addressRegion: 'Varna',
            postalCode: '9000',
            addressCountry: 'BG',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '43.22171865355527',
            longitude: '27.91822750627432',
        },
        telephone: '+359876346261',
        priceRange: '$$',
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '18:00',
            },
        ],
        medicalSpecialty: ['Dentistry', 'Orthodontics', 'Pediatric Dentistry'],
        areaServed: {
            '@type': 'City',
            name: 'Varna',
        },
    };

    const translations = {
        home: t('menuHome'),
        contact: t('menuContact'),
        team: t('menuTeam'),
        gallery: t('menuGallery'),
        licenses: t('menuLicenses'),
        reviews: t('menuReviews'),
    };

    return (
        <>
            <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <header className='w-full shadow-sm bg-white relative z-40'>
                <nav className='mx-auto flex items-center justify-between h-16 md:h-20 lg:h-24 px-4 sm:px-6 lg:px-8 relative'>
                    {/* Logo */}
                    <div className='flex items-start flex-shrink-0 lg:w-64 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 pt-1 lg:pt-0'>
                        <Link
                            href='/'
                            className='relative w-24 sm:w-32 md:w-40 lg:w-44 h-auto ml-2 sm:ml-3 lg:ml-4'
                            aria-label={t('menuHome')}
                        >
                            <Image
                                src={getImageUrl('/Images/logo/cropped_logo_dp.jpg')}
                                alt='Dental Point Logo'
                                width={180}
                                height={85}
                                priority
                                fetchPriority='high'
                                className='w-full h-auto object-contain'
                                placeholder='blur'
                                blurDataURL={getBlurPlaceholder('/Images/logo/cropped_logo_dp.jpg')}
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden lg:flex flex-1 justify-center'>
                        <Navigation translations={translations} />
                    </div>

                    {/* Right side */}
                    <div className='flex items-center justify-end space-x-3 flex-shrink-0 lg:w-64 ml-auto'>
                        <div className='hidden lg:block'>
                            <StatisticsLink />
                        </div>
                        <div className='hidden lg:block'>
                            <LanguageSwitcher />
                        </div>
                        <div className='lg:hidden'>
                            <Navigation translations={translations} />
                        </div>
                    </div>
                </nav>
            </header>

            <main>{children}</main>

            <footer className='bg-white border-t-[0.5px] border-gray-200'>
                <div className='w-full h-[35px] bg-[#009fe3]'></div>
                <div className='max-w-7xl mx-auto pt-6 md:pt-8 pb-4 px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col items-center space-y-4'>
                        <div className='flex space-x-4 md:space-x-6'>
                            <a
                                href='https://www.facebook.com/p/Dental-Point-%D0%B4-%D1%80-%D0%AF%D0%B2%D0%BE%D1%80-%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2-61553440213240/'
                                target='_blank'
                                rel='noopener noreferrer'
                                aria-label='Facebook'
                                className='text-gray-600 hover:text-[#1877F2]'
                            >
                                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                                </svg>
                            </a>
                            <a
                                href='https://www.instagram.com/dentalpoint_drivanov/'
                                target='_blank'
                                rel='noopener noreferrer'
                                aria-label='Instagram'
                                className='text-gray-600 hover:text-[#E4405F]'
                            >
                                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                                </svg>
                            </a>
                        </div>
                        <div className='text-center text-gray-700 text-sm'>
                            <p>&copy; {new Date().getFullYear()} Dental Point</p>
                        </div>
                    </div>
                </div>
            </footer>

            <DeferredWidgets />
        </>
    );
}
