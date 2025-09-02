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
