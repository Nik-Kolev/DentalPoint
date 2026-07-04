'use server';

import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { appendContactSubmission, setSubmissionsRead, readContactSubmissions, writeContactSettings } from '@/lib/contact-data';
import { sendNtfyNotification } from '@/lib/ntfy';
import type { ContactSettings, ContactSubmission } from '@/types/contact';

async function assertAdmin(): Promise<void> {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
}

export interface ContactFormState {
    status: 'idle' | 'success' | 'error';
}

export async function submitContactForm(_prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
    const name = (formData.get('name') as string | null)?.trim() ?? '';
    const phone = (formData.get('phone') as string | null)?.trim() ?? '';
    const message = (formData.get('message') as string | null)?.trim() ?? '';

    if (!name || !phone || !message) {
        return { status: 'error' };
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

export async function getContactSubmissions(): Promise<ContactSubmission[]> {
    await assertAdmin();
    return readContactSubmissions();
}
