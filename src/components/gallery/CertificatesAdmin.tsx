'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { Certificate } from '@/types/gallery';
import { uploadGalleryImage, removeGalleryImage, reorderGallery } from '@/lib/actions/gallery';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

export default function CertificatesAdmin({ initialItems }: { initialItems: Certificate[] }) {
    const [items, setItems] = useState<Certificate[]>(initialItems);
    const [editMode, setEditMode] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const snapshotRef = useRef<Certificate[]>(initialItems);

    const handleImageClick = (item: Certificate) => {
        if (editMode) return;
        if (window.innerWidth >= 640) {
            setLightbox({ src: item.path, alt: item.alt });
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const newItem = await uploadGalleryImage('certificates', formData);
            setItems((prev) => [...prev, newItem as Certificate]);
        } catch (err) {
            console.error(err);
            alert('Грешка при качване на сертификата');
        } finally {
            setUploading(false);
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

    const handleRevert = async () => {
        const confirmed = window.confirm(
            'Ще върнете реда на сертификатите към оригиналния. Изтритите снимки не могат да бъдат възстановени. Продължавате?',
        );
        if (!confirmed) return;
        const original = snapshotRef.current;
        setItems(original);
        try {
            await reorderGallery('certificates', original.map((i) => i.id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragStart = (id: string) => setDragId(id);
    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setDragOverId(id);
    };
    const handleDrop = async (targetId: string) => {
        if (!dragId || dragId === targetId) return;
        const from = items.findIndex((i) => i.id === dragId);
        const to = items.findIndex((i) => i.id === targetId);
        const reordered = [...items];
        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
        const withOrder = reordered.map((item, index) => ({ ...item, order: index }));
        setItems(withOrder);
        setDragId(null);
        setDragOverId(null);
        try {
            await reorderGallery('certificates', withOrder.map((i) => i.id));
        } catch (err) {
            console.error(err);
        }
    };
    const handleDragEnd = () => {
        setDragId(null);
        setDragOverId(null);
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
                        <div
                            className='relative aspect-square rounded-md overflow-hidden bg-[var(--dp-bg-from)] shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                            style={item.aspectRatio ? { aspectRatio: item.aspectRatio } : undefined}
                        >
                            {!loadedIds.has(item.id) && (
                                <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-md' />
                            )}
                            <Image
                                src={item.path}
                                alt={item.alt}
                                fill
                                unoptimized
                                className='object-contain'
                                onLoad={() => setLoadedIds((prev) => new Set([...prev, item.id]))}
                            />
                        </div>

                        {editMode && (
                            <div className='absolute inset-0 rounded-lg flex flex-col'>
                                <div className='flex justify-center pt-1'>
                                    <span className='text-white bg-black/40 rounded px-2 py-0.5 text-xs select-none'>
                                        ⠿ Плъзни
                                    </span>
                                </div>
                                <div className='mt-auto flex justify-center pb-2 px-2'>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(item.id);
                                        }}
                                        title='Изтрий'
                                        className='bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow text-sm font-bold'
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}
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
                <div className='fixed bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none'>
                    <div className='flex items-center gap-3 bg-white rounded-full shadow-xl border border-gray-200 px-5 py-2.5 pointer-events-auto'>
                        <button
                            onClick={handleRevert}
                            className='text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors'
                        >
                            ↩ Върни преди промените
                        </button>
                        <div className='w-px h-5 bg-gray-200' />
                        <button
                            onClick={() => setEditMode(false)}
                            className='px-4 py-1.5 bg-[var(--dp-primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--dp-primary)]/90 transition-colors'
                        >
                            ✓ Готово
                        </button>
                    </div>
                </div>
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
