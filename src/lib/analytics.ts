// Mock data for statistics - GA API will be enabled later
export interface AnalyticsData {
    totalVisitors: number;
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions?: number;
    timeSeries?: Array<{ label: string; visitors: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
    trafficSources?: Array<{ source: string; count: number; percentage: number }>;
}

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

// Mock data for different time periods
const mockData: Record<TimePeriod, AnalyticsData> = {
    day: {
        totalVisitors: 45,
        totalPageViews: 67,
        uniqueVisitors: 38,
        deviceBreakdown: [
            { device: 'Mobile', count: 29, percentage: 64.4 },
            { device: 'Desktop', count: 16, percentage: 35.6 },
        ],
        trafficSources: [
            { source: 'Direct', count: 18, percentage: 40.0 },
            { source: 'Google', count: 15, percentage: 33.3 },
            { source: 'Facebook', count: 8, percentage: 17.8 },
            { source: 'Instagram', count: 4, percentage: 8.9 },
        ],
    },
    week: {
        totalVisitors: 312,
        totalPageViews: 467,
        uniqueVisitors: 245,
        timeSeries: [
            { label: 'Mon', visitors: 38 },
            { label: 'Tue', visitors: 45 },
            { label: 'Wed', visitors: 42 },
            { label: 'Thu', visitors: 51 },
            { label: 'Fri', visitors: 48 },
            { label: 'Sat', visitors: 44 },
            { label: 'Sun', visitors: 44 },
        ],
        deviceBreakdown: [
            { device: 'Mobile', count: 203, percentage: 65.1 },
            { device: 'Desktop', count: 109, percentage: 34.9 },
        ],
        trafficSources: [
            { source: 'Direct', count: 125, percentage: 40.1 },
            { source: 'Google', count: 98, percentage: 31.4 },
            { source: 'Facebook', count: 56, percentage: 17.9 },
            { source: 'Instagram', count: 28, percentage: 9.0 },
            { source: 'Others', count: 5, percentage: 1.6 },
        ],
    },
    month: {
        totalVisitors: 1240,
        totalPageViews: 1890,
        uniqueVisitors: 980,
        timeSeries: [
            { label: 'Week 1', visitors: 280 },
            { label: 'Week 2', visitors: 310 },
            { label: 'Week 3', visitors: 295 },
            { label: 'Week 4', visitors: 355 },
        ],
        deviceBreakdown: [
            { device: 'Mobile', count: 806, percentage: 65.0 },
            { device: 'Desktop', count: 434, percentage: 35.0 },
        ],
        trafficSources: [
            { source: 'Direct', count: 456, percentage: 36.8 },
            { source: 'Google', count: 389, percentage: 31.4 },
            { source: 'Facebook', count: 223, percentage: 18.0 },
            { source: 'Instagram', count: 112, percentage: 9.0 },
            { source: 'Others', count: 60, percentage: 4.8 },
        ],
    },
    year: {
        totalVisitors: 12450,
        totalPageViews: 18720,
        uniqueVisitors: 8920,
        timeSeries: [
            { label: 'Jan', visitors: 980 },
            { label: 'Feb', visitors: 1020 },
            { label: 'Mar', visitors: 1100 },
            { label: 'Apr', visitors: 1050 },
            { label: 'May', visitors: 1150 },
            { label: 'Jun', visitors: 1080 },
            { label: 'Jul', visitors: 1200 },
            { label: 'Aug', visitors: 1180 },
            { label: 'Sep', visitors: 1120 },
            { label: 'Oct', visitors: 1250 },
            { label: 'Nov', visitors: 1180 },
            { label: 'Dec', visitors: 1040 },
        ],
        deviceBreakdown: [
            { device: 'Mobile', count: 8093, percentage: 65.0 },
            { device: 'Desktop', count: 4357, percentage: 35.0 },
        ],
        trafficSources: [
            { source: 'Direct', count: 4560, percentage: 36.6 },
            { source: 'Google', count: 3890, percentage: 31.2 },
            { source: 'Facebook', count: 2340, percentage: 18.8 },
            { source: 'Instagram', count: 1120, percentage: 9.0 },
            { source: 'Others', count: 540, percentage: 4.3 },
        ],
    },
};

/**
 * Fetch analytics data - using mock data for now
 * TODO: Enable GA API later
 */
export async function fetchAnalyticsData(period: TimePeriod): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = mockData[period];

    // Combine tablet into mobile and sort by count (bigger first)
    const deviceMap = new Map<string, { device: string; count: number; percentage: number }>();
    data.deviceBreakdown.forEach((item) => {
        const deviceName = item.device === 'Tablet' ? 'Mobile' : item.device;
        if (deviceMap.has(deviceName)) {
            const existing = deviceMap.get(deviceName)!;
            existing.count += item.count;
        } else {
            deviceMap.set(deviceName, { device: deviceName, count: item.count, percentage: 0 });
        }
    });

    // Calculate percentages and sort by count (bigger first)
    const totalDeviceCount = Array.from(deviceMap.values()).reduce((sum, d) => sum + d.count, 0);
    const deviceBreakdown = Array.from(deviceMap.values())
        .map((d) => ({
            ...d,
            percentage: totalDeviceCount > 0 ? Math.round((d.count / totalDeviceCount) * 100 * 10) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count);

    // Sort traffic sources by count (bigger first)
    const trafficSources = data.trafficSources ? [...data.trafficSources].sort((a, b) => b.count - a.count) : undefined;

    return {
        ...data,
        deviceBreakdown,
        trafficSources,
    };
}

/**
 * Helper function to format GA4 date range based on period
 */
export function getDateRange(period: TimePeriod): { startDate: string; endDate: string } {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

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
    }

    return { startDate, endDate };
}
