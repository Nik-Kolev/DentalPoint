'use client';

import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
    const router = useRouter();

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#e3f3fb] to-white px-4'>
            <div className='max-w-sm w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center'>
                <div className='mb-6'>
                    <h1 className='text-xl font-bold text-gray-900 mb-3'>Unauthorized</h1>
                    <p className='text-gray-600 text-sm'>Your email is not authorized to access this application.</p>
                </div>

                <div className='space-y-2'>
                    <button
                        onClick={() => router.push('/auth/signin')}
                        className='w-full bg-[#005baa] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#004a8f] transition-colors duration-200 text-sm'
                    >
                        Try Again
                    </button>
                    <button onClick={() => router.push('/')} className='w-full text-sm text-gray-600 hover:text-[#005baa] transition-colors duration-200 py-2'>
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
