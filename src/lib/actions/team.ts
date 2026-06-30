'use server';

import { auth } from '@/auth';
import { readTeamMembers, writeTeamMembers } from '@/lib/gallery-data';
import type { TeamMember } from '@/types/gallery';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const JPEG_EXTS = new Set(['.jpg', '.jpeg']);

async function assertAdmin(): Promise<void> {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');
}

export async function replaceTeamMemberImage(
    id: string,
    formData: FormData,
): Promise<{ imagePath: string }> {
    await assertAdmin();

    const file = formData.get('image') as File | null;
    if (!file || file.size === 0) throw new Error('No file');

    const members = readTeamMembers();
    const member = members.find((m) => m.id === id);
    if (!member) throw new Error('Member not found');

    const ext = path.extname(file.name).toLowerCase();
    const bytes = await file.arrayBuffer();
    const buf = Buffer.from(bytes);

    // Keep JPEG bytes raw (no re-encode loss); convert other formats to JPEG
    const outputBuf = JPEG_EXTS.has(ext) ? buf : await sharp(buf).jpeg({ quality: 95 }).toBuffer();

    // Write to a new UUID filename so the URL changes — cache headers on /Images/** are immutable,
    // so overwriting the same filename would leave browsers serving the old cached file forever.
    const newFilename = `${randomUUID()}.jpg`;
    const newRelPath = `/Images/owners/${newFilename}`;
    const newFilePath = path.join(process.cwd(), 'public', newRelPath);
    fs.writeFileSync(newFilePath, outputBuf);

    // Delete old file (ignore errors — may already be gone or be the seeded path)
    try { fs.unlinkSync(path.join(process.cwd(), 'public', member.imagePath)); } catch { /* ok */ }

    const updated = members.map((m) =>
        m.id === id ? { ...m, imagePath: newRelPath } : m,
    );
    writeTeamMembers(updated);

    return { imagePath: newRelPath };
}

export async function updateTeamMemberText(
    id: string,
    fields: Pick<TeamMember, 'nameBg' | 'nameEn' | 'titleBg' | 'titleEn' | 'descriptionBg' | 'descriptionEn'>,
): Promise<void> {
    await assertAdmin();
    const members = readTeamMembers();
    const updated = members.map((m) => (m.id === id ? { ...m, ...fields } : m));
    writeTeamMembers(updated);
}
