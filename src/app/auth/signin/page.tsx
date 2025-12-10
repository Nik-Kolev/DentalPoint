'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SignInPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const callbackUrl = searchParams.get('callbackUrl') || '/statistics';

    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'AccessDenied') {
            setError('Access denied. Only authorized email addresses can sign in.');
        } else if (errorParam) {
            setError('An error occurred during sign in. Please try again.');
        }
    }, [searchParams]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signIn('google', { callbackUrl, redirect: true });
        } catch (err) {
            setError('Failed to sign in. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#e3f3fb] to-white px-4'>
            <div className='max-w-sm w-full bg-white rounded-lg shadow-lg p-6 border border-gray-200'>
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-bold text-[#005baa] mb-1'>Sign In</h1>
                    <p className='text-gray-600 text-sm'>Access the statistics dashboard</p>
                </div>

                {error && (
                    <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded text-center'>
                        <p className='text-red-700 text-sm'>Unauthorized</p>
                    </div>
                )}

                <div className='mb-4'>
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className='w-full bg-[#005baa] text-white font-medium py-2.5 px-4 rounded-lg hover:bg-[#004a8f] active:bg-[#003d7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2.5'
                    >
                        {loading ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                <span className='text-sm'>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <svg className='w-4 h-4' viewBox='0 0 24 24'>
                                    <path
                                        fill='#4285F4'
                                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                    />
                                    <path
                                        fill='#34A853'
                                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                    />
                                    <path
                                        fill='#FBBC05'
                                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                    />
                                    <path
                                        fill='#EA4335'
                                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                    />
                                </svg>
                                <span className='text-sm'>Sign in with Google</span>
                            </>
                        )}
                    </button>
                </div>

                <div className='pt-4 border-t border-gray-200'>
                    <button
                        onClick={() => router.push('/')}
                        className='w-full text-sm text-gray-600 hover:text-[#005baa] transition-colors duration-200 flex items-center justify-center gap-1.5 py-1.5'
                    >
                        <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                        </svg>
                        Back to home
                    </button>
                </div>
            </div>
        </div>
    );
}
