'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { updateContactAwaySettings } from '@/lib/actions/contact';
import { isContactAway, isContactAwaySoon, formatAwayRange } from '@/lib/contactAway';
import type { ContactSettings } from '@/types/contact';
import ContactForm from './ContactForm';
import ContactAwayNotice from './ContactAwayNotice';
import ContactAwaySoonBanner from './ContactAwaySoonBanner';
import DateRangePicker from '@/components/shared/DateRangePicker';
import { DOCTORS } from '@/lib/doctors';

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
                                disabled={{ before: new Date() }}
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
                    <>
                        {awaySoon && <ContactAwaySoonBanner message={soonMessage} />}
                        <ContactForm />
                    </>
                )}
            </div>
        </div>
    );
}
