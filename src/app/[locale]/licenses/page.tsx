'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import CertificateCard from './CertificateCard';
import ImageLightbox from '@/components/ImageLightbox';
import { getImageUrl } from '@/lib/imageVersion';

// Certificate data array - only images needed
const certificatesData = [
    '/Images/certificates/CCI_000058.jpg',
    '/Images/certificates/CCI_000059.jpg',
    '/Images/certificates/CCI_000060.jpg',
    '/Images/certificates/CCI_000061.jpg',
    '/Images/certificates/CCI_000063.jpg',
    '/Images/certificates/CCI_000065.jpg',
    '/Images/certificates/CCI_000064.jpg',
    '/Images/certificates/CCI_000062.jpg',
    '/Images/certificates/CCI_000066.jpg',
    '/Images/certificates/CCI_000067.jpg',
    '/Images/certificates/CCI_000068.jpg',
    '/Images/certificates/CCI_000069.jpg',
    '/Images/certificates/CCI_000070.jpg',
    '/Images/certificates/CCI_000073.jpg',
];

function useCountUp(target: number, suffix: string = '', startTime: number | null, duration: number = 1500) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (startTime === null) return;

        let animationFrameId: number;
        const startValue = 0;
        let lastCount = 0;
        let lastUpdateTime = startTime;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Throttle updates to every 16ms (60fps) to reduce main-thread work
            if (currentTime - lastUpdateTime < 16 && progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            lastUpdateTime = currentTime;

            // Use smoother easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const calculated = startValue + (target - startValue) * easeOutCubic;
            const current = Math.round(calculated);

            // Only update if count changed (reduces re-renders)
            if (current !== lastCount) {
                setCount(current);
                lastCount = current;
            }

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                // Ensure final value is set
                setCount(target);
            }
        };

        // Delay start slightly to avoid blocking initial render
        animationFrameId = requestAnimationFrame(() => {
            animationFrameId = requestAnimationFrame(animate);
        });

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [target, startTime, duration]);

    return { displayValue: `${count}${suffix}` };
}

// Statistics Section wrapper that synchronizes all animations
function StatisticsSection({ children }: { children: React.ReactNode }) {
    const [startTime, setStartTime] = useState<number | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const hasAnimatedRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Reset animation state on mount (for navigation/hard refresh)
        hasAnimatedRef.current = false;
        setStartTime(null);

        const currentElement = sectionRef.current;
        if (!currentElement) return;

        // Check if already visible on mount (faster)
        const rect = currentElement.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible && !hasAnimatedRef.current) {
            // Small delay to avoid blocking initial render
            const timeoutId = setTimeout(() => {
                hasAnimatedRef.current = true;
                setStartTime(performance.now());
            }, 100);
            return () => clearTimeout(timeoutId);
        }

        // Otherwise use IntersectionObserver with lower threshold for faster trigger
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimatedRef.current) {
                        hasAnimatedRef.current = true;
                        // Delay to avoid blocking during navigation
                        requestAnimationFrame(() => {
                            setStartTime(performance.now());
                        });
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' } // Lower threshold, start earlier
        );

        observerRef.current.observe(currentElement);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div className='mb-8 bg-white rounded-lg shadow-lg p-6 sm:p-8' ref={sectionRef}>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center'>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, { startTime } as any);
                    }
                    return child;
                })}
            </div>
        </div>
    );
}

// Statistic Card Component with animation
function StatisticCard({ target, suffix, label, startTime }: { target: number; suffix: string; label: string; startTime?: number | null }) {
    const { displayValue } = useCountUp(target, suffix, startTime ?? null);

    return (
        <div>
            <div className='text-3xl font-bold text-[#005baa] mb-2'>{displayValue}</div>
            <div className='text-gray-600'>{label}</div>
        </div>
    );
}

export default function Licenses({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const [selectedImage, setSelectedImage] = useState<{
        src: string;
        alt: string;
        element: HTMLElement | null;
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
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('licenses', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('licenses', 'subtitle')}</p>
                </div>

                {/* Statistics Section - Moved to top */}
                <div className='pb-8 sm:pb-12'>
                    <StatisticsSection>
                        <StatisticCard target={certificatesData.length} suffix='+' label={t('licenses', 'statsCertificates')} />
                        <StatisticCard target={10 + Math.max(0, new Date().getFullYear() - 2026)} suffix='+' label={t('licenses', 'statsExperience')} />
                        <StatisticCard target={500} suffix='+' label={t('licenses', 'statsPatients')} />
                        <StatisticCard target={100} suffix='%' label={t('licenses', 'statsProfessionalism')} />
                    </StatisticsSection>
                </div>

                {/* Certificates Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-8 sm:pb-12'>
                    {visibleCertificates.map((imagePath: string, index: number) => (
                        <CertificateCard
                            key={index}
                            imageUrl={getImageUrl(imagePath)}
                            imagePath={imagePath}
                            priority={index < 3}
                            onImageClick={(element) =>
                                setSelectedImage({
                                    src: getImageUrl(imagePath),
                                    alt: 'Certificate',
                                    element,
                                })
                            }
                        />
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
                    <StaticCTA locale={params.locale} title={t('licenses', 'ctaTitle')} subtitle={t('licenses', 'ctaSubtitle')} />
                </div>
            </div>

            {/* Lightbox - rendered outside container for proper positioning - only on desktop */}
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
