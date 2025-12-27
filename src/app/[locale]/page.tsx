'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Playfair_Display, Montserrat } from 'next/font/google';
import { getTranslation } from '../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import ImageLightbox from '@/components/ImageLightbox';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

const playfair = Playfair_Display({
    subsets: ['latin'],
    display: 'swap',
    preload: false, // Not critical for homepage
});
const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['600', '700'],
    display: 'swap',
    preload: false, // Not critical for homepage
});

export default function Home({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; element: HTMLElement | null } | null>(null);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Gallery images - first 3 load instantly, rest on scroll
    const clinicImages = ['IMG_3345.jpeg', 'IMG_3349.jpeg', 'IMG_3350.jpeg', 'IMG_3357.jpeg', 'IMG_3372.jpeg', 'IMG_3445.jpeg'];
    const [galleryVisible, setGalleryVisible] = useState(false);

    // Lazy load gallery when user starts scrolling
    useEffect(() => {
        const handleScroll = () => {
            if (!galleryVisible && window.scrollY > 200) {
                setGalleryVisible(true);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [galleryVisible]);

    return (
        <div className='bg-gradient-to-b from-[#e3f3fb] to-white min-h-screen'>
            {/* Main Title - Centered */}
            <div className='text-center pt-8 sm:pt-12 pb-8 sm:pb-12 px-4'>
                <h1 className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-[#005baa] ${playfair.className}`}>
                    <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium opacity-80'>{t('home', 'heroTitlePrefix')}</span>
                    <span className={`${montserrat.className} font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl`}>{t('home', 'heroTitleClinic')}</span>
                </h1>
            </div>

            {/* Clinic Image Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl bg-gray-100'>
                        <Image
                            src={getImageUrl('/Images/front/clinic.jpg')}
                            alt='Dental Point Clinic'
                            fill
                            className='object-cover'
                            priority
                            loading='eager'
                            quality={85}
                            sizes='(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 1024px, 1280px'
                            placeholder='blur'
                            blurDataURL={getBlurPlaceholder('/Images/front/clinic.jpg')}
                        />
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 sm:p-8 shadow-md text-center'>
                        <h2 className='text-2xl sm:text-3xl font-bold text-[#005baa] mb-4'>{t('home', 'aboutTitle')}</h2>
                        <p className='text-gray-600 leading-relaxed text-lg mb-2'>{t('home', 'aboutTextLine1')}</p>
                        <p className='text-gray-600 leading-relaxed text-lg'>{t('home', 'aboutTextLine2')}</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <StaticCTA locale={params.locale} title={t('home', 'ctaTitle')} subtitle={t('home', 'ctaSubtitle')} />
                </div>
            </section>

            {/* Clinic Gallery Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4'>
                        {clinicImages.map((imageName, i) => (
                            <div
                                key={i}
                                className='bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200 sm:cursor-pointer'
                                onClick={(e) => {
                                    // Only open lightbox on desktop
                                    if (!isMobile) {
                                        setSelectedImage({ src: `/Images/front/${imageName}`, alt: `Clinic image ${i + 1}`, element: e.currentTarget });
                                    }
                                }}
                            >
                                <div className='relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100'>
                                    <Image
                                        src={getImageUrl(`/Images/front/${imageName}`)}
                                        alt={`Clinic image ${i + 1}`}
                                        fill
                                        quality={85}
                                        priority={i < 2}
                                        loading={i < 2 ? 'eager' : 'lazy'}
                                        sizes='(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px'
                                        className='rounded-md object-cover'
                                        placeholder='blur'
                                        blurDataURL={getBlurPlaceholder(`/Images/front/${imageName}`)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
    );
}
