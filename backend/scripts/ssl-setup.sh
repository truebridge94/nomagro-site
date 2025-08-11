#!/bin/bash

# SSL Certificate Setup Script using Let's Encrypt
# Usage: ./scripts/ssl-setup.sh your-domain.com

set -e

DOMAIN=$1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if domain is provided
if [ -z "$DOMAIN" ]; then
    print_error "Please provide a domain name"
    echo "Usage: $0 your-domain.com"
    exit 1
fi

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_status "Setting up SSL certificate for $DOMAIN"

# Update Nginx configuration with domain
print_status "Updating Nginx configuration..."
sed -i "s/server_name _;/server_name $DOMAIN www.$DOMAIN;/" /etc/nginx/sites-available/nomagro

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Obtain SSL certificate
print_status "Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Setup auto-renewal
print_status "Setting up automatic certificate renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

print_status "✅ SSL certificate setup completed!"
print_status "Your site is now available at https://$DOMAIN"

# Test the certificate
print_status "Testing SSL certificate..."
curl -I https://$DOMAIN/health || print_warning "SSL test failed - please check your configuration"