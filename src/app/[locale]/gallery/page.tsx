import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/auth';
import { readGalleryCases } from '@/lib/gallery-data';
import GalleryCasesViewer from '@/components/gallery/GalleryCasesViewer';
import GalleryCasesAdmin from '@/components/gallery/GalleryCasesAdmin';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('gallery');
    return { title: t('title') };
}

export default async function Gallery({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const [cases, session, t] = await Promise.all([
        readGalleryCases(),
        auth(),
        getTranslations('gallery'),
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

                    <div className='pb-8 sm:pb-10 flex justify-center'>
                        <p className='text-sm text-gray-500 flex items-center gap-2'>
                            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                                <path strokeLinecap='round' strokeLinejoin='round' d='M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' />
                            </svg>
                            {t('sliderHint')}
                        </p>
                    </div>

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
                            loadMoreLabel={t('loadMore')}
                            showLessLabel={t('showLess')}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
