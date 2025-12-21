'use client';

import { useRef, useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/imageVersion';

interface CertificateCardProps {
    title: string;
    description: string;
    year: string;
    issuer: string;
    imageUrl: string;
    onImageClick: (element: HTMLElement) => void;
}

export default function CertificateCard({ title, description, year, issuer, imageUrl, onImageClick }: CertificateCardProps) {
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
        <div className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col'>
            <div
                ref={imageRef}
                className={`relative bg-gray-50 flex items-center justify-center p-4 min-h-[200px] max-h-[400px] ${!isMobile ? 'cursor-pointer group' : ''}`}
                onClick={handleClick}
            >
                <img
                    src={getImageUrl(imageUrl)}
                    alt={title || description || 'Certificate'}
                    className='max-w-full max-h-full w-auto h-auto object-contain'
                    loading='lazy'
                />
                {year && (
                    <div className='absolute top-2 right-2 bg-[#005baa] text-white px-2 py-1 rounded text-sm font-semibold pointer-events-none z-20'>
                        {year}
                    </div>
                )}
            </div>
            <div className='p-6 flex-grow'>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>{title}</h3>
                <p className='text-gray-600 text-sm'>{description}</p>
            </div>
        </div>
    );
}
