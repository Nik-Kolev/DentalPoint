'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageVersion';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel: string;
    afterLabel: string;
    description?: string;
    priority?: boolean;
}

export default function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel, afterLabel, description, priority = false }: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(percentage);
    }, []);

    // Use document-level events for smooth dragging even outside container
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                handleMove(e.clientX);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMove]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        handleMove(e.clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        handleMove(e.touches[0].clientX);
    };

    return (
        <div className='group'>
            {/* Slider container */}
            <div
                ref={containerRef}
                className='relative aspect-[4/3] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-xl bg-gray-100 touch-none'
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {/* After image (background) with After label */}
                <div className='absolute inset-0'>
                    <Image
                        src={getImageUrl(afterImage)}
                        alt='After treatment'
                        fill
                        className='object-cover'
                        quality={80}
                        priority={priority}
                        sizes='(max-width: 768px) 100vw, 50vw'
                        draggable={false}
                    />
                    {/* After label - gets covered by before image when slider moves right */}
                    <div className='absolute top-4 right-4 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-base sm:text-lg font-bold shadow-lg'>
                        {afterLabel}
                    </div>
                </div>

                {/* Before image (foreground, clipped) with Before label */}
                <div className='absolute inset-0 overflow-hidden' style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                    <Image
                        src={getImageUrl(beforeImage)}
                        alt='Before treatment'
                        fill
                        className='object-cover'
                        quality={80}
                        priority={priority}
                        sizes='(max-width: 768px) 100vw, 50vw'
                        draggable={false}
                    />
                    {/* Before label - gets clipped with the before image when slider moves left */}
                    <div className='absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-base sm:text-lg font-bold shadow-lg'>
                        {beforeLabel}
                    </div>
                </div>

                {/* Slider line */}
                <div
                    className='absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10'
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                >
                    {/* Slider handle wrapper - stays centered */}
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                        {/* Handle - smoothly scales near edges */}
                        <div
                            className='w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-[#005baa] transition-transform duration-100'
                            style={{
                                transform: `scale(${1 + Math.max(0, (15 - sliderPosition) / 15, (sliderPosition - 85) / 15) * 0.3})`,
                            }}
                        >
                            <svg className='w-5 h-5 text-[#005baa] -mr-1' fill='currentColor' viewBox='0 0 20 20'>
                                <path
                                    fillRule='evenodd'
                                    d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                                    clipRule='evenodd'
                                />
                            </svg>
                            <svg className='w-5 h-5 text-[#005baa] -ml-1' fill='currentColor' viewBox='0 0 20 20'>
                                <path
                                    fillRule='evenodd'
                                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {description && (
                <div className='mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-[#e3f3fb]'>
                    <p className='text-gray-700 text-center leading-relaxed'>{description}</p>
                </div>
            )}
        </div>
    );
}
