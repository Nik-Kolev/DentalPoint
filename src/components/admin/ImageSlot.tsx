'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageSlotBaseProps {
    src: string;
    alt: string;
    editable: boolean;
    aspectRatioClassName?: string;
    aspectRatioStyle?: React.CSSProperties;
    fit?: 'cover' | 'contain';
    containerClassName?: string;
    imageClassName?: string;
    objectPositionClassName?: string;
    priority?: boolean;
    quality?: number;
    showSkeleton?: boolean;
    // Home Gallery/Certificates bypass Next's optimizer (avoids Lanczos3 ringing on thumbnails);
    // Team's portrait relies on real optimization (sizes/quality) instead — so this must stay
    // per-caller rather than hardcoded.
    unoptimized?: boolean;
    loading?: 'eager' | 'lazy';
    fetchPriority?: 'high' | 'auto';
    sizes?: string;
}

interface GridCellProps extends ImageSlotBaseProps {
    variant: 'grid-cell';
    dragHandleLabel?: string;
    onDelete?: () => void;
    deleteTitle?: string;
}

interface PortraitProps extends ImageSlotBaseProps {
    variant: 'portrait';
    onReplace: (file: File) => Promise<void>;
    replaceLabel?: string;
}

type ImageSlotProps = GridCellProps | PortraitProps;

export default function ImageSlot(props: ImageSlotProps) {
    const {
        src,
        alt,
        editable,
        aspectRatioClassName = 'aspect-square',
        aspectRatioStyle,
        fit = 'cover',
        containerClassName = '',
        imageClassName = '',
        objectPositionClassName = '',
        priority,
        quality,
        showSkeleton = false,
        unoptimized = true,
        loading,
        fetchPriority,
        sizes,
    } = props;

    const [loaded, setLoaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploading, handleFile } = useImageUpload(
        props.variant === 'portrait' ? props.onReplace : async () => {},
    );

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await handleFile(file);
        } catch (err) {
            console.error(err);
            alert('Грешка при качване на снимката');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const objectFitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

    return (
        <div
            className={`relative ${aspectRatioClassName} rounded-md overflow-hidden ${containerClassName}`}
            style={aspectRatioStyle}
        >
            {showSkeleton && !loaded && <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-md' />}
            <Image
                src={src}
                alt={alt}
                fill
                unoptimized={unoptimized}
                priority={priority}
                loading={loading}
                fetchPriority={fetchPriority}
                quality={quality}
                sizes={sizes}
                className={`${objectFitClass} ${objectPositionClassName} ${imageClassName}`}
                onLoad={() => setLoaded(true)}
            />

            {editable && props.variant === 'grid-cell' && (
                <div className='absolute inset-0 rounded-lg flex flex-col'>
                    {props.dragHandleLabel && (
                        <div className='flex justify-center pt-1'>
                            <span className='text-white bg-black/40 rounded px-2 py-0.5 text-xs select-none'>
                                {props.dragHandleLabel}
                            </span>
                        </div>
                    )}
                    {props.onDelete && (
                        <div className='mt-auto flex justify-center pb-2 px-2'>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    props.onDelete!();
                                }}
                                title={props.deleteTitle ?? 'Изтрий'}
                                className='bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow text-sm font-bold'
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            )}

            {editable && props.variant === 'portrait' && (
                <>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className='absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/55 transition-colors'
                    >
                        {uploading ? (
                            <div className='w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin' />
                        ) : (
                            <div className='flex flex-col items-center gap-2'>
                                <svg
                                    className='w-9 h-9 text-white drop-shadow'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z'
                                    />
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z'
                                    />
                                </svg>
                                <span className='font-montserrat text-white text-xs font-semibold drop-shadow'>
                                    {props.replaceLabel ?? 'Смени снимка'}
                                </span>
                            </div>
                        )}
                    </button>
                    <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleChange} />
                </>
            )}
        </div>
    );
}
