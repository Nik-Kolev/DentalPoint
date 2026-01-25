/**
 * Image Optimization Script
 * Run with: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../public/Images');

const CONFIG = {
    // Large photos (hero sections) - Optimize for web delivery
    large: {
        maxWidth: 1920,
        maxHeight: 1440,
        quality: 85, // Balanced quality/size for web
        minSize: 200 * 1024, // Optimize files larger than 200KB
    },
    // Faces/People - High quality but web-optimized
    people: {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 90, // High quality for portraits
        minSize: 200 * 1024, // Optimize files larger than 200KB
    },
    // Certificates - readability is key
    certificates: {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 85, // Good quality, smaller files
        minSize: 200 * 1024, // Optimize files larger than 200KB
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
    const fileName = path.basename(filePath);
    const needsProcessing = folder === 'certificates' || (config.minSize && originalSize >= config.minSize);

    // Skip small files to preserve original quality (except certificates which need rotation/trim)
    if (!needsProcessing) {
        console.log(`○ ${relativePath}: Skipped (Small enough: ${(originalSize / 1024).toFixed(0)}KB)`);
        return { original: originalSize, optimized: originalSize };
    }

    try {
        const inputBuffer = fs.readFileSync(filePath);
        let image = sharp(inputBuffer);
        const metadata = await image.metadata();

        // Special handling for certificates
        if (folder === 'certificates') {
            // Rotate specific certificates
            // if (fileName === 'CCI_000077.jpg') {
            //     image = image.rotate(90); // 90 degrees clockwise
            // }
            // if (fileName === 'CCI_000060.jpg') {
            //     image = image.rotate(180); // Upside down - rotate 180
            // }

            // Trim white borders/backgrounds from certificates
            image = image.trim({
                threshold: 10, // Trim pixels within 10 of white (255,255,255)
                background: { r: 255, g: 255, b: 255 }
            });
        } else {
            // Auto-rotate based on EXIF orientation (fixes rotated images)
            image = image.rotate();
        }

        // Get updated metadata after rotation/trim
        const updatedMetadata = await image.clone().metadata();

        // Resize if larger than max dimensions (preserves aspect ratio with fit: 'inside')
        if (updatedMetadata.width > config.maxWidth || updatedMetadata.height > config.maxHeight) {
            image = image.resize(config.maxWidth, config.maxHeight, {
                fit: 'inside',
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3, // Better quality resizing
            });
        }

        let outputBuffer;
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.png') {
            outputBuffer = await image
                .png({
                    quality: config.quality,
                    compressionLevel: 9,
                    adaptiveFiltering: true,
                    palette: true,
                })
                .toBuffer();
        } else {
            // Use better mozjpeg settings for smaller files without quality loss
            outputBuffer = await image
                .jpeg({
                    quality: config.quality,
                    mozjpeg: true,
                    progressive: true,
                    optimizeScans: true,
                })
                .toBuffer();
        }

        // Always save certificates (rotation/trim), or save if we actually save space
        if (folder === 'certificates' || outputBuffer.length < originalSize) {
            fs.writeFileSync(filePath, outputBuffer);
            const savings = (((originalSize - outputBuffer.length) / originalSize) * 100).toFixed(1);
            if (outputBuffer.length < originalSize) {
                console.log(`✓ ${relativePath}: ${(originalSize / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB (-${savings}%)`);
            } else {
                console.log(`✓ ${relativePath}: ${(originalSize / 1024).toFixed(0)}KB → ${(outputBuffer.length / 1024).toFixed(0)}KB (processed)`);
            }
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
