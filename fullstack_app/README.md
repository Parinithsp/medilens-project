# MediLens Fullstack Application 🩺

This folder contains both the **Frontend** and **Backend** in a clean, unified structure.

## 📁 Directory Structure

```
fullstack_app/
├── backend/                # Python FastAPI Backend
│   ├── app/                # Application routes, models, schemas, and services
│   ├── sample_reports/     # Pre-loaded clinical reports for testing
│   ├── uploads/            # Uploaded PDF and image files
│   ├── requirements.txt    # Python dependencies
│   └── medilens.db         # SQLite database file
├── frontend/               # React (Vite) + Tailwind CSS Frontend
│   ├── src/                # React components, pages, and API client
│   ├── public/             # Static assets and Netlify _redirects
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration & proxy settings
├── netlify.toml            # Pre-configured Netlify deployment configuration
├── package.json            # Root workspace scripts
├── start_dev.bat           # 1-Click launcher for Windows
└── README.md               # Documentation
```

---

## 🚀 Running Locally

### Option 1: One-Click Launcher (Windows)
Double-click `start_dev.bat` inside this folder. It will launch both the FastAPI backend and the Vite frontend in separate terminal windows.

### Option 2: Manual Terminal Commands

#### 1. Backend (Terminal 1)
```bash
cd backend
# Activate virtual environment:
..\..\.venv\Scripts\activate
# Start FastAPI server:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API is live at: `http://127.0.0.1:8000`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 🌐 Deploying to Netlify

This folder is already pre-configured for Netlify with `netlify.toml`:

1. When deploying this repository to Netlify, it automatically detects:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
2. All SPA routes are routed correctly to `/index.html` (no 404 on refresh).
3. **Connect to your live backend**:
   In Netlify under **Site configuration** > **Environment variables**, set:
   - `VITE_API_URL` = `https://<your-backend-domain>/api`
