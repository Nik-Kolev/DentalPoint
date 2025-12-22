/**
 * Generate blur placeholders for all images
 * Run with: node scripts/generate-blur-placeholders.js
 *
 * Outputs a TypeScript file with blur data URLs for all images.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/Images');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/blurPlaceholders.ts');

async function getImageFiles(dir, baseDir = dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...(await getImageFiles(fullPath, baseDir)));
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
            // Get path relative to public folder
            const publicPath = '/' + path.relative(path.join(baseDir, '..'), fullPath).replace(/\\/g, '/');
            files.push({ fullPath, publicPath });
        }
    }
    return files;
}

async function generateBlurDataURL(filePath) {
    const buffer = await sharp(filePath).resize(10, 10, { fit: 'inside' }).blur().jpeg({ quality: 50 }).toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

async function main() {
    console.log('🔵 Generating blur placeholders...\n');

    const files = await getImageFiles(IMAGES_DIR);
    const placeholders = {};

    for (const { fullPath, publicPath } of files) {
        try {
            const blurDataURL = await generateBlurDataURL(fullPath);
            placeholders[publicPath] = blurDataURL;
            console.log(`✓ ${publicPath}`);
        } catch (error) {
            console.error(`✗ ${publicPath}: ${error.message}`);
        }
    }

    // Generate TypeScript file
    const tsContent = `// Auto-generated blur placeholders
// Run: node scripts/generate-blur-placeholders.js

export const blurPlaceholders: Record<string, string> = ${JSON.stringify(placeholders, null, 2)};

export function getBlurPlaceholder(imagePath: string): string | undefined {
    // Normalize path
    const normalized = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
    return blurPlaceholders[normalized];
}
`;

    fs.writeFileSync(OUTPUT_FILE, tsContent);
    console.log(`\n✅ Generated ${OUTPUT_FILE}`);
    console.log(`   ${Object.keys(placeholders).length} placeholders created`);
}

main().catch(console.error);
