'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

// Mock data - Replace with real GA data later
const mockData = {
    allTime: {
        totalVisitors: 12450,
        totalPageViews: 18720,
        uniqueVisitors: 8920,
        avgSessionDuration: '2m 34s',
        bounceRate: '42.5%',
        dailyData: [
            { date: '2024-01-01', visitors: 45, pageViews: 67 },
            { date: '2024-01-02', visitors: 52, pageViews: 78 },
            { date: '2024-01-03', visitors: 38, pageViews: 56 },
            { date: '2024-01-04', visitors: 61, pageViews: 92 },
            { date: '2024-01-05', visitors: 55, pageViews: 83 },
            { date: '2024-01-06', visitors: 48, pageViews: 71 },
            { date: '2024-01-07', visitors: 67, pageViews: 101 },
        ],
        deviceBreakdown: [
            { device: 'Desktop', count: 6234, percentage: 50.1 },
            { device: 'Mobile', count: 4980, percentage: 40.0 },
            { device: 'Tablet', count: 1236, percentage: 9.9 },
        ],
        trafficSources: [
            { source: 'Direct', count: 4560, percentage: 36.6 },
            { source: 'Google Search', count: 3890, percentage: 31.2 },
            { source: 'Social Media', count: 2340, percentage: 18.8 },
            { source: 'Referral', count: 1660, percentage: 13.4 },
        ],
    },
    month: {
        totalVisitors: 1240,
        totalPageViews: 1890,
        uniqueVisitors: 980,
        avgSessionDuration: '2m 45s',
        bounceRate: '38.2%',
        dailyData: [
            { date: 'Day 1', visitors: 42, pageViews: 63 },
            { date: 'Day 2', visitors: 48, pageViews: 72 },
            { date: 'Day 3', visitors: 35, pageViews: 52 },
            { date: 'Day 4', visitors: 55, pageViews: 83 },
            { date: 'Day 5', visitors: 51, pageViews: 76 },
            { date: 'Day 6', visitors: 44, pageViews: 66 },
            { date: 'Day 7', visitors: 62, pageViews: 93 },
        ],
        deviceBreakdown: [
            { device: 'Desktop', count: 620, percentage: 50.0 },
            { device: 'Mobile', count: 496, percentage: 40.0 },
            { device: 'Tablet', count: 124, percentage: 10.0 },
        ],
    },
    week: {
        totalVisitors: 312,
        totalPageViews: 467,
        uniqueVisitors: 245,
        avgSessionDuration: '2m 52s',
        bounceRate: '35.8%',
        dailyData: [
            { date: 'Mon', visitors: 38, pageViews: 57 },
            { date: 'Tue', visitors: 45, pageViews: 68 },
            { date: 'Wed', visitors: 42, pageViews: 63 },
            { date: 'Thu', visitors: 51, pageViews: 76 },
            { date: 'Fri', visitors: 48, pageViews: 72 },
            { date: 'Sat', visitors: 44, pageViews: 66 },
            { date: 'Sun', visitors: 44, pageViews: 65 },
        ],
        deviceBreakdown: [
            { device: 'Desktop', count: 156, percentage: 50.0 },
            { device: 'Mobile', count: 125, percentage: 40.1 },
            { device: 'Tablet', count: 31, percentage: 9.9 },
        ],
    },
    day: {
        totalVisitors: 45,
        totalPageViews: 67,
        uniqueVisitors: 38,
        avgSessionDuration: '3m 12s',
        bounceRate: '33.3%',
        hourlyData: [
            { hour: '00:00', visitors: 0 },
            { hour: '06:00', visitors: 2 },
            { hour: '09:00', visitors: 5 },
            { hour: '12:00', visitors: 8 },
            { hour: '15:00', visitors: 12 },
            { hour: '18:00', visitors: 10 },
            { hour: '21:00', visitors: 6 },
        ],
        deviceBreakdown: [
            { device: 'Desktop', count: 23, percentage: 51.1 },
            { device: 'Mobile', count: 18, percentage: 40.0 },
            { device: 'Tablet', count: 4, percentage: 8.9 },
        ],
    },
};

type TimePeriod = 'day' | 'week' | 'month' | 'allTime';

