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
    const [bottomOffset, setBottomOffset] = useState(0);
    const [hasPassedStaticCTA, setHasPassedStaticCTA] = useState(false);

    // Hide on contact page
    const isContactPage = pathname?.includes('/contact');

    useEffect(() => {
        const handleScroll = () => {
            // Check back to top visibility
            setIsBackToTopVisible(window.pageYOffset > 100);

            // Check footer overlap
            const footer = document.querySelector('footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // If footer is visible in viewport
                if (footerRect.top < windowHeight) {
                    // Calculate how much of the footer is visible
                    const visibleFooterHeight = windowHeight - footerRect.top;
                    // Add some padding (20px)
                    setBottomOffset(visibleFooterHeight);
                } else {
                    setBottomOffset(0);
                }
            }
        };

        handleScroll(); // Initial check
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (isContactPage) return;

        // Find static CTA elements
        const staticCTAs = document.querySelectorAll('[data-static-cta]');

        if (staticCTAs.length === 0) {
            setIsStaticCTAVisible(false);
            setHasPassedStaticCTA(false);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                // Check if any StaticCTA is visible
                const anyVisible = entries.some((entry) => entry.isIntersecting);
                setIsStaticCTAVisible(anyVisible);

                // Check if we've passed the StaticCTA
                const passed = entries.some((entry) => {
                    const rect = entry.boundingClientRect;
                    return !entry.isIntersecting && rect.top < 0;
                });
                if (passed) {
                    setHasPassedStaticCTA(true);
                } else if (anyVisible) {
                    // Reset if it becomes visible again (user scrolled up)
                    setHasPassedStaticCTA(false);
                } else {
                    // If not visible and not passed (i.e. above), ensure passed is false
                    // We need to check if we are actually above
                    const isAbove = entries.some((entry) => {
                        const rect = entry.boundingClientRect;
                        return !entry.isIntersecting && rect.top > 0;
                    });
                    if (isAbove) setHasPassedStaticCTA(false);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px',
            }
        );

        staticCTAs.forEach((cta) => observer.observe(cta));

        // Also check immediately
        const checkVisibility = () => {
            let passed = false;
            let visible = false;
            staticCTAs.forEach((cta) => {
                const rect = cta.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
                if (isVisible) visible = true;
                if (!isVisible && rect.top < 0) passed = true;
            });
            setIsStaticCTAVisible(visible);
            setHasPassedStaticCTA(passed && !visible);
        };

        // Check on scroll too for precise "passed" detection
        const scrollCheck = () => {
            checkVisibility();
        };
        window.addEventListener('scroll', scrollCheck);

        // Small delay to ensure DOM is ready
        setTimeout(checkVisibility, 100);

        return () => {
            staticCTAs.forEach((cta) => observer.unobserve(cta));
            window.removeEventListener('scroll', scrollCheck);
        };
    }, [isContactPage, pathname]);

    if (isContactPage) {
        return null;
    }

    // Hide if static CTA is visible OR if we have passed it
    const shouldHide = isStaticCTAVisible || hasPassedStaticCTA;

    return (
        <div
            className={`fixed left-0 right-0 z-[60] px-4 md:hidden transition-all duration-300 ${
                shouldHide ? 'opacity-0 pointer-events-none translate-y-full' : 'opacity-100 pointer-events-auto translate-y-0'
            }`}
            style={{ bottom: `${Math.max(16, bottomOffset + 16)}px` }}
        >
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
