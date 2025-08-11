# Complete VPS Deployment Guide for Nomagro Backend

This guide will walk you through deploying the Nomagro backend on your own VPS (Virtual Private Server).

## Prerequisites

- A VPS running Ubuntu 20.04+ or Debian 11+ (recommended)
- Root access to your VPS
- A domain name pointing to your VPS IP (optional but recommended)
- Basic knowledge of Linux command line

## Quick Start (Automated Setup)

### Step 1: Initial VPS Setup

1. **Connect to your VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Download and run the setup script:**
   ```bash
   wget https://raw.githubusercontent.com/your-repo/nomagro-backend/main/scripts/setup-vps.sh
   chmod +x setup-vps.sh
   sudo ./setup-vps.sh
   ```

3. **Switch to the application user:**
   ```bash
   sudo su - nomagro
   ```

### Step 2: Deploy the Application

1. **Clone your repository:**
   ```bash
   git clone https://github.com/your-username/your-repo.git /var/www/nomagro-backend
   cd /var/www/nomagro-backend
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   nano .env
   ```

   **Required environment variables:**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   PORT=5000
   
   # Optional - for full functionality
   MONGODB_URI=mongodb://localhost:27017/nomagro
   OPENWEATHER_API_KEY=your-openweather-api-key
   CLIENT_URL=https://your-frontend-domain.com
   ```

3. **Run the deployment script:**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### Step 3: Configure Domain and SSL (Optional)

If you have a domain name:

1. **Point your domain to your VPS IP** in your DNS settings

2. **Setup SSL certificate:**
   ```bash
   sudo ./scripts/ssl-setup.sh your-domain.com
   ```

## Manual Setup (Step by Step)

If you prefer to set up everything manually:

### 1. System Updates and Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install MongoDB (optional)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 2. Create Application User and Directories

```bash
# Create user
sudo useradd -m -s /bin/bash nomagro
sudo usermod -aG sudo nomagro

# Create directories
sudo mkdir -p /var/www/nomagro-backend
sudo mkdir -p /var/log/nomagro
sudo mkdir -p /var/backups/nomagro-backend

# Set permissions
sudo chown -R nomagro:nomagro /var/www/nomagro-backend
sudo chown -R nomagro:nomagro /var/log/nomagro
sudo chown -R nomagro:nomagro /var/backups/nomagro-backend
```

### 3. Deploy Application

```bash
# Switch to application user
sudo su - nomagro

# Clone repository
git clone https://github.com/your-username/your-repo.git /var/www/nomagro-backend
cd /var/www/nomagro-backend

# Install dependencies
npm ci --only=production

# Create necessary directories
mkdir -p logs uploads/products models

# Configure environment
cp .env.example .env
nano .env  # Edit with your values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Follow the instructions
```

### 4. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/nomagro
```

Copy the nginx.conf content from the generated files, then:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nomagro /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configure Firewall

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000  # For direct API access if needed
```

## Environment Variables Configuration

### Required Variables

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
PORT=5000
```

### Optional Variables (for full functionality)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/nomagro

# Weather API
OPENWEATHER_API_KEY=your-openweather-api-key

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=15

# Logging
LOG_LEVEL=info
```

## Database Setup

### MongoDB (Local Installation)

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
> use nomagro
> db.createUser({
    user: "nomagro",
    pwd: "secure-password",
    roles: ["readWrite"]
  })
> exit

# Update .env file
MONGODB_URI=mongodb://nomagro:secure-password@localhost:27017/nomagro
```

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create database user
4. Whitelist your VPS IP
5. Get connection string and add to .env

## SSL Certificate Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already set up by script)
sudo crontab -l  # Check if renewal cron job exists
```

## Monitoring and Maintenance

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs nomagro-backend

# Application health
curl http://localhost:5000/health
```

### Automated Monitoring

Set up a cron job for automated monitoring:

```bash
# Edit crontab
crontab -e

# Add monitoring job (every 5 minutes)
*/5 * * * * /var/www/nomagro-backend/scripts/monitor.sh
```

### Backup Setup

Set up automated backups:

```bash
# Edit crontab
crontab -e

# Add backup job (daily at 2 AM)
0 2 * * * /var/www/nomagro-backend/scripts/backup.sh
```

## Updating the Application

```bash
# Switch to application user
sudo su - nomagro
cd /var/www/nomagro-backend

# Pull latest changes
git pull origin main

# Install new dependencies
npm ci --only=production

# Restart application
pm2 restart nomagro-backend

# Check status
pm2 status
```

## Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   # Check PM2 logs
   pm2 logs nomagro-backend
   
   # Check if port is in use
   sudo netstat -tlnp | grep :5000
   ```

2. **Database connection issues:**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Check connection
   mongo --eval "db.adminCommand('ismaster')"
   ```

3. **Nginx issues:**
   ```bash
   # Check Nginx status
   sudo systemctl status nginx
   
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues:**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Enable Nginx caching:**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

2. **Configure PM2 for clustering:**
   ```javascript
   // In ecosystem.config.js
   instances: 'max',  // Use all CPU cores
   exec_mode: 'cluster'
   ```

3. **Monitor resource usage:**
   ```bash
   # Install htop for better monitoring
   sudo apt install htop
   htop
   
   # Check disk usage
   df -h
   
   # Check memory usage
   free -h
   ```

## Security Best Practices

1. **Regular updates:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Firewall configuration:**
   ```bash
   sudo ufw status
   # Only allow necessary ports
   ```

3. **SSH security:**
   ```bash
   # Disable root login
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart ssh
   ```

4. **Regular backups:**
   - Automated daily backups
   - Test restore procedures
   - Store backups off-site

## Support

If you encounter issues:

1. Check the logs: `pm2 logs nomagro-backend`
2. Verify environment variables: `cat .env`
3. Test API endpoints: `curl http://localhost:5000/health`
4. Check system resources: `htop` and `df -h`

For additional support, check the project repository or contact the development team.