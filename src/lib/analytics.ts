import { toSofiaDateString } from '@/lib/format';

export interface AnalyticsData {
    totalVisitors: number;
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions?: number;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
    trafficSources?: Array<{ source: string; count: number; percentage: number }>;
}

export type TimePeriod = 'week' | 'month';

export async function fetchAnalyticsData(period: TimePeriod): Promise<AnalyticsData> {
    const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch analytics data');
    }

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
}

export function getDateRange(period: TimePeriod): { startDate: string; endDate: string } {
    const end = new Date(`${toSofiaDateString(new Date())}T00:00:00Z`);
    // Use yesterday as the end date so we only include full days
    end.setUTCDate(end.getUTCDate() - 1);
    const endDate = end.toISOString().split('T')[0];

    let startDate: string;
    switch (period) {
        case 'week': {
            // Last 7 days from yesterday, including yesterday
            const weekAgo = new Date(end);
            weekAgo.setUTCDate(end.getUTCDate() - 6);
            startDate = weekAgo.toISOString().split('T')[0];
            break;
        }
        case 'month': {
            // Last 30 full days including endDate
            const monthAgo = new Date(end);
            monthAgo.setUTCDate(end.getUTCDate() - 29);
            startDate = monthAgo.toISOString().split('T')[0];
            break;
        }
    }

    return { startDate, endDate };
}
