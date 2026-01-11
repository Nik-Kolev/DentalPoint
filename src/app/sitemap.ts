import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dentalpoint.bg';
    const currentDate = new Date().toISOString();

    return [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/bg`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/en`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/bg/contact`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/contact`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bg/team`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/en/team`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/bg/gallery`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/en/gallery`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];
}
