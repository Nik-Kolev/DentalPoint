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

    // Translation helpers
    const translateDevice = (device: string): string => {
        const translations: Record<string, string> = {
            Mobile: 'Мобилно',
            Desktop: 'Настолно',
            Tablet: 'Таблет',
        };
        return translations[device] || device;
    };

    const translateSource = (source: string): string => {
        const translations: Record<string, string> = {
            Direct: 'Директно',
            Google: 'Google',
            Facebook: 'Facebook',
            Instagram: 'Instagram',
            Others: 'Други',
        };
        return translations[source] || source;
    };

    const translateTimeLabel = (label: string): string => {
        // Days of week (full names)
        const dayTranslations: Record<string, string> = {
            Mon: 'Понеделник',
            Tue: 'Вторник',
            Wed: 'Сряда',
            Thu: 'Четвъртък',
            Fri: 'Петък',
            Sat: 'Събота',
            Sun: 'Неделя',
            Пон: 'Понеделник',
            Вто: 'Вторник',
            Сря: 'Сряда',
            Чет: 'Четвъртък',
            Пет: 'Петък',
            Съб: 'Събота',
            Нед: 'Неделя',
            Понеделник: 'Понеделник',
            Вторник: 'Вторник',
            Сряда: 'Сряда',
            Четвъртък: 'Четвъртък',
            Петък: 'Петък',
            Събота: 'Събота',
            Неделя: 'Неделя',
        };
        if (dayTranslations[label]) return dayTranslations[label];

        // Date format for monthly view (e.g., "01.12")
        if (/^\d{2}\.\d{2}$/.test(label)) {
            return label;
        }

        // Months
        const monthTranslations: Record<string, string> = {
            Jan: 'Яну',
            Feb: 'Фев',
            Mar: 'Мар',
            Apr: 'Апр',
            May: 'Май',
            Jun: 'Юни',
            Jul: 'Юли',
            Aug: 'Авг',
            Sep: 'Сеп',
            Oct: 'Окт',
            Nov: 'Ное',
            Dec: 'Дек',
        };
        if (monthTranslations[label]) return monthTranslations[label];

        // Years (for alltime view) - return as is
        if (/^\d{4}$/.test(label)) {
            return label;
        }

        return label;
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const analyticsData = await fetchAnalyticsData(timePeriod);
                setData(analyticsData);
            } catch (err: any) {
                console.error('Failed to load analytics:', err);
                setError(err.message || 'Неуспешно зареждане на данни за аналитика');
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

    // Calculate optimal label spacing for time series
    const getLabelSpacing = (dataLength: number, period: TimePeriod): number => {
        if (period === 'week') return 1; // Show all 7 days
        if (period === 'month') return 1; // Show all 30 days
        if (period === 'year') return 1; // Show all 12 months
        if (period === 'alltime') return 1; // Show all years
        return 1;
    };

    return (
        <ProtectedRoute>
            <div className='min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 overflow-x-hidden'>
                <div className='max-w-7xl mx-auto w-full'>
                    {/* Header */}
                    <div className='bg-white rounded-lg shadow-lg p-4 sm:p-5 mb-4 sm:mb-6'>
                        <div className='flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 mb-3 sm:mb-4'>
                            <div>
                                <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>Табло за статистика</h1>
                            </div>
                            <div className='flex gap-2 sm:gap-3 justify-center md:justify-start'>
                                <button
                                    onClick={handleReturnToWebsite}
                                    className='bg-gray-200 text-gray-700 font-semibold py-2 px-4 sm:px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-sm text-sm sm:text-base'
                                >
                                    Назад към сайта
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className='bg-[#005baa] text-white font-semibold py-2 px-4 sm:px-6 rounded-lg hover:bg-[#004a8f] transition-colors duration-200 shadow-sm text-sm sm:text-base'
                                >
                                    Изход
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
                                        {period === 'week'
                                            ? 'Последни 7 дни'
                                            : period === 'month'
                                            ? 'Последни 30 дни'
                                            : period === 'year'
                                            ? 'Последна година'
                                            : 'Целия период'}
                                    </button>
                                ))}
                            </div>
                            {data && (
                                <div className='flex items-center gap-2 text-base sm:text-lg text-gray-700'>
                                    <span className='text-gray-400 hidden sm:inline'>—</span>
                                    <span>
                                        Общо посетители:{' '}
                                        <span className='font-bold text-lg sm:text-xl text-[#005baa]'>{data.totalVisitors.toLocaleString()}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {loading && (
                        <div className='bg-white rounded-lg shadow-lg p-12 text-center'>
                            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#005baa] mb-4'></div>
                            <p className='text-[#005baa]'>Зареждане на данни за аналитика...</p>
                        </div>
                    )}

                    {!loading && !error && data && (
                        <>
                            {/* Visitors Over Time - Full Width */}
                            <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 overflow-hidden'>
                                <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3'>
                                    {timePeriod === 'week'
                                        ? 'Посетители за последните 7 дни'
                                        : timePeriod === 'month'
                                        ? 'Посетители за последните 30 дни'
                                        : timePeriod === 'year'
                                        ? 'Посетители за последната година (по месеци)'
                                        : 'Посетители за целия период (по години)'}
                                </h2>
                                {data.timeSeries && data.timeSeries.length > 0 ? (
                                    timePeriod === 'month' ? (
                                        // Mobile: Split 30 days into 2 rows (1-15 and 16-30)
                                        <div className='space-y-4'>
                                            {/* First half: Days 1-15 */}
                                            <div className='block sm:hidden'>
                                                <h3 className='text-xs sm:text-sm font-semibold text-gray-600 mb-2'>Дни 1-15</h3>
                                                <div className='h-64 flex items-end justify-center gap-1 px-1 pb-2 overflow-hidden'>
                                                    {(data.timeSeries || []).slice(0, 15).map((item, index) => {
                                                        const maxVisitors = Math.max(...(data.timeSeries || []).map((d) => d.visitors), 1);
                                                        const height = (item.visitors / maxVisitors) * 100;
                                                        return (
                                                            <div key={index} className='flex-1 min-w-0 flex flex-col items-center h-full relative group'>
                                                                <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                                    <div
                                                                        className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                        style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '10px' : '0' }}
                                                                    >
                                                                        {height > 20 && (
                                                                            <span className='text-white text-[10px] font-semibold absolute inset-0 flex items-center justify-center'>
                                                                                {item.visitors}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className='text-[9px] text-gray-600 mt-1 text-center font-medium truncate w-full'>
                                                                    {translateTimeLabel(item.label)}
                                                                </div>
                                                                {/* Value is shown inside the bar; avoid duplicating below */}
                                                                {height <= 20 && (
                                                                    <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                                        {translateTimeLabel(item.label)}: {item.visitors.toLocaleString()}
                                                                        <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Second half: Days 16-30 */}
                                            <div className='block sm:hidden'>
                                                <h3 className='text-xs sm:text-sm font-semibold text-gray-600 mb-2'>Дни 16-30</h3>
                                                <div className='h-64 flex items-end justify-center gap-1 px-1 pb-2 overflow-hidden'>
                                                    {(data.timeSeries || []).slice(15).map((item, index) => {
                                                        const maxVisitors = Math.max(...(data.timeSeries || []).map((d) => d.visitors), 1);
                                                        const height = (item.visitors / maxVisitors) * 100;
                                                        return (
                                                            <div key={index} className='flex-1 min-w-0 flex flex-col items-center h-full relative group'>
                                                                <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                                    <div
                                                                        className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                        style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '10px' : '0' }}
                                                                    >
                                                                        {height > 20 && (
                                                                            <span className='text-white text-[10px] font-semibold absolute inset-0 flex items-center justify-center'>
                                                                                {item.visitors}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className='text-[9px] text-gray-600 mt-1 text-center font-medium truncate w-full'>
                                                                    {translateTimeLabel(item.label)}
                                                                </div>
                                                                {/* Value is shown inside the bar; avoid duplicating below */}
                                                                {height <= 20 && (
                                                                    <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                                        {translateTimeLabel(item.label)}: {item.visitors.toLocaleString()}
                                                                        <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Desktop: Full 30 days in one chart (no horizontal scroll) */}
                                            <div className='hidden sm:flex h-64 sm:h-72 items-end justify-center gap-2 sm:gap-3 px-2 sm:px-4 pb-2 overflow-hidden'>
                                                {data.timeSeries?.map((item, index) => {
                                                    const maxVisitors = Math.max(...(data.timeSeries || []).map((d) => d.visitors), 1);
                                                    const height = (item.visitors / maxVisitors) * 100;
                                                    const labelSpacing = getLabelSpacing((data.timeSeries || []).length, timePeriod);
                                                    const showLabel = index % labelSpacing === 0 || index === (data.timeSeries || []).length - 1;
                                                    return (
                                                        <div
                                                            key={index}
                                                            className='flex-1 max-w-[70px] sm:max-w-[80px] flex flex-col items-center h-full relative group'
                                                        >
                                                            <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                                <div
                                                                    className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                    style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '10px' : '0' }}
                                                                >
                                                                    {height > 20 && (
                                                                        <span className='text-white text-xs sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                            {item.visitors}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {showLabel && (
                                                                <div className='text-[10px] sm:text-xs text-gray-600 mt-2 text-center font-medium whitespace-nowrap'>
                                                                    {translateTimeLabel(item.label)}
                                                                </div>
                                                            )}
                                                            {/* Value is shown inside the bar; avoid duplicating below */}
                                                            {height <= 20 && (
                                                                <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                                    {translateTimeLabel(item.label)}: {item.visitors.toLocaleString()}
                                                                    <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        // Other periods: week, year, alltime
                                        <div className='h-64 sm:h-72 flex items-end justify-center gap-1 sm:gap-6 px-1 sm:px-4 pb-2 overflow-hidden'>
                                            {(data.timeSeries || []).map((item, index) => {
                                                const maxVisitors = Math.max(...(data.timeSeries || []).map((d) => d.visitors), 1);
                                                const height = (item.visitors / maxVisitors) * 100;
                                                const labelSpacing = getLabelSpacing((data.timeSeries || []).length, timePeriod);
                                                const showLabel = index % labelSpacing === 0 || index === (data.timeSeries || []).length - 1;
                                                const maxWidthClass =
                                                    timePeriod === 'week'
                                                        ? 'sm:max-w-[140px]'
                                                        : timePeriod === 'year'
                                                        ? 'sm:max-w-[120px]'
                                                        : 'sm:max-w-[140px]';
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex-1 min-w-0 ${maxWidthClass} flex flex-col items-center h-full relative group`}
                                                    >
                                                        <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                style={{ height: `${height}%`, minHeight: item.visitors > 0 ? '10px' : '0' }}
                                                            >
                                                                {height > 20 && (
                                                                    <span className='text-white text-[10px] sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {item.visitors}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {showLabel && (
                                                            <div className='text-[9px] sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center font-medium truncate w-full sm:whitespace-nowrap'>
                                                                {translateTimeLabel(item.label)}
                                                            </div>
                                                        )}
                                                        {/* Value is shown inside the bar; avoid duplicating below */}
                                                        {height <= 20 && (
                                                            <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                                {translateTimeLabel(item.label)}: {item.visitors.toLocaleString()}
                                                                <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                ) : (
                                    <p className='text-gray-500 text-sm'>Няма налични данни за времеви ред</p>
                                )}
                            </div>

                            {/* Device and Traffic Sources - Side by Side */}
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 items-start'>
                                {/* Device Breakdown */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-hidden'>
                                    <h2 className='text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3'>Посетители по устройства</h2>
                                    <div className='h-64 sm:h-72 flex items-end justify-center gap-1 sm:gap-6 px-1 sm:px-4 pb-2 overflow-hidden'>
                                        {data.deviceBreakdown.length > 0 ? (
                                            data.deviceBreakdown.map((device, index) => {
                                                const maxCount = Math.max(...data.deviceBreakdown.map((d) => d.count), 1);
                                                const height = (device.count / maxCount) * 100;
                                                return (
                                                    <div
                                                        key={index}
                                                        className='flex-1 min-w-0 sm:max-w-[140px] flex flex-col items-center h-full relative group'
                                                    >
                                                        <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                style={{ height: `${height}%`, minHeight: device.count > 0 ? '10px' : '0' }}
                                                            >
                                                                {height > 20 && (
                                                                    <span className='text-white text-[10px] sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {device.percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-[9px] sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center font-medium truncate w-full sm:whitespace-nowrap'>
                                                            {translateDevice(device.device)}
                                                        </div>
                                                        <div className='text-[9px] sm:text-sm font-semibold text-[#005baa] mt-0.5 sm:mt-1'>
                                                            {device.count.toLocaleString()}
                                                        </div>
                                                        {/* Tooltip for small bars */}
                                                        <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                            {translateDevice(device.device)}: {device.count.toLocaleString()} ({device.percentage}%)
                                                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className='text-gray-500 text-sm'>Няма налични данни за устройства</p>
                                        )}
                                    </div>
                                </div>

                                {/* Traffic Sources */}
                                <div className='bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-5 overflow-hidden'>
                                    <div className='flex items-center gap-2 mb-2 sm:mb-3'>
                                        <h2 className='text-base sm:text-lg font-bold text-gray-900'>Източници на трафик</h2>
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
                                                        <strong>Директно:</strong> Въведен адрес на сайта директно в браузъра
                                                    </div>
                                                    <div>
                                                        <strong>Google:</strong> Кликнато от резултатите в Google (напр. "зъболекар варна")
                                                    </div>
                                                    <div>
                                                        <strong>Facebook/Instagram:</strong> Кликнато от публикации или реклами в социалните мрежи
                                                    </div>
                                                    <div>
                                                        <strong>Други:</strong> Всички други източници на трафик
                                                    </div>
                                                </div>
                                                <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-64 sm:h-72 flex items-end justify-center gap-1 sm:gap-6 px-1 sm:px-4 pb-2 overflow-hidden'>
                                        {data.trafficSources && data.trafficSources.length > 0 ? (
                                            data.trafficSources.map((source, index) => {
                                                const maxCount = Math.max(...data.trafficSources!.map((s) => s.count), 1);
                                                const height = (source.count / maxCount) * 100;
                                                return (
                                                    <div
                                                        key={index}
                                                        className='flex-1 min-w-0 sm:max-w-[120px] flex flex-col items-center h-full relative group'
                                                    >
                                                        <div className='w-full flex flex-col items-center justify-end h-full overflow-hidden'>
                                                            <div
                                                                className='w-full bg-[#005baa] rounded-t-md transition-all hover:bg-[#004a8f] cursor-pointer relative overflow-hidden'
                                                                style={{ height: `${height}%`, minHeight: source.count > 0 ? '10px' : '0' }}
                                                            >
                                                                {height > 20 && (
                                                                    <span className='text-white text-[10px] sm:text-sm font-semibold absolute inset-0 flex items-center justify-center'>
                                                                        {source.percentage}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-[9px] sm:text-sm text-gray-600 mt-1 sm:mt-2 text-center font-medium truncate w-full sm:whitespace-nowrap'>
                                                            {translateSource(source.source)}
                                                        </div>
                                                        <div className='text-[9px] sm:text-sm font-semibold text-[#005baa] mt-0.5 sm:mt-1'>
                                                            {source.count.toLocaleString()}
                                                        </div>
                                                        {/* Tooltip for small bars */}
                                                        <div className='invisible group-hover:visible absolute -top-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none'>
                                                            {translateSource(source.source)}: {source.count.toLocaleString()} ({source.percentage}%)
                                                            <div className='absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900'></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className='text-gray-500 text-sm'>Няма налични данни за източници на трафик</p>
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
