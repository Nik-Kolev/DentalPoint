'use client';

import { useEffect, useState } from 'react';

interface ReviewItem {
    name: string;
    initials: string;
    rating: number;
    date: string;
    text: string;
}

interface Props {
    items: ReviewItem[];
    ctaLabel: string;
    ctaUrl: string;
    loadMoreLabel: string;
    showLessLabel: string;
}

const MOBILE_INITIAL = 3;
const MOBILE_STEP = 3;

function getInitials(name: string, initials: string): string {
    return (
        initials ||
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    );
}

export default function HomeReviewsGrid({ items, ctaLabel, ctaUrl, loadMoreLabel, showLessLabel }: Props) {
    const [visibleCount, setVisibleCount] = useState(MOBILE_INITIAL);

    // Desktop shows every review immediately — same "paginate on mobile, show all on desktop"
    // pattern already used in CertificatesViewer/GalleryCasesViewer.
    useEffect(() => {
        if (window.innerWidth >= 1024) setVisibleCount(items.length);
    }, [items.length]);

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const hasExpanded = visibleCount > MOBILE_INITIAL;

    return (
        <>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
                {visibleItems.map((review, index) => (
                    <div key={index} className='bg-white rounded-2xl shadow-sm border border-[var(--dp-card-border)] p-5'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='flex-shrink-0 w-9 h-9 rounded-full bg-[var(--dp-primary)] text-white flex items-center justify-center font-semibold text-xs'>
                                {getInitials(review.name, review.initials)}
                            </div>
                            <div className='min-w-0'>
                                <p className='font-semibold text-gray-900 text-sm truncate'>{review.name}</p>
                                <span className='text-[var(--dp-accent)] text-xs leading-none'>
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </span>
                            </div>
                        </div>
                        <p className='text-gray-600 text-sm leading-relaxed line-clamp-3'>{review.text}</p>
                    </div>
                ))}
            </div>

            <div className='flex flex-col items-center gap-3'>
                {(hasMore || hasExpanded) && (
                    <div className='flex justify-center gap-3 lg:hidden'>
                        {hasMore && (
                            <button
                                type='button'
                                onClick={() => setVisibleCount((prev) => Math.min(prev + MOBILE_STEP, items.length))}
                                className='px-6 py-2.5 bg-[var(--dp-primary)] text-white rounded-full font-semibold text-sm hover:bg-[var(--dp-primary)]/90 transition-colors shadow-md'
                            >
                                {loadMoreLabel}
                            </button>
                        )}
                        {hasExpanded && (
                            <button
                                type='button'
                                onClick={() => setVisibleCount(MOBILE_INITIAL)}
                                className='px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors'
                            >
                                {showLessLabel}
                            </button>
                        )}
                    </div>
                )}

                {hasExpanded && (
                    <a
                        href={ctaUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='px-6 py-2.5 bg-[var(--dp-primary)] text-white rounded-full font-semibold text-sm hover:bg-[var(--dp-primary)]/90 transition-colors shadow-sm'
                    >
                        {ctaLabel}
                    </a>
                )}
            </div>
        </>
    );
}
