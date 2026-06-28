'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getTranslation } from '@/lib/useTranslation';

interface CookieConsentProps {
    locale: string;
}

export default function CookieConsent({ locale }: CookieConsentProps) {
    const t = getTranslation(locale);

    const [showBanner, setShowBanner] = useState(false);
    const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem('cookie-consent');
        if (consent === null) {
            // No consent stored, show banner
            setShowBanner(true);
        } else {
            setConsentGiven(consent === 'true');
            // If consent was given, ensure GA is loaded
            if (consent === 'true') {
                loadGoogleAnalytics();
            }
        }
    }, []);

    const loadGoogleAnalytics = () => {
        // Only load if GA_MEASUREMENT_ID exists and not already loaded
        if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
            return;
        }

        const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

        // Check if already loaded
        if (typeof window.gtag !== 'undefined') {
            return;
        }

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
            window.dataLayer.push(args);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', measurementId, { anonymize_ip: true });

        // Load gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
    };

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true');
        setConsentGiven(true);
        setShowBanner(false);
        loadGoogleAnalytics();
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'false');
        setConsentGiven(false);
        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div className='fixed bottom-0 left-0 right-0 z-[70] bg-white border-t-2 border-gray-200 shadow-lg p-4 md:p-6'>
            <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>{t('cookies', 'title')}</h3>
                    <p className='text-sm text-gray-700 mb-2'>{t('cookies', 'description')}</p>
                    <p className='text-xs text-gray-600 mb-2'>{t('cookies', 'notice')}</p>
                    <Link href={`/${locale}/privacy`} className='text-xs text-[#005baa] hover:text-[#004085] hover:underline transition-colors font-medium'>
                        {t('cookies', 'learnMore')}
                    </Link>
                </div>
                <div className='flex gap-3 flex-shrink-0'>
                    <button
                        onClick={handleReject}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                        {t('cookies', 'reject')}
                    </button>
                    <button
                        onClick={handleAccept}
                        className='px-4 py-2 text-sm font-medium text-white bg-[#005baa] rounded-lg hover:bg-[#004085] transition-colors'
                    >
                        {t('cookies', 'accept')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Extend Window interface for TypeScript
declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

