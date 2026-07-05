import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { readTeamMembers } from '@/lib/gallery-data';
import TeamViewer from '@/components/team/TeamViewer';
import TeamAdmin from '@/components/team/TeamAdmin';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('team');
    return { title: t('title'), description: t('subtitle'), alternates: { canonical: '/team' } };
}

export default async function Team({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [members, session] = await Promise.all([readTeamMembers(), auth()]);

    const t = await getTranslations('team');

    return (
        <div className='min-h-screen bg-gradient-to-b from-[var(--dp-bg-from)] to-white'>
            <section className='px-4 sm:px-8 pt-12 pb-12'>
                <div className='max-w-6xl mx-auto'>
                    {/* Page header */}
                    <div className='mb-10 sm:mb-14'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className='w-1.5 h-12 rounded-full bg-[var(--dp-primary)]' />
                            <h1 className='font-playfair text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--dp-heading)]'>
                                {t('title')}
                            </h1>
                        </div>
                        <p className='font-montserrat text-gray-500 text-base sm:text-lg ml-5'>{t('subtitle')}</p>
                    </div>

                    {/* Doctor cards */}
                    {session?.user ? (
                        <TeamAdmin initialMembers={members} locale={locale} />
                    ) : (
                        <TeamViewer members={members} locale={locale} />
                    )}
                </div>
            </section>
        </div>
    );
}
