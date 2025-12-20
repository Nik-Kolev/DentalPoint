'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import StatisticsLink from './StatisticsLink';

interface NavigationProps {
    locale: string;
    translations: {
        home: string;
        contact: string;
        team: string;
        gallery: string;
        licenses: string;
        reviews: string;
    };
}

export default function Navigation({ locale, translations }: NavigationProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '') {
            return pathname === `/${locale}` || pathname === `/${locale}/`;
        }
        return pathname.includes(`/${locale}/${path}`);
    };

    const linkClass = (path: string) => {
        const baseClass = 'nav-link font-semibold text-base lg:text-lg text-gray-600 hover:text-gray-800 transition-colors duration-200';
        const activeClass = isActive(path) ? 'active' : '';
        return `${baseClass} ${activeClass}`.trim();
    };

    const mobileLinkClass = (path: string) => {
        const baseClass =
            'block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 text-center';
        const activeClass = isActive(path) ? 'bg-gray-100 text-gray-900' : '';
        return `${baseClass} ${activeClass}`.trim();
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            {/* Desktop Navigation */}
            <div className='hidden lg:flex space-x-6 xl:space-x-8'>
                <Link href={`/${locale}`} className={linkClass('')} prefetch={true}>
                    {translations.home}
                </Link>
                <Link href={`/${locale}/contact`} className={linkClass('contact')} prefetch={true}>
                    {translations.contact}
                </Link>
                <Link href={`/${locale}/team`} className={linkClass('team')} prefetch={true}>
                    {translations.team}
                </Link>
                <Link href={`/${locale}/gallery`} className={linkClass('gallery')} prefetch={true}>
                    {translations.gallery}
                </Link>
                <Link href={`/${locale}/licenses`} className={linkClass('licenses')} prefetch={true}>
                    {translations.licenses}
                </Link>
                <Link href={`/${locale}/reviews`} className={linkClass('reviews')} prefetch={true}>
                    {translations.reviews}
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className='lg:hidden relative inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
                aria-expanded={isMobileMenuOpen}
                aria-label='Toggle navigation menu'
            >
                <svg
                    className={`h-6 w-6 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                </svg>
                <svg
                    className={`absolute h-6 w-6 transition-all duration-300 ${
                        isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                    }`}
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
            </button>

            {/* Mobile Menu - With Centered Language Switcher */}
            <div
                className={`lg:hidden fixed top-16 right-4 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
            >
                <div className='py-2'>
                    <Link href={`/${locale}`} className={mobileLinkClass('')} onClick={closeMobileMenu} prefetch={true}>
                        {translations.home}
                    </Link>
                    <Link href={`/${locale}/contact`} className={mobileLinkClass('contact')} onClick={closeMobileMenu} prefetch={true}>
                        {translations.contact}
                    </Link>
                    <Link href={`/${locale}/team`} className={mobileLinkClass('team')} onClick={closeMobileMenu} prefetch={true}>
                        {translations.team}
                    </Link>
                    <Link href={`/${locale}/gallery`} className={mobileLinkClass('gallery')} onClick={closeMobileMenu} prefetch={true}>
                        {translations.gallery}
                    </Link>
                    <Link href={`/${locale}/licenses`} className={mobileLinkClass('licenses')} onClick={closeMobileMenu} prefetch={true}>
                        {translations.licenses}
                    </Link>
                    <Link href={`/${locale}/reviews`} className={mobileLinkClass('reviews')} onClick={closeMobileMenu} prefetch={true}>
                        {translations.reviews}
                    </Link>

                    {/* Statistics Link in Mobile Menu */}
                    <div className='border-t border-gray-200 mt-2 pt-2 pb-1'>
                        <div className='flex justify-center'>
                            <StatisticsLink />
                        </div>
                    </div>

                    {/* Language Switcher in Mobile Menu - Centered */}
                    <div className='border-t border-gray-200 mt-2 pt-3 pb-1'>
                        <div className='flex justify-center'>
                            <LanguageSwitcher locale={locale} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
