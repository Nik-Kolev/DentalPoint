'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { replaceTeamMemberImage, updateTeamMemberText } from '@/lib/actions/team';
import type { TeamMember } from '@/types/gallery';

type TextFields = Pick<
    TeamMember,
    'nameBg' | 'nameEn' | 'titleBg' | 'titleEn' | 'descriptionBg' | 'descriptionEn'
>;

interface Props {
    initialMembers: TeamMember[];
    locale: string;
}

export default function TeamAdmin({ initialMembers, locale }: Props) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [editMode, setEditMode] = useState(false);
    const [editFields, setEditFields] = useState<Record<string, TextFields>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [replacing, setReplacing] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const pendingReplaceId = useRef<string | null>(null);
    const snapshotRef = useRef<TeamMember[]>(initialMembers);

    const enterEditMode = () => {
        const fields: Record<string, TextFields> = {};
        for (const m of members) {
            fields[m.id] = {
                nameBg: m.nameBg,
                nameEn: m.nameEn,
                titleBg: m.titleBg,
                titleEn: m.titleEn,
                descriptionBg: m.descriptionBg,
                descriptionEn: m.descriptionEn,
            };
        }
        setEditFields(fields);
        setEditMode(true);
    };

    const exitEditMode = () => {
        setEditMode(false);
        setEditFields({});
    };

    const handleRevert = async () => {
        const confirmed = window.confirm(
            'Ще върнете текста на лекарите към оригиналния. Подменените снимки не могат да бъдат възстановени. Продължавате?',
        );
        if (!confirmed) return;
        const original = snapshotRef.current;
        setMembers(original);
        const fields: Record<string, TextFields> = {};
        for (const m of original) {
            fields[m.id] = { nameBg: m.nameBg, nameEn: m.nameEn, titleBg: m.titleBg, titleEn: m.titleEn, descriptionBg: m.descriptionBg, descriptionEn: m.descriptionEn };
        }
        setEditFields(fields);
        try {
            await Promise.all(original.map((m) => updateTeamMemberText(m.id, fields[m.id])));
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageReplace = (id: string) => {
        pendingReplaceId.current = id;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const id = pendingReplaceId.current;
        if (!file || !id) return;

        setReplacing(id);
        const fd = new FormData();
        fd.append('image', file);
        try {
            const { imagePath } = await replaceTeamMemberImage(id, fd);
            setMembers((prev) =>
                prev.map((m) => (m.id === id ? { ...m, imagePath } : m)),
            );
            // Keep snapshot in sync so global revert doesn't point to the now-deleted old file
            snapshotRef.current = snapshotRef.current.map((m) =>
                m.id === id ? { ...m, imagePath } : m,
            );
        } catch {
            // silent — file on disk unchanged if action threw
        } finally {
            setReplacing(null);
            e.target.value = '';
        }
    };

    const handleSaveText = async (id: string) => {
        const fields = editFields[id];
        if (!fields) return;
        setSaving(id);
        try {
            await updateTeamMemberText(id, fields);
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } : m)));
            setEditMode(false);
        } catch {
            // silent
        } finally {
            setSaving(null);
        }
    };

    const setField = (id: string, key: keyof TextFields, value: string) => {
        setEditFields((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    };

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10'>
            {/* Toolbar — spans full width */}
            <div className='flex items-center justify-end gap-3 mb-3 lg:col-span-2'>
                <button
                    onClick={editMode ? exitEditMode : enterEditMode}
                    className='flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                >
                    {editMode ? '✕ Изход' : '✏️ Редактирай'}
                </button>
            </div>

            {/* Hidden file input — shared across both doctors */}
            <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleFileChange}
            />

            {members.map((member, i) => {
                const isEven = i % 2 === 0;
                const name = locale === 'bg' ? member.nameBg : member.nameEn;
                const isReplacing = replacing === member.id;
                const isSaving = saving === member.id;
                const fields = editFields[member.id];

                return (
                    <article
                        key={member.id}
                        id={member.id}
                        className='flex flex-col bg-white rounded-3xl shadow-sm border border-[var(--dp-card-border)] overflow-hidden scroll-mt-24'
                    >
                        {/* Portrait */}
                        <div className='relative w-full aspect-[4/5]'>
                            <Image
                                src={member.imagePath}
                                alt={name}
                                fill
                                priority
                                loading='eager'
                                fetchPriority={i === 0 ? 'high' : 'auto'}
                                quality={75}
                                sizes='(max-width: 1024px) 100vw, 50vw'
                                className='object-cover object-top'
                            />
                            {/* Camera overlay in edit mode */}
                            {editMode && (
                                <button
                                    onClick={() => handleImageReplace(member.id)}
                                    disabled={isReplacing}
                                    className='absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/55 transition-colors'
                                >
                                    {isReplacing ? (
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
                                                Смени снимка
                                            </span>
                                        </div>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Bio / Edit form */}
                        <div className='flex flex-col justify-center p-8 xl:p-12 flex-1'>
                            {editMode && fields ? (
                                <div className='flex flex-col gap-4'>
                                    {/* BG fields */}
                                    <fieldset>
                                        <legend className='font-montserrat text-[10px] uppercase tracking-widest text-[var(--dp-primary)] font-semibold mb-3'>
                                            Български
                                        </legend>
                                        <div className='flex flex-col gap-3'>
                                            <div>
                                                <label className='font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block'>
                                                    Ime
                                                </label>
                                                <input
                                                    value={fields.nameBg}
                                                    onChange={(e) => setField(member.id, 'nameBg', e.target.value)}
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 font-playfair text-xl text-[var(--dp-heading)] focus:outline-none focus:border-[var(--dp-primary)]'
                                                />
                                            </div>
                                            <div>
                                                <label className='font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block'>
                                                    Специалност
                                                </label>
                                                <input
                                                    value={fields.titleBg}
                                                    onChange={(e) => setField(member.id, 'titleBg', e.target.value)}
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 font-montserrat text-sm text-[var(--dp-primary)] focus:outline-none focus:border-[var(--dp-primary)]'
                                                />
                                            </div>
                                            <div>
                                                <label className='font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block'>
                                                    Описание
                                                </label>
                                                <textarea
                                                    value={fields.descriptionBg}
                                                    onChange={(e) => setField(member.id, 'descriptionBg', e.target.value)}
                                                    rows={5}
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:border-[var(--dp-primary)]'
                                                />
                                            </div>
                                        </div>
                                    </fieldset>

                                    <hr className='border-gray-100' />

                                    {/* EN fields */}
                                    <fieldset>
                                        <legend className='font-montserrat text-[10px] uppercase tracking-widest text-[var(--dp-primary)] font-semibold mb-3'>
                                            English
                                        </legend>
                                        <div className='flex flex-col gap-3'>
                                            <div>
                                                <label className='font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block'>
                                                    Name
                                                </label>
                                                <input
                                                    value={fields.nameEn}
                                                    onChange={(e) => setField(member.id, 'nameEn', e.target.value)}
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 font-playfair text-xl text-[var(--dp-heading)] focus:outline-none focus:border-[var(--dp-primary)]'
                                                />
                                            </div>
                                            <div>
                                                <label className='font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block'>
                                                    Specialty
                                                </label>
                                                <input
                                                    value={fields.titleEn}
                                                    onChange={(e) => setField(member.id, 'titleEn', e.target.value)}
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 font-montserrat text-sm text-[var(--dp-primary)] focus:outline-none focus:border-[var(--dp-primary)]'
                                                />
                                            </div>
                                            <div>
                                                <label className='font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block'>
                                                    Description
                                                </label>
                                                <textarea
                                                    value={fields.descriptionEn}
                                                    onChange={(e) => setField(member.id, 'descriptionEn', e.target.value)}
                                                    rows={5}
                                                    className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 leading-relaxed resize-y focus:outline-none focus:border-[var(--dp-primary)]'
                                                />
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div className='flex gap-2 pt-1'>
                                        <button
                                            onClick={() => handleSaveText(member.id)}
                                            disabled={isSaving}
                                            className='flex-1 py-2 bg-[var(--dp-primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--dp-primary)]/90 disabled:opacity-60 transition-colors'
                                        >
                                            {isSaving ? 'Запазва...' : 'Запази'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                const orig = members.find((m) => m.id === member.id);
                                                if (orig) setEditFields((prev) => ({ ...prev, [member.id]: { nameBg: orig.nameBg, nameEn: orig.nameEn, titleBg: orig.titleBg, titleEn: orig.titleEn, descriptionBg: orig.descriptionBg, descriptionEn: orig.descriptionEn } }));
                                            }}
                                            className='flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors'
                                        >
                                            ↩ Върни промените на тази карта
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className='flex items-start gap-3 mb-4'>
                                        <div className='w-1.5 h-10 rounded-full bg-[var(--dp-primary)] flex-shrink-0 mt-0.5' />
                                        <div>
                                            <h2 className='font-playfair text-2xl xl:text-3xl font-bold text-[var(--dp-heading)] leading-tight'>
                                                {locale === 'bg' ? member.nameBg : member.nameEn}
                                            </h2>
                                            <p className='font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--dp-primary)] mt-1.5'>
                                                {locale === 'bg' ? member.titleBg : member.titleEn}
                                            </p>
                                        </div>
                                    </div>
                                    <p className='text-gray-600 leading-relaxed text-base xl:text-lg'>
                                        {locale === 'bg' ? member.descriptionBg : member.descriptionEn}
                                    </p>
                                </>
                            )}
                        </div>
                    </article>
                );
            })}

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
        </div>
    );
}
