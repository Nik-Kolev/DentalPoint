import { requireAdmin } from '@/lib/admin-auth';
import { readHomeGallery, writeHomeGallery, appendPendingChange } from '@/lib/gallery-data';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { id } = await params;
    const { direction }: { direction: 'left' | 'right' } = await request.json();
    if (direction !== 'left' && direction !== 'right') {
        return Response.json({ error: 'direction must be left or right' }, { status: 400 });
    }

    const items = readHomeGallery();
    const target = items.find((i) => i.id === id);
    if (!target) return Response.json({ error: 'Not found' }, { status: 404 });

    const filePath = path.join(process.cwd(), 'public', target.path);
    const degrees = direction === 'right' ? 90 : 270;

    const rotated = await sharp(filePath).rotate(degrees).jpeg({ quality: 95 }).toBuffer();
    fs.writeFileSync(filePath, rotated);

    // Regenerate blur for the rotated image
    const blurBuf = await sharp(rotated).resize(10, 10, { fit: 'cover' }).jpeg({ quality: 30 }).toBuffer();
    const blurDataURL = 'data:image/jpeg;base64,' + blurBuf.toString('base64');

    const updated = items.map((i) => (i.id === id ? { ...i, blurDataURL } : i));
    writeHomeGallery(updated);
    appendPendingChange({ page: 'home', action: 'rotate', detail: target.filename });

    return Response.json({ ok: true, blurDataURL });
}
