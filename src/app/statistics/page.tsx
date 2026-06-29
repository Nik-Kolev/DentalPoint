'use client';

import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import BarChart from '@/components/statistics/BarChart';
import { fetchAnalyticsData, type AnalyticsData, type TimePeriod } from '@/lib/analytics';

const columnWidths: Record<TimePeriod, string> = {
    day: 'w-24 sm:w-32',
    week: 'w-24 sm:w-32',
    month: 'w-20 sm:w-24',
    year: 'w-20 sm:w-28',
    alltime: 'w-20 sm:w-28',
};

export default function StatisticsPage() {
    const { data: session } = useSession();
    const t = useTranslations('statistics');
    const router = useRouter();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [useMockData, setUseMockData] = useState(false);
    const isDevelopment = process.env.NODE_ENV === 'development';

    const translateDevice = (device: string): string =>
        (t.raw('device') as Record<string, string>)[device] ?? device;

    const translateSource = (source: string): string =>
        (t.raw('source') as Record<string, string>)[source] ?? source;

    const translateTimeLabel = (label: string, period?: TimePeriod): string => {
        const days = t.raw('days') as Record<string, string>;
        if (days[label]) return days[label];

        if (/^\d{2}\.\d{2}$/.test(label)) return label;

        const monthsFull = t.raw('monthsFull') as Record<string, string>;
        if (period === 'year' && monthsFull[label]) return monthsFull[label];

        const monthsShort = t.raw('monthsShort') as Record<string, string>;
        if (monthsShort[label]) return monthsShort[label];

        if (/^\d{4}$/.test(label)) return label;

        return label;
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const analyticsData = await fetchAnalyticsData(timePeriod, useMockData);
                setData(analyticsData);
            } catch (err: any) {
                setError(err.message || t('loadError'));
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [timePeriod, useMockData]);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/signin');
        router.refresh();
    };

    return (
        <ProtectedRoute>
            <div className='min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 overflow-x-hidden'>
                <div className='max-w-7xl mx-auto w-full'>
                    {/* Header */}
                    <div className='bg-white rounded-lg shadow-lg p-4 sm:p-5 mb-4 sm:mb-6'>
                        <div className='flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 mb-3 sm:mb-4'>
                            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>{t('title')}</h1>
                            <div className='flex gap-2 sm:gap-3 justify-center md:justify-start'>
                                <button
                                    onClick={() => router.push('/')}
                                    className='bg-gray-200 text-gray-700 font-semibold py-2 px-4 sm:px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-sm text-sm sm:text-base'
                                >
                                    {t('backToSite')}
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className='bg-[#005baa] text-white font-semibold py-2 px-4 sm:px-6 rounded-lg hover:bg-[#004a8f] transition-colors duration-200 shadow-sm text-sm sm:text-base'
                                >
                                    {t('signOut')}
                                </button>
                            </div>
                        </div>

                        {/* Time Period Selector */}
                        <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-t pt-4'>
                            <div className='flex gap-2 flex-wrap justify-center'>
                                {(['week', 'month', 'year', 'alltime'] as TimePeriod[]).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setTimePeriod(period)}
                                        disabled={loading}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            timePeriod === period ? 'bg-[#005baa] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {t(`period.${period}` as 'period.week')}
                                    </button>
                                ))}
                                {isDevelopment && (
                                    <button
                                        onClick={() => setUseMockData(!useMockData)}
                                        disabled={loading}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                                            useMockData ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                    >
                                        {useMockData ? t('mockToggleOn') : t('mockToggleOff')}
                                    </button>
                                )}
                            </div>
                            {data && (
                                <div className='flex items-center gap-2 text-base sm:text-lg text-gray-700'>
                                    <span className='text-gray-400 hidden sm:inline'>—</span>
                                    <span>
                                        {t('totalVisitors')}:{' '}
                                        <span className='font-bold text-lg sm:text-xl text-[#005baa]'>{data.totalVisitors.toLocaleString()}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {loading && (
                        <div className='bg-white rounded-lg shadow-lg p-12 text-center'>
                            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005baa] mb-4'></div>
                            <p className='text-[#005baa]'>{t('loading')}</p>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <>
                            {/* Visitors Over Time - Full Width */}
                            <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 overflow-hidden'>
                                <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3'>
                                    {t(`chartTitle.${timePeriod}` as 'chartTitle.week')}
                                </h2>
                                {data.timeSeries && data.timeSeries.length > 0 ? (
                                    <BarChart
                                        data={data.timeSeries}
                                        columnWidth={columnWidths[timePeriod]}
                                        translateLabel={(label) => translateTimeLabel(label, timePeriod)}
                                    />
                                ) : (
                                    <p className='text-gray-500 text-sm'>{t('noDataForPeriod')}</p>
                                )}
                            </div>

                            {/* Device and Traffic Sources - Side by Side */}
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 items-start'>
                                {/* Device Breakdown */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-hidden'>
                                    <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3'>{t('deviceChart')}</h2>
                                    <div className='h-64 sm:h-72 flex items-end justify-center gap-2 sm:gap-12 lg:gap-16 px-2 sm:px-4 pb-2 overflow-hidden'>
                                        {data.deviceBreakdown.length > 0 ? (
                                            data.deviceBreakdown.map((device, index) => {
                                                const maxCount = Math.max(...data.deviceBreakdown.map((d) => d.count), 1);
                                                const height = (device.count / maxCount) * 100;
                                                return (
                                                    <div key={index} className='flex flex-col items-center h-full relative group w-24 sm:w-32'>
                                                        <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                style={{ height: `${height}%`, minHeight: device.count > 0 ? '10px' : '0' }}
                                                            >
                                                                {height > 20 && (
                                                                    <span className='text-white text-xs sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {device.percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-xs sm:text-base text-gray-600 mt-2 text-center font-medium whitespace-nowrap'>
                                                            {translateDevice(device.device)}
                                                        </div>
                                                        <div className='text-xs sm:text-base font-semibold text-[#005baa] mt-1'>
                                                            {device.count.toLocaleString()}
                                                        </div>
                                                        <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                            {translateDevice(device.device)}: {device.count.toLocaleString()} ({device.percentage}%)
                                                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className='text-gray-500 text-sm'>{t('noDeviceData')}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Traffic Sources */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-hidden'>
                                    <div className='flex items-center gap-2 mb-2 sm:mb-3'>
                                        <h2 className='text-base sm:text-lg font-bold text-gray-900'>{t('sourceChart')}</h2>
                                        <div className='group relative z-50'>
                                            <svg
                                                className='w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hover:text-gray-700 cursor-help transition-colors'
                                                fill='currentColor'
                                                viewBox='0 0 20 20'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                            <div className='opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 sm:p-4 bg-gray-900 text-white text-xs sm:text-sm rounded-lg shadow-2xl z-[100] pointer-events-none whitespace-normal transition-opacity duration-200'>
                                                <div className='space-y-2'>
                                                    <div><strong>Директно:</strong> {t('sourceTooltip.direct')}</div>
                                                    <div><strong>Google:</strong> {t('sourceTooltip.google')}</div>
                                                    <div><strong>Facebook/Instagram:</strong> {t('sourceTooltip.social')}</div>
                                                    <div><strong>Други:</strong> {t('sourceTooltip.others')}</div>
                                                </div>
                                                <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-64 sm:h-72 flex items-end justify-center gap-2 sm:gap-8 lg:gap-12 px-2 sm:px-4 pb-2 overflow-hidden'>
                                        {data.trafficSources && data.trafficSources.length > 0 ? (
                                            data.trafficSources.map((source, index) => {
                                                const maxCount = Math.max(...data.trafficSources!.map((s) => s.count), 1);
                                                const height = (source.count / maxCount) * 100;
                                                return (
                                                    <div key={index} className='flex flex-col items-center h-full relative group w-20 sm:w-28'>
                                                        <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                style={{ height: `${height}%`, minHeight: source.count > 0 ? '10px' : '0' }}
                                                            >
                                                                {height > 20 && (
                                                                    <span className='text-white text-xs sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {source.percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-xs sm:text-base text-gray-600 mt-2 text-center font-medium whitespace-nowrap'>
                                                            {translateSource(source.source)}
                                                        </div>
                                                        <div className='text-xs sm:text-base font-semibold text-[#005baa] mt-1'>
                                                            {source.count.toLocaleString()}
                                                        </div>
                                                        <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                            {translateSource(source.source)}: {source.count.toLocaleString()} ({source.percentage}%)
                                                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className='text-gray-500 text-sm'>{t('noSourceData')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
