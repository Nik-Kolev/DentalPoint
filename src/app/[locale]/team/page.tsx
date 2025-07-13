import { getTranslation } from '../../../lib/useTranslation';

export default function Team({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-3xl mx-auto px-4'>
                <h1 className='text-3xl font-extrabold text-[#005baa] mb-8 text-center'>{t('teamTitle')}</h1>
                <div className='grid md:grid-cols-2 gap-8'>
                    <div className='bg-white rounded-lg shadow p-6 flex flex-col items-center'>
                        <div className='w-32 h-32 bg-gray-200 rounded-full mb-4 flex items-center justify-center'>
                            {/* Placeholder image */}
                            <span className='text-5xl text-[#009fe3]'>👩‍⚕️</span>
                        </div>
                        <h2 className='text-xl font-bold text-[#005baa] mb-2'>{t('teamPerson1')}</h2>
                        <p className='text-gray-600 text-center'>{t('teamPerson1Desc')}</p>
                    </div>
                    <div className='bg-white rounded-lg shadow p-6 flex flex-col items-center'>
                        <div className='w-32 h-32 bg-gray-200 rounded-full mb-4 flex items-center justify-center'>
                            {/* Placeholder image */}
                            <span className='text-5xl text-[#009fe3]'>👩‍⚕️</span>
                        </div>
                        <h2 className='text-xl font-bold text-[#005baa] mb-2'>{t('teamPerson2')}</h2>
                        <p className='text-gray-600 text-center'>{t('teamPerson2Desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
