'use server';

import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { appendContactSubmission, writeContactSettings } from '@/lib/contact-data';
import type { ContactSettings } from '@/types/contact';

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

    appendContactSubmission({
        id: randomUUID(),
        name,
        phone,
        message,
        createdAt: new Date().toISOString(),
    });

    return { status: 'success' };
}

export async function updateContactAwaySettings(settings: ContactSettings): Promise<void> {
    await assertAdmin();
    writeContactSettings(settings);
}
