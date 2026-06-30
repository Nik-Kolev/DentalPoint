import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { readGalleryCases } from '@/lib/gallery-data';
import StaticCTA from '@/components/shared/StaticCTA';
import GalleryCasesViewer from '@/components/gallery/GalleryCasesViewer';
import GalleryCasesAdmin from '@/components/gallery/GalleryCasesAdmin';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('gallery');
    return { title: t('title') };
}

export default async function Gallery({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [cases, session, t, tLicenses] = await Promise.all([
        readGalleryCases(),
        auth(),
        getTranslations('gallery'),
        getTranslations('licenses'),
    ]);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-6 sm:pb-8'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('title')}</h1>
                    <p className='mt-4 text-xl text-gray-600 max-w-2xl mx-auto'>{t('subtitle')}</p>
                </div>

                {!session?.user && (
                    <div className='text-center pb-8 sm:pb-10'>
                        <p className='text-sm text-gray-500 flex items-center justify-center gap-2'>
                            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' />
                            </svg>
                            {t('sliderHint')}
                        </p>
                    </div>
                )}

                {session?.user ? (
                    <GalleryCasesAdmin
                        initialCases={cases}
                        locale={locale}
                        beforeLabel={t('before')}
                        afterLabel={t('after')}
                    />
                ) : (
                    <GalleryCasesViewer
                        cases={cases}
                        locale={locale}
                        beforeLabel={t('before')}
                        afterLabel={t('after')}
                        loadMoreLabel={tLicenses('loadMore')}
                        showLessLabel={tLicenses('showLess')}
                    />
                )}

                <div className='pt-12 sm:pt-16'>
                    <StaticCTA title={t('ctaTitle')} subtitle={t('ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
