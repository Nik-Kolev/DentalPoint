import 'server-only';
import fs from 'fs';
import path from 'path';
import type { HomeGalleryItem, GalleryCase, Certificate, PendingChange } from '@/types/gallery';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJson<T>(filename: string): T {
    const raw = fs.readFileSync(path.join(DATA_DIR, filename), 'utf8');
    return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
}

export function readHomeGallery(): HomeGalleryItem[] {
    return readJson<HomeGalleryItem[]>('home-gallery.json').sort((a, b) => a.order - b.order);
}

export function writeHomeGallery(items: HomeGalleryItem[]): void {
    writeJson('home-gallery.json', items);
}

export function readGalleryCases(): GalleryCase[] {
    return readJson<GalleryCase[]>('gallery-cases.json').sort((a, b) => a.order - b.order);
}

export function writeGalleryCases(cases: GalleryCase[]): void {
    writeJson('gallery-cases.json', cases);
}

export function readCertificates(): Certificate[] {
    return readJson<Certificate[]>('certificates.json').sort((a, b) => a.order - b.order);
}

export function writeCertificates(items: Certificate[]): void {
    writeJson('certificates.json', items);
}

export function readPendingChanges(): PendingChange[] {
    const file = path.join(DATA_DIR, 'pending-changes.json');
    if (!fs.existsSync(file)) return [];
    return readJson<PendingChange[]>('pending-changes.json');
}

export function appendPendingChange(change: Omit<PendingChange, 'at'>): void {
    const changes = readPendingChanges();
    changes.push({ ...change, at: new Date().toISOString() });
    writeJson('pending-changes.json', changes);
}

export function clearPendingChanges(): void {
    writeJson('pending-changes.json', []);
}
