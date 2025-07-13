import { getTranslation } from '../../../lib/useTranslation';

export default function Licenses({ params }: { params: { locale: string } }) {
    const t = getTranslation(params.locale);
    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-3xl mx-auto px-4'>
                <h1 className='text-3xl font-extrabold text-[#005baa] mb-8 text-center'>{t('licensesTitle')}</h1>
                <div className='grid md:grid-cols-2 gap-8'>
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className='bg-white rounded-lg shadow p-6 flex flex-col items-center'>
                            <div className='w-32 h-32 bg-gray-200 rounded mb-4 flex items-center justify-center'>
                                {/* Placeholder for license image */}
                                <span className='text-4xl text-[#009fe3]'>📄</span>
                            </div>
                            <p className='text-gray-600 text-center'>
                                {t('certificate')} {n}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
