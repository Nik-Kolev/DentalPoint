import { getSection } from '../../../lib/useTranslation';

export default function Reviews({ params }: { params: { locale: string } }) {
    const reviews = getSection(params.locale, 'reviews') as any;

    return (
        <div className='min-h-screen py-12 bg-gradient-to-b from-[#e3f3fb] to-white'>
            <div className='max-w-3xl mx-auto px-4'>
                <h1 className='text-3xl font-extrabold text-[#005baa] mb-8 text-center'>{reviews.title}</h1>
                <div className='space-y-6'>
                    {[1, 2, 3].map((n) => (
                        <div key={n} className='bg-white rounded-lg shadow p-6'>
                            <p className='text-gray-700 italic mb-2'>{reviews.example}</p>
                            <div className='text-right text-[#009fe3] font-bold'>
                                {reviews.patient} {n}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
