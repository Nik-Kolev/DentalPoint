import type { Metadata } from 'next';
import { getTranslation } from '../../../lib/useTranslation';
import CTAButton from '@/components/CTAButton';
import CertificateCard from './CertificateCard';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const locale = params?.locale || 'bg';
    const t = getTranslation(locale);

    return {
        title: `${t('licenses', 'title')}`,
        description: t('licenses', 'subtitle'),
    };
}

export default function Licenses({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const licensesData = t('licenses', 'licenses');

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('licenses', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('licenses', 'subtitle')}</p>
                </div>

                {/* Certificates Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16'>
                    {licensesData.map((license: any, index: number) => (
                        <CertificateCard
                            key={index}
                            title={license.title}
                            description={license.description}
                            year={license.year}
                            issuer={license.issuer}
                            imageUrl={getCertificateImageId(index)}
                        />
                    ))}
                </div>

                {/* Statistics Section */}
                <div className='mt-16 bg-white rounded-lg shadow-lg p-8'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-center'>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>{licensesData.length}+</div>
                            <div className='text-gray-600'>{t('licenses', 'statsCertificates')}</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>12+</div>
                            <div className='text-gray-600'>{t('licenses', 'statsExperience')}</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>500+</div>
                            <div className='text-gray-600'>{t('licenses', 'statsPatients')}</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>100%</div>
                            <div className='text-gray-600'>{t('licenses', 'statsProfessionalism')}</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className='text-center mt-12 bg-[#0056b3] text-white py-8 rounded-xl'>
                    <h2 className='text-xl md:text-2xl font-bold mb-3 font-serif'>{t('licenses', 'statsTitle')}</h2>
                    <p className='text-base md:text-lg mb-6'>{t('licenses', 'statsSubtitle')}</p>
                    <CTAButton locale={params.locale} />
                </div>
            </div>
        </div>
    );
}

// Helper function to get different certificate images
function getCertificateImageId(index: number): string {
    // Use your existing working image
    return 'https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg';
}
