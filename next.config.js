/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // AVIF first (smallest, best compression), then WebP fallback
        formats: ['image/avif', 'image/webp'],
        // Optimized device sizes for responsive images
        deviceSizes: [640, 750, 828, 1080, 1200],
        // Image sizes for different use cases
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Cache optimized images for 1 year
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
            {
                // Cache optimized images aggressively
                source: '/_next/image',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
            },
        ];
    },
};

module.exports = nextConfig;
