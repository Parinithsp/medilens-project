# 🚀 MediLens Deployment Guide

MediLens consists of two parts:
1. **Frontend**: React 19 + Vite Single Page Application (`client/`)
2. **Backend API**: Python 3.12 + FastAPI + Uvicorn (`server/`)

Below are the easiest and most popular deployment paths, including completely free cloud hosting options.

---

## 🌟 Recommended Free Cloud Architecture

- **Frontend**: [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/) (Free global CDN, automatic SSL, SPA routing pre-configured)
- **Backend**: [Render](https://render.com/) or [Railway](https://railway.app/) (Free/Hobby tier Python web service)

```
[ Patient / Browser ]
        │
        ├──> https://medilens.netlify.app (React Frontend)
        │            │
        │            ▼ (REST API requests with JWT)
        └──> https://medilens-api.onrender.com/api (FastAPI Backend)
```

---

## 📦 Method 1: Deploy Backend to Render + Frontend to Netlify

### Step 1: Push Project to GitHub

If you haven't initialized git yet:
```bash
git init
git add .
git commit -m "Initial commit of MediLens"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

### Step 2: Deploy Backend to Render (Free)

1. Sign up / log in to [Render.com](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Fill in the deployment settings:
   - **Name**: `medilens-backend` (or your preferred name)
   - **Region**: Closest to you (e.g., Oregon, Frankfurt)
   - **Root Directory**: `server`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `sqlite:///./medilens.db` | Default zero-config database |
   | `JWT_SECRET` | *(Generate a long random string)* | Token encryption key |
   | `OPENAI_API_KEY` | *(Optional)* | For GPT-4o-mini clinical summaries |
   | `GEMINI_API_KEY` | *(Optional)* | For Gemini clinical summaries |
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://medilens-backend.onrender.com`).
   - Test it by visiting `https://medilens-backend.onrender.com/api/health` in your browser.

---

### Step 3: Deploy Frontend to Netlify (Free)

1. Sign up / log in to [Netlify.com](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project** > Connect GitHub.
3. Select your repository.
4. Netlify will automatically detect `netlify.toml` in the repository root:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. Under **Site configuration** > **Environment variables**, click **Add a variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-render-backend-url>/api` (e.g. `https://medilens-backend.onrender.com/api`)
6. Click **Deploy Site**.
7. Your frontend is live with SSL and working SPA navigation!

---

## ⚡ Method 2: Deploy Frontend to Vercel (Alternative)

1. Sign up / log in to [Vercel](https://vercel.com/).
2. Click **Add New...** > **Project** and select your GitHub repository.
3. In project setup:
   - **Root Directory**: Click `Edit` and select `client`.
   - **Framework Preset**: `Vite` (automatically detected).
4. Expand **Environment Variables**:
   - Add `VITE_API_URL` = `https://<your-backend-domain>/api`.
5. Click **Deploy**. (`client/vercel.json` already contains SPA redirect rules).

---

## 🚂 Method 3: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app/).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. In the service settings:
   - **Root Directory**: `server`
   - Railway will automatically detect `Dockerfile` or `Procfile` and `requirements.txt`.
5. Under **Variables**, add:
   - `JWT_SECRET`: your secret string
   - `DATABASE_URL`: `sqlite:///./medilens.db` (or attach a Railway MySQL/Postgres database)
6. Under **Networking**, click **Generate Domain** to get a public HTTPS URL.

---

## 🐳 Method 4: 1-Command Docker Deployment (VPS / Self-Hosted)

If you have a Linux server (DigitalOcean droplet, AWS EC2, Hetzner, Linode, or local server):

1. Clone your repository onto the server:
   ```bash
   git clone https://github.com/<your-username>/<your-repo-name>.git
   cd <your-repo-name>
   ```
2. Run Docker Compose:
   ```bash
   docker compose up -d --build
   ```
3. Your application is now live:
   - **Frontend**: `http://<your-server-ip>:3000`
   - **Backend API**: `http://<your-server-ip>:8000`

---

## ⚙️ Environment Variables Summary

### Backend (`server/.env` or Cloud Provider Settings)
| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | No | `sqlite:///./medilens.db` | Works out of the box with SQLite. Supports MySQL / PostgreSQL. |
| `JWT_SECRET` | Recommended | Built-in fallback | Set a random 32+ character string in production. |
| `PORT` | Set by host | `8000` | Automatically passed by Render / Railway. |
| `OPENAI_API_KEY` | No | Empty | If omitted, offline clinical intelligence engine is used. |
| `GEMINI_API_KEY` | No | Empty | Optional AI summary provider. |

### Frontend (`client/.env` or Cloud Provider Settings)
| Variable | Required | Default | Notes |
|---|---|---|---|
| `VITE_API_URL` | Yes in prod | `/api` | Must be `https://<your-backend-domain>/api` in production. |

---

## ✅ Post-Deployment Verification Checklist

1. **Health Check**: Open `https://<your-backend-domain>/api/health` -> returns `{"status": "healthy"}`.
2. **Demo Login**: On frontend, click **1-Click Demo** -> logs in immediately with demo patient profile.
3. **Report Upload**: Upload a test PDF (or sample report) -> parsing, range calculation, and AI narrative complete.
4. **Download PDF**: Click "Download Doctor Summary" -> ReportLab generates and downloads a clinical PDF.
