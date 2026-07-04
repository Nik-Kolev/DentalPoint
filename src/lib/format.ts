export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('bg-BG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

// E.164 (leading + and country code) is required by Viber's deep link and recognized by
// Telegram's own phone-number auto-linking — local numbers are stored/displayed in the usual
// Bulgarian format ("0888 123 456"), so convert on the fly.
export function toE164(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits.startsWith('0') ? `+359${digits.slice(1)}` : `+${digits}`;
}

// https://developers.viber.com/docs/tools/deep-links/
export function toViberLink(phone: string): string {
    return `viber://chat?number=${toE164(phone)}`;
}

export function toTelLink(phone: string): string {
    return `tel:${phone.replace(/\s/g, '')}`;
}
