'use client';

import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
    const router = useRouter();

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--dp-bg-from)] to-white px-4'>
            <div className='relative overflow-hidden max-w-sm w-full bg-white rounded-2xl shadow-lg border border-[var(--dp-card-border)] p-6 text-center'>
                <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--dp-primary)] to-[var(--dp-accent)]' />
                <div className='mb-6'>
                    <h1 className='text-xl font-bold text-[var(--dp-primary)] mb-3'>Unauthorized</h1>
                    <p className='text-gray-600 text-sm'>Your email is not authorized to access this application.</p>
                </div>

                <div className='space-y-2'>
                    <button
                        onClick={() => router.push('/auth/signin')}
                        className='w-full bg-[var(--dp-accent)] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[var(--dp-accent)]/90 transition-colors duration-200 text-sm'
                    >
                        Try Again
                    </button>
                    <button onClick={() => router.push('/')} className='w-full text-sm text-gray-600 hover:text-[var(--dp-primary)] transition-colors duration-200 py-2'>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
