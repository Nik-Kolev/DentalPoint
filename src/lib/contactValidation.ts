export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 40;

export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 500;

// Digits only, after stripping formatting — covers "0876346261", "+359876346261",
// "00359876346261" and any other country's number. E.164 caps a phone number at 15 digits.
export const PHONE_MIN_DIGITS = 7;
export const PHONE_MAX_DIGITS = 15;

// Total string length (formatting included), distinct from the digit-count bounds above — a
// number can have the right digit count but still be an unreasonable string if it's padded with
// excess whitespace/punctuation (e.g. a digit-by-digit-spaced paste). Generous enough that no
// realistic real-world formatting of a 15-digit number ever gets silently cut off by this limit
// before the digit-count check even runs.
export const PHONE_MIN_LENGTH = 7;
export const PHONE_MAX_LENGTH = 25;

// Allowed characters only — lets the browser reject stray letters/symbols before submit.
// Digit-count range (the real check) still has to happen in validatePhone, since a character
// class alone can't express "between 7 and 15 digits, ignoring spaces/dashes/parens".
export const PHONE_CHAR_PATTERN = /^[+0-9\s()-]+$/;

export type ContactFieldErrorCode = 'required' | 'tooShort' | 'tooLong' | 'invalidFormat';

export interface ContactFormErrors {
    name?: ContactFieldErrorCode;
    phone?: ContactFieldErrorCode;
    message?: ContactFieldErrorCode;
}

// Strips ASCII control characters (0x00-0x1F, 0x7F). Without this, a submitted name/message
// containing a raw newline could inject a fake extra line into the plain-text notification
// ntfy.ts's buildMessage() assembles (e.g. a name of "John\nТелефон: 0000000000" would render
// as if it were a second field) — name/phone allow none of these, message keeps \t/\n/\r since
// it's a real multi-line field.
function stripControlChars(value: string, keepNewlines: boolean): string {
    const pattern = keepNewlines ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g : /[\x00-\x1F\x7F]/g;
    return value.replace(pattern, '');
}

export function sanitizeName(value: string): string {
    return stripControlChars(value, false).trim();
}

export function sanitizePhone(value: string): string {
    return stripControlChars(value, false).trim();
}

export function sanitizeMessage(value: string): string {
    return stripControlChars(value, true).trim();
}

export function validateName(value: string): ContactFieldErrorCode | undefined {
    if (!value) return 'required';
    if (value.length < NAME_MIN_LENGTH) return 'tooShort';
    if (value.length > NAME_MAX_LENGTH) return 'tooLong';
    return undefined;
}

export function validatePhone(value: string): ContactFieldErrorCode | undefined {
    if (!value) return 'required';
    if (value.length > PHONE_MAX_LENGTH) return 'tooLong';
    if (!PHONE_CHAR_PATTERN.test(value)) return 'invalidFormat';
    const digitCount = value.replace(/\D/g, '').length;
    if (digitCount < PHONE_MIN_DIGITS || digitCount > PHONE_MAX_DIGITS) return 'invalidFormat';
    return undefined;
}

export function validateMessage(value: string): ContactFieldErrorCode | undefined {
    if (!value) return 'required';
    if (value.length < MESSAGE_MIN_LENGTH) return 'tooShort';
    if (value.length > MESSAGE_MAX_LENGTH) return 'tooLong';
    return undefined;
}
