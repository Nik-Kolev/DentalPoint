#!/bin/bash
# Run this on your server to fix the corrupted build

cd /var/www/DentalPoint

echo "🔧 Fixing corrupted build..."

# Stop PM2
pm2 stop dentalpoint || true

# Clean everything
echo "🧹 Cleaning old build..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc

# Rebuild from scratch
echo "🔨 Rebuilding Next.js..."
NODE_OPTIONS="--max-old-space-size=2048" NODE_ENV=production npm run build

# Verify build
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Restart PM2
echo "🚀 Restarting application..."
pm2 restart dentalpoint || pm2 start npm --name dentalpoint -- start

# Wait for app to be ready
sleep 5

# Check status
pm2 status

echo "✅ Build fixed! Check logs with: pm2 logs dentalpoint"
