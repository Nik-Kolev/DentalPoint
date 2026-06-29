'use client';

import Image from 'next/image';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

interface CertificateCardProps {
    imageUrl: string;
    imagePath: string;
    onImageClick: () => void;
    priority?: boolean;
}

export default function CertificateCard({ imageUrl, imagePath, onImageClick, priority = false }: CertificateCardProps) {
    const handleClick = () => {
        if (window.innerWidth >= 640) onImageClick();
    };

    return (
        <div className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
            <div
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
