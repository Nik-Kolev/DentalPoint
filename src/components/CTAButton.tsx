'use client';

import Link from 'next/link';
import { getTranslation } from '../lib/useTranslation';

interface CTAButtonProps {
    locale: string;
    className?: string;
}

export default function CTAButton({ locale, className = '' }: CTAButtonProps) {
    const t = getTranslation(locale);

    return (
        <Link
            href={`/${locale}/contact`}
            className={`inline-block bg-white text-[#0056b3] px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:bg-gray-100 hover:scale-105 transform shadow-lg ${className}`}
        >
            {t('layout', 'contactUs')}
        </Link>
    );
}
