'use client';

import { useState, useRef } from 'react';
import BeforeAfterSlider from '@/components/gallery/BeforeAfterSlider';
import { reorderGalleryCases } from '@/lib/actions/gallery';
import type { GalleryCase } from '@/types/gallery';

interface Props {
    initialCases: GalleryCase[];
    locale: string;
    beforeLabel: string;
    afterLabel: string;
}

export default function GalleryCasesAdmin({ initialCases, locale, beforeLabel, afterLabel }: Props) {
    const [cases, setCases] = useState<GalleryCase[]>(initialCases);
    const [editMode, setEditMode] = useState(false);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const snapshotRef = useRef<GalleryCase[]>(initialCases);

    const handleRevert = async () => {
        const confirmed = window.confirm('Ще върнете реда на случаите към оригиналния. Продължавате?');
        if (!confirmed) return;
        const original = snapshotRef.current;
        setCases(original);
        try {
            await reorderGalleryCases(original.map((c) => c.id));
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
        const from = cases.findIndex((c) => c.id === dragId);
        const to = cases.findIndex((c) => c.id === targetId);
        const reordered = [...cases];
        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
        const withOrder = reordered.map((c, i) => ({ ...c, order: i }));
        setCases(withOrder);
        setDragId(null);
        setDragOverId(null);
        try {
            await reorderGalleryCases(withOrder.map((c) => c.id));
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
            <div className='flex items-center justify-end gap-3 mb-6'>
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

            <div className='space-y-6 sm:space-y-8'>
                {cases.map((c, index) => (
                    <div
                        key={c.id}
                        draggable={editMode}
                        onDragStart={() => handleDragStart(c.id)}
                        onDragOver={(e) => handleDragOver(e, c.id)}
                        onDrop={() => handleDrop(c.id)}
                        onDragEnd={handleDragEnd}
                        className={`relative flex flex-col lg:flex-row gap-6 lg:gap-10 items-center rounded-2xl transition-all duration-200
                            ${!editMode && index % 2 === 1 ? 'lg:flex-row-reverse' : ''}
                            ${editMode ? 'cursor-grab active:cursor-grabbing p-4 bg-white/70 ring-1 ring-gray-200' : ''}
                            ${dragOverId === c.id && dragId !== c.id ? 'ring-2 ring-[#005baa] scale-[1.01]' : ''}
                            ${dragId === c.id ? 'opacity-50' : ''}
                        `}
                    >
                        {editMode && (
                            <div className='absolute top-2 left-1/2 -translate-x-1/2 z-10'>
                                <span className='text-white bg-black/40 rounded px-3 py-0.5 text-xs select-none'>
                                    ⠿ Плъзни за пренаредване
                                </span>
                            </div>
                        )}

                        <div className={`w-full lg:w-3/5 ${editMode ? 'mt-6' : ''}`}>
                            <div className={editMode ? 'pointer-events-none' : ''}>
                                <BeforeAfterSlider
                                    beforeImage={c.beforePath}
                                    afterImage={c.afterPath}
                                    beforeLabel={beforeLabel}
                                    afterLabel={afterLabel}
                                    priority={index === 0}
                                    imageStyle={c.imageStyle}
                                    beforeImageStyle={c.beforeImageStyle}
                                    afterImageStyle={c.afterImageStyle}
                                    aspectRatio={c.aspectRatio}
                                />
                            </div>
                        </div>

                        <div className='w-full lg:w-2/5'>
                            <div className='bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#e3f3fb] h-full'>
                                <h3 className='text-xl font-bold text-[#005baa] mb-1'>{c.captionBg}</h3>
                                <p className='text-sm text-gray-400 italic mb-3'>{c.captionEn}</p>
                                <p className='text-gray-600 leading-relaxed text-sm'>
                                    {locale === 'bg' ? c.descriptionBg : c.descriptionEn}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
