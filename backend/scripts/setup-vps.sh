#!/bin/bash

# VPS Setup Script for Nomagro Backend
# This script sets up a fresh Ubuntu/Debian VPS for the Nomagro backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_header "NOMAGRO BACKEND VPS SETUP"

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
print_status "Node.js installed: $NODE_VERSION"
print_status "NPM installed: $NPM_VERSION"

# Install PM2 globally
print_status "Installing PM2 process manager..."
npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Install MongoDB (optional)
read -p "Do you want to install MongoDB locally? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt update
    apt install -y mongodb-org
    systemctl start mongod
    systemctl enable mongod
    print_status "MongoDB installed and started"
fi

# Install Redis (optional)
read -p "Do you want to install Redis? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Installing Redis..."
    apt install -y redis-server
    systemctl start redis-server
    systemctl enable redis-server
    print_status "Redis installed and started"
fi

# Install Certbot for SSL certificates
print_status "Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx

# Create application user
print_status "Creating application user..."
if ! id "nomagro" &>/dev/null; then
    useradd -m -s /bin/bash nomagro
    usermod -aG sudo nomagro
    print_status "User 'nomagro' created"
else
    print_status "User 'nomagro' already exists"
fi

# Create application directories
print_status "Creating application directories..."
mkdir -p /var/www/nomagro-backend
mkdir -p /var/log/nomagro
mkdir -p /var/backups/nomagro-backend
chown -R nomagro:nomagro /var/www/nomagro-backend
chown -R nomagro:nomagro /var/log/nomagro
chown -R nomagro:nomagro /var/backups/nomagro-backend

# Configure firewall
print_status "Configuring UFW firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 5000
print_status "Firewall configured"

# Setup log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/nomagro << EOF
/var/log/nomagro/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nomagro nomagro
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create systemd service for PM2
print_status "Creating systemd service for PM2..."
cat > /etc/systemd/system/pm2-nomagro.service << EOF
[Unit]
Description=PM2 process manager for Nomagro
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=nomagro
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
Environment=PM2_HOME=/home/nomagro/.pm2
PIDFile=/home/nomagro/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pm2-nomagro

# Setup basic Nginx configuration
print_status "Setting up basic Nginx configuration..."
cat > /etc/nginx/sites-available/nomagro << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:5000;
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
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/nomagro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start and enable services
print_status "Starting services..."
systemctl start nginx
systemctl enable nginx
systemctl restart nginx

print_header "VPS SETUP COMPLETED!"
print_status "✅ Node.js $(node -v) installed"
print_status "✅ PM2 process manager installed"
print_status "✅ Nginx web server configured"
print_status "✅ Firewall configured (ports 22, 80, 443, 5000)"
print_status "✅ Application user 'nomagro' created"
print_status "✅ Application directories created"
print_status "✅ Log rotation configured"

echo ""
print_header "NEXT STEPS"
echo "1. Switch to the nomagro user: sudo su - nomagro"
echo "2. Clone your repository: git clone <your-repo-url> /var/www/nomagro-backend"
echo "3. Navigate to the backend directory: cd /var/www/nomagro-backend"
echo "4. Run the deployment script: ./scripts/deploy.sh"
echo "5. Configure your domain and SSL certificate"
echo ""
print_warning "Don't forget to:"
echo "- Configure your .env file with proper values"
echo "- Set up your domain DNS to point to this server"
echo "- Run 'sudo certbot --nginx' to get SSL certificate"
echo "- Configure MongoDB connection if using external database"