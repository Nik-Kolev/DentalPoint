'use client';

import { useRouter } from 'next/navigation';
import Flag from 'react-world-flags';
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
        <div className='flex items-center space-x-3'>
            <button
                onClick={() => switchLanguage('bg')}
                className={`transition-all duration-200 hover:scale-110 border-none outline-none bg-transparent flex items-center ${
                    locale === 'bg' ? 'shadow-lg shadow-[#005baa]/30' : 'hover:shadow-md'
                }`}
                aria-label='Switch to Bulgarian'
            >
                <div style={{ width: 40, height: 24, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
                    <Flag code='BG' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt='Bulgarian flag' />
                </div>
            </button>

            <button
                onClick={() => switchLanguage('en')}
                className={`transition-all duration-200 hover:scale-110 border-none outline-none bg-transparent flex items-center ${
                    locale === 'en' ? 'shadow-lg shadow-[#005baa]/30' : 'hover:shadow-md'
                }`}
                aria-label='Switch to English'
            >
                <div style={{ width: 40, height: 24, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
                    <Flag code='GB' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt='British flag' />
                </div>
            </button>
        </div>
    );
}
