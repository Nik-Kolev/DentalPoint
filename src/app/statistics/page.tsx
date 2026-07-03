'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import StatsTab from '@/components/statistics/StatsTab';
import MessagesTab from '@/components/statistics/MessagesTab';

type Tab = 'stats' | 'messages';

export default function StatisticsPage() {
    const t = useTranslations('statistics');
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('stats');

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/signin');
        router.refresh();
    };

    return (
        <ProtectedRoute>
            <div className='min-h-screen bg-gradient-to-b from-[var(--dp-bg-from)] to-white py-4 px-3 sm:py-6 sm:px-4'>
                <div className='max-w-2xl mx-auto w-full'>
                    <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-4 sm:p-5 mb-4 sm:mb-6'>
                        <div className='flex flex-col sm:flex-row justify-between items-center gap-3 mb-4'>
                            <h1 className='text-xl sm:text-2xl font-bold text-[var(--dp-heading)]'>{t('title')}</h1>
                            <div className='flex gap-2 justify-center'>
                                <button
                                    onClick={() => router.push('/')}
                                    className='bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm'
                                >
                                    {t('backToSite')}
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className='bg-[var(--dp-primary)] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[var(--dp-primary)]/90 transition-colors text-sm'
                                >
                                    {t('signOut')}
                                </button>
                            </div>
                        </div>

                        <div className='flex gap-2 border-t border-[var(--dp-card-border)] pt-3'>
                            {(['stats', 'messages'] as Tab[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                        activeTab === tab
                                            ? 'bg-[var(--dp-primary)] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {t(`tabs.${tab}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'stats' ? <StatsTab /> : <MessagesTab />}
                </div>
            </div>
        </ProtectedRoute>
    );
}
