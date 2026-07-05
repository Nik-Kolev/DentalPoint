'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getContactSubmissions, markSubmissionsAsRead, deleteSubmissions } from '@/lib/actions/contact';
import { toViberLink, toTelLink, formatDate } from '@/lib/format';
import DateRangePicker from '@/components/shared/DateRangePicker';
import type { ContactSubmission } from '@/types/contact';

const PAGE_SIZE = 5;

export default function MessagesTab() {
    const t = useTranslations('statistics.messages');
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [fromIso, setFromIso] = useState('');
    const [untilIso, setUntilIso] = useState('');
    const [markingAll, setMarkingAll] = useState(false);
    const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        getContactSubmissions()
            .then(setSubmissions)
            .catch((err) => {
                console.error(err);
                setHasError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (!fromIso || !untilIso) return submissions;
        const from = new Date(fromIso);
        const until = new Date(untilIso);
        until.setHours(23, 59, 59, 999);
        return submissions.filter((s) => {
            const created = new Date(s.createdAt);
            return created >= from && created <= until;
        });
    }, [submissions, fromIso, untilIso]);

    const visible = filtered.slice(0, visibleCount);
    const hasMore = visibleCount < filtered.length;
    const hasExpanded = visibleCount > PAGE_SIZE;
    const hasFilter = Boolean(fromIso && untilIso);

    function handleDateChange(from: string, until: string) {
        setFromIso(from);
        setUntilIso(until);
        setVisibleCount(PAGE_SIZE);
    }

    function clearFilter() {
        setFromIso('');
        setUntilIso('');
        setVisibleCount(PAGE_SIZE);
    }

    async function toggleRead(id: string, read: boolean) {
        setMarkingIds((prev) => new Set(prev).add(id));
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read } : s)));
        try {
            await markSubmissionsAsRead([id], read);
        } catch (err) {
            console.error(err);
            setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read: !read } : s)));
            alert(t('markError'));
        } finally {
            setMarkingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm(t('deleteConfirm'))) return;
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
            await deleteSubmissions([id]);
            setSubmissions((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error(err);
            alert(t('deleteError'));
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }

    async function markAllVisibleRead() {
        const ids = visible.filter((s) => !s.read).map((s) => s.id);
        if (ids.length === 0) return;
        setMarkingAll(true);
        setSubmissions((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, read: true } : s)));
        try {
            await markSubmissionsAsRead(ids, true);
        } catch (err) {
            console.error(err);
            setSubmissions((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, read: false } : s)));
            alert(t('markError'));
        } finally {
            setMarkingAll(false);
        }
    }

    if (loading) {
        return (
            <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-12 text-center'>
                <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--dp-primary)]'></div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-8 text-center text-red-500 text-sm'>
                {t('loadError')}
            </div>
        );
    }

    return (
        <div className='space-y-4'>
            <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3'>
                <DateRangePicker
                    fromIso={fromIso}
                    untilIso={untilIso}
                    onChange={handleDateChange}
                    locale='bg'
                    placeholder={t('datePlaceholder')}
                    doneLabel={t('done')}
                    disabled={{ after: new Date() }}
                />
                {hasFilter && (
                    <button
                        onClick={clearFilter}
                        className='px-4 py-2 rounded-lg font-semibold text-sm text-[var(--dp-accent)] border border-[var(--dp-accent)] hover:bg-[var(--dp-accent)]/10 transition-colors'
                    >
                        {t('clearFilter')}
                    </button>
                )}
                <button
                    onClick={markAllVisibleRead}
                    disabled={markingAll || visible.every((s) => s.read)}
                    className='sm:ml-auto px-4 py-2 rounded-lg font-semibold text-sm bg-[var(--dp-primary)] text-white hover:bg-[var(--dp-primary)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                    {markingAll ? t('marking') : hasFilter ? t('markAllReadFiltered') : t('markAllRead')}
                </button>
            </div>

            {filtered.length === 0 ? (
                <div className='bg-white rounded-2xl border border-[var(--dp-card-border)] shadow-sm p-8 text-center text-gray-500 text-sm'>
                    {t('empty')}
                </div>
            ) : (
                <div className='space-y-3'>
                    {visible.map((s) => (
                        <div
                            key={s.id}
                            className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-3 ${
                                s.read ? 'border-[var(--dp-card-border)]' : 'border-[var(--dp-accent)]'
                            }`}
                        >
                            <label className='flex items-start pt-1 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    checked={s.read}
                                    disabled={markingIds.has(s.id)}
                                    onChange={(e) => toggleRead(s.id, e.target.checked)}
                                    className='w-5 h-5 accent-[var(--dp-primary)]'
                                />
                            </label>
                            <div className='flex-1 min-w-0'>
                                <div className='flex flex-wrap items-center justify-between gap-2 mb-1'>
                                    <span className='font-semibold text-gray-800'>{s.name}</span>
                                    <span className='text-xs text-gray-400'>{formatDate(s.createdAt)}</span>
                                </div>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <span className='text-sm text-gray-600 font-medium'>{s.phone}</span>
                                    <a
                                        href={toViberLink(s.phone)}
                                        className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-[var(--dp-primary)] border border-[var(--dp-primary)] hover:bg-[var(--dp-primary)]/10 transition-colors'
                                    >
                                        <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                                            />
                                        </svg>
                                        {t('viberButton')}
                                    </a>
                                    <a
                                        href={toTelLink(s.phone)}
                                        className='inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold text-[var(--dp-accent)] border border-[var(--dp-accent)] hover:bg-[var(--dp-accent)]/10 transition-colors'
                                    >
                                        <svg className='w-3.5 h-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                                            />
                                        </svg>
                                        {t('callButton')}
                                    </a>
                                </div>
                                <p className='text-sm text-gray-600 mt-1 whitespace-pre-wrap break-words'>{s.message}</p>
                                <div className='flex items-center justify-between mt-2'>
                                    {!s.read ? (
                                        <span className='inline-block text-xs font-semibold text-[var(--dp-accent)] bg-[var(--dp-accent)]/10 px-2 py-0.5 rounded-full'>
                                            {t('unreadBadge')}
                                        </span>
                                    ) : (
                                        <span />
                                    )}
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        disabled={deletingIds.has(s.id)}
                                        title='Изтрий'
                                        className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-red-500 border border-red-300 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                                    >
                                        <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(hasMore || hasExpanded) && (
                <div className='flex justify-center pt-2 gap-3'>
                    {hasMore && (
                        <button
                            onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length))}
                            className='px-5 py-2 bg-[var(--dp-primary)] text-white rounded-full font-semibold text-sm hover:bg-[var(--dp-primary)]/90 transition-colors shadow-sm'
                        >
                            {t('loadMore')}
                        </button>
                    )}
                    {hasExpanded && (
                        <button
                            onClick={() => setVisibleCount(PAGE_SIZE)}
                            className='px-5 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors'
                        >
                            {t('showLess')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
