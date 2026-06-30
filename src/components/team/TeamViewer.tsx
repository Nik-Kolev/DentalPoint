import Image from 'next/image';
import type { TeamMember } from '@/types/gallery';

interface Props {
    members: TeamMember[];
    locale: string;
}

export default function TeamViewer({ members, locale }: Props) {
    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10'>
            {members.map((member, i) => {
                const name = locale === 'bg' ? member.nameBg : member.nameEn;
                const title = locale === 'bg' ? member.titleBg : member.titleEn;
                const description = locale === 'bg' ? member.descriptionBg : member.descriptionEn;

                return (
                    <article
                        key={member.id}
                        id={member.id}
                        className='flex flex-col bg-white rounded-3xl shadow-sm border border-[var(--dp-card-border)] overflow-hidden scroll-mt-24'
                    >
                        {/* Portrait */}
                        <div className='relative w-full aspect-[4/5]'>
                            <Image
                                src={member.imagePath}
                                alt={name}
                                fill
                                priority
                                loading='eager'
                                fetchPriority={i === 0 ? 'high' : 'auto'}
                                quality={75}
                                sizes='(max-width: 1024px) 100vw, 50vw'
                                className='object-cover object-top'
                            />
                        </div>

                        {/* Bio */}
                        <div className='flex flex-col p-8 xl:p-10'>
                            <div className='flex items-start gap-3 mb-4'>
                                <div className='w-1.5 h-10 rounded-full bg-[var(--dp-primary)] flex-shrink-0 mt-0.5' />
                                <div>
                                    <h2 className='font-playfair text-2xl xl:text-3xl font-bold text-[var(--dp-heading)] leading-tight'>
                                        {name}
                                    </h2>
                                    <p className='font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--dp-primary)] mt-1.5'>
                                        {title}
                                    </p>
                                </div>
                            </div>
                            <p className='text-gray-600 leading-relaxed text-base'>{description}</p>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
