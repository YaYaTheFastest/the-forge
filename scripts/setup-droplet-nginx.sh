#!/bin/bash
# Run this ON THE DROPLET (ssh root@161.35.97.99) after initial deploy.
# Sets up nginx + Let's Encrypt for a custom domain.
# Domain: rockinjracing.com purchased from Squarespace

set -e

DOMAIN="rockinjracing.com"
WWW_DOMAIN="www.rockinjracing.com"
APP_PORT=3000
EMAIL="darren.l.jorgenson@gmail.com"  # Update if needed for Let's Encrypt

echo "Installing nginx and certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

echo "Creating nginx config for $DOMAIN (with www redirect)..."
cat > /etc/nginx/sites-available/the-forge << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}

# Redirect www to non-www
server {
    listen 80;
    server_name $WWW_DOMAIN;
    return 301 http://$DOMAIN\$request_uri;
}
EOF

ln -sf /etc/nginx/sites-available/the-forge /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "Testing nginx config..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo "Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email $EMAIL || echo "Certbot failed - you may need to run manually later with: certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"

echo "Done! Your site should be at https://$DOMAIN"
echo "DNS A record must point to this droplet's IP (161.35.97.99)."
echo "Test: curl -I https://$DOMAIN"