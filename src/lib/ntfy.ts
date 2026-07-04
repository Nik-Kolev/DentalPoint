import fs from 'fs';
import path from 'path';
import { toE164, toViberLink, formatDate } from '@/lib/format';
import type { ContactSubmission } from '@/types/contact';

// Published via the JSON body (not the topic-in-URL + headers form) specifically because ntfy's
// documented header-based title/tags require RFC 2047 encoding for non-ASCII clients — a JSON
// body carries Cyrillic text natively with no such restriction.
// https://docs.ntfy.sh/publish/
const SEPARATOR = '━━━━━━━━━━';

function buildMessage(submission: ContactSubmission): string {
    const { name, phone, message, createdAt } = submission;
    return [SEPARATOR, `Име: ${name}`, `Телефон: ${toE164(phone)}`, `Дата: ${formatDate(createdAt)}`, SEPARATOR, message, ''].join('\n');
}

export async function sendNtfyNotification(submission: ContactSubmission): Promise<void> {
    // See e2e/global-setup.ts / global-teardown.ts — this marker exists for the duration of an
    // e2e run so the suite's real form submissions can't fire real push notifications.
    if (fs.existsSync(path.join(process.cwd(), '.e2e-running'))) {
        return;
    }

    const topic = process.env.NTFY_TOPIC;
    if (!topic) {
        console.error('NTFY_TOPIC not configured — skipping notification');
        return;
    }

    const tel = `tel:${toE164(submission.phone)}`;
    const viber = toViberLink(submission.phone);

    try {
        const res = await fetch('https://ntfy.sh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic,
                title: 'Ново Съобщение',
                message: buildMessage(submission),
                actions: [
                    { action: 'view', label: 'Обади се', url: tel },
                    { action: 'view', label: 'Отвори Viber', url: viber },
                ],
            }),
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
            console.error('ntfy notification failed', await res.text());
        }
    } catch (err) {
        console.error('ntfy notification error', err);
    }
}
