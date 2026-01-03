import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://209.38.210.38';

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
