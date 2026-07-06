'use client';

// Offloads image optimization to Cloudflare's edge network — this server's only 1 CPU/1GB RAM,
// too little to run Next's built-in image optimizer at real traffic volume.

export default function cloudflareLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // In development, serve images directly from Next.js (with width param to avoid warning)
    if (process.env.NODE_ENV === 'development') {
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
