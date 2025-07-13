'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

    const isActive = (path: string) => {
        if (path === '') {
            return pathname === `/${locale}` || pathname === `/${locale}/`;
        }
        return pathname.includes(`/${locale}/${path}`);
    };

    const linkClass = (path: string) => {
        const baseClass = 'nav-link font-semibold text-lg text-gray-600 hover:text-gray-800';
        const activeClass = isActive(path) ? 'active' : '';

        return `${baseClass} ${activeClass}`.trim();
    };

    return (
        <div className='flex space-x-8'>
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
    );
}
