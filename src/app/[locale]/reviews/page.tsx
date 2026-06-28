/**
 * REVIEWS PAGE - Server Component
 * Interactive list extracted to ReviewsList.tsx (client component)
 */
import type { Metadata } from 'next';
import { getSection, getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import ReviewsList from '@/components/ReviewsList';

export const metadata: Metadata = {
    title: 'Reviews',
    description: 'Read reviews from our satisfied patients.',
};

interface ReviewItem {
    name: string;
    initials: string;
    rating: number;
    date: string;
    text: string;
}

export default async function Reviews({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = getTranslation(locale);
    const reviews = getSection(locale, 'reviews') as any;

    // Sort reviews by date (newest first)
    const reviewItems = [...(reviews.items || [])].sort((a: ReviewItem, b: ReviewItem) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }) as ReviewItem[];

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-3xl font-extrabold text-[#005baa]'>{reviews.title}</h1>
                </div>

                <ReviewsList items={reviewItems} locale={locale} loadMoreLabel={t('licenses', 'loadMore')} showLessLabel={t('licenses', 'showLess')} />

                <div className='pt-8 sm:pt-12'>
                    <StaticCTA locale={locale} title={reviews.ctaTitle} subtitle={reviews.ctaSubtitle} />
                </div>
            </div>
        </div>
    );
}
