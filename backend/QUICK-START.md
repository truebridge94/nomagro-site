# 🚀 Quick Start Guide - Deploy in 15 Minutes

This guide will get your Nomagro backend running on a VPS in about 15 minutes.

## Step 1: Get a VPS (5 minutes)

### DigitalOcean (Recommended)
1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up and verify your account
3. Click "Create" → "Droplets"
4. Select:
   - **Ubuntu 22.04 LTS**
   - **Basic plan - $6/month**
   - **Choose your region**
   - **Set a root password** (write it down!)
5. Click "Create Droplet"
6. **Copy your server IP** (e.g., 142.93.123.45)

## Step 2: Connect to Your Server (2 minutes)

### Windows Users:
- Download [PuTTY](https://putty.org/)
- Enter your server IP and connect
- Login as `root` with your password

### Mac/Linux Users:
```bash
ssh root@YOUR_SERVER_IP
```

## Step 3: Run Setup Script (5 minutes)

Copy and paste this command:

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/main/backend/scripts/quick-setup.sh | bash
```

Wait for it to complete (about 3-5 minutes).

## Step 4: Deploy Your App (3 minutes)

```bash
# Switch to app user
su - nomagro

# Go to web directory
cd /var/www

# Clone your code (replace with your actual repository)
git clone https://github.com/yourusername/nomagro-backend.git
cd nomagro-backend/backend

# Run deployment script
chmod +x scripts/simple-deploy.sh
./scripts/simple-deploy.sh
```

## Step 5: Configure Environment

Edit your environment file:
```bash
nano .env
```

Set these values:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
CLIENT_URL=http://YOUR_SERVER_IP
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

Restart your app:
```bash
pm2 restart nomagro-backend
```

## Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/nomagro
```

Add this configuration (replace YOUR_SERVER_IP):
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/nomagro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🎉 Done! Test Your API

Open your browser and go to:
```
http://YOUR_SERVER_IP/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

## 🔧 Quick Commands

```bash
pm2 status                    # Check app status
pm2 logs nomagro-backend     # View logs
pm2 restart nomagro-backend  # Restart app
pm2 monit                    # Monitor app
```

## 🚨 Troubleshooting

**App not working?**
```bash
pm2 logs nomagro-backend  # Check for errors
```

**Can't access from browser?**
```bash
sudo ufw status           # Check firewall
sudo systemctl status nginx  # Check nginx
```

**Need to update code?**
```bash
cd /var/www/nomagro-backend
git pull
cd backend
pm2 restart nomagro-backend
```

That's it! Your backend is now live at `http://YOUR_SERVER_IP` 🚀