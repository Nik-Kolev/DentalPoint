import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { readCertificates } from '@/lib/gallery-data';
import CertificatesAdmin from '@/components/gallery/CertificatesAdmin';
import CertificatesViewer from '@/components/gallery/CertificatesViewer';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('licenses');
    return { title: t('title'), description: t('subtitle'), alternates: { canonical: '/licenses' } };
}

export default async function Licenses() {
    const [items, session, t] = await Promise.all([
        readCertificates(),
        auth(),
        getTranslations('licenses'),
    ]);

    return (
        <div className='min-h-screen bg-gradient-to-b from-[var(--dp-bg-from)] to-white'>
            <section className='px-4 sm:px-8 pt-12 pb-12'>
                <div className='max-w-6xl mx-auto'>
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
                        <CertificatesAdmin initialItems={items} />
                    ) : (
                        <CertificatesViewer
                            items={items}
                            loadMoreLabel={t('loadMore')}
                            showLessLabel={t('showLess')}
                            statsLabels={{
                                certificates: t('statsCertificates'),
                                experience: t('statsExperience'),
                                patients: t('statsPatients'),
                                professionalism: t('statsProfessionalism'),
                            }}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
