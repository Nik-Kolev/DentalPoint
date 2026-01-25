'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

interface CertificateCardProps {
    imageUrl: string;
    imagePath: string; // Original path for blur placeholder
    onImageClick: (element: HTMLElement) => void;
    priority?: boolean;
}

export default function CertificateCard({ imageUrl, imagePath, onImageClick, priority = false }: CertificateCardProps) {
    const imageRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        // Only allow clicking on desktop (>= 640px) for lightbox
        if (window.innerWidth >= 640 && imageRef.current) {
            onImageClick(imageRef.current);
        }
    };

    return (
        <div className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
            <div
                ref={imageRef}
                className='relative bg-white flex items-center justify-center aspect-square sm:cursor-pointer group'
                style={{ aspectRatio: '1/1' }}
                onClick={handleClick}
            >
                <Image
                    src={imageUrl}
                    alt='Certificate'
                    fill
                    quality={priority ? 75 : 70}
                    priority={priority}
                    loading={priority ? 'eager' : 'lazy'}
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-contain'
                    placeholder='blur'
                    blurDataURL={getBlurPlaceholder(imagePath)}
                />
            </div>
        </div>
    );
}
