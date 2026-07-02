'use client';

import { Fragment } from 'react';

export interface BilingualField {
    key: string;
    labelBg: string;
    labelEn: string;
    type: 'input' | 'textarea';
    rows?: number;
    placeholderBg?: string;
    placeholderEn?: string;
}

interface BilingualTextFieldsProps {
    fields: BilingualField[];
    valuesBg: Record<string, string>;
    valuesEn: Record<string, string>;
    onChange: (lang: 'bg' | 'en', key: string, value: string) => void;
    // 'columns': BG+EN of the same field side by side (wide areas — e.g. an "add new" form)
    // 'rows': each field its own full-width row, BG then EN in sequence (narrow columns)
    // 'grouped': all BG fields in one fieldset, then all EN fields in another
    layout: 'columns' | 'rows' | 'grouped';
    // Scopes generated input ids (e.g. "<idPrefix>-caption-bg") so multiple instances of this
    // component can coexist on one page (e.g. an "add new" form open at the same time as an
    // existing item's edit form) without colliding on duplicate DOM ids.
    idPrefix: string;
}

const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dp-primary)]';
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';
const groupedLabelCls = 'font-montserrat text-[10px] uppercase tracking-widest text-gray-400 mb-1 block';
const groupedLegendCls =
    'font-montserrat text-[10px] uppercase tracking-widest text-[var(--dp-primary)] font-semibold mb-3';

function FieldInput({
    id,
    field,
    value,
    onChange,
    placeholder,
    textareaRows,
}: {
    id: string;
    field: BilingualField;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    textareaRows: number;
}) {
    return field.type === 'textarea' ? (
        <textarea
            id={id}
            rows={textareaRows}
            className={`${inputCls} resize-none`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ) : (
        <input
            id={id}
            type='text'
            className={inputCls}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

export default function BilingualTextFields({ fields, valuesBg, valuesEn, onChange, layout, idPrefix }: BilingualTextFieldsProps) {
    if (layout === 'grouped') {
        return (
            <div className='flex flex-col gap-4'>
                <fieldset>
                    <legend className={groupedLegendCls}>Български</legend>
                    <div className='flex flex-col gap-3'>
                        {fields.map((f) => (
                            <div key={f.key}>
                                <label className={groupedLabelCls} htmlFor={`${idPrefix}-${f.key}-bg`}>{f.labelBg}</label>
                                <FieldInput
                                    id={`${idPrefix}-${f.key}-bg`}
                                    field={f}
                                    value={valuesBg[f.key] ?? ''}
                                    onChange={(v) => onChange('bg', f.key, v)}
                                    placeholder={f.placeholderBg}
                                    textareaRows={f.rows ?? 5}
                                />
                            </div>
                        ))}
                    </div>
                </fieldset>
                <hr className='border-gray-100' />
                <fieldset>
                    <legend className={groupedLegendCls}>English</legend>
                    <div className='flex flex-col gap-3'>
                        {fields.map((f) => (
                            <div key={f.key}>
                                <label className={groupedLabelCls} htmlFor={`${idPrefix}-${f.key}-en`}>{f.labelEn}</label>
                                <FieldInput
                                    id={`${idPrefix}-${f.key}-en`}
                                    field={f}
                                    value={valuesEn[f.key] ?? ''}
                                    onChange={(v) => onChange('en', f.key, v)}
                                    placeholder={f.placeholderEn}
                                    textareaRows={f.rows ?? 5}
                                />
                            </div>
                        ))}
                    </div>
                </fieldset>
            </div>
        );
    }

    if (layout === 'rows') {
        return (
            <div className='space-y-3'>
                {fields.map((f) => (
                    <Fragment key={f.key}>
                        <div>
                            <label className={labelCls} htmlFor={`${idPrefix}-${f.key}-bg`}>{f.labelBg}</label>
                            <FieldInput
                                id={`${idPrefix}-${f.key}-bg`}
                                field={f}
                                value={valuesBg[f.key] ?? ''}
                                onChange={(v) => onChange('bg', f.key, v)}
                                placeholder={f.placeholderBg}
                                textareaRows={f.rows ?? 3}
                            />
                        </div>
                        <div>
                            <label className={labelCls} htmlFor={`${idPrefix}-${f.key}-en`}>{f.labelEn}</label>
                            <FieldInput
                                id={`${idPrefix}-${f.key}-en`}
                                field={f}
                                value={valuesEn[f.key] ?? ''}
                                onChange={(v) => onChange('en', f.key, v)}
                                placeholder={f.placeholderEn}
                                textareaRows={f.rows ?? 3}
                            />
                        </div>
                    </Fragment>
                ))}
            </div>
        );
    }

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {fields.map((f) => (
                <Fragment key={f.key}>
                    <div>
                        <label className={labelCls} htmlFor={`${idPrefix}-${f.key}-bg`}>{f.labelBg}</label>
                        <FieldInput
                            id={`${idPrefix}-${f.key}-bg`}
                            field={f}
                            value={valuesBg[f.key] ?? ''}
                            onChange={(v) => onChange('bg', f.key, v)}
                            placeholder={f.placeholderBg}
                            textareaRows={f.rows ?? 3}
                        />
                    </div>
                    <div>
                        <label className={labelCls} htmlFor={`${idPrefix}-${f.key}-en`}>{f.labelEn}</label>
                        <FieldInput
                            id={`${idPrefix}-${f.key}-en`}
                            field={f}
                            value={valuesEn[f.key] ?? ''}
                            onChange={(v) => onChange('en', f.key, v)}
                            placeholder={f.placeholderEn}
                            textareaRows={f.rows ?? 3}
                        />
                    </div>
                </Fragment>
            ))}
        </div>
    );
}
