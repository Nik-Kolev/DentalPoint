'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { HomeGalleryItem } from '@/types/gallery';
import { uploadGalleryImage, removeGalleryImage, reorderGallery } from '@/lib/actions/gallery';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useReorderableCollection } from '@/hooks/useReorderableCollection';
import ImageSlot from '@/components/admin/ImageSlot';
import AdminActionBar from '@/components/admin/AdminActionBar';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

function getGridCols(count: number): string {
    if (count === 1) return 'grid-cols-1 sm:grid-cols-1 max-w-sm mx-auto';
    if (count <= 2 || count === 4) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-3';
}

export default function HomeGalleryAdmin({ initialItems }: { initialItems: HomeGalleryItem[] }) {
    const [editMode, setEditMode] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { items, setItems, dragId, dragOverId, handleDragStart, handleDragOver, handleDrop, handleDragEnd, revert } =
        useReorderableCollection<HomeGalleryItem>({
            initialItems,
            onReorder: (orderedIds) => reorderGallery('home', orderedIds),
        });

    const { uploading, handleFile } = useImageUpload(async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const newItem = (await uploadGalleryImage('home', formData)) as HomeGalleryItem;
        setItems((prev) => [...prev, newItem]);
        return newItem;
    });

    const handleImageClick = (item: HomeGalleryItem) => {
        if (editMode) return;
        if (window.innerWidth >= 640) {
            setLightbox({ src: item.path, alt: item.alt });
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleDelete = async (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        try {
            await removeGalleryImage('home', id);
        } catch (err) {
            console.error(err);
            alert('Грешка при изтриване');
        }
    };

    return (
        <>
            <div className='flex items-center justify-end gap-3 mb-3'>
                <button
                    onClick={() => setEditMode((v) => !v)}
                    className='flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                >
                    {editMode ? '✕ Изход' : '✏️ Редактирай'}
                </button>
            </div>

            <div className={`grid gap-4 ${getGridCols(items.length)}`}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        draggable={editMode}
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDrop={() => handleDrop(item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleImageClick(item)}
                        className={`relative bg-white rounded-lg shadow-md p-2 sm:p-3 transition-all duration-200
                            ${editMode ? 'cursor-grab active:cursor-grabbing' : 'hover:shadow-lg sm:cursor-pointer'}
                            ${dragOverId === item.id && dragId !== item.id ? 'ring-2 ring-[var(--dp-primary)] scale-105' : ''}
                            ${dragId === item.id ? 'opacity-50' : ''}
                        `}
                    >
                        <ImageSlot
                            variant='grid-cell'
                            src={item.path}
                            alt={item.alt}
                            editable={editMode}
                            aspectRatioClassName='aspect-[4/3]'
                            containerClassName='bg-gray-100'
                            imageClassName='rounded-md'
                            dragHandleLabel='⠿ Плъзни'
                            onDelete={() => handleDelete(item.id)}
                            deleteTitle='Изтрий'
                            showSkeleton
                        />
                    </div>
                ))}

                {editMode && items.length < 6 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className='aspect-[4/3] rounded-lg border-2 border-dashed border-[var(--dp-primary)] flex flex-col items-center justify-center gap-2 text-[var(--dp-primary)] hover:bg-[var(--dp-primary)]/10 transition-colors disabled:opacity-50'
                    >
                        {uploading ? (
                            <>
                                <span className='block w-6 h-6 border-2 border-[var(--dp-primary)] border-t-transparent rounded-full animate-spin' />
                                <span className='text-sm'>Качване...</span>
                            </>
                        ) : (
                            <>
                                <span className='text-2xl'>+</span>
                                <span className='text-sm font-medium'>Добави снимка</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleUpload} />

            {editMode && (
                <AdminActionBar
                    onRevert={() =>
                        revert(
                            'Ще върнете реда на снимките към оригиналния. Изтритите снимки не могат да бъдат възстановени. Продължавате?',
                        )
                    }
                    onDone={() => setEditMode(false)}
                />
            )}

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
