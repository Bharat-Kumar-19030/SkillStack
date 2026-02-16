# Deployment Guide

## Backend Deployment (Heroku)

### Prerequisites
- Heroku account
- Heroku CLI installed

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set CLIENT_URL="https://your-frontend-domain.vercel.app"
   heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
   heroku config:set CLOUDINARY_API_KEY="your_api_key"
   heroku config:set CLOUDINARY_API_SECRET="your_api_secret"
   heroku config:set GOOGLE_CLIENT_ID="your_google_client_id"
   heroku config:set GOOGLE_CLIENT_SECRET="your_google_client_secret"
   heroku config:set GITHUB_CLIENT_ID="your_github_client_id"
   heroku config:set GITHUB_CLIENT_SECRET="your_github_client_secret"
   heroku config:set SESSION_SECRET="your_session_secret"
   ```

4. **Deploy to Heroku**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name
   git push heroku main
   ```
   
   Or if using `master` branch:
   ```bash
   git push heroku master
   ```

5. **Check logs**
   ```bash
   heroku logs --tail
   ```

### Important Notes
- Heroku automatically sets the `PORT` environment variable
- Make sure your MongoDB is accessible from Heroku (MongoDB Atlas recommended)
- The `Procfile` tells Heroku how to start your app

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
   - Add: `VITE_SERVER_URL` = `https://your-heroku-app.herokuapp.com`
6. **Click "Deploy"**

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
   Enter your Heroku backend URL: `https://your-heroku-app.herokuapp.com`

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
GOOGLE_CALLBACK_URL=https://your-heroku-app.herokuapp.com/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-heroku-app.herokuapp.com/api/auth/github/callback
SESSION_SECRET=your_session_secret
```

### Frontend (.env)
```env
VITE_SERVER_URL=https://your-heroku-app.herokuapp.com
```

---

## Post-Deployment Checklist

- [ ] Backend is running on Heroku
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
- **App crashed on Heroku**: Check logs with `heroku logs --tail`
- **Database connection failed**: Verify `MONGODB_URI` is correct and MongoDB allows connections from anywhere (0.0.0.0/0)
- **Environment variables missing**: Use `heroku config` to list all set variables

### Frontend Issues
- **API calls failing**: Check `VITE_SERVER_URL` is correct
- **CORS errors**: Verify backend `CLIENT_URL` matches your Vercel domain
- **Build fails**: Check for any build errors in Vercel dashboard

### OAuth Issues
- **Google/GitHub OAuth not working**: Update callback URLs in Google/GitHub developer console to production URLs
