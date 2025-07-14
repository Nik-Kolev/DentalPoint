import Image from 'next/image';
import Link from 'next/link';
import { getTranslation } from '../../lib/useTranslation';

export default function Home({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='bg-gradient-to-b from-[#e3f3fb] to-white'>
            {/* Hero Section */}
            <section className='pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col items-center text-center px-4'>
                <div className='bg-white rounded-full shadow-lg p-3 sm:p-4 mb-4 sm:mb-6'>
                    <Image
                        src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                        alt='Dental Point Logo'
                        width={80}
                        height={80}
                        className='w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full object-cover'
                    />
                </div>
                <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#005baa] mb-2 max-w-4xl'>{t('home', 'heroTitle')}</h1>
                <h2 className='text-lg sm:text-xl md:text-2xl font-semibold text-[#009fe3] mb-3 sm:mb-4 max-w-3xl'>{t('home', 'heroSubtitle')}</h2>
                <p className='text-sm sm:text-base md:text-lg text-gray-700 max-w-xl mx-auto mb-4 sm:mb-6 leading-relaxed'>{t('home', 'aboutText')}</p>
                <Link
                    href={`/${params.locale}/contact`}
                    className='inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-[#009fe3] text-white font-semibold rounded-lg shadow hover:bg-[#005baa] transition-colors duration-200 text-sm sm:text-base'
                >
                    {t('home', 'cta')}
                </Link>
            </section>

            {/* About Section */}
            <section className='py-8 sm:py-12 bg-white/80'>
                <div className='max-w-4xl mx-auto text-center px-4 sm:px-6'>
                    <h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#005baa] mb-4 sm:mb-6'>{t('home', 'aboutTitle')}</h3>
                    <p className='text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed'>{t('home', 'aboutText')}</p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className='py-8 sm:py-12 bg-gradient-to-t from-[#e3f3fb] to-white'>
                <div className='max-w-6xl mx-auto px-4 sm:px-6'>
                    <h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#005baa] text-center mb-6 sm:mb-8'>{t('home', 'galleryTitle')}</h3>
                    <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4'>
                        {/* Use the header logo as a placeholder for all images */}
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
                </div>
            </section>
        </div>
    );
}
