'use client';

import dynamic from 'next/dynamic';

const BackToTop = dynamic(() => import('@/components/shared/BackToTop'), {
    ssr: false,
    loading: () => null,
});
const CookieConsent = dynamic(() => import('@/components/shared/CookieConsent'), {
    ssr: false,
});
export default function DeferredWidgets() {
    return (
        <>
            <BackToTop />
            <CookieConsent />
        </>
    );
}
