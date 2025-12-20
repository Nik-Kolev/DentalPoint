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

export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'alltime';

/**
 * Generate realistic time series data with growth patterns
 */
function generateTimeSeries(period: TimePeriod): Array<{ label: string; visitors: number }> {
    const today = new Date();
    const timeSeries: Array<{ label: string; visitors: number }> = [];

    if (period === 'week') {
        // Past 7 full days (excluding today) - show some variation
        const dayNames = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];
        const baseVisitors = 40;
        const baseDate = new Date(today);
        baseDate.setDate(baseDate.getDate() - 1); // Use yesterday as the latest day
        for (let i = 6; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() - i);
            const dayName = dayNames[date.getDay()];
            // Weekend typically lower, weekdays higher with some variation
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const variation = isWeekend ? -8 : 5;
            const trend = Math.sin((6 - i) * 0.5) * 3; // Subtle trend
            const visitors = Math.max(20, Math.floor(baseVisitors + variation + trend + (Math.random() * 10 - 5)));
            timeSeries.push({ label: dayName, visitors });
        }
    } else if (period === 'month') {
        // Past 30 full days (excluding today) - show growth trend
        const baseVisitors = 35;
        const growthRate = 0.5; // Slight growth per day
        const baseDate = new Date(today);
        baseDate.setDate(baseDate.getDate() - 1); // Use yesterday as the latest day
        for (let i = 29; i >= 0; i--) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() - i);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const label = `${day}.${month}`;
            // Growth trend + weekly pattern + random variation
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const weeklyPattern = isWeekend ? -5 : 0;
            const trend = (29 - i) * growthRate;
            const variation = Math.random() * 12 - 6;
            const visitors = Math.max(15, Math.floor(baseVisitors + trend + weeklyPattern + variation));
            timeSeries.push({ label, visitors });
        }
    } else if (period === 'year') {
        // Past 365 days grouped by month - show seasonal patterns
        const monthMap = new Map<string, number>();
        const monthOrder: string[] = [];

        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(today.getMonth() - i);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
            if (!monthOrder.includes(monthKey)) {
                monthOrder.push(monthKey);
            }
        }

        // Generate daily data with seasonal patterns
        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
            const monthIndex = monthOrder.indexOf(monthKey);

            // Seasonal pattern: higher in spring/summer, lower in winter
            const seasonalFactor = Math.sin((monthIndex / 12) * 2 * Math.PI - Math.PI / 2) * 0.15 + 1;
            const baseDaily = 25;
            const dailyVisitors = Math.floor(baseDaily * seasonalFactor + (Math.random() * 8 - 4));

            const current = monthMap.get(monthKey) || 0;
            monthMap.set(monthKey, current + Math.max(1, dailyVisitors));
        }

        monthOrder.forEach((month) => {
            if (monthMap.has(month)) {
                timeSeries.push({ label: month, visitors: monthMap.get(month)! });
            }
        });
    } else if (period === 'alltime') {
        // Years - show clear growth trend
        const currentYear = today.getFullYear();
        for (let year = 2022; year <= currentYear; year++) {
            const yearsSinceStart = year - 2022;
            // Exponential growth pattern
            const baseGrowth = 5000;
            const growthFactor = 1.3;
            const baseVisitors = baseGrowth * Math.pow(growthFactor, yearsSinceStart);
            const visitors = Math.floor(baseVisitors + (Math.random() * baseVisitors * 0.2 - baseVisitors * 0.1));
            timeSeries.push({ label: String(year), visitors });
        }
    }

    return timeSeries;
}

/**
 * Generate device breakdown based on period and total visitors
 */
function generateDeviceBreakdown(totalVisitors: number, period: TimePeriod): Array<{ device: string; count: number; percentage: number }> {
    // Mobile percentage varies slightly by period (more mobile on weekends/evenings)
    const mobileBase = period === 'week' ? 0.68 : period === 'month' ? 0.66 : 0.65;
    const mobileVariation = Math.random() * 0.06 - 0.03;
    const mobilePercentage = Math.max(0.55, Math.min(0.75, mobileBase + mobileVariation));

    const mobileCount = Math.floor(totalVisitors * mobilePercentage);
    const desktopCount = totalVisitors - mobileCount;

    return [
        {
            device: 'Mobile',
            count: mobileCount,
            percentage: Math.round((mobileCount / totalVisitors) * 100 * 10) / 10,
        },
        {
            device: 'Desktop',
            count: desktopCount,
            percentage: Math.round((desktopCount / totalVisitors) * 100 * 10) / 10,
        },
    ].sort((a, b) => b.count - a.count);
}

