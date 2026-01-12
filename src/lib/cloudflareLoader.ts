/**
 * Cloudflare Image Resizing Loader
 *
 * This uses Cloudflare's FREE Image Resizing service (/cdn-cgi/image/).
 * Available on all Cloudflare plans - no paid subscription required!
 *
 * This offloads image optimization to Cloudflare's edge network,
 * reducing server CPU load on your 1 CPU/1GB RAM server.
 *
 * To use this loader, update next.config.js:
 * images: {
 *   loader: 'custom',
 *   loaderFile: './src/lib/cloudflareLoader.ts',
 * }
 *
 * Or use it directly in Image components with the loader prop.
 */

export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // In development, serve images directly from Next.js (with width param to avoid warning)
    if (process.env.NODE_ENV === 'development') {
        // Return src with query param to satisfy Next.js loader requirements
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}w=${width}`;
    }

    const params = [
        `width=${width}`,
        `quality=${quality || 75}`,
        'format=auto',
        'fit=scale-down', // Prevents upscaling - only scales down if image is larger
    ];

    // Remove leading slash if present (Next.js Image paths start with '/')
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;

    return `https://dentalpoint.bg/cdn-cgi/image/${params.join(',')}/${cleanSrc}`;
}
