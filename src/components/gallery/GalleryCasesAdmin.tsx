'use client';

import { useState, useRef } from 'react';
import BeforeAfterSlider from '@/components/gallery/BeforeAfterSlider';
import {
    reorderGalleryCases,
    addGalleryCase,
    removeGalleryCase,
    replaceGalleryCaseImage,
    updateGalleryCaseText,
} from '@/lib/actions/gallery';
import type { GalleryCase } from '@/types/gallery';
import { useReorderableCollection } from '@/hooks/useReorderableCollection';
import AdminActionBar from '@/components/admin/AdminActionBar';
import BilingualTextFields, { type BilingualField } from '@/components/admin/BilingualTextFields';

const ASPECT_PRESETS = [
    { label: '4:3', value: 'aspect-[4/3]' },
    { label: '2:1', value: 'aspect-[2/1]' },
    { label: '3:1', value: 'aspect-[3/1]' },
] as const;

type AspectValue = (typeof ASPECT_PRESETS)[number]['value'];

interface EditFields {
    captionBg: string;
    captionEn: string;
    descriptionBg: string;
    descriptionEn: string;
    aspectRatio: AspectValue;
}

interface NewCaseState {
    captionBg: string;
    captionEn: string;
    descriptionBg: string;
    descriptionEn: string;
    aspectRatio: AspectValue;
    beforeFile: File | null;
    afterFile: File | null;
    beforePreview: string | null;
    afterPreview: string | null;
}

const EMPTY_NEW_CASE: NewCaseState = {
    captionBg: '',
    captionEn: '',
    descriptionBg: '',
    descriptionEn: '',
    aspectRatio: 'aspect-[4/3]',
    beforeFile: null,
    afterFile: null,
    beforePreview: null,
    afterPreview: null,
};

const CASE_TEXT_FIELDS: BilingualField[] = [
    { key: 'caption', labelBg: 'Заглавие (Български)', labelEn: 'Заглавие (Английски)', type: 'input' },
    { key: 'description', labelBg: 'Описание (Български)', labelEn: 'Описание (Английски)', type: 'textarea', rows: 3 },
];

const NEW_CASE_TEXT_FIELDS: BilingualField[] = [
    {
        key: 'caption',
        labelBg: 'Заглавие (Български) *',
        labelEn: 'Заглавие (Английски) *',
        type: 'input',
        placeholderBg: 'Композитно възстановяване',
        placeholderEn: 'Composite Bonding',
    },
    {
        key: 'description',
        labelBg: 'Описание (Български)',
        labelEn: 'Описание (Английски)',
        type: 'textarea',
        rows: 3,
        placeholderBg: 'Кратко описание на лечението...',
        placeholderEn: 'Short description of the treatment...',
    },
];

interface Props {
    initialCases: GalleryCase[];
    locale: string;
    beforeLabel: string;
    afterLabel: string;
}

