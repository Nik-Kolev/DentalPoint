import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import type { TimePeriod, AnalyticsData } from '@/lib/analytics';
import { getDateRange } from '@/lib/analytics';
import { requireAdmin } from '@/lib/admin-auth';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CachedEntry = {
    timestamp: number;
    data: AnalyticsData;
};

const analyticsCache: Partial<Record<TimePeriod, CachedEntry>> = {};

export async function POST(request: NextRequest) {
    const deny = await requireAdmin();
    if (deny) return deny;

    try {
        const { period } = (await request.json()) as { period: TimePeriod };

        const validPeriods: TimePeriod[] = ['week', 'month'];
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

        const [visitorsResponse, deviceResponse, sourceResponse] = await Promise.all([
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

        // GA4 can return several distinct raw sessionSource values that normalize to the
        // same label (e.g. two different Google referrer strings both becoming "Google") —
        // group by normalized label first, so each label appears once with a summed count.
        const sourceCounts = new Map<string, number>();
        sourceRows.forEach((row) => {
            const source = row.dimensionValues?.[0]?.value || 'Unknown';
            const count = parseInt(row.metricValues?.[0]?.value || '0', 10);

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

            sourceCounts.set(normalizedSource, (sourceCounts.get(normalizedSource) || 0) + count);
        });

        sourceCounts.forEach((count, source) => {
            const percentage = totalSourceUsers > 0 ? (count / totalSourceUsers) * 100 : 0;
            trafficSources.push({
                source,
                count,
                percentage: Math.round(percentage * 10) / 10,
            });
        });

        trafficSources.sort((a, b) => b.count - a.count);

        const responseData: AnalyticsData = {
            totalVisitors,
            totalPageViews,
            uniqueVisitors: totalVisitors,
            totalSessions,
            deviceBreakdown,
            trafficSources,
        };

        analyticsCache[period] = {
            timestamp: now,
            data: responseData,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Analytics API error:', error);
        const message = error instanceof Error ? error.message : undefined;
        let errorMessage = 'Failed to fetch analytics data';
        if (message?.includes('has not been used') || message?.includes('is disabled')) {
            errorMessage = 'Google Analytics Data API is not enabled. Please enable it in Google Cloud Console.';
        } else if (message?.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied. Please check service account permissions in Google Analytics.';
        }
        return NextResponse.json({ error: errorMessage, details: message }, { status: 500 });
    }
}
