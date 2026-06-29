import type { Metadata } from 'next';
import { getTranslations, getMessages } from 'next-intl/server';
import StaticCTA from '@/components/shared/StaticCTA';
import ReviewsList from '@/components/shared/ReviewsList';

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

export default async function Reviews() {
    const t = await getTranslations('licenses');
    const messages = await getMessages();
    const reviews = messages.reviews as any;

    const reviewItems = [...(reviews.items || [])].sort((a: ReviewItem, b: ReviewItem) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }) as ReviewItem[];

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-3xl font-extrabold text-[#005baa]'>{reviews.title}</h1>
                </div>

                <ReviewsList items={reviewItems} loadMoreLabel={t('loadMore')} showLessLabel={t('showLess')} />

                <div className='pt-8 sm:pt-12'>
                    <StaticCTA title={reviews.ctaTitle} subtitle={reviews.ctaSubtitle} />
                </div>
            </div>
        </div>
    );
}
