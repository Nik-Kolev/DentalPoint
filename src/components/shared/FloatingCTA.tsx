'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function FloatingCTA() {
    const t = useTranslations('layout');
    const pathname = usePathname();
    const [isStaticCTAVisible, setIsStaticCTAVisible] = useState(false);
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
    const [isPageScrollable, setIsPageScrollable] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(0);
    const [hasPassedStaticCTA, setHasPassedStaticCTA] = useState(false);

    const isContactPage = pathname?.includes('/contact');

    useEffect(() => {
        const handleScroll = () => {
            setIsBackToTopVisible(window.pageYOffset > 100);
            setIsPageScrollable(document.documentElement.scrollHeight > window.innerHeight + 100);

            const footer = document.querySelector('footer');
            if (footer) {
                const footerRect = footer.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                if (footerRect.top < windowHeight) {
                    setBottomOffset(windowHeight - footerRect.top);
                } else {
                    setBottomOffset(0);
                }
            }
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);

        const body = document.body;
        const resizeObserver = new ResizeObserver(handleScroll);
        resizeObserver.observe(body);

        const onContentExpanded = () => requestAnimationFrame(() => requestAnimationFrame(handleScroll));
        window.addEventListener('content-expanded', onContentExpanded);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            window.removeEventListener('content-expanded', onContentExpanded);
            resizeObserver.unobserve(body);
        };
    }, []);

    useEffect(() => {
        if (isContactPage) return;

        const staticCTAs = document.querySelectorAll('[data-static-cta]');

        if (staticCTAs.length === 0) {
            setIsStaticCTAVisible(false);
            setHasPassedStaticCTA(false);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const anyVisible = entries.some((entry) => entry.isIntersecting);
                setIsStaticCTAVisible(anyVisible);

                const passed = entries.some((entry) => {
                    const rect = entry.boundingClientRect;
                    return !entry.isIntersecting && rect.top < 0;
                });
                if (passed) {
                    setHasPassedStaticCTA(true);
                } else if (anyVisible) {
                    setHasPassedStaticCTA(false);
                } else {
                    const isAbove = entries.some((entry) => {
                        const rect = entry.boundingClientRect;
                        return !entry.isIntersecting && rect.top > 0;
                    });
                    if (isAbove) setHasPassedStaticCTA(false);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -100px 0px' },
        );

        staticCTAs.forEach((cta) => observer.observe(cta));

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

        const scrollCheck = () => checkVisibility();
        window.addEventListener('scroll', scrollCheck);
        setTimeout(checkVisibility, 100);

        return () => {
            staticCTAs.forEach((cta) => observer.unobserve(cta));
            window.removeEventListener('scroll', scrollCheck);
        };
    }, [isContactPage, pathname]);

    if (isContactPage) return null;

    const shouldHide = isStaticCTAVisible || hasPassedStaticCTA;

    return (
        <div
            className={`fixed left-0 right-0 z-[60] px-4 md:hidden transition-all duration-300 pointer-events-none ${
                shouldHide ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'
            }`}
            style={{ bottom: `${Math.max(16, bottomOffset + 16)}px` }}
        >
            <Link
                href='/contact'
                className={`group relative flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-[#005baa] to-[#009fe3] rounded-xl shadow-2xl hover:shadow-[#009fe3]/50 transition-all duration-300 hover:scale-[1.02] transform overflow-hidden pointer-events-auto ${
                    isBackToTopVisible || isPageScrollable ? 'w-[calc(100%-4rem)]' : 'w-full'
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
                    <span className='truncate'>{t('contactUs')}</span>
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
