#!/bin/bash

# Backup Script for Nomagro Backend
# Creates backups of application files, database, and logs

set -e

# Configuration
APP_NAME="nomagro-backend"
APP_DIR="/var/www/$APP_NAME"
BACKUP_BASE_DIR="/var/backups/$APP_NAME"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Create backup directory with timestamp
BACKUP_DIR="$BACKUP_BASE_DIR/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

print_status "Creating backup in $BACKUP_DIR"

# Backup application files
print_status "Backing up application files..."
if [ -d "$APP_DIR" ]; then
    tar -czf "$BACKUP_DIR/app-files.tar.gz" -C "$APP_DIR" . --exclude='node_modules' --exclude='logs/*.log'
    print_status "Application files backed up"
else
    print_warning "Application directory not found: $APP_DIR"
fi

# Backup MongoDB (if running locally)
if systemctl is-active --quiet mongod; then
    print_status "Backing up MongoDB database..."
    mongodump --out "$BACKUP_DIR/mongodb" --db nomagro 2>/dev/null || print_warning "MongoDB backup failed"
fi

# Backup logs
print_status "Backing up logs..."
if [ -d "/var/log/nomagro" ]; then
    tar -czf "$BACKUP_DIR/logs.tar.gz" -C "/var/log/nomagro" .
fi

# Backup PM2 configuration
print_status "Backing up PM2 configuration..."
if [ -f "/home/nomagro/.pm2/dump.pm2" ]; then
    cp "/home/nomagro/.pm2/dump.pm2" "$BACKUP_DIR/"
fi

# Backup environment file
if [ -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env" "$BACKUP_DIR/"
fi

# Create backup info file
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Backup created: $(date)
Server: $(hostname)
Application: $APP_NAME
Node.js version: $(node -v)
PM2 status: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "unknown")
Disk usage: $(df -h $APP_DIR | tail -1)
EOF

# Compress the entire backup
print_status "Compressing backup..."
cd $BACKUP_BASE_DIR
tar -czf "$(basename $BACKUP_DIR).tar.gz" "$(basename $BACKUP_DIR)"
rm -rf "$BACKUP_DIR"

# Clean up old backups
print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_BASE_DIR -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

BACKUP_SIZE=$(du -h "$BACKUP_BASE_DIR/$(basename $BACKUP_DIR).tar.gz" | cut -f1)
print_status "✅ Backup completed: $(basename $BACKUP_DIR).tar.gz ($BACKUP_SIZE)"

# List recent backups
print_status "Recent backups:"
ls -lah $BACKUP_BASE_DIR/backup-*.tar.gz | tail -5