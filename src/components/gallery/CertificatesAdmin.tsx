'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Certificate } from '@/types/gallery';
import { uploadGalleryImage, removeGalleryImage, reorderGallery } from '@/lib/actions/gallery';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useReorderableCollection } from '@/hooks/useReorderableCollection';
import ImageSlot from '@/components/admin/ImageSlot';
import AdminActionBar from '@/components/admin/AdminActionBar';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

export default function CertificatesAdmin({ initialItems }: { initialItems: Certificate[] }) {
    const [editMode, setEditMode] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { items, setItems, dragId, dragOverId, handleDragStart, handleDragOver, handleDrop, handleDragEnd, revert } =
        useReorderableCollection<Certificate>({
            initialItems,
            onReorder: (orderedIds) => reorderGallery('certificates', orderedIds),
        });

    const { uploading, handleFile } = useImageUpload(async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const newItem = (await uploadGalleryImage('certificates', formData)) as Certificate;
        setItems((prev) => [...prev, newItem]);
        return newItem;
    });

    const handleImageClick = (item: Certificate) => {
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
            alert('Грешка при качване на сертификата');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        try {
            await removeGalleryImage('certificates', id);
        } catch (err) {
            console.error(err);
            alert('Грешка при изтриване');
        }
    };

    return (
        <>
            <div className='flex items-center justify-end gap-3 mb-4'>
                <button
                    onClick={() => setEditMode((v) => !v)}
                    className='flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                >
                    {editMode ? '✕ Изход' : '✏️ Редактирай'}
                </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start gap-6 sm:gap-8 pb-8 sm:pb-12'>
                {items.map((item) => (
                    <div
                        key={item.id}
                        draggable={editMode}
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDrop={() => handleDrop(item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleImageClick(item)}
                        className={`relative rounded-2xl shadow-sm p-2 sm:p-3 transition-all duration-200
                            ${editMode ? 'cursor-grab active:cursor-grabbing' : 'hover:shadow-md sm:cursor-pointer'}
                            ${dragOverId === item.id && dragId !== item.id ? 'ring-2 ring-[var(--dp-primary)] scale-105' : ''}
                            ${dragId === item.id ? 'opacity-50' : ''}
                        `}
                        style={{
                            border: '2px solid transparent',
                            backgroundImage:
                                'linear-gradient(white, white), linear-gradient(135deg, var(--dp-primary), var(--dp-accent))',
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'padding-box, border-box',
                        }}
                    >
                        <ImageSlot
                            variant='grid-cell'
                            src={item.path}
                            alt={item.alt}
                            editable={editMode}
                            aspectRatioClassName='aspect-square'
                            aspectRatioStyle={item.aspectRatio ? { aspectRatio: item.aspectRatio } : undefined}
                            fit='contain'
                            containerClassName='bg-[var(--dp-bg-from)] shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                            dragHandleLabel='⠿ Плъзни'
                            onDelete={() => handleDelete(item.id)}
                            deleteTitle='Изтрий'
                            showSkeleton
                        />
                    </div>
                ))}

                {editMode && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className='aspect-square rounded-2xl border-2 border-dashed border-[var(--dp-primary)] flex flex-col items-center justify-center gap-2 text-[var(--dp-primary)] hover:bg-[var(--dp-primary)]/10 transition-colors disabled:opacity-50'
                    >
                        {uploading ? (
                            <>
                                <span className='block w-6 h-6 border-2 border-[var(--dp-primary)] border-t-transparent rounded-full animate-spin' />
                                <span className='text-sm'>Качване...</span>
                            </>
                        ) : (
                            <>
                                <span className='text-3xl leading-none'>+</span>
                                <span className='text-sm font-medium'>Добави сертификат</span>
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
                            'Ще върнете реда на сертификатите към оригиналния. Изтритите снимки не могат да бъдат възстановени. Продължавате?',
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
