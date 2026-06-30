'use client';

import { useState, useEffect } from 'react';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Check if we've scrolled past the navigation area (approximately 100px)
            // Use multiple methods for better browser compatibility
            const scrollY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            setIsVisible(scrollY > 100);
        };

        // Check on mount
        toggleVisibility();

        // Listen to scroll events on both window and document
        window.addEventListener('scroll', toggleVisibility, { passive: true });
        document.addEventListener('scroll', toggleVisibility, { passive: true });

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            document.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    useEffect(() => {
        // Check if lightbox is open by monitoring body attribute
        const checkLightbox = () => {
            setIsLightboxOpen(document.body.hasAttribute('data-lightbox-open'));
        };

        // Use MutationObserver to watch for changes to body attributes
        const observer = new MutationObserver(checkLightbox);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-lightbox-open'],
        });

        // Initial check
        checkLightbox();

        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // Hide if lightbox is open
    if (isLightboxOpen) {
        return null;
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isVisible) {
                    scrollToTop();
                }
            }}
            className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-[var(--dp-primary)] text-white p-3 md:p-4 rounded-full shadow-lg border border-white/30 hover:opacity-90 transition-all duration-200 hover:scale-110 z-[60] flex-shrink-0 ${
                isVisible ? 'opacity-100 translate-y-0 pointer-events-auto cursor-pointer' : 'opacity-0 translate-y-2 pointer-events-none cursor-default'
            }`}
            aria-label='Back to top'
            tabIndex={isVisible ? 0 : -1}
        >
            <svg className='w-6 h-6 md:w-7 md:h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
            </svg>
        </button>
    );
}
