import { readHomeGallery } from '@/lib/gallery-data';
import { auth } from '@/auth';
import HomeGalleryAdmin from './HomeGalleryAdmin';
import HomeGalleryViewer from './HomeGalleryViewer';

export default async function HomeGallery() {
    const [items, session] = await Promise.all([readHomeGallery(), auth()]);

    if (session?.user) {
        return <HomeGalleryAdmin initialItems={items} />;
    }

    return <HomeGalleryViewer items={items} />;
}
