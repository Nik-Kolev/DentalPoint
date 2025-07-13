import type { Metadata } from 'next';
import { getTranslation } from '../../../lib/useTranslation';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with our dental clinic. Find our location, working hours, and contact information.',
};

export default function Contact({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    return (
        <div className='min-h-screen py-12'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>{t('contactTitle')}</h1>
                    <p className='mt-4 text-lg text-gray-500'>{t('contactSubtitle')}</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                    {/* Contact Information */}
                    <div>
                        <h2 className='text-2xl font-bold text-gray-900 mb-6'>{t('contactInfoTitle')}</h2>

                        <div className='space-y-6'>
                            <div>
                                <h3 className='text-lg font-medium text-gray-900'>{t('addressTitle')}</h3>
                                <p className='mt-2 text-gray-600'>
                                    [Your Address Here]
                                    <br />
                                    [City, State ZIP]
                                </p>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900'>{t('phoneTitle')}</h3>
                                <p className='mt-2 text-gray-600'>
                                    <a href='tel:+1234567890' className='hover:text-indigo-600'>
                                        +1 (234) 567-890
                                    </a>
                                </p>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900'>{t('emailTitle')}</h3>
                                <p className='mt-2 text-gray-600'>
                                    <a href='mailto:info@dentalclinic.com' className='hover:text-indigo-600'>
                                        info@dentalclinic.com
                                    </a>
                                </p>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900'>{t('workingHoursTitle')}</h3>
                                <div className='mt-2 text-gray-600'>
                                    <p>{t('workingHoursWeekdays')}</p>
                                    <p>{t('workingHoursSaturday')}</p>
                                    <p>{t('workingHoursSunday')}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className='text-lg font-medium text-gray-900'>{t('holidaysTitle')}</h3>
                                <p className='mt-2 text-gray-600'>{t('holidaysText')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div>
                        <h2 className='text-2xl font-bold text-gray-900 mb-6'>{t('locationTitle')}</h2>
                        <div className='bg-gray-200 h-96 rounded-lg flex items-center justify-center'>
                            <p className='text-gray-500'>{t('mapPlaceholder')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
