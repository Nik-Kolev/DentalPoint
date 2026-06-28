import type { Metadata } from 'next';
import { getTranslation } from '../../../lib/useTranslation';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = getTranslation(locale);

    return {
        title: t('privacy', 'title'),
        description: t('privacy', 'description'),
    };
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = getTranslation(locale);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='bg-white rounded-lg shadow-lg p-8 md:p-12'>
                    <div className='mb-8'>
                        <Link href={`/${locale}`} className='inline-flex items-center text-[#009fe3] hover:text-[#005baa] transition-colors mb-6'>
                            <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                            </svg>
                            {t('privacy', 'backToHome')}
                        </Link>
                        <h1 className='text-4xl font-extrabold text-[#005baa] mb-4'>{t('privacy', 'title')}</h1>
                        <p className='text-lg text-gray-600'>{t('privacy', 'lastUpdated')}</p>
                    </div>

                    <div className='prose prose-lg max-w-none space-y-8'>
                        <section>
                            <h2 className='text-2xl font-bold text-[#005baa] mb-4'>{t('privacy', 'section1Title')}</h2>
                            <p className='text-gray-700 leading-relaxed mb-4'>{t('privacy', 'section1Text')}</p>
                        </section>

                        <section>
                            <h2 className='text-2xl font-bold text-[#005baa] mb-4'>{t('privacy', 'section2Title')}</h2>
                            <p className='text-gray-700 leading-relaxed mb-4'>{t('privacy', 'section2Text')}</p>
                            <ul className='list-disc list-inside space-y-2 text-gray-700 ml-4'>
                                <li>{t('privacy', 'section2Item1')}</li>
                                <li>{t('privacy', 'section2Item2')}</li>
                                <li>{t('privacy', 'section2Item3')}</li>
                                <li>{t('privacy', 'section2Item4')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className='text-2xl font-bold text-[#005baa] mb-4'>{t('privacy', 'section3Title')}</h2>
                            <p className='text-gray-700 leading-relaxed mb-4'>{t('privacy', 'section3Text')}</p>
                            <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                                <h3 className='font-semibold text-gray-900 mb-2'>{t('privacy', 'section3Subtitle')}</h3>
                                <ul className='list-disc list-inside space-y-2 text-gray-700 ml-4'>
                                    <li>{t('privacy', 'section3Item1')}</li>
                                    <li>{t('privacy', 'section3Item2')}</li>
                                    <li>{t('privacy', 'section3Item3')}</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className='text-2xl font-bold text-[#005baa] mb-4'>{t('privacy', 'section4Title')}</h2>
                            <p className='text-gray-700 leading-relaxed mb-4'>{t('privacy', 'section4Text')}</p>
                        </section>

                        <section>
                            <h2 className='text-2xl font-bold text-[#005baa] mb-4'>{t('privacy', 'section5Title')}</h2>
                            <p className='text-gray-700 leading-relaxed mb-4'>{t('privacy', 'section5Text')}</p>
                        </section>

                        <section>
                            <h2 className='text-2xl font-bold text-[#005baa] mb-4'>{t('privacy', 'section6Title')}</h2>
                            <p className='text-gray-700 leading-relaxed'>{t('privacy', 'section6Text')}</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
