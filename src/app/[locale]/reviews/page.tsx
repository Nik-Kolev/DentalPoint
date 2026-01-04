'use client';

import { useState, useEffect } from 'react';
import { getSection, getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';

interface ReviewItem {
    name: string;
    initials: string;
    rating: number;
    date: string; // ISO date string
    text: string;
}

export default function Reviews({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const reviews = getSection(params.locale, 'reviews') as any;
    // Sort reviews by date (newest first)
    const reviewItems = [...(reviews.items || [])].sort((a: ReviewItem, b: ReviewItem) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }) as ReviewItem[];

    // Mobile: show 3 initially, desktop: show all
    const [visibleCount, setVisibleCount] = useState(3);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        // Check if mobile on mount and resize
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // On desktop, show all reviews
            if (!mobile) {
                setVisibleCount(reviewItems.length);
            }
            // On mobile, initial state is already 3, no need to reset
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [reviewItems.length]);

    // Show more reviews (3 at a time)
    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 3, reviewItems.length));
    };

    // Show less (collapse back to 3)
    const showLess = () => {
        setVisibleCount(3);
    };

    const visibleReviews = reviewItems.slice(0, visibleCount);
    const hasMore = visibleCount < reviewItems.length;
    const hasExpanded = visibleCount > 3;

    const getInitials = (name: string, initials: string) => {
        return (
            initials ||
            name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        );
    };

    // Calculate relative time (e.g., "2 days ago", "5 months ago")
    const getTimeAgo = (dateString: string, locale: string): string => {
        const reviewDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - reviewDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Calculate months - if date is on 1st of month, use month difference directly
        const yearsDiff = now.getFullYear() - reviewDate.getFullYear();
        const monthsDiff = now.getMonth() - reviewDate.getMonth() + yearsDiff * 12;
        const daysDiff = now.getDate() - reviewDate.getDate();

        // If review date is on the 1st, use month difference directly
        // Otherwise adjust for day difference
        let finalMonths = monthsDiff;
        if (reviewDate.getDate() === 1) {
            // Date is on 1st of month, so use month difference directly
            finalMonths = monthsDiff;
        } else {
            // Adjust for negative days
            if (daysDiff < 0) {
                finalMonths = monthsDiff - 1;
            }
        }

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

    // Check if review is less than 7 days old
    const isNew = (dateString: string): boolean => {
        const reviewDate = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - reviewDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays < 7;
    };

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-3xl font-extrabold text-[#005baa]'>{reviews.title}</h1>
                </div>
                <div className='space-y-4 pb-8 sm:pb-12'>
                    {visibleReviews.map((review, index) => (
                        <div key={index} className='bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200'>
                            <div className='flex items-start gap-4'>
                                {/* Avatar */}
                                <div className='flex-shrink-0'>
                                    <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#005baa] text-white flex items-center justify-center font-semibold text-sm sm:text-base'>
                                        {getInitials(review.name, review.initials)}
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className='flex-1 min-w-0'>
                                    {/* Name and Source */}
                                    <div className='mb-2'>
                                        <div className='font-semibold text-gray-900 text-sm sm:text-base'>{review.name}</div>
                                        <div className='text-xs text-gray-500 mt-0.5 flex items-center gap-1'>
                                            <span>Review from</span>
                                            <span className='text-blue-600 font-semibold'>G</span>
                                            <span>Google</span>
                                        </div>
                                    </div>

                                    {/* Rating and Time */}
                                    <div className='flex items-center gap-2 mb-3 flex-wrap'>
                                        <span className='text-sm text-gray-600'>{review.rating}/5</span>
                                        <span className='text-sm text-gray-500'>•</span>
                                        <span className='text-sm text-gray-500'>{getTimeAgo(review.date, params.locale)}</span>
                                        {isNew(review.date) && (
                                            <>
                                                <span className='text-sm text-gray-500'>•</span>
                                                <span className='bg-[#005baa] text-white text-xs px-2 py-0.5 rounded font-semibold'>NEW</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Review Text */}
                                    <p className='text-gray-700 text-sm sm:text-base leading-relaxed'>{review.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More / Show Less Buttons - Show on mobile */}
                {(hasMore || hasExpanded) && (
                    <div className='flex justify-center pb-8 sm:pb-12 md:hidden gap-4'>
                        {hasMore && (
                            <button
                                onClick={loadMore}
                                className='px-6 py-3 bg-[#005baa] text-white rounded-lg font-semibold hover:bg-[#004a8c] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                            >
                                {t('licenses', 'loadMore')}
                            </button>
                        )}
                        {hasExpanded && (
                            <button
                                onClick={showLess}
                                className='px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                            >
                                {t('licenses', 'showLess')}
                            </button>
                        )}
                    </div>
                )}

                {/* CTA Section */}
                <div className='pt-8 sm:pt-12'>
                    <StaticCTA locale={params.locale} title={reviews.ctaTitle} subtitle={reviews.ctaSubtitle} />
                </div>
            </div>
        </div>
    );
}
