'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchAnalyticsData, type AnalyticsData, type TimePeriod } from '@/lib/analytics';

export default function StatisticsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const analyticsData = await fetchAnalyticsData(timePeriod);
                setData(analyticsData);
            } catch (err: any) {
                console.error('Failed to load analytics:', err);
                setError(err.message || 'Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [timePeriod]);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/signin');
        router.refresh();
    };

    const handleReturnToWebsite = () => {
        router.push('/');
    };

    return (
        <ProtectedRoute>
            <div className='min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4'>
                <div className='max-w-6xl mx-auto'>
                    {/* Header */}
                    <div className='bg-white rounded-lg shadow-lg p-4 sm:p-5 mb-4 sm:mb-6'>
                        <div className='flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 mb-3 sm:mb-4'>
                            <div>
                                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Statistics Dashboard</h1>
                            </div>
                            <div className='flex gap-2 sm:gap-3 justify-center md:justify-start'>
                                <button
                                    onClick={handleReturnToWebsite}
                                    className='bg-gray-200 text-gray-700 font-semibold py-2 px-4 sm:px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-sm text-sm sm:text-base'
                                >
                                    Back to Website
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className='bg-[#005baa] text-white font-semibold py-2 px-4 sm:px-6 rounded-lg hover:bg-[#004a8f] transition-colors duration-200 shadow-sm text-sm sm:text-base'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Time Period Selector */}
                        <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 border-t pt-4'>
                            <div className='flex gap-2 flex-wrap justify-center'>
                                {(['week', 'month', 'year'] as TimePeriod[]).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setTimePeriod(period)}
                                        disabled={loading}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            timePeriod === period ? 'bg-[#005baa] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly'}
                                    </button>
                                ))}
                            </div>
                            {data && (
                                <div className='flex items-center gap-2 text-base sm:text-lg text-gray-700'>
                                    <span className='text-gray-400 hidden sm:inline'>—</span>
                                    <span>
                                        Total Visitors:{' '}
                                        <span className='font-bold text-lg sm:text-xl text-[#005baa]'>{data.totalVisitors.toLocaleString()}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {loading && (
                        <div className='bg-white rounded-lg shadow-lg p-12 text-center'>
                            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005baa] mb-4'></div>
                            <p className='text-[#005baa]'>Loading analytics data...</p>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <>
                            {/* Main Charts - Custom widths on desktop */}
                            <div className='grid grid-cols-1 lg:grid-cols-[2.25fr_1fr_1.75fr] gap-3 sm:gap-4 mb-4 sm:mb-6 items-start'>
                                {/* Visitors Chart - Wider */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-hidden'>
                                    <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3'>Visitors Over Time</h2>
                                    {data.timeSeries && data.timeSeries.length > 0 ? (
                                        <div
                                            className={
                                                timePeriod === 'year'
                                                    ? 'h-64 sm:h-48 grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-1.5'
                                                    : 'h-48 flex items-end justify-between gap-1.5 pb-2'
                                            }
                                        >
                                            {data.timeSeries.map((item, index) => {
                                                const maxVisitors = Math.max(...data.timeSeries!.map((d) => d.visitors), 1);
                                                const height = (item.visitors / maxVisitors) * 100;
                                                const totalVisitors = data.timeSeries!.reduce((sum, d) => sum + d.visitors, 0);
                                                const percentage = totalVisitors > 0 ? Math.round((item.visitors / totalVisitors) * 100) : 0;
                                                const isYearly = timePeriod === 'year';
                                                return (
                                                    <div key={index} className={`${isYearly ? '' : 'flex-1'} flex flex-col items-center h-full`}>
                                                        <div className='w-full flex flex-col items-center justify-end h-full'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-md transition-all hover:bg-[#004a8f] cursor-pointer relative flex items-center justify-center'
                                                                style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '4px' : '0' }}
                                                                title={`${item.visitors} visitors`}
                                                            >
                                                                {height > 15 && (
                                                                    <span
                                                                        className={`text-black ${
                                                                            isYearly ? 'text-xs' : 'text-sm'
                                                                        } font-semibold absolute inset-0 flex items-center justify-center`}
                                                                    >
                                                                        {percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div
                                                            className={`${
                                                                isYearly ? 'text-xs' : 'text-sm'
                                                            } text-gray-600 mt-1.5 text-center whitespace-nowrap font-medium`}
                                                        >
                                                            {item.label}
                                                        </div>
                                                        <div className={`${isYearly ? 'text-xs' : 'text-sm'} font-semibold text-[#005baa] mt-0.5`}>
                                                            {item.visitors}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className='text-gray-500 text-sm'>No time series data available</p>
                                    )}
                                </div>

                                {/* Device Breakdown - Vertical */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-visible'>
                                    <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3'>Visitors by Device</h2>
                                    <div className='h-48 flex items-end justify-between gap-2 sm:gap-2 pb-2 overflow-visible'>
                                        {data.deviceBreakdown.length > 0 ? (
                                            data.deviceBreakdown.map((device, index) => {
                                                const maxCount = Math.max(...data.deviceBreakdown.map((d) => d.count), 1);
                                                const height = (device.count / maxCount) * 100;
                                                return (
                                                    <div key={index} className='flex-1 min-w-0 flex flex-col items-center h-full relative group'>
                                                        <div className='w-full flex flex-col items-center justify-end h-full overflow-visible'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-visible'
                                                                style={{ height: `${height}%`, minHeight: device.count > 0 ? '8px' : '0' }}
                                                            >
                                                                {height > 15 && (
                                                                    <span className='text-black text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {device.percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-sm text-gray-600 mt-1.5 text-center font-medium whitespace-nowrap'>
                                                            {device.device}
                                                        </div>
                                                        <div className='text-sm font-semibold text-[#005baa] mt-0.5'>{device.count}</div>
                                                        {/* Tooltip for small bars */}
                                                        <div className='invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                            {device.device}: {device.count} ({device.percentage}%)
                                                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className='text-gray-500 text-sm'>No device data available</p>
                                        )}
                                    </div>
                                </div>

                                {/* Traffic Sources - Vertical */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-visible'>
                                    <div className='flex items-center gap-2 mb-2 sm:mb-3'>
                                        <h2 className='text-base sm:text-lg font-bold text-gray-900'>Traffic Sources</h2>
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
                                                    <div>
                                                        <strong>Direct:</strong> Typed your website address directly in the browser
                                                    </div>
                                                    <div>
                                                        <strong>Google:</strong> Clicked from Google search results (e.g., "dentist varna")
                                                    </div>
                                                    <div>
                                                        <strong>Facebook/Instagram:</strong> Clicked from social media posts or ads
                                                    </div>
                                                    <div>
                                                        <strong>Others:</strong> All other traffic sources
                                                    </div>
                                                </div>
                                                <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-48 flex items-end justify-between gap-2 sm:gap-2 pb-2'>
                                        {data.trafficSources && data.trafficSources.length > 0 ? (
                                            data.trafficSources.map((source, index) => {
                                                const maxCount = Math.max(...data.trafficSources!.map((s) => s.count), 1);
                                                const height = (source.count / maxCount) * 100;
                                                const getSourceTooltip = (sourceName: string) => {
                                                    if (sourceName === 'Direct') return 'Typed your website address directly';
                                                    if (sourceName === 'Google') return 'Clicked from Google search results';
                                                    if (sourceName === 'Facebook') return 'Clicked from Facebook';
                                                    if (sourceName === 'Instagram') return 'Clicked from Instagram';
                                                    return 'Clicked from other sources';
                                                };
                                                return (
                                                    <div key={index} className='flex-1 min-w-0 flex flex-col items-center h-full relative group'>
                                                        <div className='w-full flex flex-col items-center justify-end h-full'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-md transition-all hover:bg-[#004a8f] cursor-pointer relative'
                                                                style={{ height: `${height}%`, minHeight: source.count > 0 ? '8px' : '0' }}
                                                            >
                                                                {height > 15 && (
                                                                    <span className='text-black text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {source.percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-sm text-gray-600 mt-1.5 text-center font-medium whitespace-nowrap'>
                                                            {source.source}
                                                        </div>
                                                        <div className='text-sm font-semibold text-[#005baa] mt-0.5'>{source.count}</div>
                                                        {/* Tooltip for small bars */}
                                                        <div className='invisible group-hover:visible absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                            {source.source}: {source.count} ({source.percentage}%)
                                                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className='text-gray-500 text-sm'>No traffic source data available</p>
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
