/**
 * GALLERY PAGE - Server Component
 * Features interactive before/after slider comparisons
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getTranslation, getSection } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';

// Lazy load slider - it's interactive and below the fold for most items
const BeforeAfterSlider = dynamic(() => import('@/components/BeforeAfterSlider'), {
    ssr: true,
});

export const metadata: Metadata = {
    title: 'Gallery',
    description: 'View our dental work gallery showcasing before and after results.',
};

// Featured cases with interactive sliders
const featuredCases: {
    before: string;
    after: string;
    titleBg: string;
    titleEn: string;
    descriptionKey: number;
    imageStyle?: string;
    beforeImageStyle?: string;
    afterImageStyle?: string;
    aspectRatio?: string;
}[] = [
    {
        before: '/Images/gallery/case1/case1_before.jpeg',
        after: '/Images/gallery/case1/case1_after.jpeg',
        titleBg: 'Композитно възстановяване',
        titleEn: 'Composite Bonding',
        descriptionKey: 0,
    },
    {
        before: '/Images/gallery/case2/case2_before.jpeg',
        after: '/Images/gallery/case2/case2_after.jpeg',
        titleBg: 'Зъбен имплант',
        titleEn: 'Dental Implant',
        descriptionKey: 1,
    },
    {
        before: '/Images/gallery/case3/case3_before.jpeg',
        after: '/Images/gallery/case3/case3_after.jpeg',
        titleBg: 'Лечение с брекети',
        titleEn: 'Braces Treatment',
        descriptionKey: 2,
        aspectRatio: 'aspect-[5/2]',
    },
    {
        before: '/Images/gallery/case4/case4_before.jpeg',
        after: '/Images/gallery/case4/case4_after.jpeg',
        titleBg: 'Лечение на пулпит/периодонтит',
        titleEn: 'Pulpitis/Periodontitis Treatment',
        descriptionKey: 3,
    },
    {
        before: '/Images/gallery/case5/case5_before.jpeg',
        after: '/Images/gallery/case5/case5_after.jpeg',
        titleBg: 'Лечение с алайнери',
        titleEn: 'Aligner Treatment',
        descriptionKey: 4,
        afterImageStyle: 'object-cover object-[center_5%]',
    },
    {
        before: '/Images/gallery/case6/case6_before.jpeg',
        after: '/Images/gallery/case6/case6_after.jpeg',
        titleBg: 'Избелване',
        titleEn: 'Teeth Whitening',
        descriptionKey: 5,
        aspectRatio: 'aspect-[5/2]',
        beforeImageStyle: 'object-cover -translate-y-[-4px]',
        afterImageStyle: 'object-cover -translate-y-[10px] scale-[1.09]',
    },
];

export default function Gallery({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const gallery = getSection(params.locale, 'gallery') as any;

    const beforeLabel = t('gallery', 'before');
    const afterLabel = t('gallery', 'after');

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='text-center pb-6 sm:pb-8'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('gallery', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600 max-w-2xl mx-auto'>{t('gallery', 'subtitle')}</p>
                </div>

                {/* Hint for interaction - moved above */}
                <div className='text-center pb-8 sm:pb-10'>
                    <p className='text-sm text-gray-500 flex items-center justify-center gap-2'>
                        <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
                            <path strokeLinecap='round' strokeLinejoin='round' d='M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' />
                        </svg>
                        {params.locale === 'bg' ? 'Плъзнете за да сравните резултатите' : 'Drag the slider to compare results'}
                    </p>
                </div>

                {/* Featured Cases - Interactive Sliders */}
                <div className='space-y-12 sm:space-y-16'>
                    {featuredCases.map((caseItem, index) => (
                        <div key={index} className={`${index % 2 === 0 ? '' : 'lg:flex-row-reverse'} flex flex-col lg:flex-row gap-6 lg:gap-10 items-center`}>
                            {/* Slider */}
                            <div className='w-full lg:w-3/5'>
                                <BeforeAfterSlider
                                    beforeImage={caseItem.before}
                                    afterImage={caseItem.after}
                                    beforeLabel={beforeLabel}
                                    afterLabel={afterLabel}
                                    priority={index === 0}
                                    imageStyle={caseItem.imageStyle}
                                    beforeImageStyle={caseItem.beforeImageStyle}
                                    afterImageStyle={caseItem.afterImageStyle}
                                    aspectRatio={caseItem.aspectRatio}
                                />
                            </div>

                            {/* Info card */}
                            <div className='w-full lg:w-2/5'>
                                <div className='bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-[#e3f3fb] h-full'>
                                    <h3 className='text-xl font-bold text-[#005baa] mb-4'>{params.locale === 'bg' ? caseItem.titleBg : caseItem.titleEn}</h3>
                                    <p className='text-gray-600 leading-relaxed'>
                                        {gallery.items?.[caseItem.descriptionKey]?.description ||
                                            (params.locale === 'bg'
                                                ? 'Възстановяване на естетиката и функцията на зъбите с висококачествени материали и прецизна техника.'
                                                : 'Restoring dental aesthetics and function using high-quality materials and precise techniques.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className='pt-12 sm:pt-16'>
                    <StaticCTA locale={params.locale} title={t('gallery', 'ctaTitle')} subtitle={t('gallery', 'ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
