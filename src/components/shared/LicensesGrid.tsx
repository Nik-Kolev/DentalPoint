'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import CertificateCard from '@/app/[locale]/licenses/CertificateCard';
import ImageLightbox from '@/components/gallery/ImageLightbox';
import { getImageUrl } from '@/lib/imageVersion';

interface LicensesGridProps {
    certificates: string[];
    loadMoreLabel: string;
    showLessLabel: string;
    statsLabels: {
        certificates: string;
        experience: string;
        patients: string;
        professionalism: string;
    };
}

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

            if (currentTime - lastUpdateTime < 16 && progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            lastUpdateTime = currentTime;
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const calculated = startValue + (target - startValue) * easeOutCubic;
            const current = Math.round(calculated);

            if (current !== lastCount) {
                setCount(current);
                lastCount = current;
            }

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(() => {
            animationFrameId = requestAnimationFrame(animate);
        });

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [target, startTime, duration]);

    return { displayValue: `${count}${suffix}` };
}

function StatisticsSection({ children }: { children: React.ReactNode }) {
    const [startTime, setStartTime] = useState<number | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
        hasAnimatedRef.current = false;
        setStartTime(null);

        const currentElement = sectionRef.current;
        if (!currentElement) return;

        const rect = currentElement.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (isVisible && !hasAnimatedRef.current) {
            const timeoutId = setTimeout(() => {
                hasAnimatedRef.current = true;
                setStartTime(performance.now());
            }, 100);
            return () => clearTimeout(timeoutId);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimatedRef.current) {
                        hasAnimatedRef.current = true;
                        requestAnimationFrame(() => setStartTime(performance.now()));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' },
        );

        observer.observe(currentElement);
        return () => observer.disconnect();
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

function StatisticCard({ target, suffix, label, startTime }: { target: number; suffix: string; label: string; startTime?: number | null }) {
    const { displayValue } = useCountUp(target, suffix, startTime ?? null);
    return (
        <div>
            <div className='text-3xl font-bold text-[#005baa] mb-2'>{displayValue}</div>
            <div className='text-gray-600'>{label}</div>
        </div>
    );
}

export default function LicensesGrid({ certificates, loadMoreLabel, showLessLabel, statsLabels }: LicensesGridProps) {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; element: HTMLElement | null } | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        if (window.innerWidth >= 768) setVisibleCount(certificates.length);
        else setVisibleCount(3);
    }, [certificates.length]);

    const loadMore = () => setVisibleCount((prev) => Math.min(prev + 3, certificates.length));
    const showLess = () => setVisibleCount(3);

    useEffect(() => {
        if (visibleCount > 3) window.dispatchEvent(new CustomEvent('content-expanded'));
    }, [visibleCount]);

    const visibleCertificates = certificates.slice(0, visibleCount);
    const hasMore = visibleCount < certificates.length;
    const hasExpanded = visibleCount > 3;

    return (
        <>
            <div className='pb-8 sm:pb-12'>
                <StatisticsSection>
                    <StatisticCard target={certificates.length} suffix='+' label={statsLabels.certificates} />
                    <StatisticCard target={10 + Math.max(0, new Date().getFullYear() - 2026)} suffix='+' label={statsLabels.experience} />
                    <StatisticCard target={500} suffix='+' label={statsLabels.patients} />
                    <StatisticCard target={100} suffix='%' label={statsLabels.professionalism} />
                </StatisticsSection>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pb-8 sm:pb-12'>
                {visibleCertificates.map((imagePath: string, index: number) => (
                    <CertificateCard
                        key={index}
                        imageUrl={getImageUrl(imagePath)}
                        imagePath={imagePath}
                        priority={index < 3}
                        onImageClick={(element) => {
                            setSelectedImage({ src: getImageUrl(imagePath), alt: 'Certificate', element });
                        }}
                    />
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
                />
            )}
        </>
    );
}
