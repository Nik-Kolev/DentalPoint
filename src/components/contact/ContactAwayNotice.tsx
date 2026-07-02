interface Doctor {
    name: string;
    phone: string;
}

interface ContactAwayNoticeProps {
    title: string;
    dateMessage: string;
    callLabel: string;
    doctors: Doctor[];
}

export default function ContactAwayNotice({ title, dateMessage, callLabel, doctors }: ContactAwayNoticeProps) {
    return (
        <div className='text-center'>
            <p className='font-playfair text-3xl sm:text-4xl text-[var(--dp-primary)] font-bold mb-2'>{title}</p>
            <p className='font-montserrat text-gray-700 font-semibold mb-6'>{dateMessage}</p>
            <p className='font-montserrat text-sm font-semibold text-gray-500 mb-2'>{callLabel}</p>
            <div className='flex flex-col gap-2 items-center'>
                {doctors.map((d) => (
                    <div key={d.phone} className='font-montserrat text-gray-800'>
                        <span className='font-semibold'>{d.name}:</span>{' '}
                        <span className='text-[var(--dp-primary)] font-bold tabular-nums'>
                            {d.phone}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
