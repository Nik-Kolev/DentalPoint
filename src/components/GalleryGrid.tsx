'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';
import ImageLightbox from '@/components/ImageLightbox';

interface GalleryItem {
    before: string;
    after: string;
    description?: string;
}

interface GalleryGridProps {
    items: GalleryItem[];
    locale: string;
    beforeLabel: string;
    afterLabel: string;
    loadMoreLabel: string;
    showLessLabel: string;
    startIndex?: number; // For proper alt text numbering when some items are server-rendered
}

export default function GalleryGrid({ items, locale, beforeLabel, afterLabel, loadMoreLabel, showLessLabel, startIndex = 0 }: GalleryGridProps) {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; element: HTMLElement | null } | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        if (window.innerWidth >= 768) {
            setVisibleCount(items.length);
        } else {
            setVisibleCount(3);
        }
    }, [items.length]);

    const loadMore = () => setVisibleCount((prev) => Math.min(prev + 3, items.length));
    const showLess = () => setVisibleCount(3);

    useEffect(() => {
        if (visibleCount > 3) window.dispatchEvent(new CustomEvent('content-expanded'));
    }, [visibleCount]);

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const hasExpanded = visibleCount > 3;

    return (
        <>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pb-8 sm:pb-12'>
                {visibleItems.map((item, i) => (
                    <div key={i} className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
                        <div className='flex flex-col sm:grid sm:grid-cols-2 gap-0 sm:gap-1'>
                            <div
                                className='relative aspect-square sm:cursor-pointer group overflow-hidden bg-gray-100'
                                onClick={(e) => {
                                    if (window.innerWidth >= 640) {
                                        setSelectedImage({ src: item.before, alt: `Before - Gallery item ${startIndex + i + 1}`, element: e.currentTarget });
                                    }
                                }}
                            >
                                <Image
                                    src={getImageUrl(item.before)}
                                    alt={`Before - Gallery item ${startIndex + i + 1}`}
                                    fill
                                    quality={i < 2 ? 75 : 70}
                                    priority={i === 0}
                                    loading={i < 2 ? 'eager' : 'lazy'}
                                    fetchPriority={i === 0 ? 'high' : 'auto'}
                                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                    className='object-cover group-hover:opacity-90 transition-opacity'
                                    placeholder='blur'
                                    blurDataURL={getBlurPlaceholder(item.before)}
                                />
                                <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base sm:text-sm font-semibold py-2 px-2 text-center'>
                                    {beforeLabel}
                                </div>
                            </div>

                            <div
                                className='relative aspect-square sm:cursor-pointer group overflow-hidden bg-gray-100'
                                onClick={(e) => {
                                    if (window.innerWidth >= 640) {
                                        setSelectedImage({ src: item.after, alt: `After - Gallery item ${startIndex + i + 1}`, element: e.currentTarget });
                                    }
                                }}
                            >
                                <Image
                                    src={getImageUrl(item.after)}
                                    alt={`After - Gallery item ${startIndex + i + 1}`}
                                    fill
                                    quality={i < 2 ? 75 : 70}
                                    loading={i < 2 ? 'eager' : 'lazy'}
                                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                                    className='object-cover group-hover:opacity-90 transition-opacity'
                                    placeholder='blur'
                                    blurDataURL={getBlurPlaceholder(item.after)}
                                />
                                <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base sm:text-sm font-semibold py-2 px-2 text-center'>
                                    {afterLabel}
                                </div>
                            </div>
                        </div>

                        {item.description && (
                            <div className='p-4 sm:p-4'>
                                <p className='text-base text-gray-700 text-center'>{item.description}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {(hasMore || hasExpanded) && (
                <div className='flex justify-center pb-8 sm:pb-12 md:hidden gap-4'>
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

            {selectedImage && (
                <ImageLightbox
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imageSrc={selectedImage.src}
                    alt={selectedImage.alt}
                    triggerElement={selectedImage.element}
                    locale={locale}
                />
            )}
        </>
    );
}
