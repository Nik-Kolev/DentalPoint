import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslation } from '../../../lib/useTranslation';

export const metadata: Metadata = {
    title: 'Our Team',
    description: 'Meet our experienced dental professionals at Dental Point. Learn about our skilled dentists and their specializations.',
};

export default function Team({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('team', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('team', 'subtitle')}</p>
                </div>

                <div className='space-y-16'>
                    {/* Dr. Iavor Ivanov */}
                    <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8'>
                            {/* Image */}
                            <div className='flex justify-center lg:justify-start'>
                                <div className='relative'>
                                    <div className='w-80 h-80 rounded-lg shadow-lg overflow-hidden'>
                                        <Image
                                            src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/iavor.jpg'
                                            alt='Dr. Iavor Ivanov'
                                            width={320}
                                            height={320}
                                            className='object-cover w-full h-full'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className='flex flex-col justify-center space-y-6'>
                                <div>
                                    <h2 className='text-3xl font-bold text-[#005baa] mb-2'>{t('team', 'person1Name')}</h2>
                                    <p className='text-xl text-[#009fe3] font-semibold mb-4'>{t('team', 'person1Title')}</p>
                                </div>
                                <div className='prose prose-lg text-gray-700 leading-relaxed'>
                                    <p>{t('team', 'person1Description')}</p>
                                </div>
                                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                                    <div className='flex items-center'>
                                        <svg className='w-5 h-5 text-[#009fe3] mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                            />
                                        </svg>
                                        <span>9+ години опит</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <svg className='w-5 h-5 text-[#009fe3] mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                                            />
                                        </svg>
                                        <span>Детска стоматология</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dr. Ekaterina Ivanova */}
                    <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-8'>
                            {/* Content */}
                            <div className='flex flex-col justify-center space-y-6 lg:order-1'>
                                <div>
                                    <h2 className='text-3xl font-bold text-[#005baa] mb-2'>{t('team', 'person2Name')}</h2>
                                    <p className='text-xl text-[#009fe3] font-semibold mb-4'>{t('team', 'person2Title')}</p>
                                </div>
                                <div className='prose prose-lg text-gray-700 leading-relaxed'>
                                    <p>{t('team', 'person2Description')}</p>
                                </div>
                                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                                    <div className='flex items-center'>
                                        <svg className='w-5 h-5 text-[#009fe3] mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                            />
                                        </svg>
                                        <span>Ортодонт специалист</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <svg className='w-5 h-5 text-[#009fe3] mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                                        </svg>
                                        <span>Модерни техники</span>
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            <div className='flex justify-center lg:justify-end lg:order-2'>
                                <div className='relative'>
                                    <div className='w-80 h-80 rounded-lg shadow-lg overflow-hidden'>
                                        <Image
                                            src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/kati.jpg'
                                            alt='Dr. Ekaterina Ivanova'
                                            width={320}
                                            height={320}
                                            className='object-cover w-full h-full'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className='text-center mt-16'>
                    <div className='bg-[#005baa] rounded-lg p-8 text-white'>
                        <h3 className='text-2xl font-bold mb-4'>Готови сме да се грижим за вашата усмивка</h3>
                        <p className='text-lg mb-6'>Запазете час при нашите специалисти още днес</p>
                        <a
                            href={`/${params.locale}/contact`}
                            className='inline-block px-8 py-3 bg-white text-[#005baa] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200'
                        >
                            Запази час
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
