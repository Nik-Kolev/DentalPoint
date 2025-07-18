import Image from 'next/image';

interface CertificateCardProps {
    title: string;
    description: string;
    year: string;
    issuer: string;
    imageUrl: string;
}

export default function CertificateCard({ title, description, year, issuer, imageUrl }: CertificateCardProps) {
    return (
        <div className='bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
            <div className='relative h-48'>
                <Image src={imageUrl} alt={title} fill className='object-cover' />
                <div className='absolute top-2 right-2 bg-[#005baa] text-white px-2 py-1 rounded text-sm font-semibold'>{year}</div>
            </div>
            <div className='p-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>{title}</h3>
                <p className='text-gray-600 text-sm mb-3'>{description}</p>
                <div className='text-sm text-[#005baa] font-medium'>{issuer}</div>
            </div>
        </div>
    );
}
