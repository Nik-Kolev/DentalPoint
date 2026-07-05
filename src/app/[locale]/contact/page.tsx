import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { readContactSettings } from '@/lib/contact-data';
import { isContactAway, isContactAwaySoon, formatAwayRange } from '@/lib/contactAway';
import ContactForm from '@/components/contact/ContactForm';
import ContactAwayNotice from '@/components/contact/ContactAwayNotice';
import ContactAwaySoonBanner from '@/components/contact/ContactAwaySoonBanner';
import ContactAwayAdmin from '@/components/contact/ContactAwayAdmin';
import { DOCTORS } from '@/lib/doctors';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('contact');
    return { title: t('title'), description: t('subtitle'), alternates: { canonical: '/contact' } };
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [settings, session, t, tTeam] = await Promise.all([
        readContactSettings(),
        auth(),
        getTranslations('contact'),
        getTranslations('team'),
    ]);

    const away = isContactAway(settings);
    const awaySoon = !away && isContactAwaySoon(settings);
    // Only formatted when actually needed — formatAwayRange() calls Intl.DateTimeFormat on
    // awayFrom/awayUntil, which throws RangeError on the empty strings every visitor has by
    // default (away mode off), so this must never run unconditionally on every page load.
    const dateMessage = away ? t('awayMessage', { range: formatAwayRange(settings, locale) }) : '';
    const soonMessage = awaySoon ? t('awaySoonMessage', { range: formatAwayRange(settings, locale) }) : '';

    return (
        <div className='bg-gradient-to-b from-[var(--dp-bg-from)] to-white'>
            <section className='px-4 sm:px-8 pt-12 pb-16'>
                <div className='max-w-xl mx-auto'>
                    <div className='mb-10 sm:mb-14'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='w-1.5 h-12 rounded-full bg-[var(--dp-primary)]' />
                            <h1 className='font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--dp-heading)]'>
                                {t('title')}
                            </h1>
                        </div>
                        <p className='font-montserrat text-gray-500 text-base sm:text-lg ml-5'>{t('subtitle')}</p>
                    </div>

                    {session?.user ? (
                        <ContactAwayAdmin initialSettings={settings} locale={locale} />
                    ) : away ? (
                        <div className='bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[var(--dp-card-border)]'>
                            <ContactAwayNotice
                                title={t('awayTitle')}
                                dateMessage={dateMessage}
                                callLabel={t('awayCallLabel')}
                                doctors={DOCTORS.map((d) => ({ name: tTeam(d.name), phone: d.phone }))}
                            />
                        </div>
                    ) : (
                        <div className='bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[var(--dp-card-border)]'>
                            {awaySoon && <ContactAwaySoonBanner message={soonMessage} />}
                            <ContactForm />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
