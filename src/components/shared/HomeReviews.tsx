import { getTranslations } from 'next-intl/server';
import HomeReviewsGrid from '@/components/shared/HomeReviewsGrid';

interface ReviewItem {
    name: string;
    initials: string;
    rating: number;
    date: string;
    text: string;
}

// https://www.google.com/maps/place/Dental+Point+-+... — confirmed correct listing (doctor names
// in the URL match the site's own contact bar).
const GOOGLE_REVIEWS_URL =
    'https://www.google.com/maps/place/Dental+Point+-+%D0%B4-%D1%80+%D0%AF%D0%B2%D0%BE%D1%80+%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2,+%D0%B4-%D1%80+%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B0+%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0/@43.2215584,27.9152771,17z/data=!3m1!4b1!4m6!3m5!1s0x40a455d3a111b459:0xe737faf0914586ae!8m2!3d43.2215545!4d27.917852!16s%2Fg%2F11l6zqphst';

const GET_DIRECTIONS_URL =
    'https://www.google.com/maps/dir/?api=1&destination=Dental+Point,+%D1%83%D0%BB.+%D0%9F%D0%BE%D0%B4%D0%BF%D0%BE%D0%BB%D0%BA%D0%BE%D0%B2%D0%BD%D0%B8%D0%BA+%D0%9A%D0%B0%D0%BB%D0%B8%D1%82%D0%B8%D0%BD+2,+Varna,+Bulgaria';

export default async function HomeReviews() {
    const t = await getTranslations('home');
    const tReviews = await getTranslations('reviews');

    const items = (tReviews.raw('items') as ReviewItem[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const average = items.reduce((sum, r) => sum + r.rating, 0) / items.length;

    return (
        <section className='bg-[var(--dp-bg-from)] pt-8 pb-4 px-4 sm:px-8'>
            <div className='max-w-6xl mx-auto'>
                {/* Mirror the About+Map proportions so the button centers over the map column */}
                <div className='flex items-center gap-8 mb-4'>
                    <div className='flex items-center gap-3 lg:flex-[0.9]'>
                        <div className='w-1.5 h-8 rounded-full bg-[var(--dp-primary)]' />
                        <h2 className='text-2xl sm:text-3xl font-bold text-[var(--dp-heading)]'>{t('reviewsTitle')}</h2>
                    </div>
                    <div className='hidden lg:flex lg:flex-[1.1] justify-center'>
                        <a
                            href={GET_DIRECTIONS_URL}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 flex-shrink-0 bg-white border border-[var(--dp-primary)] rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition-all font-montserrat text-sm font-semibold text-gray-700 whitespace-nowrap'
                        >
                            <svg className='w-4 h-4 text-[var(--dp-primary)] flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.159.69.159 1.006 0Z' />
                            </svg>
                            {t('getDirections')}
                        </a>
                    </div>
                </div>

                <div className='flex items-center gap-2 mb-6'>
                    <span className='text-[var(--dp-accent)] text-lg leading-none'>★</span>
                    <span className='font-montserrat text-sm text-gray-600'>
                        {t('reviewsRatingSummary', { rating: average.toFixed(1), count: items.length })}
                    </span>
                </div>

                <HomeReviewsGrid
                    items={items}
                    ctaLabel={t('reviewsCta')}
                    ctaUrl={GOOGLE_REVIEWS_URL}
                    loadMoreLabel={t('reviewsLoadMore')}
                    showLessLabel={t('reviewsShowLess')}
                />
            </div>
        </section>
    );
}
