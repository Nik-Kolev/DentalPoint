/**
 * Image Optimization Script
 * Run with: node scripts/optimize-images.js
 *
 * This script compresses and resizes all images in public/Images
 * to improve PageSpeed scores.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/Images');

// Configuration for different image types
const CONFIG = {
    // Large photos (clinic, front images)
    large: {
        maxWidth: 1200,
        maxHeight: 900,
        quality: 80,
    },
    // Medium images (team, certificates)
    medium: {
        maxWidth: 800,
        maxHeight: 600,
        quality: 80,
    },
    // Small images (gallery before/after, thumbnails)
    small: {
        maxWidth: 600,
        maxHeight: 600,
        quality: 80,
    },
    // Logos
    logo: {
        maxWidth: 400,
        maxHeight: 200,
        quality: 85,
    },
};

// Map folders to config
const FOLDER_CONFIG = {
    front: 'large',
    owners: 'medium',
    certificates: 'medium',
    gallery: 'small',
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
    const configKey = FOLDER_CONFIG[folder] || 'medium';
    const config = CONFIG[configKey];

    const ext = path.extname(filePath).toLowerCase();
    const originalSize = fs.statSync(filePath).size;

    try {
        // Read file into buffer first to avoid file locking issues on Windows
        const inputBuffer = fs.readFileSync(filePath);
        let image = sharp(inputBuffer);
        const metadata = await image.metadata();

        // Resize if needed
        if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
            image = image.resize(config.maxWidth, config.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        // Convert PNG to JPEG (except logos which need transparency)
        let outputPath = filePath;
        let outputBuffer;

        if (ext === '.png' && folder !== 'logo') {
            // Convert PNG to JPEG
            outputPath = filePath.replace('.png', '.jpg');
            outputBuffer = await image.jpeg({ quality: config.quality, mozjpeg: true }).toBuffer();
        } else if (ext === '.png') {
            // Optimize PNG
            outputBuffer = await image.png({ quality: config.quality, compressionLevel: 9 }).toBuffer();
        } else {
            // Optimize JPEG
            outputBuffer = await image.jpeg({ quality: config.quality, mozjpeg: true }).toBuffer();
        }

        // Only save if smaller
        if (outputBuffer.length < originalSize) {
            fs.writeFileSync(outputPath, outputBuffer);

            // Remove old PNG if converted
            if (outputPath !== filePath && ext === '.png') {
                fs.unlinkSync(filePath);
            }

            const newSize = outputBuffer.length;
            const savings = (((originalSize - newSize) / originalSize) * 100).toFixed(1);
            console.log(`✓ ${relativePath}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (-${savings}%)`);
            return { original: originalSize, optimized: newSize, path: relativePath };
        } else {
            console.log(`○ ${relativePath}: Already optimized`);
            return { original: originalSize, optimized: originalSize, path: relativePath, skipped: true };
        }
    } catch (error) {
        console.error(`✗ ${relativePath}: ${error.message}`);
        return { original: originalSize, optimized: originalSize, path: relativePath, error: true };
    }
}

async function main() {
    console.log('🖼️  Image Optimization Script\n');
    console.log('Scanning for images...\n');

    const files = await getImageFiles(IMAGES_DIR);
    console.log(`Found ${files.length} images\n`);

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of files) {
        const result = await optimizeImage(file);
        totalOriginal += result.original;
        totalOptimized += result.optimized;
    }

    console.log('\n═══════════════════════════════════════');
    console.log(`Total: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB → ${(totalOptimized / 1024 / 1024).toFixed(2)}MB`);
    console.log(
        `Saved: ${((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2)}MB (${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1)}%)`
    );
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
