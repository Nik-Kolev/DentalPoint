import { auth } from '@/auth';

export async function requireAdmin(): Promise<Response | null> {
    const session = await auth();
    if (!session?.user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}
