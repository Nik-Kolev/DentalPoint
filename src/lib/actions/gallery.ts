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
    aspectRatio?: string;
}

interface GalleryConfig {
    uploadDir: string;
    publicPrefix: string;
    altPrefix: string;
    page: PendingChange['page'];
    read: () => GalleryItem[];
    write: (items: GalleryItem[]) => void;
    computeAspectRatio?: boolean;
    maxDimension?: number;
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
        maxDimension: 2000,
    },
    certificates: {
        uploadDir: path.join(process.cwd(), 'public', 'Images', 'certificates'),
        publicPrefix: '/Images/certificates/',
        altPrefix: 'certificate',
        page: 'certificates',
        read: readCertificates,
        write: writeCertificates,
        computeAspectRatio: true,
    },
};

async function assertAdmin() {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
}

// The raw-JPEG-passthrough branches below trust the client-supplied filename's extension
// alone and skip re-encoding for quality reasons — but that means a file merely named
// "photo.jpg" whose actual bytes aren't a JPEG (e.g. HTML with a <script> tag) would
// otherwise be written to disk unchecked. metadata() reads just the header (no full pixel
// decode) and throws on anything that isn't a genuine, decodable image.
async function assertValidImage(buffer: Buffer): Promise<void> {
    try {
        await sharp(buffer).metadata();
    } catch {
        throw new Error('Uploaded file is not a valid image');
    }
}

// Home-gallery uploads otherwise pass raw JPEG bytes straight through (see certificates'
// identical no-re-encode policy) — but real phone-camera photos (e.g. 4032x3024 iPhone
// output) can be several MB at that resolution, and these images ship `unoptimized`
// (no Cloudflare/Next resizing at request time), so an oversized original is served
// byte-for-byte to every visitor. Downscaling only when the image actually exceeds the
// cap keeps small/already-reasonable uploads byte-identical.
async function capDimensions(buffer: Buffer, maxDimension: number): Promise<Buffer> {
    const rotatedBuffer = await sharp(buffer).rotate().toBuffer();
    const { width, height } = await sharp(rotatedBuffer).metadata();
    if (!width || !height || Math.max(width, height) <= maxDimension) {
        return buffer;
    }

    const resizeOpts = width >= height ? { width: maxDimension } : { height: maxDimension };
    return sharp(rotatedBuffer).resize(resizeOpts).jpeg({ quality: 85 }).toBuffer();
}

async function _upload(formData: FormData, config: GalleryConfig): Promise<GalleryItem> {
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided');

    const ext = path.extname(file.name).toLowerCase() || '.jpeg';
    const buffer = Buffer.from(await file.arrayBuffer());
    await assertValidImage(buffer);

    let finalBuffer: Buffer;
    let saveExt: string;

    if (JPEG_EXTS.has(ext)) {
        finalBuffer = config.maxDimension
            ? await capDimensions(buffer, config.maxDimension)
            : buffer;
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

    if (config.computeAspectRatio) {
        const { width, height } = await sharp(finalBuffer).rotate().metadata();
        if (width && height) newItem.aspectRatio = `${width}/${height}`;
    }

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
    await assertValidImage(raw);

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
): Promise<{ path: string }> {
    await assertAdmin();
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided');

    const cases = readGalleryCases();
    const target = cases.find((c) => c.id === id);
    if (!target) throw new Error('Case not found');

    const oldRelPath = slot === 'before' ? target.beforePath : target.afterPath;
    const newFilename = `${randomUUID()}.jpg`;
    const newRelPath = `/Images/gallery/${id}/${newFilename}`;

    const ratio = parseAspectRatio(target.aspectRatio ?? 'aspect-[4/3]');
    const buffer = await processGalleryImage(file, ratio);
    fs.writeFileSync(path.join(process.cwd(), 'public', newRelPath), buffer);

    try { fs.unlinkSync(path.join(process.cwd(), 'public', oldRelPath)); } catch { /* ok */ }

    const updated = cases.map((c) =>
        c.id === id
            ? { ...c, [slot === 'before' ? 'beforePath' : 'afterPath']: newRelPath }
            : c,
    );
    writeGalleryCases(updated);
    appendPendingChange({ page: 'gallery', action: 'replace', detail: `${id}-${slot}` });
    return { path: newRelPath };
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
