#!/bin/bash

# Nomagro Backend Deployment Script
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Starting Nomagro Backend Deployment..."

# Configuration
APP_NAME="nomagro-backend"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js $NODE_VERSION first."
    exit 1
fi

# Check Node.js version
NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION or higher is required. Current: $(node -v)"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Create application directory if it doesn't exist
if [ ! -d "$APP_DIR" ]; then
    print_status "Creating application directory..."
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
fi

# Create backup directory
if [ ! -d "$BACKUP_DIR" ]; then
    print_status "Creating backup directory..."
    sudo mkdir -p $BACKUP_DIR
    sudo chown $USER:$USER $BACKUP_DIR
fi

# Backup current deployment if it exists
if [ -d "$APP_DIR/src" ]; then
    print_status "Creating backup of current deployment..."
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
    print_status "Backup created: $BACKUP_DIR/$BACKUP_NAME"
fi

# Copy application files
print_status "Copying application files..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='logs' ./ $APP_DIR/

# Navigate to application directory
cd $APP_DIR

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs uploads/products models/flood_model models/drought_model models/crop_recommendation_model

# Set proper permissions
print_status "Setting file permissions..."
chmod -R 755 $APP_DIR
chmod -R 777 logs uploads

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before starting the application"
fi

# Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup | grep -E '^sudo' | bash || true

print_status "✅ Deployment completed successfully!"
print_status "Application is running on port 5000"
print_status "Check status with: pm2 status"
print_status "View logs with: pm2 logs $APP_NAME"

# Display application status
echo ""
print_status "Current PM2 Status:"
pm2 status