export default function GalleryCasesAdmin({ initialCases, locale, beforeLabel, afterLabel }: Props) {
    const [editMode, setEditMode] = useState(false);

    const { items: cases, setItems: setCases, dragId, dragOverId, handleDragStart, handleDragOver, handleDrop, handleDragEnd, revert } =
        useReorderableCollection<GalleryCase>({
            initialItems: initialCases,
            onReorder: (orderedIds) => reorderGalleryCases(orderedIds),
        });

    // Per-case text editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFields, setEditFields] = useState<EditFields>({
        captionBg: '', captionEn: '', descriptionBg: '', descriptionEn: '', aspectRatio: 'aspect-[4/3]' as AspectValue,
    });
    const [savingText, setSavingText] = useState(false);

    // Per-case image replacement — single shared file input, ref tracks which slot is pending
    const [replacingKey, setReplacingKey] = useState<string | null>(null);
    const replaceFileRef = useRef<HTMLInputElement | null>(null);
    const pendingReplaceRef = useRef<{ id: string; slot: 'before' | 'after' } | null>(null);

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Add new case
    const [addingNew, setAddingNew] = useState(false);
    const [newCase, setNewCase] = useState<NewCaseState>(EMPTY_NEW_CASE);
    const [addingLoading, setAddingLoading] = useState(false);
    const newBeforeRef = useRef<HTMLInputElement | null>(null);
    const newAfterRef = useRef<HTMLInputElement | null>(null);

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!window.confirm('Изтрийте този случай?')) return;
        setDeletingId(id);
        setCases((prev) => prev.filter((c) => c.id !== id));
        try {
            await removeGalleryCase(id);
        } catch (err) {
            console.error(err);
            alert('Грешка при изтриване');
        } finally {
            setDeletingId(null);
        }
    };

    // ── Replace image ────────────────────────────────────────────────────────
    const handleReplace = async (id: string, slot: 'before' | 'after', file: File) => {
        const key = `${id}-${slot}`;
        setReplacingKey(key);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { path: newPath } = await replaceGalleryCaseImage(id, slot, formData);
            setCases((prev) => prev.map((c) =>
                c.id === id
                    ? { ...c, [slot === 'before' ? 'beforePath' : 'afterPath']: newPath }
                    : c,
            ));
        } catch (err) {
            console.error(err);
            alert('Грешка при замяна на снимката');
        } finally {
            setReplacingKey(null);
        }
    };

    // ── Text edit ────────────────────────────────────────────────────────────
    const startEdit = (c: GalleryCase) => {
        setEditingId(c.id);
        setEditFields({
            captionBg: c.captionBg,
            captionEn: c.captionEn,
            descriptionBg: c.descriptionBg,
            descriptionEn: c.descriptionEn,
            aspectRatio: (ASPECT_PRESETS.find((p) => p.value === c.aspectRatio)?.value ?? 'aspect-[4/3]'),
        });
    };

    const handleSaveText = async (id: string) => {
        setSavingText(true);
        try {
            await updateGalleryCaseText(id, editFields);
            setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...editFields } : c)));
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert('Грешка при запис');
        } finally {
            setSavingText(false);
        }
    };

    // ── Add new case ─────────────────────────────────────────────────────────
    const resetNewCase = () => {
        if (newCase.beforePreview) URL.revokeObjectURL(newCase.beforePreview);
        if (newCase.afterPreview) URL.revokeObjectURL(newCase.afterPreview);
        setNewCase(EMPTY_NEW_CASE);
    };

    const pickNewFile = (slot: 'before' | 'after', file: File) => {
        const preview = URL.createObjectURL(file);
        if (slot === 'before') {
            if (newCase.beforePreview) URL.revokeObjectURL(newCase.beforePreview);
            setNewCase((p) => ({ ...p, beforeFile: file, beforePreview: preview }));
        } else {
            if (newCase.afterPreview) URL.revokeObjectURL(newCase.afterPreview);
            setNewCase((p) => ({ ...p, afterFile: file, afterPreview: preview }));
        }
    };

    const handleAddCase = async () => {
        if (!newCase.beforeFile || !newCase.afterFile) { alert('Добавете и двете снимки'); return; }
        if (!newCase.captionBg.trim() || !newCase.captionEn.trim()) { alert('Заглавието е задължително'); return; }
        setAddingLoading(true);
        const formData = new FormData();
        formData.append('before', newCase.beforeFile);
        formData.append('after', newCase.afterFile);
        formData.append('captionBg', newCase.captionBg);
        formData.append('captionEn', newCase.captionEn);
        formData.append('descriptionBg', newCase.descriptionBg);
        formData.append('descriptionEn', newCase.descriptionEn);
        formData.append('aspectRatio', newCase.aspectRatio);
        try {
            const added = await addGalleryCase(formData);
            const newCases = [added, ...cases];
            setCases(newCases);
            await reorderGalleryCases(newCases.map((c) => c.id));
            resetNewCase();
            setAddingNew(false);
        } catch (err) {
            console.error(err);
            alert('Грешка при добавяне');
        } finally {
            setAddingLoading(false);
        }
    };

    return (
        <>
            {/* Toolbar */}
            <div className='flex items-center justify-end gap-3 mb-6'>
                <button
                    onClick={() => { setEditMode((v) => !v); setEditingId(null); setAddingNew(false); }}
                    className='flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                >
                    {editMode ? '✕ Изход' : '✏️ Редактирай'}
                </button>
            </div>

            {/* Case list */}
            <div className='space-y-6 sm:space-y-10'>
                {/* Add new case — shown at top so newest appears first */}
                {editMode && (
                    addingNew ? (
                        <div className='rounded-2xl border-2 border-[var(--dp-primary)]/30 bg-white p-6 space-y-4'>
                            <h3 className='font-bold text-[var(--dp-primary)] text-sm'>Нов случай</h3>

                            {/* Image upload areas */}
                            <div className='grid grid-cols-2 gap-4'>
                                {(['before', 'after'] as const).map((slot) => {
                                    const preview = slot === 'before' ? newCase.beforePreview : newCase.afterPreview;
                                    const label = slot === 'before' ? 'Преди' : 'След';
                                    return (
                                        <div key={slot}>
                                            <label className='block text-xs font-semibold text-gray-500 mb-1'>{label}</label>
                                            <button
                                                onClick={() => (slot === 'before' ? newBeforeRef : newAfterRef).current?.click()}
                                                className='w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-[var(--dp-primary)] transition-colors overflow-hidden relative bg-gray-50'
                                            >
                                                {preview ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={preview} alt={label} className='w-full h-full object-contain' />
                                                ) : (
                                                    <span className='flex flex-col items-center justify-center h-full gap-1 text-gray-400'>
                                                        <span className='text-2xl'>+</span>
                                                        <span className='text-xs'>{label}</span>
                                                    </span>
                                                )}
                                            </button>
                                            <input type='file' accept='image/*' className='hidden'
                                                ref={slot === 'before' ? newBeforeRef : newAfterRef}
                                                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickNewFile(slot, f); e.target.value = ''; }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Text fields */}
                            <BilingualTextFields
                                fields={NEW_CASE_TEXT_FIELDS}
                                valuesBg={{ caption: newCase.captionBg, description: newCase.descriptionBg }}
                                valuesEn={{ caption: newCase.captionEn, description: newCase.descriptionEn }}
                                onChange={(lang, key, value) =>
                                    setNewCase((p) => ({ ...p, [`${key}${lang === 'bg' ? 'Bg' : 'En'}`]: value }))
                                }
                                layout='columns'
                                idPrefix='new-case'
                            />

                            {/* Aspect ratio */}
                            <div>
                                <label className='block text-xs font-semibold text-gray-500 mb-1'>Формат на снимките</label>
                                <div className='flex gap-2'>
                                    {ASPECT_PRESETS.map((p) => (
                                        <button key={p.value} onClick={() => setNewCase((prev) => ({ ...prev, aspectRatio: p.value }))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors
                                                ${newCase.aspectRatio === p.value ? 'bg-[var(--dp-primary)] text-white border-[var(--dp-primary)]' : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--dp-primary)]'}`}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className='flex gap-3'>
                                <button onClick={handleAddCase} disabled={addingLoading}
                                    className='flex-1 py-2.5 bg-[var(--dp-primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--dp-primary)]/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2'>
                                    {addingLoading && <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />}
                                    {addingLoading ? 'Добавя...' : 'Добави случай'}
                                </button>
                                <button onClick={() => { setAddingNew(false); resetNewCase(); }}
                                    className='px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors'>
                                    Отказ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setAddingNew(true)}
                            className='w-full py-4 rounded-2xl border-2 border-dashed border-[var(--dp-primary)] text-[var(--dp-primary)] font-semibold hover:bg-[var(--dp-primary)]/10 transition-colors text-sm'>
                            + Добави нов случай
                        </button>
                    )
                )}

                {cases.map((c, index) => {
                    const isEditing = editingId === c.id;
                    const isDragging = dragId === c.id;
                    const isDragOver = dragOverId === c.id && !isDragging;

                    return (
                        <div key={c.id}>
                            <div
                                draggable={editMode && !isEditing}
                                onDragStart={() => handleDragStart(c.id)}
                                onDragOver={(e) => handleDragOver(e, c.id)}
                                onDrop={() => handleDrop(c.id)}
                                onDragEnd={handleDragEnd}
                                className={`relative flex flex-col lg:flex-row gap-6 lg:gap-10 items-center rounded-2xl transition-all duration-200
                                    ${!editMode && index % 2 === 1 ? 'lg:flex-row-reverse' : ''}
                                    ${editMode ? 'p-4 bg-white ring-1 ring-gray-200 shadow-sm' : ''}
                                    ${isDragOver ? 'ring-2 ring-[var(--dp-primary)] scale-[1.01]' : ''}
                                    ${isDragging ? 'opacity-50' : ''}
                                    ${editMode && !isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
                                `}
                            >
                                {editMode && !isEditing && (
                                    <div className='absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none'>
                                        <span className='text-white bg-black/40 rounded px-3 py-0.5 text-xs select-none'>
                                            ⠿ Плъзни за пренаредване
                                        </span>
                                    </div>
                                )}

                                {/* Slider column */}
                                <div className={`w-full lg:w-3/5 ${editMode ? 'mt-5' : ''}`}>
                                    <div className={editMode && !isEditing ? 'pointer-events-none' : ''}>
                                        <BeforeAfterSlider
                                            beforeImage={c.beforePath}
                                            afterImage={c.afterPath}
                                            beforeLabel={beforeLabel}
                                            afterLabel={afterLabel}
                                            priority={index === 0}
                                            aspectRatio={isEditing ? editFields.aspectRatio : c.aspectRatio}
                                        />
                                    </div>

                                    {/* Replace image buttons */}
                                    {editMode && (
                                        <div
                                            className='flex gap-2 mt-2'
                                            onClick={(e) => e.stopPropagation()}
                                            onDragStart={(e) => e.stopPropagation()}
                                        >
                                            {(['before', 'after'] as const).map((slot) => {
                                                const key = `${c.id}-${slot}`;
                                                const busy = replacingKey === key;
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => {
                                                            pendingReplaceRef.current = { id: c.id, slot };
                                                            replaceFileRef.current?.click();
                                                        }}
                                                        disabled={busy}
                                                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1
                                                            ${busy ? 'bg-[var(--dp-primary)] text-white border-[var(--dp-primary)] cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:border-[var(--dp-primary)] hover:text-[var(--dp-primary)]'}`}
                                                    >
                                                        {busy ? (
                                                            <>
                                                                <span className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                                                Зарежда...
                                                            </>
                                                        ) : slot === 'before' ? 'Замени преди' : 'Замени след'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Info / edit panel */}
                                <div className='w-full lg:w-2/5'>
                                    {isEditing ? (
                                        <div className='bg-white rounded-2xl p-5 shadow-lg border border-[var(--dp-primary)]/30 space-y-3' onClick={(e) => e.stopPropagation()} onDragStart={(e) => e.stopPropagation()}>
                                            <BilingualTextFields
                                                fields={CASE_TEXT_FIELDS}
                                                valuesBg={{ caption: editFields.captionBg, description: editFields.descriptionBg }}
                                                valuesEn={{ caption: editFields.captionEn, description: editFields.descriptionEn }}
                                                onChange={(lang, key, value) =>
                                                    setEditFields((f) => ({ ...f, [`${key}${lang === 'bg' ? 'Bg' : 'En'}`]: value }))
                                                }
                                                layout='rows'
                                                idPrefix={c.id}
                                            />
                                            <div>
                                                <label className='block text-xs font-semibold text-gray-500 mb-1'>Формат на снимките</label>
                                                <div className='flex gap-2'>
                                                    {ASPECT_PRESETS.map((p) => (
                                                        <button key={p.value} type='button'
                                                            onClick={() => setEditFields((f) => ({ ...f, aspectRatio: p.value }))}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                                                                ${editFields.aspectRatio === p.value ? 'bg-[var(--dp-primary)] text-white border-[var(--dp-primary)]' : 'bg-white text-gray-600 border-gray-200 hover:border-[var(--dp-primary)]'}`}>
                                                            {p.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className='flex gap-2 pt-1'>
                                                <button onClick={() => handleSaveText(c.id)} disabled={savingText}
                                                    className='flex-1 py-2 bg-[var(--dp-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--dp-primary)]/90 disabled:opacity-60 transition-colors'>
                                                    {savingText ? 'Запазва...' : 'Запази'}
                                                </button>
                                                <button onClick={() => setEditingId(null)}
                                                    className='flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors'>
                                                    Отказ
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[var(--dp-primary)]/10 h-full'>
                                            <h3 className='text-xl font-bold text-[var(--dp-primary)] mb-1'>{c.captionBg}</h3>
                                            <p className='text-sm text-gray-400 italic mb-3'>{c.captionEn}</p>
                                            <p className='text-gray-600 leading-relaxed text-sm'>
                                                {locale === 'bg' ? c.descriptionBg : c.descriptionEn}
                                            </p>
                                            {editMode && (
                                                <div className='flex gap-2 mt-4' onClick={(e) => e.stopPropagation()} onDragStart={(e) => e.stopPropagation()}>
                                                    <button onClick={() => startEdit(c)}
                                                        className='flex-1 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'>
                                                        ✏️ Текст и вид
                                                    </button>
                                                    <button onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}
                                                        className='py-1.5 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors'>
                                                        {deletingId === c.id ? '...' : '✕ Изтрий'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Floating action bar — stays visible regardless of scroll position */}
            {editMode && (
                <AdminActionBar
                    onRevert={() => revert('Всички промени от тази сесия ще бъдат отменени. Продължавате?')}
                    onDone={() => { setEditMode(false); setEditingId(null); setAddingNew(false); }}
                />
            )}

            {/* Single shared file input for image replacement */}
            <input
                type='file'
                accept='image/*'
                className='hidden'
                ref={replaceFileRef}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && pendingReplaceRef.current) {
                        handleReplace(pendingReplaceRef.current.id, pendingReplaceRef.current.slot, f);
                        pendingReplaceRef.current = null;
                    }
                    e.target.value = '';
                }}
            />
        </>
    );
}
