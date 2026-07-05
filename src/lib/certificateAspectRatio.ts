// Certificates store their exact measured aspect ratio (set at upload time in
// actions/gallery.ts from real pixel dimensions), but CSS Grid gives every card in a
// row the same width — so deriving each card's height from its own exact ratio makes
// same-orientation cards render at slightly different heights. Snapping to one ratio
// per orientation makes every landscape card (and every portrait card) an identical
// box. These two values are the most common exact measurement already present across
// the real scanned certificates (the office scanner's default full-sheet crop), not an
// arbitrary standard ratio — most images need only a sliver of letterbox margin against
// the existing card mat background, with object-contain still guaranteeing zero cropping.
const LANDSCAPE_RATIO = '1600/1121';
const PORTRAIT_RATIO = '1121/1600';

export function getCertificateDisplayRatio(aspectRatio?: string): string | undefined {
    if (!aspectRatio) return undefined;
    const [width, height] = aspectRatio.split('/').map(Number);
    return width >= height ? LANDSCAPE_RATIO : PORTRAIT_RATIO;
}
