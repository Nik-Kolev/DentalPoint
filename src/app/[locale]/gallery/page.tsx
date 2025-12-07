'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import ImageLightbox from '@/components/ImageLightbox';

export default function Gallery({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);

    // Gallery images - update this array with your actual gallery images in the order you want
    const galleryImages = [
        '/Images/gallery/cube.jpg',
        // Add more gallery images here in your desired order
        // '/Images/gallery/image2.jpg',
        // '/Images/gallery/image3.jpg',
    ];

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('gallery', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('gallery', 'subtitle')}</p>
                </div>

                <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-8 sm:pb-12'>
                    {galleryImages.map((imageSrc, i) => (
                        <div
                            key={i}
                            className='bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                            onClick={() => setSelectedImage({ src: imageSrc, alt: `Gallery image ${i + 1}` })}
                        >
                            <Image
                                src={imageSrc}
                                alt={`Gallery image ${i + 1}`}
                                width={300}
                                height={300}
                                quality={85}
                                className='rounded-md object-cover w-full h-24 sm:h-32'
                            />
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className='pt-8 sm:pt-12'>
                    <StaticCTA locale={params.locale} title={t('gallery', 'ctaTitle')} subtitle={t('gallery', 'ctaSubtitle')} />
                </div>

                {/* Lightbox */}
                {selectedImage && (
                    <ImageLightbox isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} imageSrc={selectedImage.src} alt={selectedImage.alt} />
                )}
            </div>
        </div>
    );
}
