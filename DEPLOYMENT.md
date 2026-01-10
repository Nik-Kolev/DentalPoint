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
