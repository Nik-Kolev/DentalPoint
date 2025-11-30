'use client';

import { useRouter, usePathname } from 'next/navigation';
import Flag from 'react-world-flags';

export default function LanguageSwitcher({ locale }: { locale: string }) {
    const router = useRouter();
    const pathname = usePathname();

    const switchLanguage = (newLocale: string) => {
        localStorage.setItem('preferredLang', newLocale);
        const newPath = pathname.replace(/^\/(en|bg)/, `/${newLocale}`);
        router.push(newPath);
    };

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
                    <Flag code='BG' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
                    <Flag code='GB' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
            </button>
        </div>
    );
}
