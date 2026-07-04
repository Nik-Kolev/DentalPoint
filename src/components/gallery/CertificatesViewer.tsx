'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { Certificate } from '@/types/gallery';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

function useCountUp(target: number, suffix: string, startTime: number | null, duration = 1500) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (startTime === null) return;

        let frameId: number;
        let lastCount = 0;
        let lastTick = startTime;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (now - lastTick < 16 && progress < 1) {
                frameId = requestAnimationFrame(animate);
                return;
            }

            lastTick = now;
            const current = Math.round(target * (1 - Math.pow(1 - progress, 3)));

            if (current !== lastCount) {
                setCount(current);
                lastCount = current;
            }

            if (progress < 1) frameId = requestAnimationFrame(animate);
            else setCount(target);
        };

        frameId = requestAnimationFrame(() => {
            frameId = requestAnimationFrame(animate);
        });

        return () => cancelAnimationFrame(frameId);
    }, [target, startTime, duration]);

    return `${count}${suffix}`;
}

function StatCard({
    target,
    suffix,
    label,
    startTime,
}: {
    target: number;
    suffix: string;
    label: string;
    startTime?: number | null;
}) {
    const value = useCountUp(target, suffix, startTime ?? null);
    return (
        <div>
            <div className='text-3xl font-bold text-[var(--dp-primary)] mb-2'>{value}</div>
            <div className='text-gray-600'>{label}</div>
        </div>
    );
}

function StatsSection({ children }: { children: React.ReactNode }) {
    const [startTime, setStartTime] = useState<number | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const fired = useRef(false);

    useEffect(() => {
        fired.current = false;

        const el = ref.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const id = setTimeout(() => {
                fired.current = true;
                setStartTime(performance.now());
            }, 100);
            return () => clearTimeout(id);
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !fired.current) {
                    fired.current = true;
                    requestAnimationFrame(() => setStartTime(performance.now()));
                }
            },
            { threshold: 0.1, rootMargin: '50px' },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            className='bg-white rounded-2xl shadow-sm border border-[var(--dp-card-border)] p-6 sm:p-8 mb-8 sm:mb-12'
            ref={ref}
        >
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center'>
                {React.Children.map(children, (child) =>
                    React.isValidElement(child)
                        ? React.cloneElement(child, { startTime } as object)
                        : child,
                )}
            </div>
        </div>
    );
}

interface Props {
    items: Certificate[];
    loadMoreLabel: string;
    showLessLabel: string;
    statsLabels: {
        certificates: string;
        experience: string;
        patients: string;
        professionalism: string;
    };
}

export default function CertificatesViewer({ items, loadMoreLabel, showLessLabel, statsLabels }: Props) {
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        // window.innerWidth doesn't exist during SSR, so the desktop-shows-all breakpoint check
        // can only run client-side, post-mount — this can't be computed during render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (window.innerWidth >= 768) setVisibleCount(items.length);
    }, [items.length]);

    const visibleItems = items.slice(0, visibleCount);
    const hasMore = visibleCount < items.length;
    const hasExpanded = visibleCount > 3;

    return (
        <>
            <StatsSection>
                <StatCard target={items.length} suffix='+' label={statsLabels.certificates} />
                <StatCard
                    target={10 + Math.max(0, new Date().getFullYear() - 2026)}
                    suffix='+'
                    label={statsLabels.experience}
                />
                <StatCard target={500} suffix='+' label={statsLabels.patients} />
                <StatCard target={100} suffix='%' label={statsLabels.professionalism} />
            </StatsSection>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start gap-6 sm:gap-8 pb-8 sm:pb-12'>
                {visibleItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => {
                            if (window.innerWidth >= 640) setLightbox({ src: item.path, alt: item.alt });
                        }}
                        className='rounded-2xl shadow-sm hover:shadow-md p-2 sm:p-3 sm:cursor-pointer transition-all duration-200'
                        style={{
                            border: '2px solid transparent',
                            backgroundImage:
                                'linear-gradient(white, white), linear-gradient(135deg, var(--dp-primary), var(--dp-accent))',
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'padding-box, border-box',
                        }}
                    >
                        <div
                            className='relative aspect-square rounded-md overflow-hidden bg-[var(--dp-bg-from)] shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                            style={item.aspectRatio ? { aspectRatio: item.aspectRatio } : undefined}
                        >
                            {!loadedIds.has(item.id) && (
                                <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-md' />
                            )}
                            <Image
                                src={item.path}
                                alt={item.alt}
                                fill
                                unoptimized
                                className='object-contain'
                                onLoad={() => setLoadedIds((prev) => new Set([...prev, item.id]))}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {(hasMore || hasExpanded) && (
                <div className='flex justify-center pb-8 sm:pb-12 md:hidden gap-4'>
                    {hasMore && (
                        <button
                            onClick={() => setVisibleCount((prev) => Math.min(prev + 3, items.length))}
                            className='px-6 py-2.5 bg-[var(--dp-primary)] text-white rounded-full font-semibold text-sm hover:bg-[var(--dp-primary)]/90 transition-colors shadow-md'
                        >
                            {loadMoreLabel}
                        </button>
                    )}
                    {hasExpanded && (
                        <button
                            onClick={() => setVisibleCount(3)}
                            className='px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors'
                        >
                            {showLessLabel}
                        </button>
                    )}
                </div>
            )}

            {lightbox && (
                <ImageLightbox
                    isOpen={!!lightbox}
                    onClose={() => setLightbox(null)}
                    imageSrc={lightbox.src}
                    alt={lightbox.alt}
                />
            )}
        </>
    );
}
