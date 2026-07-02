'use client';

import { useState, useRef } from 'react';
import { replaceTeamMemberImage, updateTeamMemberText } from '@/lib/actions/team';
import type { TeamMember } from '@/types/gallery';
import ImageSlot from '@/components/admin/ImageSlot';
import AdminActionBar from '@/components/admin/AdminActionBar';
import BilingualTextFields, { type BilingualField } from '@/components/admin/BilingualTextFields';

type TextFields = Pick<TeamMember, 'nameBg' | 'nameEn' | 'titleBg' | 'titleEn' | 'descriptionBg' | 'descriptionEn'>;

const TEXT_FIELDS: BilingualField[] = [
    { key: 'name', labelBg: 'Ime', labelEn: 'Name', type: 'input' },
    { key: 'title', labelBg: 'Специалност', labelEn: 'Specialty', type: 'input' },
    { key: 'description', labelBg: 'Описание', labelEn: 'Description', type: 'textarea', rows: 5 },
];

interface Props {
    initialMembers: TeamMember[];
    locale: string;
}

export default function TeamAdmin({ initialMembers, locale }: Props) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [editMode, setEditMode] = useState(false);
    const [editFields, setEditFields] = useState<Record<string, TextFields>>({});
    const [saving, setSaving] = useState<string | null>(null);
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
        try {
            await Promise.all(original.map((m) => updateTeamMemberText(m.id, fields[m.id])));
        } catch (err) {
            console.error(err);
        }
    };

    const handleReplaceImage = async (id: string, file: File) => {
        const fd = new FormData();
        fd.append('image', file);
        const { imagePath } = await replaceTeamMemberImage(id, fd);
        setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, imagePath } : m)));
        // Keep snapshot in sync so global revert doesn't point to the now-deleted old file
        snapshotRef.current = snapshotRef.current.map((m) => (m.id === id ? { ...m, imagePath } : m));
    };

    const handleSaveText = async (id: string) => {
        const fields = editFields[id];
        if (!fields) return;
        setSaving(id);
        try {
            await updateTeamMemberText(id, fields);
            setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } : m)));
            setEditMode(false);
        } catch (err) {
            console.error(err);
            alert('Грешка при запис');
        } finally {
            setSaving(null);
        }
    };

    const setField = (id: string, key: keyof TextFields, value: string) => {
        setEditFields((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    };

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10'>
            {/* Toolbar */}
            <div className='flex items-center justify-end gap-3 mb-3 lg:col-span-2'>
                <button
                    onClick={editMode ? exitEditMode : enterEditMode}
                    className='flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors'
                >
                    {editMode ? '✕ Изход' : '✏️ Редактирай'}
                </button>
            </div>

            {members.map((member, i) => {
                const name = locale === 'bg' ? member.nameBg : member.nameEn;
                const isSaving = saving === member.id;
                const fields = editFields[member.id];

                return (
                    <article
                        key={member.id}
                        id={member.id}
                        className='flex flex-col bg-white rounded-3xl shadow-sm border border-[var(--dp-card-border)] overflow-hidden scroll-mt-24'
                    >
                        {/* Portrait */}
                        <ImageSlot
                            variant='portrait'
                            src={member.imagePath}
                            alt={name}
                            editable={editMode}
                            aspectRatioClassName='aspect-[4/5]'
                            objectPositionClassName='object-top'
                            unoptimized={false}
                            priority
                            loading='eager'
                            fetchPriority={i === 0 ? 'high' : 'auto'}
                            quality={75}
                            sizes='(max-width: 1024px) 100vw, 50vw'
                            onReplace={(file) => handleReplaceImage(member.id, file)}
                            replaceLabel='Смени снимка'
                        />

                        {/* Bio / Edit form */}
                        <div className='flex flex-col p-8 xl:p-10 flex-1'>
                            {editMode && fields ? (
                                <div className='flex flex-col gap-4'>
                                    <BilingualTextFields
                                        fields={TEXT_FIELDS}
                                        valuesBg={{ name: fields.nameBg, title: fields.titleBg, description: fields.descriptionBg }}
                                        valuesEn={{ name: fields.nameEn, title: fields.titleEn, description: fields.descriptionEn }}
                                        onChange={(lang, key, value) =>
                                            setField(
                                                member.id,
                                                (`${key}${lang === 'bg' ? 'Bg' : 'En'}`) as keyof TextFields,
                                                value,
                                            )
                                        }
                                        layout='grouped'
                                        idPrefix={member.id}
                                    />
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
                                                if (orig) {
                                                    setEditFields((prev) => ({
                                                        ...prev,
                                                        [member.id]: {
                                                            nameBg: orig.nameBg,
                                                            nameEn: orig.nameEn,
                                                            titleBg: orig.titleBg,
                                                            titleEn: orig.titleEn,
                                                            descriptionBg: orig.descriptionBg,
                                                            descriptionEn: orig.descriptionEn,
                                                        },
                                                    }));
                                                }
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

            {editMode && <AdminActionBar onRevert={handleRevert} onDone={() => setEditMode(false)} />}
        </div>
    );
}