export default function StatisticsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

    const currentData = mockData[timePeriod];

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/auth/signin');
        router.refresh();
    };

    const handleReturnToWebsite = () => {
        router.push('/');
    };

    // Calculate max value for chart scaling
    const maxVisitors = useMemo(() => {
        const data = timePeriod === 'day' ? (currentData as typeof mockData.day).hourlyData : (currentData as typeof mockData.week).dailyData;
        return Math.max(...data.map((d: any) => d.visitors), 1);
    }, [currentData, timePeriod]);

    return (
        <ProtectedRoute>
            <div className='min-h-screen bg-gray-50 py-8 px-4'>
                <div className='max-w-7xl mx-auto'>
                    {/* Header */}
                    <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
                        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900 mb-2'>Statistics Dashboard</h1>
                                <p className='text-gray-600'>
                                    Welcome, <span className='font-semibold text-[#005baa]'>{session?.user?.email}</span>
                                </p>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    onClick={handleReturnToWebsite}
                                    className='bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-sm'
                                >
                                    Return to Website
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className='bg-[#005baa] text-white font-semibold py-2 px-6 rounded-lg hover:bg-[#004a8f] transition-colors duration-200 shadow-sm'
                                >
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Time Period Selector */}
                        <div className='flex gap-2 border-t pt-4'>
                            {(['day', 'week', 'month', 'allTime'] as TimePeriod[]).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimePeriod(period)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        timePeriod === period ? 'bg-[#005baa] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {period === 'day' ? 'Today' : period === 'week' ? '7 Days' : period === 'month' ? '30 Days' : 'All Time'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <div className='text-sm text-gray-600 mb-1'>Total Visitors</div>
                            <div className='text-3xl font-bold text-[#005baa]'>{currentData.totalVisitors.toLocaleString()}</div>
                            <div className='text-xs text-gray-500 mt-2'>Unique: {currentData.uniqueVisitors.toLocaleString()}</div>
                        </div>
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <div className='text-sm text-gray-600 mb-1'>Page Views</div>
                            <div className='text-3xl font-bold text-[#005baa]'>{currentData.totalPageViews.toLocaleString()}</div>
                        </div>
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <div className='text-sm text-gray-600 mb-1'>Avg. Session</div>
                            <div className='text-3xl font-bold text-[#005baa]'>{currentData.avgSessionDuration}</div>
                        </div>
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <div className='text-sm text-gray-600 mb-1'>Bounce Rate</div>
                            <div className='text-3xl font-bold text-[#005baa]'>{currentData.bounceRate}</div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                        {/* Visitor Trend Chart */}
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <h2 className='text-xl font-bold text-gray-900 mb-4'>Visitors Over Time</h2>
                            <div className='h-64 flex items-end justify-between gap-2'>
                                {(timePeriod === 'day' ? (currentData as typeof mockData.day).hourlyData : (currentData as typeof mockData.week).dailyData).map(
                                    (item: any, index: number) => {
                                        const height = (item.visitors / maxVisitors) * 100;
                                        return (
                                            <div key={index} className='flex-1 flex flex-col items-center'>
                                                <div className='w-full flex flex-col items-center justify-end h-full'>
                                                    <div
                                                        className='w-full bg-[#005baa] rounded-t transition-all hover:bg-[#004a8f] cursor-pointer'
                                                        style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '4px' : '0' }}
                                                        title={`${item.visitors} visitors`}
                                                    />
                                                </div>
                                                <div className='text-xs text-gray-600 mt-2 text-center'>{item.date || item.hour}</div>
                                                <div className='text-xs font-semibold text-[#005baa] mt-1'>{item.visitors}</div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* Device Breakdown */}
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <h2 className='text-xl font-bold text-gray-900 mb-4'>Device Breakdown</h2>
                            <div className='space-y-4'>
                                {currentData.deviceBreakdown.map((device, index) => (
                                    <div key={index}>
                                        <div className='flex justify-between items-center mb-2'>
                                            <span className='text-sm font-medium text-gray-700'>{device.device}</span>
                                            <span className='text-sm font-semibold text-[#005baa]'>
                                                {device.count.toLocaleString()} ({device.percentage}%)
                                            </span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-3'>
                                            <div className='bg-[#005baa] h-3 rounded-full transition-all' style={{ width: `${device.percentage}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Traffic Sources - Only show for allTime */}
                    {timePeriod === 'allTime' && (
                        <div className='bg-white rounded-lg shadow-lg p-6'>
                            <h2 className='text-xl font-bold text-gray-900 mb-4'>Traffic Sources</h2>
                            <p className='text-sm text-gray-600 mb-4'>
                                Shows where your visitors are coming from - useful for understanding marketing effectiveness
                            </p>
                            <div className='space-y-4'>
                                {mockData.allTime.trafficSources.map((source, index) => (
                                    <div key={index}>
                                        <div className='flex justify-between items-center mb-2'>
                                            <span className='text-sm font-medium text-gray-700'>{source.source}</span>
                                            <span className='text-sm font-semibold text-[#005baa]'>
                                                {source.count.toLocaleString()} ({source.percentage}%)
                                            </span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2'>
                                            <div className='bg-[#005baa] h-2 rounded-full transition-all' style={{ width: `${source.percentage}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Note */}
                    <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <p className='text-sm text-blue-800'>
                            <strong>Note:</strong> This dashboard is currently showing mock data. When Google Analytics is integrated, this will display real
                            statistics.
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
