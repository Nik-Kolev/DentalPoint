'use server';

import { auth } from '@/auth';
import {
    readHomeGallery,
    writeHomeGallery,
    readCertificates,
    writeCertificates,
    appendPendingChange,
} from '@/lib/gallery-data';
import type { PendingChange } from '@/types/gallery';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Structural shape shared by HomeGalleryItem and Certificate (identical fields)
interface GalleryItem {
    id: string;
    filename: string;
    path: string;
    alt: string;
    order: number;
    blurDataURL?: string;
}

interface GalleryConfig {
    uploadDir: string;
    publicPrefix: string;
    altPrefix: string;
    page: PendingChange['page'];
    read: () => GalleryItem[];
    write: (items: GalleryItem[]) => void;
}

export type Gallery = 'home' | 'certificates';

const JPEG_EXTS = new Set(['.jpg', '.jpeg']);

const configs: Record<Gallery, GalleryConfig> = {
    home: {
        uploadDir: path.join(process.cwd(), 'public', 'Images', 'front'),
        publicPrefix: '/Images/front/',
        altPrefix: 'clinic-interior',
        page: 'home',
        read: readHomeGallery,
        write: writeHomeGallery,
    },
    certificates: {
        uploadDir: path.join(process.cwd(), 'public', 'Images', 'certificates'),
        publicPrefix: '/Images/certificates/',
        altPrefix: 'certificate',
        page: 'certificates',
        read: readCertificates,
        write: writeCertificates,
    },
};

async function assertAdmin() {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
}

async function _upload(formData: FormData, config: GalleryConfig): Promise<GalleryItem> {
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided');

    const ext = path.extname(file.name).toLowerCase() || '.jpeg';
    const buffer = Buffer.from(await file.arrayBuffer());

    let finalBuffer: Buffer;
    let saveExt: string;

    if (JPEG_EXTS.has(ext)) {
        finalBuffer = buffer;
        saveExt = ext;
    } else {
        finalBuffer = await sharp(buffer).rotate().jpeg({ quality: 100 }).toBuffer();
        saveExt = '.jpeg';
    }

    const filename = randomUUID() + saveExt;
    fs.writeFileSync(path.join(config.uploadDir, filename), finalBuffer);

    const items = config.read();
    const newItem: GalleryItem = {
        id: randomUUID(),
        filename,
        path: config.publicPrefix + filename,
        alt: `${config.altPrefix}-${items.length + 1}`,
        order: items.length,
    };

    config.write([...items, newItem]);
    appendPendingChange({ page: config.page, action: 'add' });

    return newItem;
}

async function _remove(id: string, config: GalleryConfig): Promise<void> {
    const items = config.read();
    const target = items.find((i) => i.id === id);
    if (!target) throw new Error('Not found');

    const filePath = path.join(process.cwd(), 'public', target.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    const updated = items
        .filter((i) => i.id !== id)
        .map((item, index) => ({ ...item, order: index }));

    config.write(updated);
    appendPendingChange({ page: config.page, action: 'remove', detail: target.filename });
}

async function _rotate(id: string, direction: 'left' | 'right', config: GalleryConfig): Promise<void> {
    const items = config.read();
    const target = items.find((i) => i.id === id);
    if (!target) throw new Error('Not found');

    const filePath = path.join(process.cwd(), 'public', target.path);
    const degrees = direction === 'right' ? 90 : 270;
    const rotated = await sharp(filePath).rotate(degrees).jpeg({ quality: 100 }).toBuffer();
    fs.writeFileSync(filePath, rotated);

    config.write(items);
    appendPendingChange({ page: config.page, action: 'rotate', detail: target.filename });
}

async function _reorder(orderedIds: string[], config: GalleryConfig): Promise<void> {
    const items = config.read();
    const reordered = orderedIds
        .map((id, index) => {
            const item = items.find((i) => i.id === id);
            return item ? { ...item, order: index } : null;
        })
        .filter(Boolean) as GalleryItem[];

    config.write(reordered);
    appendPendingChange({ page: config.page, action: 'reorder' });
}

export async function uploadGalleryImage(gallery: Gallery, formData: FormData) {
    await assertAdmin();
    return _upload(formData, configs[gallery]);
}

export async function removeGalleryImage(gallery: Gallery, id: string) {
    await assertAdmin();
    return _remove(id, configs[gallery]);
}

export async function rotateGalleryImage(gallery: Gallery, id: string, direction: 'left' | 'right') {
    await assertAdmin();
    return _rotate(id, direction, configs[gallery]);
}

export async function reorderGallery(gallery: Gallery, orderedIds: string[]) {
    await assertAdmin();
    return _reorder(orderedIds, configs[gallery]);
}
