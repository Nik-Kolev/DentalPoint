export const IMAGE_VERSION = process.env.NEXT_PUBLIC_IMAGE_VERSION || '';

export function getImageUrl(path: string): string {
    return IMAGE_VERSION ? `${path}?v=${IMAGE_VERSION}` : path;
}

export { getBlurPlaceholder } from './blurPlaceholders';
