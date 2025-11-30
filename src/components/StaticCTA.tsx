'use client';

import Link from 'next/link';
import { getTranslation } from '../lib/useTranslation';

interface StaticCTAProps {
    locale: string;
    title: string;
    subtitle: string;
}

export default function StaticCTA({ locale, title, subtitle }: StaticCTAProps) {
    const t = getTranslation(locale);

    return (
        <div className='text-center mt-12 bg-[#005baa] text-white py-8 px-4 md:px-6 rounded-xl' data-static-cta>
            <h2 className='text-xl md:text-2xl font-bold mb-3 font-serif max-w-md mx-auto leading-tight'>{title}</h2>
            <p className='text-base md:text-lg mb-6'>{subtitle}</p>
            <Link
                href={`/${locale}/contact`}
                className='inline-block bg-white text-[#005baa] px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg'
            >
                {t('layout', 'contactUs')}
            </Link>
        </div>
    );
}
