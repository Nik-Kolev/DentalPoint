/**
 * Image Optimization Script
 * Run with: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/Images');

const CONFIG = {
    // Large photos (hero sections) - Optimize but keep high detail
    large: {
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 90, // Increased from 85
        minSize: 500 * 1024, // Don't touch files smaller than 500KB
    },
    // Faces/People - Highest quality
    people: {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 95, // Near lossless
        minSize: 300 * 1024, // Don't touch files smaller than 300KB
    },
    // Certificates - readability is key
    certificates: {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 90,
        minSize: 300 * 1024,
    },
    // Logos
    logo: {
        maxWidth: 800,
        maxHeight: 800,
        quality: 100, // Lossless for logos
    },
};

const FOLDER_CONFIG = {
    front: 'large',
    owners: 'people',
    certificates: 'certificates',
    gallery: 'large',
    logo: 'logo',
};

async function getImageFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...(await getImageFiles(fullPath)));
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(item.name)) {
            files.push(fullPath);
        }
    }
    return files;
}

async function optimizeImage(filePath) {
    const relativePath = path.relative(IMAGES_DIR, filePath);
    const folder = relativePath.split(path.sep)[0];
    const configKey = FOLDER_CONFIG[folder] || 'large';
    const config = CONFIG[configKey];

    const originalSize = fs.statSync(filePath).size;

    // Skip small files to preserve original quality
    if (config.minSize && originalSize < config.minSize) {
        console.log(`○ ${relativePath}: Skipped (Small enough: ${(originalSize / 1024).toFixed(0)}KB)`);
        return { original: originalSize, optimized: originalSize };
    }

    try {
        const inputBuffer = fs.readFileSync(filePath);
        let image = sharp(inputBuffer);
        const metadata = await image.metadata();

        // Auto-rotate based on EXIF orientation (fixes rotated images)
        image = image.rotate();

        // Only resize if significantly larger
        if (metadata.width > config.maxWidth) {
            image = image.resize(config.maxWidth, config.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        let outputBuffer;
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.png') {
            outputBuffer = await image.png({ quality: config.quality, compressionLevel: 8 }).toBuffer();
        } else {
            outputBuffer = await image.jpeg({ quality: config.quality, mozjpeg: true }).toBuffer();
        }

        // Only save if we actually save space
        if (outputBuffer.length < originalSize) {
            fs.writeFileSync(filePath, outputBuffer);
            const savings = (((originalSize - outputBuffer.length) / originalSize) * 100).toFixed(1);
            console.log(`✓ ${relativePath}: ${(originalSize / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB (-${savings}%)`);
            return { original: originalSize, optimized: outputBuffer.length };
        } else {
            console.log(`○ ${relativePath}: Already optimal`);
            return { original: originalSize, optimized: originalSize };
        }
    } catch (error) {
        console.error(`✗ ${relativePath}: ${error.message}`);
        return { original: originalSize, optimized: originalSize };
    }
}

async function main() {
    console.log('🖼️  Smart Image Optimization\n');
    const files = await getImageFiles(IMAGES_DIR);

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of files) {
        const result = await optimizeImage(file);
        totalOriginal += result.original;
        totalOptimized += result.optimized;
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`Total: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalOptimized / 1024 / 1024).toFixed(2)}MB`);
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
