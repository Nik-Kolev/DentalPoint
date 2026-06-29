import { Suspense } from 'react';
import Image from 'next/image';
import StaticCTA from '@/components/shared/StaticCTA';
import ClientGallery from '@/components/gallery/ClientGallery';
import { getTranslations } from 'next-intl/server';
import { getImageUrl, getBlurPlaceholder } from '@/lib/imageVersion';

function GallerySkeleton() {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
                <div key={i} className='bg-white rounded-lg shadow-md p-2 sm:p-3'>
                    <div className='relative aspect-[4/3] rounded-md overflow-hidden bg-gray-200 animate-pulse' />
                </div>
            ))}
        </div>
    );
}

export default async function Home() {
    const t = await getTranslations('home');

    return (
        <div className='bg-gradient-to-b from-[#e3f3fb] to-white min-h-screen'>
            {/* Main Title */}
            <div className='text-center pt-6 sm:pt-10 pb-6 sm:pb-8 px-4'>
                <h1 className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-[#005baa] font-playfair'>
                    <span className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium opacity-80'>{t('heroTitlePrefix')}</span>
                    <span className='font-montserrat font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl'>{t('heroTitleClinic')}</span>
                </h1>
            </div>

            {/* Clinic Image Section */}
            <section className='pb-6 sm:pb-8 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='relative w-full h-[280px] sm:h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100'>
                        <Image
                            src={getImageUrl('/Images/front/clinic.jpg')}
                            alt='Dental Point Clinic'
                            fill
                            className='object-cover'
                            priority
                            loading='eager'
                            quality={75}
                            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1080px'
                            fetchPriority='high'
                            placeholder='blur'
                            blurDataURL={getBlurPlaceholder('/Images/front/clinic.jpg')}
                        />
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='bg-white border border-[#e3f3fb] rounded-lg p-6 sm:p-8 shadow-sm text-center'>
                        <h2 className='text-2xl sm:text-3xl font-bold text-[#005baa] mb-4'>{t('aboutTitle')}</h2>
                        <p className='text-gray-600 leading-relaxed text-lg text-justify indent-8'>{t('aboutTextLine1')}</p>
                        <p className='text-gray-600 leading-relaxed text-lg text-justify indent-8 mt-4'>{t('aboutTextLine2')}</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <StaticCTA title={t('ctaTitle')} subtitle={t('ctaSubtitle')} />
                </div>
            </section>

            {/* Clinic Gallery Section */}
            <section className='pb-8 sm:pb-12 px-4'>
                <div className='max-w-6xl mx-auto'>
                    <Suspense fallback={<GallerySkeleton />}>
                        <ClientGallery />
                    </Suspense>
                </div>
            </section>
        </div>
    );
}
