'use server';

import { auth } from '@/auth';
import {
    readHomeGallery,
    writeHomeGallery,
    readCertificates,
    writeCertificates,
    readGalleryCases,
    writeGalleryCases,
    appendPendingChange,
} from '@/lib/gallery-data';
import type { GalleryCase, PendingChange } from '@/types/gallery';
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


export async function reorderGallery(gallery: Gallery, orderedIds: string[]) {
    await assertAdmin();
    return _reorder(orderedIds, configs[gallery]);
}

export async function reorderGalleryCases(orderedIds: string[]) {
    await assertAdmin();
    const cases = readGalleryCases();
    const reordered = orderedIds
        .map((id, index) => {
            const c = cases.find((item) => item.id === id);
            return c ? { ...c, order: index } : null;
        })
        .filter(Boolean) as GalleryCase[];
    writeGalleryCases(reordered);
    appendPendingChange({ page: 'gallery', action: 'reorder' });
}

function parseAspectRatio(value: string): number | undefined {
    const match = value.match(/\[(\d+)\/(\d+)\]/);
    if (!match) return undefined;
    return parseInt(match[1], 10) / parseInt(match[2], 10);
}

async function processGalleryImage(file: File, targetRatio?: number): Promise<Buffer> {
    const ext = path.extname(file.name).toLowerCase();
    const raw = Buffer.from(await file.arrayBuffer());

    if (!targetRatio && JPEG_EXTS.has(ext)) {
        // Raw JPEG passthrough — EXIF rotation handled by viewer, no re-encode loss
        return raw;
    }

    // Apply EXIF auto-rotation first (no-op for non-rotated images)
    const rotated = await sharp(raw).rotate().toBuffer();

    if (!targetRatio) {
        return sharp(rotated).jpeg({ quality: 95 }).toBuffer();
    }

    // Center-crop to target ratio so both images fill the slider container identically
    const { width, height } = await sharp(rotated).metadata();
    const w = width!;
    const h = height!;
    const naturalRatio = w / h;

    let cropW: number, cropH: number;
    if (naturalRatio > targetRatio) {
        // Image is wider than target: keep full height, crop sides
        cropH = h;
        cropW = Math.round(h * targetRatio);
    } else {
        // Image is taller than target: keep full width, crop top/bottom
        cropW = w;
        cropH = Math.round(w / targetRatio);
    }

    return sharp(rotated)
        .resize(cropW, cropH, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 95 })
        .toBuffer();
}

export async function addGalleryCase(formData: FormData): Promise<GalleryCase> {
    await assertAdmin();
    const beforeFile = formData.get('before') as File | null;
    const afterFile = formData.get('after') as File | null;
    if (!beforeFile || !afterFile) throw new Error('Both images are required');

    const captionBg = (formData.get('captionBg') as string) || '';
    const captionEn = (formData.get('captionEn') as string) || '';
    const descriptionBg = (formData.get('descriptionBg') as string) || '';
    const descriptionEn = (formData.get('descriptionEn') as string) || '';
    const aspectRatio = (formData.get('aspectRatio') as string) || 'aspect-[4/3]';

    const id = randomUUID();
    const caseDir = path.join(process.cwd(), 'public', 'Images', 'gallery', id);
    fs.mkdirSync(caseDir, { recursive: true });

    const ratio = parseAspectRatio(aspectRatio);
    const [beforeBuf, afterBuf] = await Promise.all([
        processGalleryImage(beforeFile, ratio),
        processGalleryImage(afterFile, ratio),
    ]);

    const beforeFilename = `${id}_before.jpeg`;
    const afterFilename = `${id}_after.jpeg`;
    fs.writeFileSync(path.join(caseDir, beforeFilename), beforeBuf);
    fs.writeFileSync(path.join(caseDir, afterFilename), afterBuf);

    const cases = readGalleryCases();
    const newCase: GalleryCase = {
        id,
        order: cases.length,
        captionBg,
        captionEn,
        descriptionBg,
        descriptionEn,
        beforePath: `/Images/gallery/${id}/${beforeFilename}`,
        afterPath: `/Images/gallery/${id}/${afterFilename}`,
        beforeAlt: `case-${id.slice(0, 8)}-before`,
        afterAlt: `case-${id.slice(0, 8)}-after`,
        aspectRatio,
    };
    writeGalleryCases([...cases, newCase]);
    appendPendingChange({ page: 'gallery', action: 'add' });
    return newCase;
}

export async function removeGalleryCase(id: string): Promise<void> {
    await assertAdmin();
    const cases = readGalleryCases();
    const updated = cases
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, order: i }));
    writeGalleryCases(updated);
    appendPendingChange({ page: 'gallery', action: 'remove', detail: id });
}

export async function replaceGalleryCaseImage(
    id: string,
    slot: 'before' | 'after',
    formData: FormData,
): Promise<void> {
    await assertAdmin();
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided');

    const cases = readGalleryCases();
    const target = cases.find((c) => c.id === id);
    if (!target) throw new Error('Case not found');

    const existingPath = slot === 'before' ? target.beforePath : target.afterPath;
    const filePath = path.join(process.cwd(), 'public', existingPath);

    const ratio = parseAspectRatio(target.aspectRatio ?? 'aspect-[4/3]');
    const buffer = await processGalleryImage(file, ratio);
    fs.writeFileSync(filePath, buffer);
    appendPendingChange({ page: 'gallery', action: 'replace', detail: `${id}-${slot}` });
}

export async function updateGalleryCaseText(
    id: string,
    data: { captionBg: string; captionEn: string; descriptionBg: string; descriptionEn: string; aspectRatio: string },
): Promise<void> {
    await assertAdmin();
    const cases = readGalleryCases();
    const updated = cases.map((c) =>
        c.id === id ? { ...c, ...data } : c,
    );
    writeGalleryCases(updated);
    appendPendingChange({ page: 'gallery', action: 'add', detail: id });
}
