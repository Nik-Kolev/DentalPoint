'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const StatisticsLink = dynamic(() => import('@/components/shared/StatisticsLink'), {
    ssr: false,
    loading: () => null,
});

interface NavigationProps {
    translations: {
        home: string;
        contact: string;
        team: string;
        gallery: string;
        licenses: string;
    };
}

export default function Navigation({ translations }: NavigationProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        }
        function handleScroll() {
            setIsMobileMenuOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isMobileMenuOpen]);

    const isActive = (path: string) => {
        if (path === '') return pathname === '/';
        return pathname.startsWith(`/${path}`);
    };

    const linkClass = (path: string) => {
        const baseClass = 'nav-link font-montserrat font-medium text-sm lg:text-[15px] tracking-wide text-gray-600 hover:text-gray-800 transition-colors duration-200';
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
                <Link href='/' className={linkClass('')}>
                    {translations.home}
                </Link>
                <Link href='/contact' className={linkClass('contact')} prefetch={false}>
                    {translations.contact}
                </Link>
                <Link href='/team' className={linkClass('team')} prefetch={false}>
                    {translations.team}
                </Link>
                <Link href='/gallery' className={linkClass('gallery')} prefetch={false}>
                    {translations.gallery}
                </Link>
                <Link href='/licenses' className={linkClass('licenses')} prefetch={false}>
                    {translations.licenses}
                </Link>
            </div>

            {/* Mobile Menu Button + Panel — shared ref so outside-click detection treats them as one unit */}
            <div ref={menuRef} className='contents'>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className='lg:hidden relative inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none'
                    aria-expanded={isMobileMenuOpen}
                    aria-label='Toggle navigation menu'
                >
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
                            <Link href='/' className={mobileLinkClass('')}>
                                {translations.home}
                            </Link>
                            <Link href='/contact' className={mobileLinkClass('contact')} prefetch={false}>
                                {translations.contact}
                            </Link>
                            <Link href='/team' className={mobileLinkClass('team')} prefetch={false}>
                                {translations.team}
                            </Link>
                            <Link href='/gallery' className={mobileLinkClass('gallery')} prefetch={false}>
                                {translations.gallery}
                            </Link>
                            <Link href='/licenses' className={mobileLinkClass('licenses')} prefetch={false}>
                                {translations.licenses}
                            </Link>

                            <StatisticsLink />
                            <div className='border-t border-gray-200 mt-2 pt-3 pb-1 flex justify-center'>
                                <LanguageSwitcher />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
