'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function CookieConsent() {
    const t = useTranslations('cookies');

    const [showBanner, setShowBanner] = useState(false);
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

    useEffect(() => {
        // localStorage doesn't exist during SSR — can only be read client-side, post-mount.
        /* eslint-disable react-hooks/set-state-in-effect */
        const consent = localStorage.getItem('cookie-consent');
        if (consent === null) {
            setShowBanner(true);
        } else if (consent === 'true') {
            setAnalyticsEnabled(true);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setShowBanner(false);
        setAnalyticsEnabled(true);
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'false');
        setShowBanner(false);
    };

    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    return (
        <>
            {analyticsEnabled && measurementId && <GoogleAnalytics gaId={measurementId} />}
            {showBanner && (
                <div className='fixed bottom-0 left-0 right-0 z-[70] bg-white border-t-2 border-gray-200 shadow-lg p-4 md:p-6'>
                    <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                        <div className='flex-1'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-2'>{t('title')}</h3>
                            <p className='text-sm text-gray-700 mb-2'>{t('description')}</p>
                            <p className='text-xs text-gray-600 mb-2'>{t('notice')}</p>
                            <Link href='/privacy' className='text-xs text-[var(--dp-primary)] hover:text-[var(--dp-accent)] hover:underline transition-colors font-medium'>
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
                                className='px-4 py-2 text-sm font-medium text-white bg-[var(--dp-primary)] rounded-lg hover:bg-[var(--dp-primary)]/90 transition-colors'
                            >
                                {t('accept')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
