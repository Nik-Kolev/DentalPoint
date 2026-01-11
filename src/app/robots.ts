import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dentalpoint.bg';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/statistics', '/api/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
