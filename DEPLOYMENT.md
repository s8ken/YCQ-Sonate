# 🚀 SYMBI Trust Protocol - Vercel Deployment Guide

## Quick Deploy to Vercel

### 1. **MongoDB Atlas Setup (Free Tier Available)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and new cluster
3. Create a database user:
   - Database Access → Add New Database User
   - Username: `symbi-user`
   - Password: Generate secure password
   - Built-in Role: `Read and write to any database`

4. Whitelist IP addresses:
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` (Allow access from anywhere) for Vercel

5. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy the connection string: `mongodb+srv://symbi-user:<password>@cluster0.xxxxx.mongodb.net/symbi-trust?retryWrites=true&w=majority`

### 2. **Deploy to Vercel**

#### Option A: Deploy from GitHub (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `s8ken/symbi-trust-protocol`
4. Configure build settings:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `frontend/build`

#### Option B: Deploy via Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
\`\`\`

### 3. **Environment Variables in Vercel**

In your Vercel project dashboard, go to Settings → Environment Variables and add:

\`\`\`bash
# Database
MONGODB_URI=mongodb+srv://symbi-user:<password>@cluster0.xxxxx.mongodb.net/symbi-trust?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Environment
NODE_ENV=production
PORT=5000

# CORS (Optional - for custom domains)
CLIENT_URL=https://your-vercel-app.vercel.app
\`\`\`

### 4. **Build Scripts Configuration**

Your `package.json` should include these scripts (already configured):

\`\`\`json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "node backend/server.js",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "nodemon backend/server.js",
    "dev:frontend": "cd frontend && npm start"
  }
}
\`\`\`

### 5. **Alternative Cloud Providers**

#### **Railway** (Backend-focused)
\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
\`\`\`

#### **Render** (Full-stack)
1. Connect GitHub repository
2. Create Web Service
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

#### **Heroku** (Traditional)
\`\`\`bash
# Install Heroku CLI
npm install -g heroku

# Create and deploy
heroku create symbi-trust-protocol
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
\`\`\`

### 6. **Database Collections Auto-Creation**

Your app will automatically create these collections:
- `users` - User accounts
- `trustdeclarations` - Trust protocol data
- `agents` - AI agent information
- `conversations` - Chat logs
- `reports` - Compliance reports

### 7. **Post-Deployment Testing**

Test your deployed API endpoints:

\`\`\`bash
# Replace with your Vercel URL
export API_URL="https://your-app.vercel.app"

# Test user registration
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Test trust declaration
curl -X POST $API_URL/api/trust \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"declaration_type":"compliance","content":"Test declaration","metadata":{"source":"api_test"}}'
\`\`\`

### 8. **Monitoring & Analytics**

- **Vercel Analytics:** Automatically enabled
- **MongoDB Atlas Monitoring:** Built-in performance metrics
- **Error Tracking:** Consider adding Sentry

### 9. **Custom Domain (Optional)**

1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` environment variable

### 🎉 **You're Live!**

Your SYMBI Trust Protocol is now deployed with:
- ✅ Scalable MongoDB Atlas database
- ✅ Global CDN via Vercel
- ✅ Automatic HTTPS
- ✅ Serverless functions
- ✅ Continuous deployment from GitHub

**Estimated Setup Time:** 15-20 minutes
**Monthly Cost:** $0 (Free tiers) to $25+ (Production scale)

---

## 🔧 Troubleshooting

**Build Errors:**
- Check Node.js version compatibility
- Verify all environment variables are set
- Review build logs in Vercel dashboard

**Database Connection Issues:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has proper permissions

**API Errors:**
- Check Vercel function logs
- Verify JWT_SECRET is set
- Test endpoints locally first
