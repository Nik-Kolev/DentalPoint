'use client';

import { useEffect, useRef, useState } from 'react';
import { DayPicker, type DateRange, type Matcher } from 'react-day-picker';
import { bg, enGB } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

function toDate(iso: string): Date | undefined {
    if (!iso) return undefined;
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

function toISO(date: Date | undefined): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatIso(iso: string, locale: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'long' }).format(new Date(y, m - 1, d));
}

interface DateRangePickerProps {
    fromIso: string;
    untilIso: string;
    onChange: (fromIso: string, untilIso: string) => void;
    locale: string;
    placeholder: string;
    doneLabel: string;
    disabled?: Matcher;
}

export default function DateRangePicker({ fromIso, untilIso, onChange, locale, placeholder, doneLabel, disabled }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    // Local, in-progress selection — only bubbled up via onChange once a full range is
    // picked. Bubbling up every intermediate click (e.g. just the "from" day, with "to"
    // still empty) would flip the parent's state to incomplete on every click.
    const [range, setRange] = useState<DateRange | undefined>(
        fromIso || untilIso ? { from: toDate(fromIso), to: toDate(untilIso) } : undefined
    );

    // Re-sync when the parent clears/changes fromIso/untilIso from outside (e.g. a
    // "clear filter" button) — the useState initializer above only runs once on mount,
    // so without this the button label stays stuck on the old range after an external reset.
    // Adjusted directly during render (React's documented pattern for syncing state from a
    // changed prop) rather than in an effect, to avoid the extra post-mount render an effect
    // would cause here.
    const [prevFromIso, setPrevFromIso] = useState(fromIso);
    const [prevUntilIso, setPrevUntilIso] = useState(untilIso);
    if (fromIso !== prevFromIso || untilIso !== prevUntilIso) {
        setPrevFromIso(fromIso);
        setPrevUntilIso(untilIso);
        setRange(fromIso || untilIso ? { from: toDate(fromIso), to: toDate(untilIso) } : undefined);
    }

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const label = range?.from && range?.to
        ? `${formatIso(toISO(range.from), locale)} – ${formatIso(toISO(range.to), locale)}`
        : placeholder;

    function handleSelect(r: DateRange | undefined) {
        setRange(r);
        if (r?.from && r?.to) onChange(toISO(r.from), toISO(r.to));
    }

    return (
        <div className='relative inline-block' ref={ref}>
            <button
                type='button'
                onClick={() => setOpen((v) => !v)}
                className='border border-gray-200 rounded-lg px-3 py-2 text-sm text-center hover:border-[var(--dp-primary)] transition-colors min-w-[220px] text-gray-700'
            >
                {label}
            </button>
            {open && (
                <div className='absolute z-20 mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-[var(--dp-card-border)] p-3'>
                    <DayPicker
                        mode='range'
                        selected={range}
                        onSelect={handleSelect}
                        locale={locale === 'bg' ? bg : enGB}
                        disabled={disabled}
                        style={{
                            ['--rdp-accent-color' as string]: 'var(--dp-primary)',
                            ['--rdp-accent-background-color' as string]: 'var(--dp-bg-from)',
                        }}
                    />
                    <div className='flex justify-center border-t border-[var(--dp-card-border)] pt-2 mt-1'>
                        <button
                            type='button'
                            onClick={() => setOpen(false)}
                            className='text-sm font-semibold text-[var(--dp-primary)] hover:underline px-2 py-1'
                        >
                            {doneLabel}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
