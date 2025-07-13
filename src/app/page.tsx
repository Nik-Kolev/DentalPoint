'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Check localStorage for preferred language
        const lang = localStorage.getItem('preferredLang') || 'bg';
        router.replace(`/${lang}`);
    }, [router]);

    return null;
}
