'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageVersion';
import { getTranslation, getSection } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import ImageLightbox from '@/components/ImageLightbox';

interface GalleryItem {
    before: string;
    after: string;
    descriptionKey?: number;
}

// Gallery items - before and after treatment results
const galleryItems: GalleryItem[] = [
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 0,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 1,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 2,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 3,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 4,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 5,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 6,
    },
    {
        before: '/Images/gallery/before.png',
        after: '/Images/gallery/after.png',
        descriptionKey: 7,
    },
];

export default function Gallery({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const gallery = getSection(params.locale, 'gallery') as any;
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; element: HTMLElement | null } | null>(null);

    // Mobile: show 3 initially, desktop: show all
    const [visibleCount, setVisibleCount] = useState(3);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        // Check if mobile on mount and resize
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // On desktop, show all items
            if (!mobile) {
                setVisibleCount(galleryItems.length);
            }
            // On mobile, initial state is already 3, no need to reset
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show more items (3 at a time)
    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 3, galleryItems.length));
    };

    // Show less (collapse back to 3)
    const showLess = () => {
        setVisibleCount(3);
    };

    const visibleItems = galleryItems.slice(0, visibleCount);
    const hasMore = visibleCount < galleryItems.length;
    const hasExpanded = visibleCount > 3;

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('gallery', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('gallery', 'subtitle')}</p>
                </div>

                {/* Before/After Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pb-8 sm:pb-12'>
                    {visibleItems.map((item, i) => (
                        <div key={i} className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
                            {/* Mobile: Stacked layout (Before, After, Text) | Desktop: Side by side (Before/After, Text below) */}
                            <div className='flex flex-col sm:grid sm:grid-cols-2 gap-0 sm:gap-1'>
                                {/* Before Image */}
                                <div
                                    className='relative sm:cursor-pointer group'
                                    onClick={(e) => {
                                        // Only open lightbox on desktop
                                        if (!isMobile) {
                                            setSelectedImage({ src: item.before, alt: `Before - Gallery item ${i + 1}`, element: e.currentTarget });
                                        }
                                    }}
                                >
                                    <Image
                                        src={getImageUrl(item.before)}
                                        alt={`Before - Gallery item ${i + 1}`}
                                        width={300}
                                        height={300}
                                        quality={35}
                                        priority={i === 0}
                                        loading={i === 0 ? 'eager' : 'lazy'}
                                        sizes='(max-width: 640px) 100vw, 50vw'
                                        className='w-full h-64 sm:h-56 object-cover group-hover:opacity-90 transition-opacity'
                                    />
                                    <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base sm:text-sm font-semibold py-2 px-2 text-center'>
                                        {t('gallery', 'before')}
                                    </div>
                                </div>

                                {/* After Image */}
                                <div
                                    className='relative sm:cursor-pointer group'
                                    onClick={(e) => {
                                        // Only open lightbox on desktop
                                        if (!isMobile) {
                                            setSelectedImage({ src: item.after, alt: `After - Gallery item ${i + 1}`, element: e.currentTarget });
                                        }
                                    }}
                                >
                                    <Image
                                        src={getImageUrl(item.after)}
                                        alt={`After - Gallery item ${i + 1}`}
                                        width={300}
                                        height={300}
                                        quality={35}
                                        priority={i === 0}
                                        loading={i === 0 ? 'eager' : 'lazy'}
                                        sizes='(max-width: 640px) 100vw, 50vw'
                                        className='w-full h-64 sm:h-56 object-cover group-hover:opacity-90 transition-opacity'
                                    />
                                    <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base sm:text-sm font-semibold py-2 px-2 text-center'>
                                        {t('gallery', 'after')}
                                    </div>
                                </div>
                            </div>

                            {/* Description Text - Below images on both mobile and desktop */}
                            {item.descriptionKey !== undefined && gallery.items?.[item.descriptionKey]?.description && (
                                <div className='p-4 sm:p-4'>
                                    <p className='text-base text-gray-700 text-center'>{gallery.items[item.descriptionKey].description}</p>
                                </div>
                            )}
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
                    <StaticCTA locale={params.locale} title={t('gallery', 'ctaTitle')} subtitle={t('gallery', 'ctaSubtitle')} />
                </div>

                {/* Lightbox - Only on desktop */}
                {selectedImage && !isMobile && (
                    <ImageLightbox
                        isOpen={!!selectedImage}
                        onClose={() => setSelectedImage(null)}
                        imageSrc={selectedImage.src}
                        alt={selectedImage.alt}
                        triggerElement={selectedImage.element}
                        locale={params.locale}
                    />
                )}
            </div>
        </div>
    );
}
