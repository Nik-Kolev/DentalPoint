import 'server-only';
import fs from 'fs';
import path from 'path';
import type { ContactSubmission, ContactSettings } from '@/types/contact';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = 'contact-submissions.json';
const SETTINGS_FILE = 'contact-settings.json';
const RETENTION_DAYS = 60;
const DEFAULT_SETTINGS: ContactSettings = { awayEnabled: false, awayFrom: '', awayUntil: '' };

function readAll(): ContactSubmission[] {
    const filePath = path.join(DATA_DIR, FILE);
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ContactSubmission[];
}

function writeAll(submissions: ContactSubmission[]): void {
    fs.writeFileSync(path.join(DATA_DIR, FILE), JSON.stringify(submissions, null, 2), 'utf8');
}

function pruneExpired(submissions: ContactSubmission[]): ContactSubmission[] {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return submissions.filter((s) => new Date(s.createdAt).getTime() >= cutoff);
}

// Both mutators below are called from Server Actions that `await assertAdmin()` first —
// that await is a yield point, so two near-simultaneous requests (e.g. an admin clicking
// through several messages quickly) can each start their own read-modify-write before the
// other's write lands, silently losing one of the two updates. Since production runs a
// single Node process (PM2 fork mode, no cluster flag), a module-level promise chain is
// enough to serialize every write to this file within that process.
let writeQueue: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(fn: () => T): Promise<T> {
    const result = writeQueue.then(fn, fn) as Promise<T>;
    writeQueue = result.catch(() => {});
    return result;
}

export function readContactSubmissions(): ContactSubmission[] {
    return pruneExpired(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function appendContactSubmission(submission: ContactSubmission): Promise<void> {
    return enqueueWrite(() => {
        const kept = pruneExpired(readAll());
        kept.push(submission);
        writeAll(kept);
    });
}

export function setSubmissionsRead(ids: string[], read: boolean): Promise<void> {
    return enqueueWrite(() => {
        const idSet = new Set(ids);
        const kept = pruneExpired(readAll());
        writeAll(kept.map((s) => (idSet.has(s.id) ? { ...s, read } : s)));
    });
}

export function readContactSettings(): ContactSettings {
    const filePath = path.join(DATA_DIR, SETTINGS_FILE);
    if (!fs.existsSync(filePath)) return DEFAULT_SETTINGS;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ContactSettings;
}

export function writeContactSettings(settings: ContactSettings): void {
    fs.writeFileSync(path.join(DATA_DIR, SETTINGS_FILE), JSON.stringify(settings, null, 2), 'utf8');
}
