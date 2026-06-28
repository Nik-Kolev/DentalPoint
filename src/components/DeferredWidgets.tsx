'use client';

import dynamic from 'next/dynamic';

const BackToTop = dynamic(() => import('@/components/BackToTop'), {
    ssr: false,
    loading: () => null,
});
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), {
    ssr: false,
});
const FloatingCTA = dynamic(() => import('@/components/FloatingCTA'), {
    ssr: false,
});

export default function DeferredWidgets({ locale }: { locale: string }) {
    return (
        <>
            <BackToTop />
            <FloatingCTA locale={locale} />
            <CookieConsent locale={locale} />
        </>
    );
}
