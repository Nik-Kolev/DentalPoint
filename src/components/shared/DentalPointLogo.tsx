import Link from 'next/link';

export default function DentalPointLogo({ label }: { label: string }) {
    return (
        <Link href='/' aria-label={label} className='flex items-center ml-2 sm:ml-3 lg:ml-4'>
            <span className='font-montserrat font-bold tracking-[0.18em] text-base sm:text-lg lg:text-xl leading-none select-none'>
                <span style={{ color: 'var(--dp-primary)' }}>DENTAL</span>
                {' '}
                <span style={{ color: 'var(--dp-accent)' }}>POINT</span>
            </span>
        </Link>
    );
}
