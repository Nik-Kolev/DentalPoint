'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getTranslation } from '../lib/useTranslation';

interface FloatingCTAProps {
    locale: string;
}

export default function FloatingCTA({ locale }: FloatingCTAProps) {
    const t = getTranslation(locale);
    const pathname = usePathname();
    const [isStaticCTAVisible, setIsStaticCTAVisible] = useState(false);
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);

    // Hide on contact page
    const isContactPage = pathname?.includes('/contact');

    useEffect(() => {
        // Check if back-to-top button should be visible
        const toggleBackToTopVisibility = () => {
            setIsBackToTopVisible(window.pageYOffset > 100);
        };

        toggleBackToTopVisibility();
        window.addEventListener('scroll', toggleBackToTopVisibility);

        return () => {
            window.removeEventListener('scroll', toggleBackToTopVisibility);
        };
    }, []);

    useEffect(() => {
        if (isContactPage) return;

        // Find static CTA elements
        const staticCTAs = document.querySelectorAll('[data-static-cta]');

        if (staticCTAs.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsStaticCTAVisible(true);
                    } else {
                        setIsStaticCTAVisible(false);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -120px 0px',
            }
        );

        staticCTAs.forEach((cta) => observer.observe(cta));

        return () => {
            staticCTAs.forEach((cta) => observer.unobserve(cta));
        };
    }, [isContactPage, pathname]);

    if (isContactPage || isStaticCTAVisible) {
        return null;
    }

    return (
        <div className='fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:hidden'>
            <Link
                href={`/${locale}/contact`}
                className={`group relative flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-[#005baa] to-[#009fe3] rounded-xl shadow-2xl hover:shadow-[#009fe3]/50 transition-all duration-300 hover:scale-[1.02] transform overflow-hidden ${
                    isBackToTopVisible ? 'w-[calc(100%-4rem)]' : 'w-full'
                }`}
            >
                <span className='relative z-10 flex items-center gap-2'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                    </svg>
                    <span className='truncate'>{t('layout', 'contactUs')}</span>
                    <svg
                        className='w-5 h-5 flex-shrink-0 transform group-hover:translate-x-1 transition-transform duration-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                </span>
                <span className='absolute inset-0 bg-gradient-to-r from-[#009fe3] to-[#005baa] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></span>
            </Link>
        </div>
    );
}
