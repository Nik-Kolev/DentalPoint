import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import { getImageUrl } from '@/lib/imageVersion';

export const metadata: Metadata = {
    title: 'Our Team',
    description: 'Meet our experienced dental professionals at Dental Point. Learn about our skilled dentists and their specializations.',
};

export default function Team({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='min-h-screen py-8 sm:py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#005baa] mb-4 font-serif'>{t('team', 'title')}</h1>
                    <p className='text-lg md:text-xl text-gray-600'>{t('team', 'subtitle')}</p>
                </div>

                <div className='space-y-8 sm:space-y-12'>
                    {/* Dr. Iavor Ivanov */}
                    <div id='dr-yavor-ivanov' className='flex flex-col lg:flex-row lg:items-start lg:gap-8 xl:gap-12 scroll-mt-20'>
                        {/* Mobile Layout */}
                        <div className='lg:hidden text-center space-y-4'>
                            <h2 className='text-2xl sm:text-3xl font-bold text-[#005baa] font-serif'>{t('team', 'person1Name')}</h2>
                            <p className='text-lg sm:text-xl text-[#005baa] font-medium'>{t('team', 'person1Title')}</p>
                            <div className='w-full max-w-sm mx-auto'>
                                <Image
                                    src={getImageUrl('/Images/owners/iavor.jpg')}
                                    alt={t('team', 'person1Name')}
                                    width={400}
                                    height={500}
                                    priority
                                    quality={30}
                                    sizes='(max-width: 640px) 100vw, 400px'
                                    fetchPriority='high'
                                    className='w-full h-[280px] sm:h-[320px] object-cover rounded-lg shadow-lg'
                                />
                            </div>
                            <div className='flex justify-center gap-4 text-sm'>
                                <span className='bg-[#005baa] text-white px-3 py-1 rounded-full'>{t('team', 'experience')}</span>
                                <span className='bg-[#005baa] text-white px-3 py-1 rounded-full'>{t('team', 'pediatricDentistry')}</span>
                            </div>
                            <p className='text-gray-700 leading-relaxed text-justify px-2'>{t('team', 'person1Description')}</p>
                        </div>

                        {/* Desktop Layout */}
                        <div className='hidden lg:flex lg:w-full lg:gap-8 xl:gap-12'>
                            <div className='lg:w-1/3 xl:w-2/5'>
                                <Image
                                    src={getImageUrl('/Images/owners/iavor.jpg')}
                                    alt={t('team', 'person1Name')}
                                    width={400}
                                    height={500}
                                    priority
                                    quality={30}
                                    sizes='(max-width: 1024px) 50vw, 400px'
                                    fetchPriority='high'
                                    className='w-full h-[400px] xl:h-[450px] object-cover rounded-lg shadow-lg'
                                />
                            </div>
                            <div className='lg:w-2/3 xl:w-3/5 lg:pt-0'>
                                <h2 className='text-3xl xl:text-4xl font-bold text-[#005baa] mb-3 font-serif'>{t('team', 'person1Name')}</h2>
                                <p className='text-xl xl:text-2xl text-[#005baa] font-medium mb-6'>{t('team', 'person1Title')}</p>
                                <div className='flex gap-4 mb-6'>
                                    <span className='bg-[#005baa] text-white px-4 py-2 rounded-full text-sm'>{t('team', 'experience')}</span>
                                    <span className='bg-[#005baa] text-white px-4 py-2 rounded-full text-sm'>{t('team', 'pediatricDentistry')}</span>
                                </div>
                                <p className='text-gray-700 leading-relaxed text-justify text-lg xl:text-xl'>{t('team', 'person1Description')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dr. Ekaterina Ivanova */}
                    <div id='dr-ekaterina-ivanova' className='flex flex-col lg:flex-row-reverse lg:items-start lg:gap-8 xl:gap-12 scroll-mt-20'>
                        {/* Mobile Layout */}
                        <div className='lg:hidden text-center space-y-4'>
                            <h2 className='text-2xl sm:text-3xl font-bold text-[#005baa] font-serif'>{t('team', 'person2Name')}</h2>
                            <p className='text-lg sm:text-xl text-[#005baa] font-medium'>{t('team', 'person2Title')}</p>
                            <div className='w-full max-w-sm mx-auto'>
                                <Image
                                    src={getImageUrl('/Images/owners/kati.jpg')}
                                    alt={t('team', 'person2Name')}
                                    width={400}
                                    height={500}
                                    priority
                                    quality={30}
                                    sizes='(max-width: 640px) 100vw, 400px'
                                    fetchPriority='high'
                                    className='w-full h-[280px] sm:h-[320px] object-cover rounded-lg shadow-lg'
                                />
                            </div>
                            <div className='flex justify-center gap-4 text-sm'>
                                <span className='bg-[#005baa] text-white px-3 py-1 rounded-full'>{t('team', 'orthodontistSpecialist')}</span>
                                <span className='bg-[#005baa] text-white px-3 py-1 rounded-full'>{t('team', 'modernTechniques')}</span>
                            </div>
                            <p className='text-gray-700 leading-relaxed text-justify px-2'>{t('team', 'person2Description')}</p>
                        </div>

                        {/* Desktop Layout */}
                        <div className='hidden lg:flex lg:w-full lg:gap-8 xl:gap-12'>
                            <div className='lg:w-1/3 xl:w-2/5'>
                                <Image
                                    src={getImageUrl('/Images/owners/kati.jpg')}
                                    alt={t('team', 'person2Name')}
                                    width={400}
                                    height={500}
                                    priority
                                    quality={30}
                                    sizes='(max-width: 1024px) 50vw, 400px'
                                    fetchPriority='high'
                                    className='w-full h-[400px] xl:h-[450px] object-cover rounded-lg shadow-lg'
                                />
                            </div>
                            <div className='lg:w-2/3 xl:w-3/5 lg:pt-0'>
                                <h2 className='text-3xl xl:text-4xl font-bold text-[#005baa] mb-3 font-serif'>{t('team', 'person2Name')}</h2>
                                <p className='text-xl xl:text-2xl text-[#005baa] font-medium mb-6'>{t('team', 'person2Title')}</p>
                                <div className='flex gap-4 mb-6'>
                                    <span className='bg-[#005baa] text-white px-4 py-2 rounded-full text-sm'>{t('team', 'orthodontistSpecialist')}</span>
                                    <span className='bg-[#005baa] text-white px-4 py-2 rounded-full text-sm'>{t('team', 'modernTechniques')}</span>
                                </div>
                                <p className='text-gray-700 leading-relaxed text-justify text-lg xl:text-xl'>{t('team', 'person2Description')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className='pt-8 sm:pt-12'>
                    <StaticCTA locale={params.locale} title={t('team', 'ctaTitle')} subtitle={t('team', 'ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
