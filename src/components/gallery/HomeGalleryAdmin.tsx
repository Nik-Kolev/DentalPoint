'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { HomeGalleryItem } from '@/types/gallery';
import { uploadGalleryImage, removeGalleryImage, reorderGallery } from '@/lib/actions/gallery';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

function getGridCols(count: number): string {
    if (count === 1) return 'grid-cols-1 sm:grid-cols-1 max-w-sm mx-auto';
    if (count <= 2 || count === 4) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-3';
}

type DisplayItem = HomeGalleryItem & { cacheBust?: string };

export default function HomeGalleryAdmin({ initialItems }: { initialItems: HomeGalleryItem[] }) {
    const [items, setItems] = useState<DisplayItem[]>(initialItems);
    const [editMode, setEditMode] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const snapshotRef = useRef<DisplayItem[]>(initialItems);

    const handleImageClick = (item: DisplayItem) => {
        if (editMode) return;
        if (window.innerWidth >= 640) {
            const src = item.cacheBust ? `${item.path}?v=${item.cacheBust}` : item.path;
            setLightbox({ src, alt: item.alt });
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const newItem = await uploadGalleryImage('home', formData);
            setItems((prev) => [...prev, newItem as DisplayItem]);
        } catch (err) {
            console.error(err);
            alert('Грешка при качване на снимката');
        } finally {
            setUploading(false);
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

    const handleRevert = async () => {
        const confirmed = window.confirm(
            'Ще върнете реда на снимките към оригиналния. Изтритите снимки не могат да бъдат възстановени. Продължавате?',
        );
        if (!confirmed) return;
        const original = snapshotRef.current;
        setItems(original);
        try {
            await reorderGallery('home', original.map((i) => i.id));
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
            await reorderGallery('home', withOrder.map((i) => i.id));
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
            <div className='flex items-center justify-end gap-3 mb-3'>
                {editMode && (
                    <button
                        onClick={handleRevert}
                        className='px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                    >
                        ↩ Върни промените
                    </button>
                )}
                <button
                    onClick={() => setEditMode((v) => !v)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                        editMode
                            ? 'bg-[#005baa] text-white hover:bg-[#004a8f]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {editMode ? 'Готово' : '✏️ Редактирай'}
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
                            ${dragOverId === item.id && dragId !== item.id ? 'ring-2 ring-[#005baa] scale-105' : ''}
                            ${dragId === item.id ? 'opacity-50' : ''}
                        `}
                    >
                        <div className='relative aspect-[4/3] rounded-md overflow-hidden bg-gray-100'>
                            {!loadedIds.has(item.id) && (
                                <div className='absolute inset-0 bg-gray-200 animate-pulse rounded-md' />
                            )}
                            <Image
                                src={item.cacheBust ? `${item.path}?v=${item.cacheBust}` : item.path}
                                alt={item.alt}
                                fill
                                unoptimized
                                className='rounded-md object-cover'
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

                {editMode && items.length < 6 && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className='aspect-[4/3] rounded-lg border-2 border-dashed border-[#005baa] flex flex-col items-center justify-center gap-2 text-[#005baa] hover:bg-[#e3f3fb] transition-colors disabled:opacity-50'
                    >
                        {uploading ? (
                            <>
                                <span className='block w-6 h-6 border-2 border-[#005baa] border-t-transparent rounded-full animate-spin' />
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
