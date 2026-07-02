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

export function readContactSubmissions(): ContactSubmission[] {
    return pruneExpired(readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function appendContactSubmission(submission: ContactSubmission): void {
    const kept = pruneExpired(readAll());
    kept.push(submission);
    writeAll(kept);
}

export function readContactSettings(): ContactSettings {
    const filePath = path.join(DATA_DIR, SETTINGS_FILE);
    if (!fs.existsSync(filePath)) return DEFAULT_SETTINGS;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ContactSettings;
}

export function writeContactSettings(settings: ContactSettings): void {
    fs.writeFileSync(path.join(DATA_DIR, SETTINGS_FILE), JSON.stringify(settings, null, 2), 'utf8');
}
