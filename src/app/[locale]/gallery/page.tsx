/**
 * GALLERY PAGE - Server Component
 * First 2 items rendered server-side for fast LCP
 * Interactive parts (lightbox, load more) in GalleryGrid client component
 */
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslation, getSection } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import GalleryGrid from '@/components/GalleryGrid';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

export const metadata: Metadata = {
    title: 'Gallery',
    description: 'View our dental work gallery showcasing before and after results.',
};

const galleryItems = [
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 0 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 1 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 2 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 3 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 4 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 5 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 6 },
    { before: '/Images/gallery/before.jpg', after: '/Images/gallery/after.jpg', descriptionKey: 7 },
];

// Server-rendered gallery item for LCP optimization
function ServerGalleryItem({
    item,
    index,
    beforeLabel,
    afterLabel,
}: {
    item: { before: string; after: string; description?: string };
    index: number;
    beforeLabel: string;
    afterLabel: string;
}) {
    return (
        <div className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden'>
            <div className='flex flex-col sm:grid sm:grid-cols-2 gap-0 sm:gap-1'>
                <div className='relative aspect-square overflow-hidden bg-gray-100'>
                    <Image
                        src={getImageUrl(item.before)}
                        alt={`Before - Gallery item ${index + 1}`}
                        fill
                        quality={75}
                        priority={index === 0}
                        loading='eager'
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        className='object-cover'
                        placeholder='blur'
                        blurDataURL={getBlurPlaceholder(item.before)}
                    />
                    <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base sm:text-sm font-semibold py-2 px-2 text-center'>
                        {beforeLabel}
                    </div>
                </div>

                <div className='relative aspect-square overflow-hidden bg-gray-100'>
                    <Image
                        src={getImageUrl(item.after)}
                        alt={`After - Gallery item ${index + 1}`}
                        fill
                        quality={75}
                        priority={index === 0}
                        loading='eager'
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        className='object-cover'
                        placeholder='blur'
                        blurDataURL={getBlurPlaceholder(item.after)}
                    />
                    <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-base sm:text-sm font-semibold py-2 px-2 text-center'>
                        {afterLabel}
                    </div>
                </div>
            </div>

            {item.description && (
                <div className='p-4'>
                    <p className='text-base text-gray-700 text-center'>{item.description}</p>
                </div>
            )}
        </div>
    );
}

export default function Gallery({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const gallery = getSection(params.locale, 'gallery') as any;

    const beforeLabel = t('gallery', 'before');
    const afterLabel = t('gallery', 'after');

    // Build items with descriptions
    const items = galleryItems.map((item) => ({
        before: item.before,
        after: item.after,
        description: item.descriptionKey !== undefined ? gallery.items?.[item.descriptionKey]?.description : undefined,
    }));

    // First 2 items server-rendered for LCP, rest handled by client component
    const serverItems = items.slice(0, 2);
    const clientItems = items.slice(2);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('gallery', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('gallery', 'subtitle')}</p>
                </div>

                {/* Server-rendered first items for fast LCP */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pb-6 sm:pb-8'>
                    {serverItems.map((item, i) => (
                        <ServerGalleryItem key={i} item={item} index={i} beforeLabel={beforeLabel} afterLabel={afterLabel} />
                    ))}
                </div>

                {/* Client component handles rest + lightbox + load more */}
                <GalleryGrid
                    items={clientItems}
                    locale={params.locale}
                    beforeLabel={beforeLabel}
                    afterLabel={afterLabel}
                    loadMoreLabel={t('licenses', 'loadMore')}
                    showLessLabel={t('licenses', 'showLess')}
                    startIndex={2}
                />

                <div className='pt-8 sm:pt-12'>
                    <StaticCTA locale={params.locale} title={t('gallery', 'ctaTitle')} subtitle={t('gallery', 'ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
