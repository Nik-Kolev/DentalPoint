'use client';

import Flag from 'react-world-flags';

export default function LanguageSwitcher({ locale }: { locale: string }) {
    const switchLanguage = (newLocale: string) => {
        localStorage.setItem('preferredLang', newLocale);
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace(/^\/(en|bg)/, `/${newLocale}`);
        window.location.pathname = newPath;
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
