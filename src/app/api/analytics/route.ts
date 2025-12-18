import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import type { TimePeriod, AnalyticsData } from '@/lib/analytics';
import { getDateRange } from '@/lib/analytics';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CachedEntry = {
    timestamp: number;
    data: AnalyticsData;
};

const analyticsCache: Partial<Record<TimePeriod, CachedEntry>> = {};

export async function POST(request: NextRequest) {
    try {
        const { period } = (await request.json()) as { period: TimePeriod };

        const validPeriods: TimePeriod[] = ['day', 'week', 'month', 'year', 'alltime'];
        if (!validPeriods.includes(period)) {
            return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
        }

        const cached = analyticsCache[period];
        const now = Date.now();
        if (cached && now - cached.timestamp < CACHE_TTL_MS) {
            return NextResponse.json(cached.data);
        }

        const propertyId = process.env.GA4_PROPERTY_ID;
        const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.GA4_CLIENT_EMAIL;

        if (!propertyId || !privateKey || !clientEmail) {
            console.error('Missing GA4 credentials');
            return NextResponse.json({ error: 'Analytics not configured' }, { status: 500 });
        }

        const jwtClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        });

        await jwtClient.authorize();

        const analyticsDataClient = google.analyticsdata({
            version: 'v1beta',
            auth: jwtClient,
        });

        const { startDate, endDate } = getDateRange(period);

        const [visitorsResponse, deviceResponse, sourceResponse, timeSeriesResponse] = await Promise.all([
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }],
                },
            }),
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [{ name: 'deviceCategory' }],
                    metrics: [{ name: 'totalUsers' }],
                },
            }),
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [{ name: 'sessionSource' }],
                    metrics: [{ name: 'totalUsers' }],
                    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
                    limit: '10',
                },
            }),
            analyticsDataClient.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [{ name: period === 'alltime' ? 'year' : period === 'year' ? 'month' : 'date' }],
                    metrics: [{ name: 'totalUsers' }],
                    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: false }],
                },
            }),
        ]);

        const totalVisitors = parseInt(visitorsResponse.data.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
        const totalPageViews = parseInt(visitorsResponse.data.rows?.[0]?.metricValues?.[1]?.value || '0', 10);
        const totalSessions = parseInt(visitorsResponse.data.rows?.[0]?.metricValues?.[2]?.value || '0', 10);

        const deviceBreakdown: Array<{ device: string; count: number; percentage: number }> = [];
        const deviceRows = deviceResponse.data.rows || [];
        const totalDeviceUsers = deviceRows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0', 10), 0);

        deviceRows.forEach((row) => {
            const device = row.dimensionValues?.[0]?.value || 'Unknown';
            const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
            const percentage = totalDeviceUsers > 0 ? (count / totalDeviceUsers) * 100 : 0;
            deviceBreakdown.push({
                device: device.charAt(0).toUpperCase() + device.slice(1).toLowerCase(),
                count,
                percentage: Math.round(percentage * 10) / 10,
            });
        });

        const trafficSources: Array<{ source: string; count: number; percentage: number }> = [];
        const sourceRows = sourceResponse.data.rows || [];
        const totalSourceUsers = sourceRows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0', 10), 0);

        sourceRows.forEach((row) => {
            const source = row.dimensionValues?.[0]?.value || 'Unknown';
            const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
            const percentage = totalSourceUsers > 0 ? (count / totalSourceUsers) * 100 : 0;

            let normalizedSource = source;
            if (source === '(direct)') {
                normalizedSource = 'Direct';
            } else if (source.toLowerCase().includes('google')) {
                normalizedSource = 'Google';
            } else if (source.toLowerCase().includes('facebook')) {
                normalizedSource = 'Facebook';
            } else if (source.toLowerCase().includes('instagram')) {
                normalizedSource = 'Instagram';
            } else if (source.toLowerCase().includes('twitter') || source.toLowerCase().includes('x.com')) {
                normalizedSource = 'Twitter/X';
            }

            trafficSources.push({
                source: normalizedSource,
                count,
                percentage: Math.round(percentage * 10) / 10,
            });
        });

        const timeSeriesRows = timeSeriesResponse.data.rows || [];
        const timeSeries: NonNullable<AnalyticsData['timeSeries']> = timeSeriesRows.map((row) => {
            const raw = row.dimensionValues?.[0]?.value || '';
            const value = parseInt(row.metricValues?.[0]?.value || '0', 10);

            let label = raw;

            if (period === 'week' || period === 'month' || period === 'day') {
                if (/^\d{8}$/.test(raw)) {
                    const year = parseInt(raw.slice(0, 4), 10);
                    const month = parseInt(raw.slice(4, 6), 10) - 1;
                    const day = parseInt(raw.slice(6, 8), 10);
                    const date = new Date(year, month, day);

                    if (period === 'week') {
                        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                        label = dayNames[date.getDay()];
                    } else {
                        const dd = String(day).padStart(2, '0');
                        const mm = String(month + 1).padStart(2, '0');
                        label = `${dd}.${mm}`;
                    }
                }
            } else if (period === 'year') {
                if (/^\d{6}$/.test(raw)) {
                    const monthIndex = parseInt(raw.slice(4, 6), 10) - 1;
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    label = months[Math.max(0, Math.min(11, monthIndex))];
                }
            } else if (period === 'alltime') {
                if (/^\d{4}$/.test(raw)) {
                    label = raw;
                }
            }

            return { label, visitors: value };
        });

        const responseData: AnalyticsData = {
            totalVisitors,
            totalPageViews,
            uniqueVisitors: totalVisitors,
            totalSessions,
            timeSeries,
            deviceBreakdown,
            trafficSources,
        };

        analyticsCache[period] = {
            timestamp: now,
            data: responseData,
        };

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error('Analytics API error:', error);
        let errorMessage = 'Failed to fetch analytics data';
        if (error.message?.includes('has not been used') || error.message?.includes('is disabled')) {
            errorMessage = 'Google Analytics Data API is not enabled. Please enable it in Google Cloud Console.';
        } else if (error.message?.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied. Please check service account permissions in Google Analytics.';
        }
        return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
    }
}
