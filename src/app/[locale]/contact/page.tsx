import type { Metadata } from 'next';
import { getTranslation } from '../../../lib/useTranslation';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
    const locale = params?.locale || 'bg';
    const t = getTranslation(locale);

    return {
        title: `${t('contact', 'title')}`,
        description: t('contact', 'subtitle'),
    };
}

export default function Contact({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);

    const latitude = 43.221575025798415;
    const longitude = 27.91784662746136;

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#f8fafc] to-white'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-extrabold text-[#005baa] sm:text-5xl'>{t('contact', 'title')}</h1>
                    <p className='mt-4 text-xl text-gray-600'>{t('contact', 'subtitle')}</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12'>
                    {/* Contact Information */}
                    <div className='bg-white rounded-lg shadow-lg p-8'>
                        <h2 className='text-3xl font-bold text-[#005baa] mb-8'>{t('contact', 'infoTitle')}</h2>

                        <div className='space-y-8'>
                            <div>
                                <h3 className='text-xl font-semibold text-gray-900 mb-3 flex items-center'>
                                    <svg className='w-6 h-6 text-[#009fe3] mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                        />
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                    </svg>
                                    {t('contact', 'addressTitle')}
                                </h3>
                                <div className='text-gray-700 ml-9 leading-relaxed'>
                                    <p>{t('contact', 'addressLine1')}</p>
                                    <p>{t('contact', 'addressLine2')}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-xl font-semibold text-gray-900 mb-3 flex items-center'>
                                    <svg className='w-6 h-6 text-[#009fe3] mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                                        />
                                    </svg>
                                    {t('contact', 'phoneTitle')}
                                </h3>
                                <p className='text-gray-700 ml-9'>
                                    <a href='tel:+359876346261' className='hover:text-[#009fe3] transition-colors duration-200'>
                                        087 634 6261
                                    </a>
                                </p>
                            </div>

                            <div>
                                <h3 className='text-xl font-semibold text-gray-900 mb-3 flex items-center'>
                                    <svg className='w-6 h-6 text-[#009fe3] mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                                    </svg>
                                    {t('contact', 'workingHoursTitle')}
                                </h3>
                                <div className='text-gray-700 ml-9 space-y-1'>
                                    <p>{t('contact', 'workingHoursMonday')}</p>
                                    <p>{t('contact', 'workingHoursTuesday')}</p>
                                    <p>{t('contact', 'workingHoursWednesday')}</p>
                                    <p>{t('contact', 'workingHoursThursday')}</p>
                                    <p>{t('contact', 'workingHoursFriday')}</p>
                                    <p>{t('contact', 'workingHoursSaturday')}</p>
                                    <p>{t('contact', 'workingHoursSunday')}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-xl font-semibold text-gray-900 mb-3 flex items-center'>
                                    <svg className='w-6 h-6 text-[#009fe3] mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                                        />
                                    </svg>
                                    {t('contact', 'holidaysTitle')}
                                </h3>
                                <p className='text-gray-700 ml-9'>{t('contact', 'holidaysText')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Google Maps */}
                    <div className='bg-white rounded-lg shadow-lg p-8'>
                        <h2 className='text-3xl font-bold text-[#005baa] mb-8'>{t('contact', 'locationTitle')}</h2>
                        <div className='rounded-lg overflow-hidden shadow-md'>
                            <iframe
                                src={`https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`}
                                width='100%'
                                height='400'
                                className='h-[300px] sm:h-[400px]'
                                style={{ border: 0 }}
                                allowFullScreen
                                loading='lazy'
                                referrerPolicy='no-referrer-when-downgrade'
                                title='Dental Point Location'
                            />
                        </div>
                        <div className='mt-8 text-center'>
                            <a
                                href='https://www.google.com/maps/place/Dental+Point+-+%D0%B4-%D1%80+%D0%AF%D0%B2%D0%BE%D1%80+%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2,+%D0%B4-%D1%80+%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B0+%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0/@43.221575,27.917847,17z/data=!4m6!3m5!1s0x40a455d3a111b459:0xe737faf0914586ae!8m2!3d43.2215545!4d27.917852!16s%2Fg%2F11l6zqphst?entry=ttu&g_ep=EgoyMDI1MDcxNS4xIKXMDSoASAFQAw%3D%3D'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center px-6 py-3 bg-[#009fe3] text-white font-semibold rounded-lg hover:bg-[#005baa] transition-colors duration-200'
                            >
                                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                                    />
                                </svg>
                                {t('contact', 'openInMaps')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
