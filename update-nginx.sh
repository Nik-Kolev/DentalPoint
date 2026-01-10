#!/bin/bash
# Run this on your server to update nginx config

cat > /etc/nginx/sites-available/dentalpoint << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name dentalpoint.bg www.dentalpoint.bg;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dentalpoint.bg www.dentalpoint.bg;

    ssl_certificate /etc/letsencrypt/live/dentalpoint.bg/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dentalpoint.bg/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss image/svg+xml;
    gzip_comp_level 6;

    error_page 502 503 504 = @maintenance;

    location ~* ^/Images/.*\.(jpg|jpeg|png|gif|webp|avif|svg)$ {
        alias /var/www/DentalPoint/public$request_uri;
        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";
        add_header X-Content-Type-Options "nosniff";
        access_log off;
        log_not_found off;
        try_files $uri =404;
    }

    location /_next/image {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $scheme://$host;
        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";
        add_header X-Content-Type-Options "nosniff";
    }

    location ^~ /_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";
        access_log off;
    }

    location ^~ /_next/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    location ~* \.(ico)$ {
        root /var/www/DentalPoint/public;
        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";
        access_log off;
        log_not_found off;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $scheme://$host;
        proxy_set_header Referer $scheme://$host$request_uri;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    location @maintenance {
        root /var/www/DentalPoint/public;
        try_files /maintenance.html =502;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "origin-when-cross-origin" always;
    server_tokens off;
}
NGINXEOF

nginx -t && systemctl reload nginx && echo "✅ Nginx config updated successfully"
