import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const locale = params?.locale || 'bg';
    const t = getTranslation(locale);

    return {
        title: t('gallery', 'title'),
        description: t('gallery', 'subtitle'),
    };
}

export default function Gallery({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('gallery', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('gallery', 'subtitle')}</p>
                </div>

                <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-16'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className='bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200'>
                            <Image
                                src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                                alt={`Gallery image ${i + 1}`}
                                width={150}
                                height={150}
                                className='rounded-md object-cover w-full h-24 sm:h-32'
                            />
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <StaticCTA locale={params.locale} title={t('gallery', 'ctaTitle')} subtitle={t('gallery', 'ctaSubtitle')} />
            </div>
        </div>
    );
}
