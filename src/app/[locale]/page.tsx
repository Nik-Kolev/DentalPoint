import Image from 'next/image';
import Link from 'next/link';
import { getTranslation } from '../../lib/useTranslation';

export default function Home({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    return (
        <div className='min-h-screen bg-gradient-to-b from-[#e3f3fb] to-white flex flex-col justify-between'>
            {/* Hero Section */}
            <section className='pt-12 pb-8 flex flex-col items-center text-center'>
                <div className='bg-white rounded-full shadow-lg p-4 mb-4'>
                    <Image
                        src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/cube.jpg'
                        alt='Dental Clinic Logo'
                        width={100}
                        height={100}
                        className='rounded-full'
                    />
                </div>
                <h1 className='text-4xl font-extrabold text-[#005baa] mb-2'>{t('heroTitle')}</h1>
                <h2 className='text-xl font-semibold text-[#009fe3] mb-4'>{t('heroSubtitle')}</h2>
                <p className='text-gray-700 max-w-xl mx-auto mb-6'>{t('aboutText')}</p>
                <Link
                    href={`/${params.locale}/contact`}
                    className='inline-block px-8 py-3 bg-[#009fe3] text-white font-semibold rounded-lg shadow hover:bg-[#005baa] transition'
                >
                    {t('cta')}
                </Link>
            </section>

            {/* About Section */}
            <section className='py-8 bg-white/80'>
                <div className='max-w-2xl mx-auto text-center'>
                    <h3 className='text-2xl font-bold text-[#005baa] mb-2'>{t('aboutTitle')}</h3>
                    <p className='text-gray-600'>{t('aboutText')}</p>
                </div>
            </section>

            {/* Gallery Section */}
            <section className='py-8 bg-gradient-to-t from-[#e3f3fb] to-white'>
                <div className='max-w-4xl mx-auto'>
                    <h3 className='text-2xl font-bold text-[#005baa] text-center mb-6'>{t('galleryTitle')}</h3>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        {/* Use the cube as a placeholder for all images */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='bg-white rounded-lg shadow p-2 flex items-center justify-center'>
                                <Image
                                    src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/cube.jpg'
                                    alt={`Gallery image ${i + 1}`}
                                    width={120}
                                    height={120}
                                    className='rounded-md'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer with Social Links */}
            <footer className='bg-white border-t py-6 mt-8'>
                <div className='max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4'>
                    <div className='text-gray-500 text-sm mb-2 md:mb-0'>&copy; 2024 Дентален кабинет. {t('footer')}</div>
                    <div className='flex space-x-4'>
                        <a
                            href='https://facebook.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Facebook'
                            className='text-[#005baa] hover:text-[#009fe3]'
                        >
                            <svg width='28' height='28' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0' />
                            </svg>
                        </a>
                        <a
                            href='https://instagram.com'
                            target='_blank'
                            rel='noopener noreferrer'
                            aria-label='Instagram'
                            className='text-[#005baa] hover:text-[#009fe3]'
                        >
                            <svg width='28' height='28' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.783 2.225 7.149 2.163 8.415 2.105 8.795 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406 2.697 2.387 2.403 3.499 2.344 4.78 2.285 6.06 2.272 6.469 2.272 12c0 5.531.013 5.94.072 7.22.059 1.281.353 2.393 1.334 3.374.981.981 2.093 1.275 3.374 1.334 1.28.059 1.689.072 7.22.072s5.94-.013 7.22-.072c1.281-.059 2.393-.353 3.374-1.334.981-.981 1.275-2.093 1.334-3.374.059-1.28.072-1.689.072-7.22s-.013-5.94-.072-7.22c-.059-1.281-.353-2.393-1.334-3.374C21.393.425 20.281.131 19 .072 17.719.013 17.309 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' />
                            </svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
