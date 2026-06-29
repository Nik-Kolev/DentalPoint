'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { HomeGalleryItem } from '@/types/gallery';

const ImageLightbox = dynamic(() => import('@/components/gallery/ImageLightbox'), { ssr: false });

interface Props {
    initialItems: HomeGalleryItem[];
    isAdmin: boolean;
}

type DisplayItem = HomeGalleryItem & { cacheBust?: string };

function getGridCols(count: number): string {
    if (count === 1) return 'grid-cols-1 sm:grid-cols-1 max-w-sm mx-auto';
    if (count <= 2 || count === 4) return 'grid-cols-1 sm:grid-cols-2';
    return 'grid-cols-1 sm:grid-cols-3';
}

function getImageSizes(count: number): string {
    if (count === 1) return '(max-width: 640px) 100vw, 384px';
    if (count <= 2 || count === 4) return '(max-width: 640px) 100vw, 50vw';
    return '(max-width: 640px) 100vw, 33vw';
}

export default function HomeGalleryClient({ initialItems, isAdmin }: Props) {
    const [items, setItems] = useState<DisplayItem[]>(initialItems);
    const [editMode, setEditMode] = useState(false);
    const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
    const [rotatingKey, setRotatingKey] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const snapshotRef = useRef<DisplayItem[]>(initialItems);

    const handleImageClick = (_e: React.MouseEvent<HTMLDivElement>, item: HomeGalleryItem) => {
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
            const res = await fetch('/api/admin/home-gallery', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const newItem: HomeGalleryItem = await res.json();
            setItems((prev) => [...prev, newItem]);
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
            const res = await fetch(`/api/admin/home-gallery/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
        } catch (err) {
            console.error(err);
            alert('Грешка при изтриване');
        }
    };

    const handleRotate = async (id: string, direction: 'left' | 'right') => {
        const key = `${id}-${direction}`;
        setRotatingKey(key);
        try {
            const res = await fetch(`/api/admin/home-gallery/${id}/rotate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction }),
            });
            if (!res.ok) throw new Error('Rotate failed');
            const cacheBust = String(Date.now());
            setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cacheBust } : i)));
            setLoadedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
        } catch (err) {
            console.error(err);
            alert('Грешка при завъртане');
        } finally {
            setRotatingKey(null);
        }
    };

    const handleRevert = async () => {
        const confirmed = window.confirm(
            'Ще върнете реда на снимките към оригиналния. Изтритите или завъртените снимки не могат да бъдат възстановени. Продължавате?'
        );
        if (!confirmed) return;
        const original = snapshotRef.current;
        setItems(original);
        try {
            await fetch('/api/admin/home-gallery/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: original.map((i) => i.id) }),
            });
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
            await fetch('/api/admin/home-gallery/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: withOrder.map((i) => i.id) }),
            });
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
            {isAdmin && (
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
            )}

            <div className={`grid gap-4 ${getGridCols(items.length)}`}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        draggable={editMode}
                        onDragStart={() => handleDragStart(item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDrop={() => handleDrop(item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => handleImageClick(e, item)}
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
                                    <span className='text-white bg-black/40 rounded px-2 py-0.5 text-xs select-none'>⠿ Плъзни</span>
                                </div>
                                <div className='mt-auto flex justify-center gap-2 pb-2 px-2'>
                                    {([
                                        { dir: 'left' as const, icon: '↺', title: 'Завърти наляво' },
                                        { dir: 'right' as const, icon: '↻', title: 'Завърти надясно' },
                                    ] as const).map(({ dir, icon, title }) => {
                                        const busy = rotatingKey === `${item.id}-${dir}`;
                                        return (
                                            <button
                                                key={dir}
                                                onClick={(e) => { e.stopPropagation(); handleRotate(item.id, dir); }}
                                                disabled={busy}
                                                title={title}
                                                className={`rounded-full w-9 h-9 flex items-center justify-center shadow text-sm font-bold transition-colors
                                                    ${busy ? 'bg-[#005baa] text-white cursor-not-allowed' : 'bg-white/90 hover:bg-[#005baa] hover:text-white text-gray-800'}`}
                                            >
                                                {busy
                                                    ? <span className='block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                                    : icon
                                                }
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
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
                            <span className='text-sm'>Качване...</span>
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
