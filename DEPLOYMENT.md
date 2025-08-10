# Nomagro Backend Deployment Guide

## Issues Fixed

1. **Dependencies**: Fixed version conflicts and added missing dependencies
2. **ML Models**: Implemented fallback linear regression models to avoid external ML library dependencies
3. **Database**: Made MongoDB optional for basic functionality
4. **Rate Limiting**: Switched to express-rate-limit for better compatibility
5. **Environment**: Added proper environment variable handling
6. **Docker**: Added Dockerfile for containerized deployment
7. **Platform Configs**: Added configuration files for multiple hosting platforms

## Deployment Options

### 1. Railway (Recommended - Free Tier Available)

Railway offers 500 hours/month free tier with automatic deployments.

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your forked repository
5. Choose the `backend` folder as root directory
6. Set environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```
7. Deploy automatically

**Railway will provide you with a URL like:** `https://your-app-name.up.railway.app`

### 2. Render (Free Tier Available)

Render offers free tier with some limitations but good for testing.

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Set environment variables in dashboard
7. Deploy

### 3. Vercel (Serverless)

Good for API endpoints but has limitations for long-running processes.

**Steps:**
1. Install Vercel CLI: `npm install -g vercel`
2. Navigate to backend directory: `cd backend`
3. Run: `vercel`
4. Follow prompts
5. Set environment variables in Vercel dashboard

### 4. Heroku (Paid after November 2022)

If you have Heroku credits or paid plan:

**Steps:**
1. Install Heroku CLI
2. Create new app: `heroku create your-app-name`
3. Set buildpack: `heroku buildpacks:set heroku/nodejs`
4. Set environment variables: `heroku config:set NODE_ENV=production`
5. Deploy: `git push heroku main`

## Environment Variables Setup

### Required Variables:
```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
PORT=5000
```

### Optional Variables:
```bash
# Database (for full functionality)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nomagro

# Weather API (for real weather data)
OPENWEATHER_API_KEY=your-openweather-api-key

# CORS (set to your frontend URL)
CLIENT_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW=15

# Logging
LOG_LEVEL=info
```

## Database Setup (Optional)

### MongoDB Atlas (Free Tier)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create new cluster (free M0 tier)
4. Create database user
5. Whitelist IP addresses (0.0.0.0/0 for all IPs)
6. Get connection string
7. Add to environment variables as `MONGODB_URI`

## API Keys Setup (Optional)

### OpenWeather API
1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Sign up for free account
3. Get API key
4. Add as `OPENWEATHER_API_KEY` environment variable

## Testing Your Deployment

Once deployed, test these endpoints:

1. **Health Check**: `GET /health`
2. **API Status**: `GET /api/v1/auth/me` (should return 401)
3. **Weather**: `GET /api/v1/weather` (requires auth)

## Recommended: Railway Deployment

Railway is the easiest and most reliable option:

1. **Fork the repository** to your GitHub account
2. **Go to Railway**: https://railway.app
3. **Sign up** with GitHub
4. **New Project** → Deploy from GitHub repo
5. **Select** your forked repository
6. **Set root directory** to `backend`
7. **Add environment variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=nomagro-super-secret-jwt-key-2024-change-this-in-production
   ```
8. **Deploy** - Railway will automatically build and deploy

Your API will be available at: `https://[your-project-name].up.railway.app`

## Next Steps

1. Update your frontend to use the deployed backend URL
2. Set up MongoDB Atlas for data persistence
3. Get OpenWeather API key for real weather data
4. Configure CORS for your frontend domain
5. Set up monitoring and logging

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check Node.js version (requires 18+)
2. **App Crashes**: Check environment variables are set
3. **CORS Errors**: Set CLIENT_URL environment variable
4. **Rate Limiting**: Adjust RATE_LIMIT_* variables
5. **Database Errors**: App works without MongoDB, but with limited functionality

### Logs:
- Railway: Check deployment logs in dashboard
- Render: View logs in service dashboard
- Vercel: Check function logs in dashboard

## Support

If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Test endpoints with Postman/curl
4. Check the GitHub repository for updates