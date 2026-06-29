import { requireAdmin } from '@/lib/admin-auth';
import { readHomeGallery, writeHomeGallery, appendPendingChange } from '@/lib/gallery-data';
import type { HomeGalleryItem } from '@/types/gallery';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'Images', 'front');
const JPEG_EXTS = new Set(['.jpg', '.jpeg']);

export async function POST(request: Request) {
    const deny = await requireAdmin();
    if (deny) return deny;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase() || '.jpeg';
    const buffer = Buffer.from(await file.arrayBuffer());

    let finalBuffer: Buffer;
    let saveExt: string;

    if (JPEG_EXTS.has(ext)) {
        // Save the original JPEG bytes untouched — no re-encoding, no quality loss.
        // EXIF orientation is respected automatically by browsers (image-orientation: from-image)
        // and by Cloudflare Image Resizing in production.
        finalBuffer = buffer;
        saveExt = ext;
    } else {
        // Non-JPEG (PNG, HEIC, WebP, etc.) — browsers can't render HEIC, so convert to JPEG.
        // Quality 100 minimises loss on this one-time conversion.
        finalBuffer = await sharp(buffer).rotate().jpeg({ quality: 100 }).toBuffer();
        saveExt = '.jpeg';
    }

    const filename = randomUUID() + saveExt;
    const destPath = path.join(UPLOAD_DIR, filename);
    const publicPath = `/Images/front/${filename}`;

    fs.writeFileSync(destPath, finalBuffer);

    const items = readHomeGallery();
    const newItem: HomeGalleryItem = {
        id: randomUUID(),
        filename,
        path: publicPath,
        alt: `clinic-interior-${items.length + 1}`,
        order: items.length,
    };

    items.push(newItem);
    writeHomeGallery(items);
    appendPendingChange({ page: 'home', action: 'add' });

    return Response.json(newItem, { status: 201 });
}
