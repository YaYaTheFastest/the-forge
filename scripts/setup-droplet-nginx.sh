#!/bin/bash
# Run this ON THE DROPLET (ssh root@161.35.97.99) after initial deploy.
# Sets up nginx + Let's Encrypt for a custom domain.
# Domain: rockinjracing.com purchased from Squarespace

set -e

DOMAIN="rockinjracing.com"
WWW_DOMAIN="www.rockinjracing.com"
APP_PORT=3000
EMAIL="darren.l.jorgenson@gmail.com"  # Update if needed for Let's Encrypt

USER="darren"  # Change to your desired username for basic auth

apt update
apt install -y nginx certbot python3-certbot-nginx apache2-utils

echo "Creating nginx config for $DOMAIN (with www redirect)..."
cat > /etc/nginx/sites-available/the-forge << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        auth_basic "Restricted Access";
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

# Create htpasswd file (will prompt for password)
echo "Creating basic auth credentials for user: $USER"
htpasswd -c /etc/nginx/.htpasswd $USER

 echo "Obtaining SSL certificate..."
certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email $EMAIL || echo "Certbot failed - you may need to run manually later with: certbot --nginx -d $DOMAIN -d $WWW_DOMAIN"

echo "Done! Your site should be at https://$DOMAIN"
echo "DNS A record must point to this droplet's IP (161.35.97.99)."
echo "Test: curl -I https://$DOMAIN"
echo ""
echo "IMPORTANT: Your site is now protected with HTTP Basic Auth."
echo "Username: $USER"
echo "Password: (the one you just entered)"
echo "To add more users later: htpasswd /etc/nginx/.htpasswd newuser"
