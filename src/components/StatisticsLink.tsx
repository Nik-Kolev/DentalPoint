'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StatisticsLink() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    // Only show if user is authenticated
    if (status !== 'authenticated' || !session) {
        return null;
    }

    // Don't show on statistics page itself
    if (pathname?.startsWith('/statistics')) {
        return null;
    }

    return (
        <Link
            href='/statistics'
            className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#005baa] transition-colors duration-200 rounded-lg hover:bg-gray-100'
            title='Statistics'
        >
            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
            </svg>
            <span className='hidden sm:inline'>Statistics</span>
        </Link>
    );
}
