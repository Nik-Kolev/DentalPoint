'use client';

import { useState, useEffect } from 'react';
import BeforeAfterSlider from '@/components/gallery/BeforeAfterSlider';
import type { GalleryCase } from '@/types/gallery';

interface Props {
    cases: GalleryCase[];
    locale: string;
    beforeLabel: string;
    afterLabel: string;
    loadMoreLabel: string;
    showLessLabel: string;
}

export default function GalleryCasesViewer({ cases, locale, beforeLabel, afterLabel, loadMoreLabel, showLessLabel }: Props) {
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        if (window.innerWidth >= 768) {
            setVisibleCount(cases.length);
        } else {
            setVisibleCount(3);
        }
    }, [cases.length]);

    const loadMore = () => setVisibleCount((prev) => Math.min(prev + 3, cases.length));
    const showLess = () => setVisibleCount(3);

    useEffect(() => {
        if (visibleCount > 3) window.dispatchEvent(new CustomEvent('content-expanded'));
    }, [visibleCount]);

    const visibleCases = cases.slice(0, visibleCount);
    const hasMore = visibleCount < cases.length;
    const hasExpanded = visibleCount > 3;

    return (
        <>
            <div className='space-y-12 sm:space-y-16'>
                {visibleCases.map((c, index) => (
                    <div
                        key={c.id}
                        className={`flex flex-col lg:flex-row gap-6 lg:gap-10 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                    >
                        <div className='w-full lg:w-3/5'>
                            <BeforeAfterSlider
                                beforeImage={c.beforePath}
                                afterImage={c.afterPath}
                                beforeLabel={beforeLabel}
                                afterLabel={afterLabel}
                                priority={index === 0}
                                imageStyle={c.imageStyle}
                                beforeImageStyle={c.beforeImageStyle}
                                afterImageStyle={c.afterImageStyle}
                                aspectRatio={c.aspectRatio}
                            />
                        </div>

                        <div className='w-full lg:w-2/5'>
                            <div className='bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#e3f3fb] h-full'>
                                <h3 className='text-xl font-bold text-[#005baa] mb-4'>
                                    {locale === 'bg' ? c.captionBg : c.captionEn}
                                </h3>
                                <p className='text-gray-600 leading-relaxed'>
                                    {locale === 'bg' ? c.descriptionBg : c.descriptionEn}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {(hasMore || hasExpanded) && (
                <div className='flex justify-center pt-8 sm:pt-12 md:hidden gap-4'>
                    {hasMore && (
                        <button
                            type='button'
                            onClick={loadMore}
                            className='px-6 py-3 bg-[#005baa] text-white rounded-lg font-semibold hover:bg-[#004a8c] transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                        >
                            {loadMoreLabel}
                        </button>
                    )}
                    {hasExpanded && (
                        <button
                            type='button'
                            onClick={showLess}
                            className='px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
                        >
                            {showLessLabel}
                        </button>
                    )}
                </div>
            )}
        </>
    );
}
