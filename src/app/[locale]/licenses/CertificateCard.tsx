'use client';

import { useRef, useState, useEffect } from 'react';
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleClick = () => {
        // Only allow clicking on desktop (lightbox)
        if (!isMobile && imageRef.current) {
            onImageClick(imageRef.current);
        }
    };

    return (
        <div className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
            <div
                ref={imageRef}
                className={`relative bg-gray-50 flex items-center justify-center p-4 min-h-[200px] max-h-[400px] ${!isMobile ? 'cursor-pointer group' : ''}`}
                onClick={handleClick}
            >
                <Image
                    src={imageUrl}
                    alt='Certificate'
                    width={600}
                    height={600}
                    quality={90}
                    priority={priority}
                    loading={priority ? 'eager' : 'lazy'}
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='max-w-full max-h-full w-auto h-auto object-contain'
                    placeholder='blur'
                    blurDataURL={getBlurPlaceholder(imagePath)}
                />
            </div>
        </div>
    );
}
