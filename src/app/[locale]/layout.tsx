import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import Navigation from '@/components/layout/Navigation';
import StatisticsLink from '@/components/shared/StatisticsLink';
import DeferredWidgets from '@/components/layout/DeferredWidgets';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import DentalPointLogo from '@/components/shared/DentalPointLogo';
import { routing } from '@/i18n/routing';
import { getAverageRating, type ReviewItem } from '@/lib/reviews';

export async function generateViewport(): Promise<Viewport> {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: '#1a7a8a',
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
      'geo.position': '43.2215545;27.917852',
      ICBM: '43.2215545, 27.917852',
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const t = await getTranslations('layout');
  const tMeta = await getTranslations('metadata');
  const tReviews = await getTranslations('reviews');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dentalpoint.bg';
  const isBulgarian = locale === 'bg';

  const reviewItems = tReviews.raw('items') as ReviewItem[];
  const averageRating = getAverageRating(reviewItems);

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
      streetAddress: isBulgarian ? 'ул. "Подполковник Калитин" 2' : '2 Podpolkovnik Kalitin St.',
      addressLocality: 'Varna',
      addressRegion: 'Varna',
      postalCode: '9000',
      addressCountry: 'BG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '43.2215545',
      longitude: '27.917852',
    },
    telephone: '+359876346261',
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:30',
        closes: '18:30',
      },
    ],
    medicalSpecialty: ['Dentistry', 'Orthodontics', 'Pediatric Dentistry'],
    areaServed: {
      '@type': 'City',
      name: 'Varna',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: String(reviewItems.length),
    },
    review: reviewItems.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      datePublished: r.date,
      reviewRating: { '@type': 'Rating', ratingValue: String(r.rating) },
      reviewBody: r.text,
    })),
  };

  const translations = {
    home: t('menuHome'),
    contact: t('menuContact'),
    team: t('menuTeam'),
    gallery: t('menuGallery'),
    licenses: t('menuLicenses'),
  };

  return (
    <>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <header className='w-full shadow-sm bg-white relative z-40'>
        <nav className='mx-auto flex items-center justify-between h-12 md:h-14 lg:h-16 px-4 sm:px-6 lg:px-8 relative'>
          {/* Logo */}
          <div className='flex items-center flex-shrink-0 lg:w-56 absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0'>
            <DentalPointLogo label={t('menuHome')} />
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

      <footer className='bg-[var(--dp-primary)] text-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6'>

          {/* Mobile: flex-col centered. Desktop: flex-row justify-between */}
          <div className='flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between'>

            {/* Left — wordmark + tagline + social */}
            <div className='flex flex-col gap-5 items-center text-center md:items-start md:text-left md:max-w-[280px]'>
              <div className='font-montserrat font-bold tracking-[0.18em] text-lg leading-none'>
                <span style={{ color: 'var(--dp-accent)' }}>DENTAL</span>
                {' '}
                <span className='text-white'>POINT</span>
              </div>
              <p className='text-white/60 text-sm leading-relaxed'>{t('footerTagline')}</p>
              <div className='flex gap-4'>
                <a
                  href='https://www.facebook.com/p/Dental-Point-%D0%B4-%D1%80-%D0%AF%D0%B2%D0%BE%D1%80-%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2-61553440213240/'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Facebook'
                  className='text-white/50 hover:text-white transition-colors'
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                </a>
                <a
                  href='https://www.instagram.com/dentalpoint_drivanov/'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Instagram'
                  className='text-white/50 hover:text-white transition-colors'
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right — nav + contact: 2-col grid on mobile, flex row on desktop */}
            <div className='grid grid-cols-2 gap-10 w-full md:w-auto md:flex md:gap-16'>

              {/* Navigation */}
              <div className='flex flex-col gap-4 items-center pl-6 md:pl-0 md:items-start'>
                <p className='font-montserrat text-xs font-semibold uppercase tracking-[0.15em] text-white/40 self-start'>{t('footerNav')}</p>
                <nav className='flex flex-col gap-2.5 self-start'>
                  {[
                    { label: translations.home, href: '/' },
                    { label: translations.contact, href: '/contact' },
                    { label: translations.team, href: '/team' },
                    { label: translations.gallery, href: '/gallery' },
                    { label: translations.licenses, href: '/licenses' },
                  ].map(({ label, href }) => (
                    <Link key={href} href={href} className='font-montserrat text-sm text-white/70 hover:text-white transition-colors'>
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Contact */}
              <div className='flex flex-col gap-4 items-center pl-2 md:pl-0 md:items-start'>
                <p className='font-montserrat text-xs font-semibold uppercase tracking-[0.15em] text-white/40 self-start'>{t('footerContact')}</p>
                <div className='flex flex-col gap-2 font-montserrat text-sm text-white/70 self-start'>
                  <p>{t('addressLine1')}</p>
                  <p>{t('addressLine2')}</p>
                  <p className='mt-1'>0876 346 261</p>
                  <p>0878 355 494</p>
                  <p className='mt-1'>{t('workingHoursWeekdays')}</p>
                  <p>{t('workingHoursWeekend')}</p>
                </div>
              </div>

            </div>
          </div>

          <div className='border-t border-white/15 mt-8 pt-4 text-center font-montserrat text-xs text-white/60'>
            &copy; {new Date().getFullYear()} Dental Point. Всички права запазени.
          </div>
        </div>
      </footer>

      <DeferredWidgets />
    </>
  );
}
