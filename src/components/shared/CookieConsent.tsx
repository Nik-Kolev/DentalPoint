'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CookieConsent() {
    const t = useTranslations('cookies');

    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // localStorage doesn't exist during SSR — can only be read client-side, post-mount.
        /* eslint-disable react-hooks/set-state-in-effect */
        const consent = localStorage.getItem('cookie-consent');
        if (consent === null) {
            setShowBanner(true);
        } else if (consent === 'true') {
            loadGoogleAnalytics();
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);

    const loadGoogleAnalytics = () => {
        if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
        const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        if (typeof window.gtag !== 'undefined') return;

        window.dataLayer = window.dataLayer || [];
        function gtag(...args: unknown[]) {
            window.dataLayer.push(args);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
        });
        gtag('config', measurementId, { anonymize_ip: true });

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
    };

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setShowBanner(false);
        loadGoogleAnalytics();
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'false');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className='fixed bottom-0 left-0 right-0 z-[70] bg-white border-t-2 border-gray-200 shadow-lg p-4 md:p-6'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>{t('title')}</h3>
                    <p className='text-sm text-gray-700 mb-2'>{t('description')}</p>
                    <p className='text-xs text-gray-600 mb-2'>{t('notice')}</p>
                    <Link href='/privacy' className='text-xs text-[#005baa] hover:text-[#004085] hover:underline transition-colors font-medium'>
                        {t('learnMore')}
                    </Link>
                </div>
                <div className='flex gap-3 flex-shrink-0'>
                    <button
                        onClick={handleReject}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                        {t('reject')}
                    </button>
                    <button
                        onClick={handleAccept}
                        className='px-4 py-2 text-sm font-medium text-white bg-[#005baa] rounded-lg hover:bg-[#004085] transition-colors'
                    >
                        {t('accept')}
                    </button>
                </div>
            </div>
        </div>
    );
}

declare global {
    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[]) => void;
    }
}
