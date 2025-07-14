'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavigationProps {
    locale: string;
    translations: {
        home: string;
        contact: string;
        team: string;
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

    return (
        <>
            {/* Desktop Navigation */}
            <div className='hidden lg:flex space-x-6 xl:space-x-8'>
                <Link href={`/${locale}`} className={linkClass('')}>
                    {translations.home}
                </Link>
                <Link href={`/${locale}/contact`} className={linkClass('contact')}>
                    {translations.contact}
                </Link>
                <Link href={`/${locale}/team`} className={linkClass('team')}>
                    {translations.team}
                </Link>
                <Link href={`/${locale}/licenses`} className={linkClass('licenses')}>
                    {translations.licenses}
                </Link>
                <Link href={`/${locale}/reviews`} className={linkClass('reviews')}>
                    {translations.reviews}
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className='lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
                aria-expanded={isMobileMenuOpen}
                aria-label='Toggle navigation menu'
            >
                <svg
                    className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                </svg>
                <svg
                    className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                >
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
            </button>

            {/* Mobile Menu - With Centered Language Switcher */}
            {isMobileMenuOpen && (
                <div className='lg:hidden absolute top-16 right-4 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                    <div className='py-2'>
                        <Link href={`/${locale}`} className={mobileLinkClass('')} onClick={closeMobileMenu}>
                            {translations.home}
                        </Link>
                        <Link href={`/${locale}/contact`} className={mobileLinkClass('contact')} onClick={closeMobileMenu}>
                            {translations.contact}
                        </Link>
                        <Link href={`/${locale}/team`} className={mobileLinkClass('team')} onClick={closeMobileMenu}>
                            {translations.team}
                        </Link>
                        <Link href={`/${locale}/licenses`} className={mobileLinkClass('licenses')} onClick={closeMobileMenu}>
                            {translations.licenses}
                        </Link>
                        <Link href={`/${locale}/reviews`} className={mobileLinkClass('reviews')} onClick={closeMobileMenu}>
                            {translations.reviews}
                        </Link>

                        {/* Language Switcher in Mobile Menu - Centered */}
                        <div className='border-t border-gray-200 mt-2 pt-3 pb-1'>
                            <div className='flex justify-center'>
                                <LanguageSwitcher locale={locale} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
