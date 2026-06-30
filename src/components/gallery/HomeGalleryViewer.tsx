'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { HomeGalleryItem } from '@/types/gallery';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

function getGridCols(count: number): string {
    if (count === 1) return 'grid-cols-1 sm:grid-cols-1 max-w-sm mx-auto';
    if (count <= 2 || count === 4) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-3';
}

export default function HomeGalleryViewer({ items }: { items: HomeGalleryItem[] }) {
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

    return (
        <>
            <div className={`grid gap-4 ${getGridCols(items.length)}`}>
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => {
                            if (window.innerWidth >= 640) setLightbox({ src: item.path, alt: item.alt });
                        }}
                        className='relative bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg sm:cursor-pointer transition-all duration-200'
                    >
                        <div className='relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100'>
                            {!loadedIds.has(item.id) && (
                                <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-md' />
                            )}
                            <Image
                                src={item.path}
                                alt={item.alt}
                                fill
                                unoptimized
                                priority={index === 0}
                                className='rounded-md object-cover'
                                onLoad={() => setLoadedIds((prev) => new Set([...prev, item.id]))}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {lightbox && (
                <ImageLightbox
                    isOpen={!!lightbox}
                    onClose={() => setLightbox(null)}
                    imageSrc={lightbox.src}
                    alt={lightbox.alt}
                />
            )}
        </>
    );
}
