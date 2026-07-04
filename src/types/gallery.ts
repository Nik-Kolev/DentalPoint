export interface HomeGalleryItem {
    id: string;
    filename: string;
    path: string;
    alt: string;
    order: number;
}

export interface GalleryCase {
    id: string;
    order: number;
    captionBg: string;
    captionEn: string;
    descriptionBg: string;
    descriptionEn: string;
    beforePath: string;
    afterPath: string;
    beforeAlt: string;
    afterAlt: string;
    imageStyle?: string;
    beforeImageStyle?: string;
    afterImageStyle?: string;
    aspectRatio?: string;
}

export interface Certificate {
    id: string;
    filename: string;
    path: string;
    alt: string;
    order: number;
    // Raw CSS ratio "W/H" applied via inline style, NOT a Tailwind class (unlike GalleryCase.aspectRatio)
    aspectRatio?: string;
}

export interface TeamMember {
    id: string;
    nameBg: string;
    nameEn: string;
    titleBg: string;
    titleEn: string;
    descriptionBg: string;
    descriptionEn: string;
    imagePath: string;
    order: number;
}

export interface PendingChange {
    page: 'home' | 'gallery' | 'certificates';
    action: 'add' | 'remove' | 'reorder' | 'replace';
    detail?: string;
    at: string;
}
