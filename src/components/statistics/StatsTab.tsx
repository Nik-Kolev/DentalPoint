'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchAnalyticsData, type AnalyticsData, type TimePeriod } from '@/lib/analytics';

const PERIODS: TimePeriod[] = ['week', 'month'];

interface WindowData {
    period: TimePeriod;
    data: AnalyticsData | null;
    errorMessage?: string;
}

export default function StatsTab() {
    const t = useTranslations('statistics');
    const [windows, setWindows] = useState<WindowData[]>(PERIODS.map((period) => ({ period, data: null })));
    const [loading, setLoading] = useState(true);

    const translateDevice = (device: string): string => (t.raw('device') as Record<string, string>)[device] ?? device;
    const translateSource = (source: string): string => (t.raw('source') as Record<string, string>)[source] ?? source;

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            const results = await Promise.all(
                PERIODS.map(async (period) => {
                    try {
                        const data = await fetchAnalyticsData(period);
                        return { period, data };
                    } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : undefined;
                        return { period, data: null, errorMessage };
                    }
                })
            );
            if (!cancelled) {
                setWindows(results);
                setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-12 text-center'>
                <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--dp-primary)] mb-4'></div>
                <p className='text-[var(--dp-primary)]'>{t('loading')}</p>
            </div>
        );
    }

    return (
        <div className='space-y-4 sm:space-y-6'>
            {windows.map(({ period, data, errorMessage }) => (
                <div key={period} className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-4 sm:p-6'>
                    <h2 className='text-lg sm:text-xl font-bold text-[var(--dp-heading)] mb-4'>{t(`period.${period}` as 'period.week')}</h2>

                    {data === null ? (
                        <p className='text-red-500 text-sm'>{errorMessage || t('loadError')}</p>
                    ) : data ? (
                        <div className='space-y-5'>
                            <div className='text-center'>
                                <p className='text-sm text-gray-500'>{t('totalVisitors')}</p>
                                <p className='text-3xl sm:text-4xl font-bold text-[var(--dp-primary)]'>{data.totalVisitors.toLocaleString()}</p>
                            </div>

                            <div>
                                <h3 className='text-sm font-semibold text-gray-600 mb-2'>{t('deviceChart')}</h3>
                                {data.deviceBreakdown.length > 0 ? (
                                    <div className='space-y-2'>
                                        {data.deviceBreakdown.map((device) => (
                                            <div key={device.device} className='flex items-center gap-3'>
                                                <span className='text-sm text-gray-600 w-20 shrink-0'>{translateDevice(device.device)}</span>
                                                <div className='flex-1 h-3 bg-gray-100 rounded-full overflow-hidden'>
                                                    <div
                                                        className='h-full bg-[var(--dp-primary)] rounded-full'
                                                        style={{ width: `${device.percentage}%` }}
                                                    />
                                                </div>
                                                <span className='text-sm font-semibold text-[var(--dp-primary)] w-20 text-right shrink-0 whitespace-nowrap'>
                                                    {device.percentage}% ({device.count})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-gray-500 text-sm'>{t('noDeviceData')}</p>
                                )}
                            </div>

                            <div>
                                <h3 className='text-sm font-semibold text-gray-600 mb-2'>{t('sourceChart')}</h3>
                                {data.trafficSources && data.trafficSources.length > 0 ? (
                                    <div className='space-y-2'>
                                        {data.trafficSources.map((source) => (
                                            <div key={source.source} className='flex items-center gap-3'>
                                                <span className='text-sm text-gray-600 w-20 shrink-0'>{translateSource(source.source)}</span>
                                                <div className='flex-1 h-3 bg-gray-100 rounded-full overflow-hidden'>
                                                    <div
                                                        className='h-full bg-[var(--dp-accent)] rounded-full'
                                                        style={{ width: `${source.percentage}%` }}
                                                    />
                                                </div>
                                                <span className='text-sm font-semibold text-[var(--dp-accent)] w-20 text-right shrink-0 whitespace-nowrap'>
                                                    {source.percentage}% ({source.count})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-gray-500 text-sm'>{t('noSourceData')}</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            ))}

            <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-4'>
                <div className='flex items-start gap-2 text-xs text-gray-500'>
                    <svg className='w-4 h-4 shrink-0 mt-0.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z'
                        />
                    </svg>
                    <span>
                        <strong>{t('sourceTooltipLabel.direct')}</strong> {t('sourceTooltip.direct')} · <strong>{t('sourceTooltipLabel.google')}</strong>{' '}
                        {t('sourceTooltip.google')} · <strong>{t('sourceTooltipLabel.social')}</strong> {t('sourceTooltip.social')} ·{' '}
                        <strong>{t('sourceTooltipLabel.others')}</strong> {t('sourceTooltip.others')}
                    </span>
                </div>
            </div>
        </div>
    );
}
