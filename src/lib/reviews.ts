export interface ReviewItem {
    name: string;
    initials: string;
    rating: number;
    date: string;
    text: string;
}

export function getAverageRating(items: ReviewItem[]): number {
    return items.reduce((sum, r) => sum + r.rating, 0) / items.length;
}
