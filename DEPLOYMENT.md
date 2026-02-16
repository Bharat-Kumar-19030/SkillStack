# Deployment Guide

## Backend Deployment (Railway)

### Prerequisites
- Railway account ([railway.app](https://railway.app))
- GitHub repository (recommended)

### Steps

#### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Go to [Railway](https://railway.app) and login**

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect your backend folder

3. **Configure Root Directory (if needed)**
   - Go to Settings
   - Set Root Directory to `backend` if Railway doesn't auto-detect it

4. **Set Environment Variables**
   - Go to "Variables" tab
   - Add the following variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     CLIENT_URL=https://your-frontend-domain.vercel.app
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_CALLBACK_URL=https://your-railway-app.railway.app/api/auth/google/callback
     GITHUB_CLIENT_ID=your_github_client_id
     GITHUB_CLIENT_SECRET=your_github_client_secret
     GITHUB_CALLBACK_URL=https://your-railway-app.railway.app/api/auth/github/callback
     GITHUB_TOKEN=your_github_token
     SESSION_SECRET=your_session_secret
     ENCRYPTION_KEY=your_32_char_encryption_key
     ENCRYPTION_IV=your_16_char_encryption_iv
     ```

5. **Deploy**
   - Railway automatically deploys on every push to your main branch
   - Monitor deployment logs in the Railway dashboard

6. **Get Your App URL**
   - Go to Settings → Domains
   - Railway provides a free `.railway.app` domain
   - Copy this URL for your frontend configuration

#### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd backend
   railway init
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI="your_mongodb_connection_string"
   railway variables set JWT_SECRET="your_jwt_secret"
   # ... set other variables
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Important Notes
- Railway automatically sets the `PORT` environment variable
- Railway auto-detects Node.js and runs `npm start`
- Make sure your MongoDB is accessible from Railway (MongoDB Atlas recommended)
- Railway offers 500 hours/month free usage

---

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account
- Vercel CLI (optional) or use Vercel Dashboard

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel](https://vercel.com)**
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Configure Project:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `VITE_SERVER_URL` = `https://your-railway-app.railway.app`
6. **Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_SERVER_URL
   ```
   Enter your Railway backend URL: `https://your-railway-app.railway.app`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Environment Variables Summary

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-railway-app.railway.app/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-railway-app.railway.app/api/auth/github/callback
GITHUB_TOKEN=your_github_token
SESSION_SECRET=your_session_secret
ENCRYPTION_KEY=your_32_char_encryption_key
ENCRYPTION_IV=your_16_char_encryption_iv
```

### Frontend (.env)
```env
VITE_SERVER_URL=https://your-railway-app.railway.app
```

---

## Post-Deployment Checklist

- [ ] Backend is running on Railway
- [ ] Frontend is deployed to Vercel
- [ ] All environment variables are set correctly
- [ ] MongoDB connection is working
- [ ] CORS is configured with correct frontend URL
- [ ] OAuth callbacks are updated with production URLs
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test file uploads (Cloudinary)
- [ ] Check browser console for errors

---

## Troubleshooting

### Backend Issues
- **App crashed on Railway**: Check logs in Railway dashboard under "Deployments" → "View Logs"
- **Database connection failed**: Verify `MONGODB_URI` is correct and MongoDB allows connections from anywhere (0.0.0.0/0)
- **Environment variables missing**: Check Railway dashboard → "Variables" tab

### Frontend Issues
- **API calls failing**: Check `VITE_SERVER_URL` is correct
- **CORS errors**: Verify backend `CLIENT_URL` matches your Vercel domain
- **Build fails**: Check for any build errors in Vercel dashboard

### OAuth Issues
- **Google/GitHub OAuth not working**: Update callback URLs in Google/GitHub developer console to production URLs
