/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        loader: 'custom',
        loaderFile: './src/lib/cloudflareLoader.ts',
        formats: ['image/avif', 'image/webp'],
        // Optimized device sizes: removed very large ones (1080) to save mobile bandwidth
        deviceSizes: [384, 640, 750, 828, 1080], // 1080 is the "sweet spot" for PC
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Added 384 for slightly larger thumbnails
        minimumCacheTTL: 31536000,
        unoptimized: false,
        dangerouslyAllowSVG: false,
        contentDispositionType: 'inline',
    },
    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    swcMinify: true,
    optimizeFonts: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
        // Essential for modern performance
        optimizePackageImports: [
            '@next-languages/flags',
            'react-world-flags',
            'lucide-react', // Common icons that cause bloat
            '@headlessui/react',
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Add specific caching for fonts to eliminate "Serve static assets with an efficient cache policy" warning
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

module.exports = nextConfig;
