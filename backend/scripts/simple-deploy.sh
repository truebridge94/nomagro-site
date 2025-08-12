#!/bin/bash

# Simple deployment script for beginners
# Run this script after you've cloned your code to the server

echo "🚀 Starting Nomagro Backend Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo "✏️ Please edit the .env file with your settings:"
    echo "   nano .env"
    echo "   Then run this script again."
    exit 0
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p uploads/products

# Set permissions
chmod 755 logs
chmod 755 uploads

# Stop existing PM2 process if running
echo "🔄 Stopping existing processes..."
pm2 stop nomagro-backend 2>/dev/null || true
pm2 delete nomagro-backend 2>/dev/null || true

# Start the application
echo "🚀 Starting application..."
pm2 start src/server.js --name "nomagro-backend" --instances 1

# Save PM2 configuration
pm2 save

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🌐 Your API is running at:"
echo "   http://$(curl -s ifconfig.me):5000"
echo ""
echo "🔍 Useful commands:"
echo "   pm2 logs nomagro-backend  # View logs"
echo "   pm2 restart nomagro-backend  # Restart app"
echo "   pm2 monit  # Monitor app"
echo ""
echo "🧪 Test your API:"
echo "   curl http://localhost:5000/health"