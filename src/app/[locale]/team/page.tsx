import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

export const metadata: Metadata = {
    title: 'Our Team',
    description: 'Meet our experienced dental professionals at Dental Point. Learn about our skilled dentists and their specializations.',
};

export default function Team({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    const doctors = [
        {
            id: 'dr-yavor-ivanov',
            name: t('team', 'person1Name'),
            title: t('team', 'person1Title'),
            description: t('team', 'person1Description'),
            imagePath: '/Images/owners/dr-iavor.jpg',
        },
        {
            id: 'dr-ekaterina-ivanova',
            name: t('team', 'person2Name'),
            title: t('team', 'person2Title'),
            description: t('team', 'person2Description'),
            imagePath: '/Images/owners/dr-kati.jpg',
        },
    ];

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-12'>
                    <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-[#005baa] mb-4 font-serif'>{t('team', 'title')}</h1>
                    <p className='text-lg md:text-xl text-gray-600'>{t('team', 'subtitle')}</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto'>
                    {doctors.map((doctor, index) => (
                        <div key={doctor.id} id={doctor.id} className='flex flex-col items-center text-center scroll-mt-24'>
                            {/* Image Container */}
                            <div className='relative w-full max-w-[420px] aspect-[3/4] mb-6 rounded-2xl overflow-hidden shadow-lg bg-gray-100 group'>
                                <Image
                                    src={getImageUrl(doctor.imagePath)}
                                    alt={doctor.name}
                                    fill
                                    priority={index === 0}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    fetchPriority={index === 0 ? 'high' : 'auto'}
                                    quality={75}
                                    sizes='(max-width: 768px) 420px, (max-width: 1200px) 50vw, 420px'
                                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                                    placeholder='blur'
                                    blurDataURL={getBlurPlaceholder(doctor.imagePath)}
                                />
                            </div>

                            {/* Text Container */}
                            <div className='w-full max-w-lg'>
                                <h2 className='text-2xl sm:text-3xl font-bold text-[#005baa] mb-2 font-serif'>{doctor.name}</h2>
                                <p className='text-lg sm:text-xl text-[#009fe3] font-medium mb-4'>{doctor.title}</p>
                                <p className='text-gray-700 leading-relaxed text-lg text-justify'>{doctor.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className='pt-16'>
                    <StaticCTA locale={params.locale} title={t('team', 'ctaTitle')} subtitle={t('team', 'ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
