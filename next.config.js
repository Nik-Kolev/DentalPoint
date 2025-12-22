/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000,
        unoptimized: false,
        // Aggressive compression for faster loading
        dangerouslyAllowSVG: false,
        contentDispositionType: 'inline',
    },
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle
    swcMinify: true, // Use SWC minifier for better performance
    // Optimize CSS loading
    optimizeFonts: true,
    experimental: {
        optimizePackageImports: ['@next-languages/flags', 'react-world-flags'], // Tree-shake unused exports
    },
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
