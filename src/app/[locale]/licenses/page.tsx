import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { readCertificates } from '@/lib/gallery-data';
import StaticCTA from '@/components/shared/StaticCTA';
import CertificatesAdmin from '@/components/gallery/CertificatesAdmin';
import CertificatesViewer from '@/components/gallery/CertificatesViewer';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('licenses');
    return { title: t('title') };
}

export default async function Licenses() {
    const [items, session, t] = await Promise.all([
        readCertificates(),
        auth(),
        getTranslations('licenses'),
    ]);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('subtitle')}</p>
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

                <div className='pt-8 sm:pt-12'>
                    <StaticCTA title={t('ctaTitle')} subtitle={t('ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