/**
 * Generate traffic sources based on period and total visitors
 */
function generateTrafficSources(totalVisitors: number, period: TimePeriod): Array<{ source: string; count: number; percentage: number }> {
    // Sources vary by period - social media more active on weekends
    const isShortPeriod = period === 'week' || period === 'month';
    const socialFactor = isShortPeriod ? 1.1 : 1.0;

    const directBase = 0.38;
    const googleBase = 0.32;
    const facebookBase = 0.18 * socialFactor;
    const instagramBase = 0.09 * socialFactor;
    const othersBase = 0.03;

    // Add some variation
    const variation = Math.random() * 0.1 - 0.05;
    const directPct = Math.max(0.3, Math.min(0.45, directBase + variation));
    const googlePct = Math.max(0.25, Math.min(0.38, googleBase + variation * 0.5));
    const facebookPct = Math.max(0.12, Math.min(0.25, facebookBase + variation * 0.3));
    const instagramPct = Math.max(0.06, Math.min(0.15, instagramBase + variation * 0.3));
    const othersPct = 1 - directPct - googlePct - facebookPct - instagramPct;

    return [
        { source: 'Direct', count: Math.floor(totalVisitors * directPct), percentage: Math.round(directPct * 100 * 10) / 10 },
        { source: 'Google', count: Math.floor(totalVisitors * googlePct), percentage: Math.round(googlePct * 100 * 10) / 10 },
        { source: 'Facebook', count: Math.floor(totalVisitors * facebookPct), percentage: Math.round(facebookPct * 100 * 10) / 10 },
        { source: 'Instagram', count: Math.floor(totalVisitors * instagramPct), percentage: Math.round(instagramPct * 100 * 10) / 10 },
        { source: 'Others', count: Math.floor(totalVisitors * othersPct), percentage: Math.round(othersPct * 100 * 10) / 10 },
    ]
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count);
}

/**
 * Fetch analytics data - using mock data for now
 * TODO: Enable GA API later
 */
export async function fetchAnalyticsData(period: TimePeriod): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const timeSeries = generateTimeSeries(period);
    const totalVisitors = timeSeries.reduce((sum, item) => sum + item.visitors, 0);
    const deviceBreakdown = generateDeviceBreakdown(totalVisitors, period);
    const trafficSources = generateTrafficSources(totalVisitors, period);

    const data: AnalyticsData = {
        totalVisitors,
        totalPageViews: Math.floor(totalVisitors * 1.5),
        uniqueVisitors: Math.floor(totalVisitors * 0.8),
        timeSeries,
        deviceBreakdown,
        trafficSources,
    };

    return data;
}

/**
 * Helper function to format GA4 date range based on period
 */
export function getDateRange(period: TimePeriod): { startDate: string; endDate: string } {
    const today = new Date();
    const end = new Date(today);
    // Use yesterday as the end date so we only include full days
    end.setDate(end.getDate() - 1);
    const endDate = end.toISOString().split('T')[0]; // YYYY-MM-DD

    let startDate: string;
    switch (period) {
        case 'day':
            startDate = endDate;
            break;
        case 'week':
            // Last 7 full days including endDate
            const weekAgo = new Date(end);
            weekAgo.setDate(end.getDate() - 6);
            startDate = weekAgo.toISOString().split('T')[0];
            break;
        case 'month':
            // Last 30 full days including endDate
            const monthAgo = new Date(end);
            monthAgo.setDate(end.getDate() - 29);
            startDate = monthAgo.toISOString().split('T')[0];
            break;
        case 'year':
            // Last 365 full days including endDate
            const yearAgo = new Date(end);
            yearAgo.setDate(end.getDate() - 364);
            startDate = yearAgo.toISOString().split('T')[0];
            break;
        case 'alltime':
            // All time - use a far back date
            startDate = '2022-01-01';
            break;
    }

    return { startDate, endDate };
}
