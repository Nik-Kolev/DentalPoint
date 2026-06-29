'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    alt: string;
    triggerElement?: HTMLElement | null;
    year?: string;
    title?: string;
    shortText?: string;
}

export default function ImageLightbox({ isOpen, onClose, imageSrc, alt, triggerElement, year, title, shortText }: ImageLightboxProps) {
    const t = useTranslations('gallery');
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.body.setAttribute('data-lightbox-open', 'true');
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
            document.body.removeAttribute('data-lightbox-open');
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
            document.body.removeAttribute('data-lightbox-open');
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(false);
            setImageLoaded(false);
            if (triggerElement && containerRef.current) {
                const rect = triggerElement.getBoundingClientRect();
                const container = containerRef.current;
                const startX = rect.left + rect.width / 2;
                const startY = rect.top + rect.height / 2;
                const endX = window.innerWidth / 2;
                const endY = window.innerHeight / 2;

                container.style.willChange = 'transform, opacity';
                container.style.transition = 'none';
                container.style.left = `${startX}px`;
                container.style.top = `${startY}px`;
                container.style.transform = 'translate(-50%, -50%) scale(0.9)';
                container.style.opacity = '0';

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        container.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                        container.style.left = `${endX}px`;
                        container.style.top = `${endY}px`;
                        container.style.transform = 'translate(-50%, -50%) scale(1)';
                        container.style.opacity = '1';
                        setIsAnimating(true);
                        setTimeout(() => {
                            container.style.willChange = 'auto';
                        }, 400);
                    });
                });
            } else {
                setIsAnimating(true);
            }
        } else {
            setIsAnimating(false);
            setImageLoaded(false);
        }
    }, [isOpen, triggerElement]);

    useEffect(() => {
        if (isOpen && imgRef.current && imageSrc) {
            setImageLoaded(false);
            let isMounted = true;

            const imageLoader = new Image();
            imageLoader.onload = () => {
                if (isMounted && imgRef.current) {
                    imgRef.current.src = imageSrc;
                    setImageLoaded(true);
                }
            };
            imageLoader.onerror = () => {
                if (isMounted) setImageLoaded(false);
            };
            imageLoader.src = imageSrc;

            return () => {
                isMounted = false;
                imageLoader.onload = null;
                imageLoader.onerror = null;
            };
        }
    }, [isOpen, imageSrc]);

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300' onClick={onClose}>
            <button
                className='absolute top-4 right-4 text-gray-700 hover:text-gray-900 transition-colors z-10 bg-white rounded-full p-2 shadow-lg'
                onClick={onClose}
                aria-label='Close'
            >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
            </button>
            <div
                ref={containerRef}
                className='absolute w-auto h-auto bg-white rounded-lg shadow-2xl overflow-y-auto flex flex-col'
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '65vw', maxHeight: '88vh', willChange: 'transform' }}
            >
                {year && (
                    <div className='pt-4 pb-2 flex justify-center flex-shrink-0'>
                        <div className='bg-[#005baa] text-white px-4 py-2 rounded text-sm font-semibold'>{year}</div>
                    </div>
                )}

                <div className='relative bg-gray-50 flex items-center justify-center p-4 flex-1 min-h-0 overflow-auto'>
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        alt={alt || 'Image'}
                        className='w-auto h-auto object-contain'
                        style={{ display: imageLoaded ? 'block' : 'none', maxWidth: '100%', maxHeight: 'calc(90vh - 60px)' }}
                        loading='lazy'
                    />
                    {!imageLoaded && (
                        <div className='w-full h-full flex flex-col items-center justify-center text-gray-400'>
                            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005baa] mb-4'></div>
                            <p className='text-[#005baa]'>{t('loading')}</p>
                        </div>
                    )}
                </div>

                {(title || shortText) && (
                    <div className='px-6 pb-6 pt-4 flex-shrink-0 text-center'>
                        {title && <h3 className='text-lg font-bold text-gray-900 mb-2'>{title}</h3>}
                        {shortText && <p className='text-gray-600 text-sm'>{shortText}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
