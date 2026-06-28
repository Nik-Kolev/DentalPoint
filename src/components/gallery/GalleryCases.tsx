'use client';

import { useState, useEffect } from 'react';
import BeforeAfterSlider from '@/components/gallery/BeforeAfterSlider';

interface CaseItem {
    before: string;
    after: string;
    titleBg: string;
    titleEn: string;
    descriptionKey: number;
    imageStyle?: string;
    beforeImageStyle?: string;
    afterImageStyle?: string;
    aspectRatio?: string;
}

interface GalleryCasesProps {
    cases: CaseItem[];
    locale: string;
    beforeLabel: string;
    afterLabel: string;
    descriptions: { description: string }[];
    loadMoreLabel: string;
    showLessLabel: string;
}

export default function GalleryCases({ cases, locale, beforeLabel, afterLabel, descriptions, loadMoreLabel, showLessLabel }: GalleryCasesProps) {
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
            {/* Featured Cases - Interactive Sliders */}
            <div className='space-y-12 sm:space-y-16'>
                {visibleCases.map((caseItem, index) => (
                    <div key={index} className={`${index % 2 === 0 ? '' : 'lg:flex-row-reverse'} flex flex-col lg:flex-row gap-6 lg:gap-10 items-center`}>
                        {/* Slider */}
                        <div className='w-full lg:w-3/5'>
                            <BeforeAfterSlider
                                beforeImage={caseItem.before}
                                afterImage={caseItem.after}
                                beforeLabel={beforeLabel}
                                afterLabel={afterLabel}
                                priority={index === 0}
                                imageStyle={caseItem.imageStyle}
                                beforeImageStyle={caseItem.beforeImageStyle}
                                afterImageStyle={caseItem.afterImageStyle}
                                aspectRatio={caseItem.aspectRatio}
                            />
                        </div>

                        {/* Info card */}
                        <div className='w-full lg:w-2/5'>
                            <div className='bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#e3f3fb] h-full'>
                                <h3 className='text-xl font-bold text-[#005baa] mb-4'>{locale === 'bg' ? caseItem.titleBg : caseItem.titleEn}</h3>
                                <p className='text-gray-600 leading-relaxed'>
                                    {descriptions?.[caseItem.descriptionKey]?.description ||
                                        (locale === 'bg'
                                            ? 'Ð’ÑŠÐ·ÑÑ‚Ð°Ð½Ð¾Ð²ÑÐ²Ð°Ð½Ðµ Ð½Ð° ÐµÑÑ‚ÐµÑ‚Ð¸ÐºÐ°Ñ‚Ð° Ð¸ Ñ„ÑƒÐ½ÐºÑ†Ð¸ÑÑ‚Ð° Ð½Ð° Ð·ÑŠÐ±Ð¸Ñ‚Ðµ Ñ Ð²Ð¸ÑÐ¾ÐºÐ¾ÐºÐ°Ñ‡ÐµÑÑ‚Ð²ÐµÐ½Ð¸ Ð¼Ð°Ñ‚ÐµÑ€Ð¸Ð°Ð»Ð¸ Ð¸ Ð¿Ñ€ÐµÑ†Ð¸Ð·Ð½Ð° Ñ‚ÐµÑ…Ð½Ð¸ÐºÐ°.'
                                            : 'Restoring dental aesthetics and function using high-quality materials and precise techniques.')}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More / Show Less Buttons - Mobile only */}
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

