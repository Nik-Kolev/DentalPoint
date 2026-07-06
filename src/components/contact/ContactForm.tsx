'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { submitContactForm, type ContactFormState } from '@/lib/actions/contact';
import {
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH,
    MESSAGE_MIN_LENGTH,
    MESSAGE_MAX_LENGTH,
    PHONE_MIN_LENGTH,
    PHONE_MAX_LENGTH,
    PHONE_CHAR_PATTERN,
    type ContactFieldErrorCode,
} from '@/lib/contactValidation';

const initialState: ContactFormState = { status: 'idle' };

function fieldCls(invalid: boolean): string {
    const border = invalid
        ? 'border-red-500 focus:ring-red-400'
        : 'border-[var(--dp-card-border)] focus:ring-[var(--dp-primary)]';
    return `w-full rounded-xl border ${border} px-4 py-3 font-montserrat text-gray-800 focus:outline-none focus:ring-2`;
}
const labelCls = 'block font-montserrat text-sm font-semibold text-gray-700 mb-2';
const fieldErrorCls = 'mt-1.5 font-montserrat text-sm text-red-600';

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

    const fieldError = (field: 'name' | 'phone' | 'message'): ContactFieldErrorCode | undefined => state.errors?.[field];

    return (
        <form action={formAction} className='space-y-6' noValidate>
            <div>
                <label htmlFor='name' className={labelCls}>{t('nameLabel')}</label>
                <input
                    id='name'
                    name='name'
                    type='text'
                    required
                    minLength={NAME_MIN_LENGTH}
                    maxLength={NAME_MAX_LENGTH}
                    aria-invalid={Boolean(fieldError('name'))}
                    aria-describedby={fieldError('name') ? 'name-error' : undefined}
                    className={fieldCls(Boolean(fieldError('name')))}
                />
                {fieldError('name') && (
                    <p id='name-error' role='alert' className={fieldErrorCls}>{t(`nameError_${fieldError('name')}`)}</p>
                )}
            </div>
            <div>
                <label htmlFor='phone' className={labelCls}>{t('phoneLabel')}</label>
                <input
                    id='phone'
                    name='phone'
                    type='tel'
                    required
                    pattern={PHONE_CHAR_PATTERN.source}
                    title={t('phoneHint')}
                    minLength={PHONE_MIN_LENGTH}
                    maxLength={PHONE_MAX_LENGTH}
                    aria-invalid={Boolean(fieldError('phone'))}
                    aria-describedby={fieldError('phone') ? 'phone-error' : undefined}
                    className={fieldCls(Boolean(fieldError('phone')))}
                />
                {fieldError('phone') && (
                    <p id='phone-error' role='alert' className={fieldErrorCls}>{t(`phoneError_${fieldError('phone')}`)}</p>
                )}
            </div>
            <div>
                <label htmlFor='message' className={labelCls}>{t('messageLabel')}</label>
                <textarea
                    id='message'
                    name='message'
                    rows={4}
                    required
                    minLength={MESSAGE_MIN_LENGTH}
                    maxLength={MESSAGE_MAX_LENGTH}
                    placeholder={t('messagePlaceholder')}
                    aria-invalid={Boolean(fieldError('message'))}
                    aria-describedby={fieldError('message') ? 'message-error' : undefined}
                    className={`${fieldCls(Boolean(fieldError('message')))} resize-none`}
                />
                {fieldError('message') && (
                    <p id='message-error' role='alert' className={fieldErrorCls}>{t(`messageError_${fieldError('message')}`)}</p>
                )}
            </div>

            {state.status === 'error' && !state.errors && (
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
