'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface ReviewItem {
    name: string;
    initials: string;
    rating: number;
    date: string;
    text: string;
}

interface ReviewsListProps {
    items: ReviewItem[];
    loadMoreLabel: string;
    showLessLabel: string;
}

export default function ReviewsList({ items, loadMoreLabel, showLessLabel }: ReviewsListProps) {
    const locale = useLocale();
    const [visibleCount, setVisibleCount] = useState(5);

    const loadMore = () => setVisibleCount((prev) => Math.min(prev + 3, items.length));
    const showLess = () => setVisibleCount(5);

    useEffect(() => {
        if (visibleCount > 5) window.dispatchEvent(new CustomEvent('content-expanded'));
    }, [visibleCount]);

    const visibleReviews = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const hasExpanded = visibleCount > 5;

    const getInitials = (name: string, initials: string) =>
        initials ||
        name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    const getTimeAgo = (dateString: string): string => {
        const reviewDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - reviewDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        const yearsDiff = now.getFullYear() - reviewDate.getFullYear();
        const monthsDiff = now.getMonth() - reviewDate.getMonth() + yearsDiff * 12;
        const daysDiff = now.getDate() - reviewDate.getDate();

        let finalMonths = monthsDiff;
        if (reviewDate.getDate() !== 1 && daysDiff < 0) finalMonths = monthsDiff - 1;
        const finalYears = Math.floor(finalMonths / 12);

        if (locale === 'bg') {
            if (diffDays < 1) return 'днес';
            if (diffDays === 1) return 'вчера';
            if (diffDays < 7) return `преди ${diffDays} дни`;
            if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return weeks === 1 ? 'преди седмица' : `преди ${weeks} седмици`;
            }
            if (finalMonths < 12) {
                const displayMonths = Math.max(finalMonths, 1);
                return displayMonths === 1 ? 'преди месец' : `преди ${displayMonths} месеца`;
            }
            if (finalYears === 1) return 'преди година';
            return `преди ${finalYears} години`;
        } else {
            if (diffDays < 1) return 'today';
            if (diffDays === 1) return 'yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return weeks === 1 ? 'a week ago' : `${weeks} weeks ago`;
            }
            if (finalMonths < 12) {
                const displayMonths = Math.max(finalMonths, 1);
                return displayMonths === 1 ? 'a month ago' : `${displayMonths} months ago`;
            }
            if (finalYears === 1) return 'a year ago';
            return `${finalYears} years ago`;
        }
    };

    const isNew = (dateString: string): boolean => {
        const diffDays = Math.floor(
            (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
        );
        return diffDays < 7;
    };

    return (
        <>
            <div className='space-y-4 pb-8 sm:pb-12'>
                {visibleReviews.map((review, index) => (
                    <div
                        key={index}
                        className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow duration-200'
                    >
                        <div className='flex items-start gap-4'>
                            <div className='flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--dp-primary)] text-white flex items-center justify-center font-semibold text-sm'>
                                {getInitials(review.name, review.initials)}
                            </div>

                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between gap-2 mb-1 flex-wrap'>
                                    <span className='font-semibold text-gray-900 text-sm sm:text-base'>
                                        {review.name}
                                    </span>
                                    <span className='text-xs text-gray-400 flex items-center gap-1'>
                                        <span className='text-blue-500 font-bold'>G</span>
                                        Google
                                    </span>
                                </div>

                                <div className='flex items-center gap-2 mb-3 flex-wrap'>
                                    <span className='text-[var(--dp-accent)] text-base leading-none'>
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </span>
                                    <span className='text-xs text-gray-300'>•</span>
                                    <span className='text-xs text-gray-500'>{getTimeAgo(review.date)}</span>
                                    {isNew(review.date) && (
                                        <span className='bg-[var(--dp-accent)] text-white text-xs px-2 py-0.5 rounded-full font-semibold'>
                                            NEW
                                        </span>
                                    )}
                                </div>

                                <p className='text-gray-700 text-sm sm:text-base leading-relaxed'>
                                    {review.text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(hasMore || hasExpanded) && (
                <div className='flex justify-center pb-8 sm:pb-12 gap-3'>
                    {hasMore && (
                        <button
                            type='button'
                            onClick={loadMore}
                            className='px-6 py-2.5 bg-[var(--dp-primary)] text-white rounded-full font-semibold text-sm hover:bg-[var(--dp-primary)]/90 transition-colors shadow-md'
                        >
                            {loadMoreLabel}
                        </button>
                    )}
                    {hasExpanded && (
                        <button
                            type='button'
                            onClick={showLess}
                            className='px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors'
                        >
                            {showLessLabel}
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
