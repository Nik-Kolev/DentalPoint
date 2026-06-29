import { requireAdmin } from '@/lib/admin-auth';
import { readHomeGallery, writeHomeGallery, appendPendingChange } from '@/lib/gallery-data';

export async function PATCH(request: Request) {
    const deny = await requireAdmin();
    if (deny) return deny;

    const { orderedIds }: { orderedIds: string[] } = await request.json();
    if (!Array.isArray(orderedIds)) {
        return Response.json({ error: 'orderedIds must be an array' }, { status: 400 });
    }

    const items = readHomeGallery();
    const reordered = orderedIds
        .map((id, index) => {
            const item = items.find((i) => i.id === id);
            return item ? { ...item, order: index } : null;
        })
        .filter(Boolean) as typeof items;

    writeHomeGallery(reordered);
    appendPendingChange({ page: 'home', action: 'reorder' });

    return Response.json({ ok: true });
}
