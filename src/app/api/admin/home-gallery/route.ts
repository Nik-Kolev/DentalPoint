import { requireAdmin } from '@/lib/admin-auth';
import { readHomeGallery, writeHomeGallery, appendPendingChange } from '@/lib/gallery-data';
import type { HomeGalleryItem } from '@/types/gallery';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'Images', 'front');

export async function POST(request: Request) {
    const deny = await requireAdmin();
    if (deny) return deny;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase() || '.jpeg';
    const filename = randomUUID() + ext;
    const destPath = path.join(UPLOAD_DIR, filename);
    const publicPath = `/Images/front/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    // Auto-rotate from EXIF and bake into pixels — ensures correct orientation everywhere
    const processed = await sharp(buffer).rotate().jpeg({ quality: 95 }).toBuffer();
    fs.writeFileSync(destPath, processed);

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
