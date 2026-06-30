import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface StaticCTAProps {
    title: string;
    subtitle: string;
}

export default async function StaticCTA({ title, subtitle }: StaticCTAProps) {
    const t = await getTranslations('layout');

    return (
        <div className='relative overflow-hidden text-center bg-[var(--dp-cta-bg)] text-white py-12 px-6 md:px-12 rounded-3xl' data-static-cta>
            <div className='absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10' />
            <div className='absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10' />
            <div className='absolute top-4 right-32 w-20 h-20 rounded-full bg-white/5' />
            <div className='relative z-10'>
                <h2 className='text-xl md:text-2xl font-bold mb-3 font-serif max-w-2xl mx-auto leading-tight'>{title}</h2>
                <p className='text-base md:text-lg mb-8 max-w-2xl mx-auto opacity-90'>{subtitle}</p>
                <Link
                    href='/contact'
                    className='inline-block bg-[var(--dp-cta-btn-bg)] text-[var(--dp-cta-btn-text)] px-10 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg'
                >
                    {t('contactUs')}
                </Link>
            </div>
        </div>
    );
}
