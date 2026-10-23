# SmartCivic Issue Management System - Deployment Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher) or MongoDB Atlas account
- Git
- Hosting service for frontend (Vercel, Netlify, or similar)
- Hosting service for backend (Render, Railway, Heroku, or similar)

## Environment Variables

### Backend Environment Variables (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcivic?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-very-secure-random-secret-key-min-32-characters
JWT_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Rate Limiting
# Auth limiter: 5 requests per 15 minutes
# API limiter: 100 requests per 15 minutes
```

### Frontend Environment Variables (.env.production)

Create a `.env.production` file in the `frontend` directory with the following variables:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_APP_NAME=SmartCivic Issue Management
VITE_APP_URL=https://your-frontend-domain.com
```

## Deployment Steps

### 1. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended for Production)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your backend deployment IP (or use 0.0.0.0/0 for all IPs)
5. Get your connection string
6. Replace `MONGO_URI` in backend `.env` with your connection string

#### Option B: Self-hosted MongoDB

1. Install MongoDB on your server
2. Configure authentication
3. Set up firewall rules
4. Update `MONGO_URI` in backend `.env`

### 2. Backend Deployment (Render)

#### Step 1: Prepare Backend

```bash
cd backend
npm install
```

#### Step 2: Deploy to Render

1. Create a Render account at https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add all backend environment variables
5. Deploy

### 3. Frontend Deployment (Vercel)

#### Step 1: Prepare Frontend

```bash
cd frontend
npm install
npm run build
```

#### Step 2: Deploy to Vercel

1. Create a Vercel account at https://vercel.com
2. Import your GitHub repository
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `../dist`
   - **Environment Variables**: Add all frontend environment variables
4. Deploy

### 4. Alternative: Full Stack Deployment (Railway)

Railway can host both backend and MongoDB in one place.

1. Create a Railway account at https://railway.app
2. Create a new project
3. Add MongoDB service
4. Add backend service:
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Add environment variables
5. Add frontend service:
   - Connect your GitHub repository
   - Set root directory to `frontend`
   - Configure build and deploy settings
6. Deploy

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is accessible and loads
- [ ] Database connection is successful
- [ ] User registration works
- [ ] User login works
- [ ] Complaint submission works
- [ ] Notifications are generated
- [ ] File uploads (if enabled) work
- [ ] CORS is configured correctly
- [ ] Environment variables are not exposed
- [ ] Rate limiting is active
- [ ] JWT secret is secure
- [ ] MongoDB has proper authentication
- [ ] SSL/TLS is enabled for all connections

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique JWT secrets** (minimum 32 characters)
3. **Enable MongoDB authentication** with strong passwords
4. **Use SSL/TLS** for all database connections
5. **Restrict CORS** to only your frontend domain
6. **Monitor rate limiting** logs for abuse
7. **Keep dependencies updated** with `npm audit`
8. **Enable MongoDB backups** (Atlas has automated backups)
9. **Use production-grade hosting** with proper monitoring
10. **Review logs regularly** for suspicious activity

## Monitoring and Maintenance

### Backend Monitoring

- Use Render's built-in metrics
- Monitor error logs
- Track response times
- Monitor database query performance

### Database Maintenance

- Set up automated backups
- Monitor database size
- Index optimization (already added to models)
- Archive old complaints if needed

### Regular Updates

- Update Node.js dependencies monthly
- Check for security vulnerabilities with `npm audit`
- Update MongoDB version when needed
- Review and update environment variables

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check Render logs for specific errors

**Problem**: Database connection fails
- Verify MongoDB is accessible
- Check IP whitelist in MongoDB Atlas
- Verify username and password

**Problem**: CORS errors
- Check `ALLOWED_ORIGINS` in backend
- Verify frontend URL is whitelisted

### Frontend Issues

**Problem**: Frontend can't connect to backend
- Check `VITE_API_BASE_URL` in frontend
- Verify backend is running
- Check browser console for CORS errors

**Problem**: Build fails
- Clear cache: `rm -rf node_modules && npm install`
- Check for missing dependencies
- Verify Vite configuration

## Cost Estimation

### MongoDB Atlas (Free Tier)
- 512 MB storage
- Shared RAM
- Suitable for development/small production

### Render (Free Tier)
- Limited CPU/RAM
- Sleeps after inactivity
- Suitable for development/low traffic

### Vercel (Free Tier)
- Unlimited bandwidth
- Automatic SSL
- Suitable for production

### Recommended Production Setup
- MongoDB Atlas: $9/month (M0 cluster)
- Render: $7/month (Starter)
- Vercel: Free (Hobby)
- **Total**: ~$16/month

## Support

For issues:
1. Check logs in hosting provider dashboard
2. Review this deployment guide
3. Check MongoDB Atlas status
4. Verify environment variables
5. Test API endpoints directly

## Additional Resources

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- Express.js Best Practices: https://expressjs.com/en/advanced/best-practice-performance.html
