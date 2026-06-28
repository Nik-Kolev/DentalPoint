'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), {
    ssr: false,
});

const clinicImages = ['IMG_3345.jpeg', 'IMG_3357.jpeg', 'IMG_3350.jpeg', 'IMG_3372.jpeg', 'IMG_3349.jpeg', 'IMG_3445.jpeg'];

export default function ClientGallery({ locale }: { locale: string }) {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; element: HTMLElement | null } | null>(null);

    return (
        <>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4'>
                {clinicImages.map((imageName, i) => (
                    <div
                        key={i}
                        className='bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200 sm:cursor-pointer'
                        onClick={(e) => {
                            if (window.innerWidth >= 640) {
                                setSelectedImage({
                                    src: `/Images/front/${imageName}`,
                                    alt: `Clinic image ${i + 1}`,
                                    element: e.currentTarget,
                                });
                            }
                        }}
                    >
                        <div className='relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100'>
                            <Image
                                src={getImageUrl(`/Images/front/${imageName}`)}
                                alt={`Clinic image ${i + 1}`}
                                fill
                                quality={60}
                                loading='lazy'
                                sizes='(max-width: 768px) 100vw, 300px'
                                className='rounded-md object-cover'
                                placeholder='blur'
                                blurDataURL={getBlurPlaceholder(`/Images/front/${imageName}`)}
                            />
                        </div>
                    </div>
                ))}
            </div>

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

