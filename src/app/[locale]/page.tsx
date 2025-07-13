import Image from 'next/image';
import Link from 'next/link';
import { getTranslation } from '../../lib/useTranslation';

export default function Home({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='bg-gradient-to-b from-[#e3f3fb] to-white'>
            {/* Hero Section */}
            <section className='pt-12 pb-8 flex flex-col items-center text-center'>
                <div className='bg-white rounded-full shadow-lg p-4 mb-6'>
                    <Image
                        src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                        alt='Dental Point Logo'
                        width={100}
                        height={100}
                        className='rounded-full object-cover'
                    />
                </div>
                <h1 className='text-4xl font-extrabold text-[#005baa] mb-2'>{t('home', 'heroTitle')}</h1>
                <h2 className='text-xl font-semibold text-[#009fe3] mb-4'>{t('home', 'heroSubtitle')}</h2>
                <p className='text-gray-700 max-w-xl mx-auto mb-6 px-4'>{t('home', 'aboutText')}</p>
                <Link
                    href={`/${params.locale}/contact`}
                    className='inline-block px-8 py-3 bg-[#009fe3] text-white font-semibold rounded-lg shadow hover:bg-[#005baa] transition-colors duration-200'
                >
                    {t('home', 'cta')}
                </Link>
            </section>

            {/* About Section */}
            <section className='py-12 bg-white/80'>
                <div className='max-w-4xl mx-auto text-center px-4'>
                    <h3 className='text-3xl font-bold text-[#005baa] mb-6'>{t('home', 'aboutTitle')}</h3>
                    <p className='text-gray-600 text-lg leading-relaxed'>{t('home', 'aboutText')}</p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className='py-12 bg-gradient-to-t from-[#e3f3fb] to-white'>
                <div className='max-w-6xl mx-auto px-4'>
                    <h3 className='text-3xl font-bold text-[#005baa] text-center mb-8'>{t('home', 'galleryTitle')}</h3>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {/* Use the header logo as a placeholder for all images */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow duration-200'>
                                <Image
                                    src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                                    alt={`Gallery image ${i + 1}`}
                                    width={150}
                                    height={150}
                                    className='rounded-md object-cover w-full h-32'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
