/**
 * LICENSES PAGE - Server Component
 * Interactive grid with lightbox and stats extracted to LicensesGrid.tsx (client component)
 */
import type { Metadata } from 'next';
import { getTranslation } from '../../../lib/useTranslation';
import StaticCTA from '@/components/StaticCTA';
import LicensesGrid from '@/components/LicensesGrid';

export const metadata: Metadata = {
    title: 'Certificates & Licenses',
    description: 'View our professional dental certificates and licenses.',
};

const certificatesData = [
    '/Images/certificates/CCI_000058.jpg',
    '/Images/certificates/CCI_000059.jpg',
    '/Images/certificates/CCI_000060.jpg',
    '/Images/certificates/CCI_000061.jpg',
    '/Images/certificates/CCI_000063.jpg',
    '/Images/certificates/CCI_000065.jpg',
    '/Images/certificates/CCI_000064.jpg',
    '/Images/certificates/CCI_000062.jpg',
    '/Images/certificates/CCI_000066.jpg',
    '/Images/certificates/CCI_000067.jpg',
    '/Images/certificates/CCI_000068.jpg',
    '/Images/certificates/CCI_000069.jpg',
    '/Images/certificates/CCI_000070.jpg',
    '/Images/certificates/CCI_000073.jpg',
    '/Images/certificates/CCI_000074.jpg',
    '/Images/certificates/CCI_000075.jpg',
    '/Images/certificates/CCI_000076.jpg',
    '/Images/certificates/CCI_000077.jpg',
];

export default function Licenses({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center pb-8 sm:pb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('licenses', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('licenses', 'subtitle')}</p>
                </div>

                <LicensesGrid
                    certificates={certificatesData}
                    locale={params.locale}
                    loadMoreLabel={t('licenses', 'loadMore')}
                    showLessLabel={t('licenses', 'showLess')}
                    statsLabels={{
                        certificates: t('licenses', 'statsCertificates'),
                        experience: t('licenses', 'statsExperience'),
                        patients: t('licenses', 'statsPatients'),
                        professionalism: t('licenses', 'statsProfessionalism'),
                    }}
                />

                <div className='pt-8 sm:pt-12'>
                    <StaticCTA locale={params.locale} title={t('licenses', 'ctaTitle')} subtitle={t('licenses', 'ctaSubtitle')} />
                </div>
            </div>
        </div>
    );
}
