export default function ContactAwaySoonBanner({ message }: { message: string }) {
    return (
        <div className='mb-6 rounded-xl border border-[var(--dp-accent)]/30 bg-[var(--dp-accent)]/10 px-4 py-3 text-center font-montserrat text-sm text-gray-700'>
            {message}
        </div>
    );
}
