'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitContactForm, type ContactFormState } from '@/lib/actions/contact';

const initialState: ContactFormState = { status: 'idle' };

const inputCls =
    'w-full rounded-xl border border-[var(--dp-card-border)] px-4 py-3 font-montserrat text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--dp-primary)]';
const labelCls = 'block font-montserrat text-sm font-semibold text-gray-700 mb-2';

export default function ContactForm() {
    const t = useTranslations('contact');
    const [state, formAction, pending] = useActionState(submitContactForm, initialState);

    if (state.status === 'success') {
        return (
            <div className='text-center py-16'>
                <p className='font-playfair text-2xl text-[var(--dp-primary)] font-bold mb-2'>{t('successTitle')}</p>
                <p className='font-montserrat text-gray-600'>{t('successMessage')}</p>
            </div>
        );
    }

    return (
        <form action={formAction} className='space-y-6'>
            <div>
                <label htmlFor='name' className={labelCls}>{t('nameLabel')}</label>
                <input id='name' name='name' type='text' required className={inputCls} />
            </div>
            <div>
                <label htmlFor='phone' className={labelCls}>{t('phoneLabel')}</label>
                <input id='phone' name='phone' type='tel' required className={inputCls} />
            </div>
            <div>
                <label htmlFor='message' className={labelCls}>{t('messageLabel')}</label>
                <textarea id='message' name='message' rows={4} required placeholder={t('messagePlaceholder')} className={`${inputCls} resize-none`} />
            </div>

            {state.status === 'error' && (
                <p role='alert' className='font-montserrat text-sm text-red-600'>{t('errorMessage')}</p>
            )}

            <button
                type='submit'
                disabled={pending}
                className='w-full rounded-xl bg-[var(--dp-cta-btn-bg)] text-[var(--dp-cta-btn-text)] font-montserrat font-semibold py-3.5 hover:opacity-90 transition-opacity disabled:opacity-60'
            >
                {pending ? t('sending') : t('submit')}
            </button>
        </form>
    );
}
