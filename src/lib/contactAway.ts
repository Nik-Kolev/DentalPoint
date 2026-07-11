import type { ContactSettings } from '@/types/contact';
import { toSofiaDateString } from '@/lib/format';

const AWAY_SOON_LEAD_DAYS = 3;
// The form stops accepting new requests this many days before the clinic's actual awayFrom
// date — a message sent the evening before closing has essentially no chance of a same-day
// reply, so visitors are better served by the away notice + emergency numbers a day early
// than by a form that looks open but effectively isn't.
const FORM_CLOSE_LEAD_DAYS = 1;

function shiftIsoDate(iso: string, deltaDays: number): string {
    return new Date(new Date(iso).getTime() + deltaDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Pure — no I/O, so it's safe to import from both server components and client
// components (unlike contact-data.ts, which is marked 'server-only').
export function isContactAway(settings: ContactSettings, now: Date = new Date()): boolean {
    if (!settings.awayEnabled || !settings.awayFrom || !settings.awayUntil) return false;
    const today = toSofiaDateString(now);
    const closesFrom = shiftIsoDate(settings.awayFrom, -FORM_CLOSE_LEAD_DAYS);
    return today >= closesFrom && today <= settings.awayUntil;
}

// True for the days between AWAY_SOON_LEAD_DAYS and FORM_CLOSE_LEAD_DAYS before awayFrom —
// lets visitors still submit the form, but warns them a response may be delayed until after
// the clinic reopens, instead of the form looking completely normal right up until it closes.
export function isContactAwaySoon(settings: ContactSettings, now: Date = new Date()): boolean {
    if (!settings.awayEnabled || !settings.awayFrom) return false;
    if (isContactAway(settings, now)) return false;
    const today = toSofiaDateString(now);
    const leadStart = shiftIsoDate(settings.awayFrom, -AWAY_SOON_LEAD_DAYS);
    return today >= leadStart;
}

export function formatAwayRange(settings: ContactSettings, locale: string): string {
    const formatter = new Intl.DateTimeFormat(locale === 'bg' ? 'bg-BG' : 'en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    const from = formatter.format(new Date(settings.awayFrom));
    const until = formatter.format(new Date(settings.awayUntil));
    return `${from} – ${until}`;
}
