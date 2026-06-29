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

    // Auto-rotate from EXIF, then save full quality
    const processed = await sharp(buffer).rotate().jpeg({ quality: 95 }).toBuffer();
    fs.writeFileSync(destPath, processed);

    // Generate blur placeholder
    const blurBuf = await sharp(processed).resize(10, 10, { fit: 'cover' }).jpeg({ quality: 30 }).toBuffer();
    const blurDataURL = 'data:image/jpeg;base64,' + blurBuf.toString('base64');

    const items = readHomeGallery();
    const newItem: HomeGalleryItem = {
        id: randomUUID(),
        filename,
        path: publicPath,
        alt: `clinic-interior-${items.length + 1}`,
        order: items.length,
        blurDataURL,
    };

    items.push(newItem);
    writeHomeGallery(items);
    appendPendingChange({ page: 'home', action: 'add' });

    return Response.json(newItem, { status: 201 });
}
