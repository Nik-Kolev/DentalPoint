// Image version for cache busting
// Set during build by GitHub Actions workflow
// If not set (dev mode), no version is added (images work normally)
export const IMAGE_VERSION = process.env.NEXT_PUBLIC_IMAGE_VERSION || '';

// Helper function to add version to image URLs
export function getImageUrl(path: string): string {
    return IMAGE_VERSION ? `${path}?v=${IMAGE_VERSION}` : path;
}
