# Deployment Guide

## Automatic Deployment

Deployment happens automatically when you push to the `main` branch via GitHub Actions.

### What Happens Automatically:

1. **Code Pull** - Latest code from main branch
2. **Clean Build** - Removes old `.next` directory to prevent corruption
3. **Dependencies** - Runs `npm install`
4. **Build** - Runs Next.js production build
5. **Nginx Config** - Automatically applies `nginx.conf.dentalpoint` from repo
6. **PM2 Restart** - Restarts the Next.js application
7. **Nginx Reload** - Reloads Nginx with new config

### Skip Deployment

To skip automatic deployment, include `[skip ci]` or `[skip deploy]` in your commit message:

```bash
git commit -m "Update docs [skip ci]"
```

### Manual Fixes (Optional - Only if auto-deployment fails)

**Normally, you don't need to do anything manually.** Auto-deployment handles everything.

If auto-deployment fails or you need to manually fix a corrupted build on the server:

```bash
cd /var/www/DentalPoint
git pull origin main
bash fix-build.sh  # Optional - only if auto-deployment fails
```

**Or just trigger a new deployment:**

```bash
# Push an empty commit to trigger auto-deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### Nginx Config

The Nginx configuration is now version-controlled in `nginx.conf.dentalpoint`. Changes to this file will automatically be applied during deployment. No manual SSH access needed!

### Scripts (Optional - For emergencies only)

-   `fix-build.sh` - Manual build fix script (auto-deployment handles this now)
-   `update-nginx.sh` - Manual Nginx update (auto-deployment handles this now)

These scripts are kept in the repo for emergency manual fixes, but you normally won't need them since auto-deployment handles everything.

## Image Optimization for Mobile Performance

The project is optimized for a 1 CPU, 1GB RAM server with aggressive mobile image settings:

-   **Device sizes**: Reduced to `[384, 640, 750, 828, 1080]` (removed 1200, 1920 for faster mobile loading)
-   **Image quality**: Reduced to 70-75 for most images (from 80-90) to reduce server CPU load
-   **Cloudflare caching**: 3 caching rules configured for `/Images/*`, `/_next/static/*`, `/_next/image/*`
-   **Sharp library**: Installed and enabled for faster image processing
-   **Nginx proxy buffering**: Disabled for `/_next/image` to reduce first-byte delay on mobile

### Recommended Server-Level Optimizations

**Add Swap Space (Required for 1GB RAM):**

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Make permanent by adding to /etc/fstab:
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Cloudflare Image Resizing (Best Solution - FREE!):**

-   A Cloudflare loader is available at `src/lib/cloudflareLoader.ts`
-   This offloads all image optimization to Cloudflare's edge network
-   Uses Cloudflare's FREE Image Resizing service (no paid subscription needed!)
-   No usage limits - works on all Cloudflare plans
-   To enable: Update `next.config.js` to use custom loader (see cloudflareLoader.ts comments)

These settings significantly improve mobile loading times on limited server resources.
