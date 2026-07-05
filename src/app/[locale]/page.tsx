import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HomeGallery from '@/components/gallery/HomeGallery';
import HomeReviews from '@/components/shared/HomeReviews';
import { getTranslations } from 'next-intl/server';
import { getImageUrl } from '@/lib/imageVersion';
import { heroBlurPlaceholder } from '@/lib/heroBlurPlaceholder';

function GallerySkeleton() {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
                <div key={i} className='bg-white rounded-lg shadow-md p-2 sm:p-3'>
                    <div className='relative aspect-[4/3] rounded-md overflow-hidden bg-gray-200 animate-pulse' />
                </div>
            ))}
        </div>
    );
}

export default async function Home() {
    const t = await getTranslations('home');
    const tLayout = await getTranslations('layout');

    return (
        <div className='min-h-screen'>

            {/* ── Hero ─────────────────────────────────────────── */}
            <section className='bg-gradient-to-br from-[var(--dp-bg-from)] via-[var(--dp-bg-from)] to-white px-4 sm:px-8 pt-10 sm:pt-14 pb-12 sm:pb-16'>
                <div className='max-w-6xl mx-auto'>
                    <div className='flex flex-col lg:flex-row items-center gap-10 lg:gap-16'>

                        {/* Text column */}
                        <div className='flex-1 text-center lg:text-left'>
                            <div className='flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-2 text-[var(--dp-primary)] font-montserrat text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] mb-5'>
                                <span>{t('doctor1Name')} &</span>
                                <span>{t('doctor2Name')}</span>
                            </div>
                            <h1 className='font-playfair leading-tight mb-8'>
                                <span className='block text-2xl sm:text-3xl font-normal text-[var(--dp-heading)] opacity-75 mb-2'>
                                    {t('heroTitlePrefix')}
                                </span>
                                <span className='block text-4xl sm:text-5xl lg:text-6xl font-bold'>
                                    <span style={{ color: 'var(--dp-primary)' }}>Dental</span>
                                    {' '}
                                    <span style={{ color: 'var(--dp-accent)' }}>Point</span>
                                </span>
                            </h1>
                            <div className='flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
                                <Link
                                    href='/contact'
                                    className='inline-block whitespace-nowrap bg-[var(--dp-accent)] text-white px-8 py-3.5 rounded-xl font-semibold font-montserrat text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg'
                                >
                                    {tLayout('bookAppointment')}
                                </Link>
                                <Link
                                    href='/team'
                                    className='inline-block whitespace-nowrap border-2 border-[var(--dp-primary)] text-[var(--dp-primary)] px-8 py-3.5 rounded-xl font-semibold font-montserrat text-sm sm:text-base transition-all duration-300 hover:bg-[var(--dp-primary)] hover:text-white'
                                >
                                    {t('moreInfo')}
                                </Link>
                            </div>
                        </div>

                        {/* Image column */}
                        <div className='w-full lg:flex-[1.15]'>
                            <div className='relative h-[260px] sm:h-[360px] lg:h-[460px] rounded-3xl overflow-hidden shadow-2xl'>
                                <Image
                                    src={getImageUrl('/Images/front/clinic.jpg')}
                                    alt='Dental Point Clinic'
                                    fill
                                    className='object-cover'
                                    priority
                                    loading='eager'
                                    quality={75}
                                    sizes='(max-width: 1024px) 100vw, 580px'
                                    fetchPriority='high'
                                    placeholder='blur'
                                    blurDataURL={heroBlurPlaceholder}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Contact Bar ──────────────────────────────────── */}
            <section className='bg-white border-y border-[var(--dp-card-border)] py-5 px-4 sm:px-8'>
                <div className='max-w-6xl mx-auto'>
                    <div className='grid grid-cols-1 sm:grid-cols-[1fr_1.6fr_1fr] divide-y sm:divide-y-0 sm:divide-x divide-[var(--dp-card-border)]'>

                        <div className='flex items-center gap-4 py-5 sm:py-0 sm:px-6 first:sm:pl-0'>
                            <div className='w-10 h-10 rounded-full bg-[var(--dp-primary)]/10 flex items-center justify-center flex-shrink-0'>
                                <svg className='w-5 h-5 text-[var(--dp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' />
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z' />
                                </svg>
                            </div>
                            <div className='space-y-1'>
                                <p className='font-montserrat text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 leading-snug'>{tLayout('addressLabel')}</p>
                                <p className='font-montserrat text-[13px] font-semibold text-gray-800 leading-snug'>{tLayout('addressLine1')}</p>
                                <p className='font-montserrat text-[13px] text-gray-500 leading-snug'>{tLayout('addressLine2')}</p>
                            </div>
                        </div>

                        <div className='flex items-center sm:justify-center gap-4 py-5 sm:py-0 sm:px-6'>
                            <div className='w-10 h-10 rounded-full bg-[var(--dp-primary)]/10 flex items-center justify-center flex-shrink-0'>
                                <svg className='w-5 h-5 text-[var(--dp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z' />
                                </svg>
                            </div>
                            <div className='space-y-1'>
                                <p className='font-montserrat text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 leading-snug'>{tLayout('footerContact')}</p>
                                <div className='flex divide-x divide-[var(--dp-card-border)]'>
                                    <div className='pr-4 space-y-1'>
                                        <a href='tel:+359876346261' className='font-montserrat text-[13px] font-semibold text-gray-800 hover:text-[var(--dp-primary)] transition-colors leading-snug block'>
                                            0876 346 261
                                        </a>
                                        <p className='font-montserrat text-[12px] text-gray-500 leading-snug'>{t('doctor1Name')}</p>
                                    </div>
                                    <div className='pl-4 space-y-1'>
                                        <a href='tel:+359878355494' className='font-montserrat text-[13px] font-semibold text-gray-800 hover:text-[var(--dp-primary)] transition-colors leading-snug block'>
                                            0878 355 494
                                        </a>
                                        <p className='font-montserrat text-[12px] text-gray-500 leading-snug'>{t('doctor2Name')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center gap-4 py-5 sm:py-0 sm:px-6 last:sm:pr-0'>
                            <div className='w-10 h-10 rounded-full bg-[var(--dp-primary)]/10 flex items-center justify-center flex-shrink-0'>
                                <svg className='w-5 h-5 text-[var(--dp-primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.8}>
                                    <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' />
                                </svg>
                            </div>
                            <div className='space-y-1'>
                                <p className='font-montserrat text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 leading-snug'>{tLayout('workingHoursLabel')}</p>
                                <p className='font-montserrat text-[13px] font-semibold text-gray-800 leading-snug'>{tLayout('workingHoursWeekdays')}</p>
                                <p className='font-montserrat text-[13px] text-gray-500 leading-snug'>{tLayout('workingHoursWeekend')}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── About + Map ──────────────────────────────────── */}
            <section className='bg-[var(--dp-bg-from)] pt-10 sm:pt-14 pb-4 px-4 sm:px-8'>
                <div className='max-w-6xl mx-auto'>
                    <div className='flex flex-col lg:flex-row lg:items-stretch gap-8'>

                        {/* About */}
                        <div className='lg:flex-[0.9] bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[var(--dp-card-border)]'>
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='w-1.5 h-8 rounded-full bg-[var(--dp-primary)]' />
                                <h2 className='text-2xl sm:text-3xl font-bold text-[var(--dp-heading)]'>{t('aboutTitle')}</h2>
                            </div>
                            <p className='text-gray-600 leading-relaxed text-lg'>{t('aboutTextLine1')}</p>
                            <p className='text-gray-600 leading-relaxed text-lg mt-4'>{t('aboutTextLine2')}</p>
                        </div>

                        {/* Map */}
                        <div className='lg:flex-[1.1] rounded-3xl overflow-hidden shadow-md border border-[var(--dp-card-border)] h-[280px] sm:h-[340px] lg:h-auto [transform:translateZ(0)]'>
                            <iframe
                                src='https://www.google.com/maps?q=Dental%20Point%20Varna%2C%20%D1%83%D0%BB.%20%D0%9F%D0%BE%D0%B4%D0%BF%D0%BE%D0%BB%D0%BA%D0%BE%D0%B2%D0%BD%D0%B8%D0%BA%20%D0%9A%D0%B0%D0%BB%D0%B8%D1%82%D0%B8%D0%BD%202%2C%20%D0%92%D0%B0%D1%80%D0%BD%D0%B0&z=17&output=embed'
                                width='100%'
                                height='100%'
                                style={{ border: 0 }}
                                allowFullScreen
                                loading='eager'
                                referrerPolicy='no-referrer-when-downgrade'
                                title='Dental Point Location'
                            />
                        </div>

                    </div>

                    {/* Mobile-only button — desktop version lives in the gallery header */}
                    <div className='flex justify-center mt-8 lg:hidden'>
                        <a
                            href='https://www.google.com/maps/dir/?api=1&destination=Dental+Point,+%D1%83%D0%BB.+%D0%9F%D0%BE%D0%B4%D0%BF%D0%BE%D0%BB%D0%BA%D0%BE%D0%B2%D0%BD%D0%B8%D0%BA+%D0%9A%D0%B0%D0%BB%D0%B8%D1%82%D0%B8%D0%BD+2,+Varna,+Bulgaria'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 bg-white border border-[var(--dp-primary)] rounded-xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all font-montserrat text-sm font-semibold text-gray-700 whitespace-nowrap'
                        >
                            <svg className='w-4 h-4 text-[var(--dp-primary)] flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z' />
                            </svg>
                            {t('getDirections')}
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Reviews ──────────────────────────────────────── */}
            <HomeReviews />

            {/* ── Gallery ──────────────────────────────────────── */}
            <section className='bg-[var(--dp-bg-from)] pt-8 pb-10 sm:pb-14 px-4 sm:px-8'>
                <div className='max-w-6xl mx-auto'>
                    <div className='flex items-center gap-3 mb-4'>
                        <div className='w-1.5 h-8 rounded-full bg-[var(--dp-primary)]' />
                        <h2 className='text-2xl sm:text-3xl font-bold text-[var(--dp-heading)]'>{t('galleryTitle')}</h2>
                    </div>
                    <Suspense fallback={<GallerySkeleton />}>
                        <HomeGallery />
                    </Suspense>
                </div>
            </section>

        </div>
    );
}
