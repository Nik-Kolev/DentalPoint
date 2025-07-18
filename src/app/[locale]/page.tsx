'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTranslation } from '../../lib/useTranslation';
import CTAButton from '../../components/CTAButton';

export default function Home({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Images for the carousel - using doctor images only
    const carouselImages = [
        'https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/iavor.jpg',
        'https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/kati.jpg',
        'https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/cube.jpg',
    ];

    // Auto-advance carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1));
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [carouselImages.length]);

    return (
        <div className='bg-gradient-to-b from-[#e3f3fb] to-white min-h-screen'>
            {/* Main Title - Centered across both sections */}
            <div className='text-center pt-8 sm:pt-12 pb-16 sm:pb-20'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#005baa] px-4'>{t('home', 'heroTitle')}</h1>
            </div>

            {/* Hero Section with Carousel and Content */}
            <section className='pb-16 sm:pb-20 px-4'>
                <div className='max-w-7xl mx-auto'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
                        {/* Left Side - Carousel */}
                        <div className='relative h-80 sm:h-96 lg:h-[540px] rounded-2xl overflow-hidden shadow-2xl'>
                            <div className='relative w-full h-full'>
                                {carouselImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-opacity duration-1000 ${
                                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    >
                                        <Image src={image} alt={`Dental clinic image ${index + 1}`} fill className='object-cover' priority={index === 0} />
                                    </div>
                                ))}

                                {/* Carousel Indicators */}
                                <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
                                    {carouselImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Content */}
                        <div className='text-center lg:text-left flex flex-col justify-between h-80 sm:h-96 lg:h-[540px]'>
                            {/* Top Section: Doctors Info */}
                            <div className='space-y-6'>
                                <h3 className='text-lg sm:text-xl font-semibold text-[#005baa]'>{t('home', 'doctorsTitle')}</h3>
                                <div className='space-y-6'>
                                    <div className='bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md'>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <h4 className='font-semibold text-[#005baa] text-lg'>{t('home', 'doctor1Name')}</h4>
                                                <p className='text-gray-600'>{t('home', 'doctor1Specialty')}</p>
                                            </div>
                                            <Link
                                                href={`/${params.locale}/team#dr-yavor-ivanov`}
                                                className='bg-[#009fe3] text-white px-3 py-1 rounded-md text-sm hover:bg-[#005baa] transition-colors duration-200'
                                            >
                                                {t('home', 'moreInfo')}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className='bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md'>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <h4 className='font-semibold text-[#005baa] text-lg'>{t('home', 'doctor2Name')}</h4>
                                                <p className='text-gray-600'>{t('home', 'doctor2Specialty')}</p>
                                            </div>
                                            <Link
                                                href={`/${params.locale}/team#dr-ekaterina-ivanova`}
                                                className='bg-[#009fe3] text-white px-3 py-1 rounded-md text-sm hover:bg-[#005baa] transition-colors duration-200'
                                            >
                                                {t('home', 'moreInfo')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Section: CTA Button */}
                            <div className='flex justify-center lg:justify-start py-6'>
                                <CTAButton locale={params.locale} />
                            </div>

                            {/* Bottom Section: About Us */}
                            <div className='bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-md'>
                                <h3 className='text-xl font-bold text-[#005baa] mb-4'>{t('home', 'aboutTitle')}</h3>
                                <p className='text-gray-600 leading-relaxed'>{t('home', 'aboutText')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className='py-8 sm:py-12 bg-gradient-to-t from-[#e3f3fb] to-white'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#005baa] text-center mb-6 sm:mb-8'>{t('home', 'galleryTitle')}</h3>
                    <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'>
                        {/* Use the header logo as a placeholder for all images */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200'>
                                <Image
                                    src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                                    alt={`Gallery image ${i + 1}`}
                                    width={150}
                                    height={150}
                                    className='rounded-md object-cover w-full h-24 sm:h-32'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
