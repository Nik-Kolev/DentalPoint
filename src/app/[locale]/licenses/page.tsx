'use client';

import { useState, useEffect } from 'react';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import CertificateCard from './CertificateCard';
import ImageLightbox from '@/components/ImageLightbox';

// Certificate data array - add your certificate data here
// Each object should have: year, title, shortText, and image
const certificatesData = [
    {
        year: '2022',
        title: 'Test',
        shortText: 'testing the tests, more tests, even more tests',
        image: '/Images/certificates/CCI_000058.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000059.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000060.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000061.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000063.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000065.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000064.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000062.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000066.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000067.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000068.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000069.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000070.jpg',
    },
    {
        year: '',
        title: '',
        shortText: '',
        image: '/Images/certificates/CCI_000073.jpg',
    },
];

export default function Licenses({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const [selectedImage, setSelectedImage] = useState<{
        src: string;
        alt: string;
        element: HTMLElement | null;
        year?: string;
        title?: string;
        shortText?: string;
    } | null>(null);

    // Mobile: show 3 initially, desktop: show all
    const [visibleCount, setVisibleCount] = useState(3);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        // Check if mobile on mount and resize
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // On desktop, show all certificates
            if (!mobile) {
                setVisibleCount(certificatesData.length);
            }
            // On mobile, initial state is already 3, no need to reset
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Show more certificates (3 at a time)
    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 3, certificatesData.length));
    };

    // Show less (collapse back to 3)
    const showLess = () => {
        setVisibleCount(3);
    };

    const visibleCertificates = certificatesData.slice(0, visibleCount);
    const hasMore = visibleCount < certificatesData.length;
    const hasExpanded = visibleCount > 3;

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('licenses', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('licenses', 'subtitle')}</p>
                </div>

                {/* Statistics Section - Moved to top */}
                <div className='mb-8 bg-white rounded-lg shadow-lg p-6 sm:p-8'>
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center'>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>{certificatesData.length}+</div>
                            <div className='text-gray-600'>{t('licenses', 'statsCertificates')}</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>12+</div>
                            <div className='text-gray-600'>{t('licenses', 'statsExperience')}</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>500+</div>
                            <div className='text-gray-600'>{t('licenses', 'statsPatients')}</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>100%</div>
                            <div className='text-gray-600'>{t('licenses', 'statsProfessionalism')}</div>
                        </div>
                    </div>
                </div>

                {/* Certificates Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8'>
                    {visibleCertificates.map((certificate: { year: string; title: string; shortText: string; image: string }, index: number) => (
                        <CertificateCard
                            key={index}
                            title={certificate.title}
                            description={certificate.shortText}
                            year={certificate.year}
                            issuer=''
                            imageUrl={certificate.image}
                            onImageClick={(element) =>
                                setSelectedImage({
                                    src: certificate.image,
                                    alt: certificate.title,
                                    element,
                                    year: certificate.year,
                                    title: certificate.title,
                                    shortText: certificate.shortText,
                                })
                            }
                        />
                    ))}
                </div>

                {/* Load More / Show Less Buttons - Show on mobile */}
                {(hasMore || hasExpanded) && (
                    <div className='flex justify-center mb-16 md:hidden gap-4'>
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
                <StaticCTA locale={params.locale} title={t('licenses', 'ctaTitle')} subtitle={t('licenses', 'ctaSubtitle')} />
            </div>

            {/* Lightbox - rendered outside container for proper positioning - only on desktop */}
            {selectedImage && !isMobile && (
                <ImageLightbox
                    isOpen={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                    imageSrc={selectedImage.src}
                    alt={selectedImage.alt}
                    triggerElement={selectedImage.element}
                    year={selectedImage.year}
                    title={selectedImage.title}
                    shortText={selectedImage.shortText}
                />
            )}
        </div>
    );
}
