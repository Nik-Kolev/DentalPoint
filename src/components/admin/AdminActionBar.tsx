'use client';

interface AdminActionBarProps {
    onRevert: () => void;
    onDone: () => void;
    revertLabel?: string;
    doneLabel?: string;
}

export default function AdminActionBar({
    onRevert,
    onDone,
    revertLabel = '↩ Върни преди промените',
    doneLabel = '✓ Готово',
}: AdminActionBarProps) {
    return (
        <div className='fixed bottom-6 inset-x-0 flex justify-center z-20 pointer-events-none'>
            <div className='flex items-center gap-3 bg-white rounded-full shadow-xl border border-gray-200 px-5 py-2.5 pointer-events-auto'>
                <button onClick={onRevert} className='text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors'>
                    {revertLabel}
                </button>
                <div className='w-px h-5 bg-gray-200' />
                <button
                    onClick={onDone}
                    className='px-4 py-1.5 bg-[var(--dp-primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--dp-primary)]/90 transition-colors'
                >
                    {doneLabel}
                </button>
            </div>
        </div>
    );
}
