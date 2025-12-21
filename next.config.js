/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        unoptimized: false,
    },
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
    // Skip linting during production builds (faster, lint locally/CI instead)
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Skip type checking during production builds (faster, check locally/CI instead)
    typescript: {
        ignoreBuildErrors: false, // Keep false to catch real errors, but can set true if needed
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
        ];
    },
};

module.exports = nextConfig;
