import { requireAdmin } from '@/lib/admin-auth';
import { readHomeGallery, writeHomeGallery, appendPendingChange } from '@/lib/gallery-data';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { id } = await params;
    const items = readHomeGallery();
    const target = items.find((i) => i.id === id);
    if (!target) return Response.json({ error: 'Not found' }, { status: 404 });

    // Remove file from disk
    const filePath = path.join(process.cwd(), 'public', target.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Update JSON — remove item and re-index order
    const updated = items
        .filter((i) => i.id !== id)
        .map((item, index) => ({ ...item, order: index }));

    writeHomeGallery(updated);
    appendPendingChange({ page: 'home', action: 'remove', detail: target.filename });

    return Response.json({ ok: true });
}
