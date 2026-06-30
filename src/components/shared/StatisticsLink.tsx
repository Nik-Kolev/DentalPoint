'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StatisticsLink() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (status !== 'authenticated' || !session) {
        return null;
    }

    const onDashboard = pathname?.startsWith('/statistics');

    return (
        <div className='flex items-center gap-0.5'>
            {!onDashboard && (
                <Link
                    href='/statistics'
                    className='flex items-center gap-1.5 px-3 py-1.5 font-montserrat text-sm font-medium tracking-wide text-gray-600 hover:text-[var(--dp-primary)] transition-colors duration-200 rounded-lg hover:bg-gray-100'
                    title='Табло'
                >
                    <svg className='h-4 w-4 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                    </svg>
                    <span className='hidden sm:inline'>Табло</span>
                </Link>
            )}
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className='flex items-center gap-1.5 px-3 py-1.5 font-montserrat text-sm font-medium tracking-wide text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 rounded-lg'
                title='Изход'
            >
                <svg className='h-4 w-4 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
                </svg>
                <span className='hidden sm:inline'>Изход</span>
            </button>
        </div>
    );
}
