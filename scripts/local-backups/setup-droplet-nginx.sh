#!/bin/bash
# Run this ON THE DROPLET (ssh root@161.35.97.99) after initial deploy.
# Sets up nginx + Let's Encrypt for a custom domain.
# Replace YOUR_DOMAIN with the actual domain (e.g. forge.darrenjorgenson.com)
#
# SECURITY: Basic auth is enabled by default.
# Set password with:
#   apt install -y apache2-utils
#   htpasswd -c /etc/nginx/.htpasswd darren

set -e

DOMAIN="rockinjracing.com"  # Purchased from Squarespace - includes www.rockinjracing.com
APP_PORT=3000
EMAIL="darren.l.jorgenson@gmail.com"  # Update if needed for Let's Encrypt notifications

echo "Installing nginx, certbot, and apache2-utils (for basic auth)..."
apt update
apt install -y nginx certbot python3-certbot-nginx apache2-utils

echo "Creating nginx config for $DOMAIN (with www redirect + basic auth)..."
cat > /etc/nginx/sites-available/the-forge << EOF
server {
    listen 80;
    server_name rockinjracing.com www.rockinjracing.com;

    location / {
        auth_basic "The Forge — Private Access";
        auth_basic_user_file /etc/nginx/.htpasswd;

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

# Redirect www to non-www (or vice versa if preferred)
server {
    listen 80;
    server_name www.rockinjracing.com;
    return 301 http://rockinjracing.com\$request_uri;
}
EOF

ln -sf /etc/nginx/sites-available/the-forge /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "Testing nginx config..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo "Obtaining SSL certificate..."
certbot --nginx -d rockinjracing.com -d www.rockinjracing.com --non-interactive --agree-tos --email $EMAIL || echo "Certbot failed - run manually later with: certbot --nginx -d rockinjracing.com -d www.rockinjracing.com"

echo "Done! Your site should be at https://rockinjracing.com"
echo "DNS A record must point to this droplet's IP (161.35.97.99)."

echo ""
echo "=== SECURITY ==="
echo "Basic authentication is configured."
echo "Set password if needed: htpasswd -c /etc/nginx/.htpasswd darren"
echo "Reload after: systemctl reload nginx"
echo "=================="