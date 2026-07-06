'use server';

import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { appendContactSubmission, setSubmissionsRead, deleteContactSubmissions, readContactSubmissions, writeContactSettings } from '@/lib/contact-data';
import { sendNtfyNotification } from '@/lib/ntfy';
import { sanitizeName, sanitizePhone, sanitizeMessage, validateName, validatePhone, validateMessage, type ContactFormErrors } from '@/lib/contactValidation';
import type { ContactSettings, ContactSubmission } from '@/types/contact';

async function assertAdmin(): Promise<void> {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
}

// formData.get() is typed as FormDataEntryValue | null (File | string | null) — a raw `as string`
// cast would throw at runtime (.trim() doesn't exist on File) if this public, unauthenticated
// action ever receives a crafted multipart POST with a file part under one of these field names.
function getStringField(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === 'string' ? value : '';
}

export interface ContactFormState {
    status: 'idle' | 'success' | 'error';
    errors?: ContactFormErrors;
}

export async function submitContactForm(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
    const name = sanitizeName(getStringField(formData, 'name'));
    const phone = sanitizePhone(getStringField(formData, 'phone'));
    const message = sanitizeMessage(getStringField(formData, 'message'));

    const errors: ContactFormErrors = {
        name: validateName(name),
        phone: validatePhone(phone),
        message: validateMessage(message),
    };

    if (errors.name || errors.phone || errors.message) {
        return { status: 'error', errors };
    }

    const submission: ContactSubmission = {
        id: randomUUID(),
        name,
        phone,
        message,
        createdAt: new Date().toISOString(),
        read: false,
    };

    await appendContactSubmission(submission);
    await sendNtfyNotification(submission);

    return { status: 'success' };
}

export async function updateContactAwaySettings(settings: ContactSettings): Promise<void> {
    await assertAdmin();
    writeContactSettings(settings);
}

export async function markSubmissionsAsRead(ids: string[], read: boolean = true): Promise<void> {
    await assertAdmin();
    await setSubmissionsRead(ids, read);
}

export async function deleteSubmissions(ids: string[]): Promise<void> {
    await assertAdmin();
    await deleteContactSubmissions(ids);
}

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
    await assertAdmin();
    return readContactSubmissions();
}
