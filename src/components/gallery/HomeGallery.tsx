import { readHomeGallery } from '@/lib/gallery-data';
import { auth } from '@/auth';
import HomeGalleryClient from './HomeGalleryClient';

export default async function HomeGallery() {
    const [items, session] = await Promise.all([readHomeGallery(), auth()]);
    return <HomeGalleryClient initialItems={items} isAdmin={!!session?.user} />;
}
