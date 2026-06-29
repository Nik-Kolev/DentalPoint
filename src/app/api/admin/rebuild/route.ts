import { requireAdmin } from '@/lib/admin-auth';
import { clearPendingChanges } from '@/lib/gallery-data';
import { exec } from 'child_process';
import path from 'path';

export async function POST() {
    const deny = await requireAdmin();
    if (deny) return deny;

    if (process.env.NODE_ENV === 'development') {
        return Response.json({ started: true, dev: true, message: 'Rebuild skipped in development mode' });
    }

    const projectRoot = process.cwd();
    const script = path.join(projectRoot, 'fix-build.sh');

    // Fire-and-forget: PM2 keeps serving old build until this succeeds
    exec(`bash "${script}"`, { cwd: projectRoot }, (error) => {
        if (error) {
            console.error('[rebuild] Build failed:', error.message);
        } else {
            clearPendingChanges();
            console.log('[rebuild] Build succeeded, pending changes cleared');
        }
    });

    return Response.json({ started: true });
}
