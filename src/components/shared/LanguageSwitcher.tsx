'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
    const router = useRouter();
    const locale = useLocale();

    const switchLanguage = useCallback(
        (newLocale: string) => {
            if (newLocale === locale) return;
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;
            router.refresh();
        },
        [locale, router],
    );

    return (
        <div className='flex items-center'>
            <button
                onClick={() => switchLanguage('bg')}
                className={`font-montserrat text-sm tracking-wider px-2 py-1 transition-colors duration-200 ${
                    locale === 'bg'
                        ? 'text-[var(--dp-primary)] font-semibold'
                        : 'text-gray-400 font-medium hover:text-gray-600'
                }`}
                aria-label='Switch to Bulgarian'
            >
                БГ
            </button>
            <span className='text-gray-300 select-none'>|</span>
            <button
                onClick={() => switchLanguage('en')}
                className={`font-montserrat text-sm tracking-wider px-2 py-1 transition-colors duration-200 ${
                    locale === 'en'
                        ? 'text-[var(--dp-primary)] font-semibold'
                        : 'text-gray-400 font-medium hover:text-gray-600'
                }`}
                aria-label='Switch to English'
            >
                EN
            </button>
        </div>
    );
}
