'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getTranslation } from '../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';

export default function Home({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='bg-gradient-to-b from-[#e3f3fb] to-white min-h-screen'>
            {/* Main Title - Centered */}
            <div className='text-center pt-8 sm:pt-12 pb-12 sm:pb-16'>
                <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#005baa] px-4'>{t('home', 'heroTitle')}</h1>
            </div>

            {/* Two Images Section */}
            <section className='pb-12 sm:pb-16 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8'>
                        {/* Dr. Yavor Ivanov */}
                        <div className='text-center'>
                            <div className='relative h-80 sm:h-96 md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl mb-4'>
                                <Image src='/Images/owners/iavor.jpg' alt={t('home', 'doctor1Name')} fill className='object-cover' priority />
                            </div>
                            <h4 className='font-semibold text-[#005baa] text-xl sm:text-2xl md:text-3xl mb-2'>{t('home', 'doctor1Name')}</h4>
                            <p className='text-gray-600 text-base sm:text-lg md:text-xl mb-4'>{t('home', 'doctor1Specialty')}</p>
                            <Link
                                href={`/${params.locale}/team#dr-yavor-ivanov`}
                                className='inline-block bg-[#009fe3] text-white px-5 py-2.5 rounded-md text-base sm:text-lg hover:bg-[#005baa] transition-colors duration-200'
                            >
                                {t('home', 'moreInfo')}
                            </Link>
                        </div>

                        {/* Dr. Ekaterina Ivanova */}
                        <div className='text-center'>
                            <div className='relative h-80 sm:h-96 md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl mb-4'>
                                <Image src='/Images/owners/kati.jpg' alt={t('home', 'doctor2Name')} fill className='object-cover' priority />
                            </div>
                            <h4 className='font-semibold text-[#005baa] text-xl sm:text-2xl md:text-3xl mb-2'>{t('home', 'doctor2Name')}</h4>
                            <p className='text-gray-600 text-base sm:text-lg md:text-xl mb-4'>{t('home', 'doctor2Specialty')}</p>
                            <Link
                                href={`/${params.locale}/team#dr-ekaterina-ivanova`}
                                className='inline-block bg-[#009fe3] text-white px-5 py-2.5 rounded-md text-base sm:text-lg hover:bg-[#005baa] transition-colors duration-200'
                            >
                                {t('home', 'moreInfo')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className='pb-12 sm:pb-16 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6 sm:p-8 shadow-md text-center'>
                        <h3 className='text-2xl sm:text-3xl font-bold text-[#005baa] mb-4'>{t('home', 'aboutTitle')}</h3>
                        <p className='text-gray-600 leading-relaxed text-lg'>{t('home', 'aboutText')}</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='pb-8 sm:pb-10 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <StaticCTA locale={params.locale} title={t('home', 'ctaTitle')} subtitle={t('home', 'ctaSubtitle')} />
                </div>
            </section>

            {/* Cabinet Interior Gallery Section */}
            <section className='pt-4 sm:pt-6 pb-6 md:pb-8 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
                        {[
                            'IMG_3345.jpeg',
                            'IMG_3346.jpeg',
                            'IMG_3349.jpeg',
                            'IMG_3350.jpeg',
                            'IMG_3356.jpeg',
                            'IMG_3357.jpeg',
                            'IMG_3358.jpeg',
                            'IMG_3372.jpeg',
                            'IMG_3445.jpeg',
                            'IMG_3448.jpeg',
                        ].map((imageName, i) => (
                            <div key={i} className='bg-white rounded-lg shadow-md p-2 sm:p-3 hover:shadow-lg transition-shadow duration-200'>
                                <Image
                                    src={`/Images/front/${imageName}`}
                                    alt={`Cabinet interior ${i + 1}`}
                                    width={150}
                                    height={150}
                                    className='rounded-md object-cover w-full h-24 sm:h-32'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
