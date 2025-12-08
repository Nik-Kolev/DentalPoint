'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignInPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const callbackUrl = searchParams.get('callbackUrl') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password.');
                setLoading(false);
            } else {
                // Redirect to statistics page
                window.location.href = '/statistics';
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-[#005baa] mb-2'>Sign In</h1>
                    <p className='text-gray-600'>Access the statistics dashboard</p>
                </div>

                {error && (
                    <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
                        <p className='text-red-800 text-sm'>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005baa] focus:border-transparent outline-none transition-all'
                            placeholder='kolev93@abv.bg'
                        />
                    </div>

                    <div>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                            Password
                        </label>
                        <input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#005baa] focus:border-transparent outline-none transition-all'
                            placeholder='Enter your password'
                        />
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-[#005baa] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#004a8f] transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <button onClick={() => router.push('/')} className='text-sm text-gray-600 hover:text-[#005baa]'>
                        ← Back to home
                    </button>
                </div>
            </div>
        </div>
    );
}
