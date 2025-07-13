import type { Metadata } from 'next';
import Image from 'next/image';
import { getSection, getTranslation } from '../../../lib/useTranslation';

export const metadata: Metadata = {
    title: 'Licenses and Certificates',
    description:
        'View our professional dental licenses and certifications. Our team maintains the highest standards of qualification and continuous education.',
};

interface License {
    title: string;
    description: string;
    year: string;
    issuer: string;
}

interface LicensesSection {
    title: string;
    subtitle: string;
    licenses: License[];
}

export default function Licenses({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    const layout = getSection(params.locale, 'layout') as any;
    const licensesData = getSection(params.locale, 'licenses') as unknown as LicensesSection;

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{licensesData.title}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{licensesData.subtitle}</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {licensesData.licenses.map((license, index) => (
                        <div key={index} className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
                            {/* License Image */}
                            <div className='relative h-48 bg-gradient-to-br from-[#005baa] to-[#009fe3] flex items-center justify-center'>
                                <div className='absolute inset-0 bg-black bg-opacity-10'></div>
                                <Image
                                    src='https://lzvdw3wv3rlhnguv.public.blob.vercel-storage.com/header_logo.jpg'
                                    alt={license.title}
                                    width={120}
                                    height={120}
                                    className='object-cover opacity-20 absolute inset-0 w-full h-full'
                                />
                                <div className='relative z-10 text-center text-white'>
                                    <div className='text-4xl mb-2'>🏆</div>
                                    <div className='text-sm font-semibold px-2'>{license.year}</div>
                                </div>
                            </div>

                            {/* License Content */}
                            <div className='p-6'>
                                <div className='mb-4'>
                                    <h3 className='text-lg font-bold text-[#005baa] mb-2 line-clamp-2 min-h-[3.5rem]'>{license.title}</h3>
                                    <p className='text-gray-600 text-sm leading-relaxed line-clamp-3 min-h-[4rem]'>{license.description}</p>
                                </div>

                                <div className='border-t pt-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center text-xs text-gray-500'>
                                            <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                                />
                                            </svg>
                                            <span className='font-medium text-[#009fe3]'>{license.year}</span>
                                        </div>
                                        <div className='text-xs text-gray-400 text-right max-w-[60%] truncate'>{license.issuer}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Section */}
                <div className='mt-16 bg-white rounded-lg shadow-lg p-8'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-center'>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>{licensesData.licenses.length}+</div>
                            <div className='text-gray-600'>Сертификати</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>12+</div>
                            <div className='text-gray-600'>Години общ опит</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>500+</div>
                            <div className='text-gray-600'>Доволни пациенти</div>
                        </div>
                        <div>
                            <div className='text-3xl font-bold text-[#005baa] mb-2'>100%</div>
                            <div className='text-gray-600'>Професионализъм</div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className='text-center mt-12'>
                    <div className='bg-[#005baa] rounded-lg p-8 text-white'>
                        <h3 className='text-2xl font-bold mb-4'>Доверете се на нашия опит</h3>
                        <p className='text-lg mb-6'>Нашите квалификации гарантират най-високо качество на лечение</p>
                        <a
                            href={`/${params.locale}/contact`}
                            className='inline-block px-8 py-3 bg-white text-[#005baa] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200'
                        >
                            {layout.contactUs}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
