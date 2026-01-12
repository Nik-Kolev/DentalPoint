'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import LanguageSwitcher from './LanguageSwitcher';

const StatisticsLink = dynamic(() => import('./StatisticsLink'), {
    ssr: false,
    loading: () => null,
});

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
        return `${baseClass} ${isActive(path) ? 'active' : ''}`.trim();
    };

    const mobileLinkClass = (path: string) => {
        const baseClass =
            'block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200 text-center';
        return `${baseClass} ${isActive(path) ? 'bg-gray-100 text-gray-900' : ''}`.trim();
    };

    return (
        <>
            {/* Desktop Navigation */}
            <div className='hidden lg:flex space-x-6 xl:space-x-8'>
                <Link href={`/${locale}`} className={linkClass('')}>
                    {translations.home}
                </Link>
                {/* Prefetch false for secondary pages to save mobile data/CPU */}
                <Link href={`/${locale}/contact`} className={linkClass('contact')} prefetch={false}>
                    {translations.contact}
                </Link>
                <Link href={`/${locale}/team`} className={linkClass('team')} prefetch={false}>
                    {translations.team}
                </Link>
                <Link href={`/${locale}/gallery`} className={linkClass('gallery')} prefetch={false}>
                    {translations.gallery}
                </Link>
                <Link href={`/${locale}/licenses`} className={linkClass('licenses')} prefetch={false}>
                    {translations.licenses}
                </Link>
                <Link href={`/${locale}/reviews`} className={linkClass('reviews')} prefetch={false}>
                    {translations.reviews}
                </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='lg:hidden relative inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none'
                aria-expanded={isMobileMenuOpen}
                aria-label='Toggle navigation menu'
            >
                {/* Simplified Menu Icon logic to reduce re-renders */}
                <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    {isMobileMenuOpen ? (
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    ) : (
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                    )}
                </svg>
            </button>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className='lg:hidden fixed top-16 right-4 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                    <div className='py-2' onClick={() => setIsMobileMenuOpen(false)}>
                        <Link href={`/${locale}`} className={mobileLinkClass('')}>
                            {translations.home}
                        </Link>
                        <Link href={`/${locale}/contact`} className={mobileLinkClass('contact')} prefetch={false}>
                            {translations.contact}
                        </Link>
                        <Link href={`/${locale}/team`} className={mobileLinkClass('team')} prefetch={false}>
                            {translations.team}
                        </Link>
                        <Link href={`/${locale}/gallery`} className={mobileLinkClass('gallery')} prefetch={false}>
                            {translations.gallery}
                        </Link>
                        <Link href={`/${locale}/licenses`} className={mobileLinkClass('licenses')} prefetch={false}>
                            {translations.licenses}
                        </Link>
                        <Link href={`/${locale}/reviews`} className={mobileLinkClass('reviews')} prefetch={false}>
                            {translations.reviews}
                        </Link>

                        <div className='border-t border-gray-200 mt-2 pt-2 flex justify-center'>
                            <StatisticsLink />
                        </div>
                        <div className='border-t border-gray-200 mt-2 pt-3 pb-1 flex justify-center'>
                            <LanguageSwitcher locale={locale} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
