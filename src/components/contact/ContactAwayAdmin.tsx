'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { DayPicker, type DateRange } from 'react-day-picker';
import { bg, enGB } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { updateContactAwaySettings } from '@/lib/actions/contact';
import { isContactAway, isContactAwaySoon, formatAwayRange } from '@/lib/contactAway';
import type { ContactSettings } from '@/types/contact';
import ContactForm from './ContactForm';
import ContactAwayNotice from './ContactAwayNotice';
import ContactAwaySoonBanner from './ContactAwaySoonBanner';
import { DOCTORS } from '@/lib/doctors';

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

function DateRangePicker({
    fromIso, untilIso, onChange, locale, placeholder, doneLabel,
}: {
    fromIso: string; untilIso: string; onChange: (fromIso: string, untilIso: string) => void;
    locale: string; placeholder: string; doneLabel: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    // Local, in-progress selection — only bubbled up via onChange once a full range is
    // picked. Bubbling up every intermediate click (e.g. just the "from" day, with "to"
    // still empty) used to flip the parent's awayFrom/awayUntil to incomplete on every
    // click, which made isContactAway() go false mid-selection and swap the whole preview
    // card below (notice <-> disabled form), causing a visible layout jump.
    const [range, setRange] = useState<DateRange | undefined>(
        fromIso || untilIso ? { from: toDate(fromIso), to: toDate(untilIso) } : undefined
    );

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
                        disabled={{ before: new Date() }}
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

export default function ContactAwayAdmin({ initialSettings, locale }: { initialSettings: ContactSettings; locale: string }) {
    const t = useTranslations('contact');
    const tTeam = useTranslations('team');
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();

    const away = isContactAway(settings);
    const awaySoon = !away && isContactAwaySoon(settings);
    const hasCompleteRange = Boolean(settings.awayFrom && settings.awayUntil);
    const dateMessage = hasCompleteRange ? t('awayMessage', { range: formatAwayRange(settings, locale) }) : '';
    const soonMessage = awaySoon ? t('awaySoonMessage', { range: formatAwayRange(settings, locale) }) : '';

    function persist(next: ContactSettings) {
        setSettings(next);
        startTransition(async () => {
            await updateContactAwaySettings(next);
        });
    }

    function handleToggle(checked: boolean) {
        if (checked) {
            setSettings((s) => ({ ...s, awayEnabled: true }));
            return;
        }
        // Turning away-mode off is low-risk and instantly reversible, so it saves itself.
        // Also clears the dates: leaving a stale range in place caused a real bug where
        // re-enabling later silently carried forward whatever was last picked.
        persist({ ...settings, awayEnabled: false, awayFrom: '', awayUntil: '' });
    }

    function handleRangeChange(fromIso: string, untilIso: string) {
        // Only persists once the range is actually complete — picking just the "from" day
        // shouldn't save a half-finished selection. No separate Save button: the moment a full
        // range is picked, it's live.
        if (fromIso && untilIso) {
            persist({ ...settings, awayFrom: fromIso, awayUntil: untilIso });
        } else {
            setSettings((s) => ({ ...s, awayFrom: fromIso, awayUntil: untilIso }));
        }
    }

    return (
        <div className='space-y-6'>
            <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] p-6 flex flex-col items-center text-center'>
                <label className='flex items-center gap-3 cursor-pointer mb-4'>
                    <input
                        type='checkbox'
                        checked={settings.awayEnabled}
                        onChange={(e) => handleToggle(e.target.checked)}
                        className='w-5 h-5 accent-[var(--dp-primary)]'
                    />
                    <span className='font-montserrat font-semibold text-gray-700'>{t('adminAwayToggle')}</span>
                </label>

                {settings.awayEnabled && (
                    <>
                        <p className='text-sm text-gray-400 mb-4 -mt-2 w-full'>{t('adminAwayExplainer')}</p>

                        <div>
                            <label className='block text-xs font-semibold text-gray-500 mb-1'>{t('adminAwayRange')}</label>
                            <DateRangePicker
                                fromIso={settings.awayFrom}
                                untilIso={settings.awayUntil}
                                onChange={handleRangeChange}
                                locale={locale}
                                placeholder={t('adminAwayRangePlaceholder')}
                                doneLabel={t('adminDone')}
                            />
                            {/* Always mounted so its height is reserved — conditionally rendering this
                            node made the box grow/shrink by one line every time a range finished
                            saving, which read as the whole box bumping down and back up. */}
                            <p className={`text-xs text-gray-400 mt-2 ${isPending ? 'visible' : 'invisible'}`}>{t('adminSaving')}</p>
                        </div>
                    </>
                )}
            </div>

            <div className='bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[var(--dp-card-border)]'>
                {away ? (
                    <ContactAwayNotice
                        title={t('awayTitle')}
                        dateMessage={dateMessage}
                        callLabel={t('awayCallLabel')}
                        doctors={DOCTORS.map((d) => ({ name: tTeam(d.name), phone: d.phone }))}
                    />
                ) : (
                    <fieldset disabled className='opacity-60 pointer-events-none'>
                        {awaySoon && <ContactAwaySoonBanner message={soonMessage} />}
                        <ContactForm />
                    </fieldset>
                )}
            </div>
        </div>
    );
}
