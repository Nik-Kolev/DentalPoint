'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    alt: string;
}

export default function ImageLightbox({ isOpen, onClose, imageSrc, alt }: ImageLightboxProps) {
    const t = useTranslations('gallery');
    const overlayRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'Tab') {
                const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusable || focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) closeButtonRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setImageLoaded(false);
            setImageError(false);
        }
    }, [isOpen, imageSrc]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className='fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-8'
            onClick={onClose}
            role='dialog'
            aria-modal='true'
            aria-label={alt || 'Image preview'}
        >
            <div
                className='relative bg-white rounded-xl shadow-2xl p-3 sm:p-4'
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'lightbox-enter 0.22s cubic-bezier(0.4,0,0.2,1) both' }}
            >
                <button
                    ref={closeButtonRef}
                    className='absolute top-3 right-3 z-10 bg-white/90 text-gray-700 hover:bg-[var(--dp-primary)] hover:text-white rounded-full p-2 shadow-lg transition-colors'
                    onClick={onClose}
                    aria-label='Close'
                >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>

                {!imageLoaded && !imageError && (
                    <div className='flex flex-col items-center gap-3 py-20 px-20 text-[var(--dp-primary)]'>
                        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--dp-primary)]' />
                        <p className='text-sm'>{t('loading')}</p>
                    </div>
                )}

                {imageError && (
                    <div className='flex flex-col items-center gap-3 py-16 px-12 text-gray-500'>
                        <svg className='w-12 h-12 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                        <p className='text-sm'>{t('imageError')}</p>
                    </div>
                )}

                <img
                    src={imageSrc}
                    alt={alt}
                    className='block rounded-lg shadow-md'
                    style={{
                        display: imageLoaded ? 'block' : 'none',
                        maxWidth: 'min(88vw, 1000px)',
                        maxHeight: '85vh',
                        width: 'auto',
                        height: 'auto',
                        imageOrientation: 'from-image',
                    }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            </div>
        </div>
    );
}
