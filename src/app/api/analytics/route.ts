import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
    try {
        const { period } = await request.json();

        // Validate period
        const validPeriods = ['day', 'week', 'month', 'year'];
        if (!validPeriods.includes(period)) {
            return NextResponse.json({ error: 'Invalid period' }, { status: 400 });
        }

        // Check for required environment variables
        const propertyId = process.env.GA4_PROPERTY_ID;
        const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const clientEmail = process.env.GA4_CLIENT_EMAIL;

        if (!propertyId || !privateKey || !clientEmail) {
            console.error('Missing GA4 credentials');
            return NextResponse.json({ error: 'Analytics not configured' }, { status: 500 });
        }

        // Create JWT client
        const jwtClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
        });

        await jwtClient.authorize();

        // Create analytics data client with auth
        const analyticsData = google.analyticsdata({
            version: 'v1beta',
            auth: jwtClient,
        });

        // Calculate date range
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        let startDate: string;

        switch (period) {
            case 'day':
                startDate = endDate;
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                startDate = weekAgo.toISOString().split('T')[0];
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);
                startDate = monthAgo.toISOString().split('T')[0];
                break;
            case 'year':
                const yearAgo = new Date(today);
                yearAgo.setFullYear(today.getFullYear() - 1);
                startDate = yearAgo.toISOString().split('T')[0];
                break;
            default:
                startDate = endDate;
        }

        // Fetch total visitors and sessions
        const [visitorsResponse, deviceResponse, sourceResponse] = await Promise.all([
            analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    metrics: [{ name: 'totalUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }],
                },
            }),
            // Device breakdown
            analyticsData.properties.runReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [{ name: 'deviceCategory' }],
                    metrics: [{ name: 'totalUsers' }],
                },
            }),
            // Traffic sources
            analyticsData.properties.runReport({
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

        // Extract data
        const totalVisitors = parseInt(visitorsResponse.data.rows?.[0]?.metricValues?.[0]?.value || '0');
        const totalPageViews = parseInt(visitorsResponse.data.rows?.[0]?.metricValues?.[1]?.value || '0');
        const totalSessions = parseInt(visitorsResponse.data.rows?.[0]?.metricValues?.[2]?.value || '0');

        // Process device breakdown
        const deviceBreakdown: Array<{ device: string; count: number; percentage: number }> = [];
        const deviceRows = deviceResponse.data.rows || [];
        const totalDeviceUsers = deviceRows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0);

        deviceRows.forEach((row) => {
            const device = row.dimensionValues?.[0]?.value || 'Unknown';
            const count = parseInt(row.metricValues?.[0]?.value || '0');
            const percentage = totalDeviceUsers > 0 ? (count / totalDeviceUsers) * 100 : 0;
            deviceBreakdown.push({
                device: device.charAt(0).toUpperCase() + device.slice(1).toLowerCase(),
                count,
                percentage: Math.round(percentage * 10) / 10,
            });
        });

        // Process traffic sources
        const trafficSources: Array<{ source: string; count: number; percentage: number }> = [];
        const sourceRows = sourceResponse.data.rows || [];
        const totalSourceUsers = sourceRows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0'), 0);

        sourceRows.forEach((row) => {
            const source = row.dimensionValues?.[0]?.value || 'Unknown';
            const count = parseInt(row.metricValues?.[0]?.value || '0');
            const percentage = totalSourceUsers > 0 ? (count / totalSourceUsers) * 100 : 0;

            // Normalize source names
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
            } else {
                normalizedSource = source;
            }

            trafficSources.push({
                source: normalizedSource,
                count,
                percentage: Math.round(percentage * 10) / 10,
            });
        });

        return NextResponse.json({
            totalVisitors,
            totalPageViews,
            uniqueVisitors: totalVisitors,
            totalSessions,
            deviceBreakdown,
            trafficSources,
        });
    } catch (error: any) {
        console.error('Analytics API error:', error);
        // Provide more helpful error messages
        let errorMessage = 'Failed to fetch analytics data';
        if (error.message?.includes('has not been used') || error.message?.includes('is disabled')) {
            errorMessage = 'Google Analytics Data API is not enabled. Please enable it in Google Cloud Console.';
        } else if (error.message?.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied. Please check service account permissions in Google Analytics.';
        }
        return NextResponse.json({ error: errorMessage, details: error.message }, { status: 500 });
    }
}
