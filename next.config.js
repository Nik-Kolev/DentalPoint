const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [384, 640, 750, 828, 1080, 1920, 2560],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000,
        dangerouslyAllowSVG: false,
        contentDispositionType: 'inline',
    },
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        optimizePackageImports: ['react-world-flags'],
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ],
            },
            {
                source: '/fonts/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
            {
                source: '/Images/(.*)',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
        ];
    },
};

module.exports = withNextIntl(nextConfig);
