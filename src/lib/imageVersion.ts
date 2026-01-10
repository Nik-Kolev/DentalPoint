export const IMAGE_VERSION = process.env.NEXT_PUBLIC_IMAGE_VERSION || '';

export function getImageUrl(path: string): string {
    // Removed version param - causing 404s. Cache headers handle versioning now.
    return path;
}

export { getBlurPlaceholder } from './blurPlaceholders';
