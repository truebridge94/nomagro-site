# Complete Beginner's Guide to VPS Deployment

## 🎯 What We're Going to Do

We'll deploy your Nomagro backend to a VPS (Virtual Private Server) so it's accessible on the internet 24/7. Think of a VPS as renting a computer in the cloud that never turns off.

## 📋 Prerequisites

- A VPS (we'll help you get one)
- Your backend code
- Basic terminal/command line knowledge
- 30-60 minutes of time

---

## Step 1: Get a VPS (Virtual Private Server)

### Option A: DigitalOcean (Recommended for beginners)
1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up for an account
3. Click "Create" → "Droplets"
4. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month, 1GB RAM, 1 CPU)
   - **Region**: Choose closest to your users
   - **Authentication**: SSH Key (recommended) or Password
5. Click "Create Droplet"
6. Wait 2-3 minutes for creation
7. Note down your server's IP address (e.g., 142.93.123.45)

### Option B: Other Providers
- **Linode**: Similar process, $5/month
- **Vultr**: Similar process, $6/month
- **Hetzner**: Cheapest option, €4.15/month

---

## Step 2: Connect to Your VPS

### On Windows:
1. Download [PuTTY](https://putty.org/) or use Windows Terminal
2. Open PuTTY
3. Enter your server IP in "Host Name"
4. Click "Open"
5. Login as `root` with your password

### On Mac/Linux:
1. Open Terminal
2. Type: `ssh root@YOUR_SERVER_IP`
3. Enter your password when prompted

**Example:**
```bash
ssh root@142.93.123.45
```

---

## Step 3: Initial Server Setup

Copy and paste these commands one by one:

### Update the system:
```bash
apt update && apt upgrade -y
```

### Create a new user for security:
```bash
adduser nomagro
usermod -aG sudo nomagro
```

### Switch to the new user:
```bash
su - nomagro
```

---

## Step 4: Install Required Software

### Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2 (Process Manager):
```bash
sudo npm install -g pm2
```

### Install Nginx (Web Server):
```bash
sudo apt install nginx -y
```

### Install Git:
```bash
sudo apt install git -y
```

### Verify installations:
```bash
node --version    # Should show v18.x.x
npm --version     # Should show 9.x.x
pm2 --version     # Should show 5.x.x
nginx -v          # Should show nginx version
```

---

## Step 5: Get Your Code on the Server

### Option A: From GitHub (Recommended)
```bash
# Navigate to web directory
cd /var/www

# Clone your repository (replace with your actual repo URL)
sudo git clone https://github.com/yourusername/nomagro-backend.git
sudo chown -R nomagro:nomagro nomagro-backend
cd nomagro-backend/backend
```

### Option B: Upload files manually
If you don't have GitHub, you can use SCP or SFTP to upload your backend folder.

---

## Step 6: Configure Your Application

### Install dependencies:
```bash
npm install
```

### Create environment file:
```bash
cp .env.example .env
nano .env
```

### Edit the .env file with these values:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters

# Optional - only if you want database features
MONGODB_URI=mongodb://localhost:27017/nomagro

# Optional - only if you want real weather data
OPENWEATHER_API_KEY=your-api-key-here

# Set your domain or IP
CLIENT_URL=http://YOUR_SERVER_IP
```

**To save in nano editor:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

---

## Step 7: Start Your Application

### Start with PM2:
```bash
pm2 start src/server.js --name "nomagro-backend"
```

### Make PM2 start on boot:
```bash
pm2 startup
pm2 save
```

### Check if it's running:
```bash
pm2 status
```

You should see your app running!

---

## Step 8: Configure Nginx (Web Server)

### Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/nomagro
```

### Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # Replace with your actual IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nomagro /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Step 9: Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## Step 10: Test Your Deployment

### Check if everything is running:
```bash
pm2 status                    # Your app should be "online"
sudo systemctl status nginx  # Should be "active (running)"
```

### Test your API:
Open your web browser and go to:
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

---

## 🎉 Congratulations! Your Backend is Live!

Your API is now accessible at: `http://YOUR_SERVER_IP`

### Common endpoints to test:
- `http://YOUR_SERVER_IP/health` - Health check
- `http://YOUR_SERVER_IP/api/v1/auth/register` - User registration
- `http://YOUR_SERVER_IP/api/v1/auth/login` - User login

---

## 🔧 Managing Your Application

### View logs:
```bash
pm2 logs nomagro-backend
```

### Restart your app:
```bash
pm2 restart nomagro-backend
```

### Stop your app:
```bash
pm2 stop nomagro-backend
```

### Update your code:
```bash
cd /var/www/nomagro-backend
git pull origin main
cd backend
npm install
pm2 restart nomagro-backend
```

---

## 🛡️ Optional: Add SSL Certificate (HTTPS)

If you have a domain name (like api.nomagro.com):

### Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

### Auto-renewal:
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🚨 Troubleshooting

### App not starting?
```bash
pm2 logs nomagro-backend  # Check error logs
```

### Can't access from browser?
```bash
sudo ufw status  # Check firewall
sudo systemctl status nginx  # Check nginx
```

### Port already in use?
```bash
sudo lsof -i :5000  # Check what's using port 5000
```

### Need to change port?
Edit your `.env` file and change `PORT=5000` to another port, then restart:
```bash
pm2 restart nomagro-backend
```

---

## 💡 Tips for Beginners

1. **Always backup** before making changes
2. **Use `pm2 logs`** to debug issues
3. **Keep your server updated**: `sudo apt update && sudo apt upgrade`
4. **Monitor your app**: `pm2 monit`
5. **Use strong passwords** and SSH keys for security

---

## 📞 Need Help?

If you get stuck:
1. Check the logs: `pm2 logs nomagro-backend`
2. Restart services: `pm2 restart nomagro-backend`
3. Check if ports are open: `sudo ufw status`
4. Verify Nginx config: `sudo nginx -t`

Your backend should now be running 24/7 on your VPS! 🚀