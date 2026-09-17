# MediLens 🩺
### AI Medical Report Summarizer & Clinical Biomarker Intelligence System

MediLens is a modern, production-grade, 100% software-based web application designed to help patients and healthcare consumers easily understand their laboratory test results and diagnostic medical records.

MediLens ingests reports in **PDF, JPG, JPEG, and PNG** formats, determines whether a PDF contains selectable digital text or scanned imagery, runs **PyMuPDF** vector extraction or **OpenCV + Tesseract OCR**, parses and extracts clinical biomarker names, values, units, reference ranges, and page numbers, evaluates each value against standard reference intervals, classifies each result as **Within Range**, **Below Range**, **Above Range**, or **Unable to Determine**, synthesizes a patient-friendly AI clinical summary with questions for the doctor, provides an interactive context-grounded AI chat assistant, and generates downloadable doctor-ready PDF summaries powered by **ReportLab**.

> [!IMPORTANT]
> **Strict Medical Disclaimer**: MediLens is exclusively an educational and informational tool. It does not provide medical diagnoses, prescribe medications, or replace the clinical expertise and advice of a licensed physician. Prominent clinical disclaimers are embedded across every user interface, AI chat response, and exported PDF summary.

---

## 🌟 Key Features

1. **Dual-Mode Document Processing**:
   - **Digital PDFs**: PyMuPDF extracts vector text layers directly with 100% character fidelity and fast performance.
   - **Scanned Reports & Photos (JPG, JPEG, PNG)**: OpenCV pre-processes images with grayscale conversion, bilateral edge-preserving smoothing, and adaptive thresholding before running Tesseract OCR.
2. **Clinical Biomarker Engine**:
   - Covers 80+ standard biomarkers across Complete Blood Count (CBC), Comprehensive Metabolic Panel (CMP/BMP), Lipid Profile, Liver Function Tests (LFT), Thyroid Function, Electrolytes, and Vitamins.
   - Compares measured numbers against reference brackets (`min - max`, `< max`, `> min`, or qualitative tests).
   - Classifies each result into:
     - 🟢 **Within Range** (Normal baseline)
     - 🔴 **Above Range** (Elevated)
     - 🟡 **Below Range** (Decreased)
     - ⚪ **Unable to Determine**
3. **Interactive Range Visualizer Gauges**:
   - Visual horizontal bar for each biomarker showing the normal range band and an exact pin marker of the patient's measured value.
4. **Patient-Friendly AI Narrative & Doctor Guide**:
   - Clear, empathetic overview in plain English explaining what tests were done and why.
   - Attention cards detailing flagged out-of-range biomarkers.
   - Tailored 3-5 specific questions the patient can bring to their physician.
5. **Interactive Report Chat**:
   - Chat in real-time with an AI assistant grounded strictly in your document's findings.
   - Pre-loaded suggested prompts for instant exploration.
6. **Doctor-Ready PDF Export**:
   - One-click export of an executive clinical summary PDF generated using **ReportLab**, complete with patient metadata, findings, color-coded biomarkers table, and clinical disclaimer.
7. **Longitudinal Health Trends & History**:
   - Multi-report tracking with interactive Line Charts (Recharts) to visualize biomarker trajectories over time (e.g. Fasting Glucose or Cholesterol across visits).
8. **1-Click Demo Tour**:
   - Instant 1-click exploration with pre-loaded realistic laboratory test panels.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React Icons |
| **Data Visualizations** | Recharts |
| **Backend API** | Python 3.12, FastAPI, Uvicorn |
| **Database** | SQLAlchemy supporting MySQL (`mysql+pymysql`) and automatic fallback to SQLite |
| **PDF Extraction** | PyMuPDF (`fitz`) |
| **Image OCR & Preprocessing** | OpenCV (`opencv-python-headless`), Pillow, Tesseract OCR (`pytesseract`) |
| **PDF Generation** | ReportLab |
| **Authentication & Security** | JWT (`python-jose`), bcrypt password hashing |
| **AI / NLP Intelligence** | OpenAI / Gemini API support + Built-in Clinical Intelligence Engine |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & `npm`
- *(Optional)* MySQL 8.0 (If not configured, the backend automatically uses SQLite without any configuration needed!)
- *(Optional)* Tesseract OCR (for scanned physical documents)

---

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Activate virtual environment
# Windows:
..\.venv\Scripts\activate
# Linux/macOS:
source ../.venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt # or uv pip install

# Run FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The FastAPI documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 2. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run Vite dev server
npm run dev
```

Open your browser and navigate to:
👉 **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)**

---

## 🔐 Firebase Google Authentication Setup

MediLens supports production-ready Google Authentication via Firebase Auth. To configure it with your Firebase project:

1. **Create/Open a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/).
2. **Enable Google Sign-In**:
   - Navigate to **Authentication** > **Sign-in method**.
   - Click **Google**, toggle **Enable**, set your Project support email, and save.
   - Verify that `localhost` is listed in **Authorized domains** (Authentication > Settings > Authorized domains).
3. **Register a Web App & Copy Keys**:
   - Go to **Project settings** (gear icon) > **General** > **Your apps** > Add Web App (`</>`).
   - Copy the `firebaseConfig` properties into `client/.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-app
   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:...
   ```
4. **Restart Vite**: Restart `npm run dev` to pick up the updated `.env` keys. Users can now sign in seamlessly with Google on the Login page, Sign-Up page, and Auth modal!

---

## 📋 Database Configuration (MySQL / SQLite)

The database connection is configured in `server/.env` (or `server/app/config.py`):

```env
# To use MySQL:
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/medilens

# Optional LLM API keys:
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

> **Note**: If `DATABASE_URL` is not provided or MySQL is not running, MediLens will automatically and transparently use SQLite (`sqlite:///./medilens.db`) so the application works instantly with zero setup!

---

## 📁 Project Structure

```
ai project1/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation header & clinical notice
│   │   │   ├── LandingPage.jsx # Hero, features, FAQ, sample launchers
│   │   │   ├── Dashboard.jsx   # Stats, upload zone, recent reports
│   │   │   ├── ReportView.jsx  # Biomarkers table, range gauges, AI summary
│   │   │   ├── ReportChat.jsx  # Interactive grounded AI chat drawer
│   │   │   ├── HistoryView.jsx # Longitudinal charts & report archive
│   │   │   ├── UploadModal.jsx # Drag-and-drop & animated 4-step pipeline
│   │   │   └── AuthModal.jsx   # Sign in, register & 1-click demo login
│   │   ├── api.js              # Axios REST client with JWT interceptor
│   │   ├── App.jsx             # Main application state coordinator
│   │   └── index.css           # Tailwind CSS & glassmorphic styling
│   └── vite.config.js          # Vite configuration with API proxy
│
├── server/                     # Backend FastAPI application
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth_routes.py  # JWT register, login, demo endpoints
│   │   │   ├── report_routes.py# Upload, details, stats, ReportLab PDF
│   │   │   └── chat_routes.py  # Grounded Q&A chat endpoints
│   │   ├── services/
│   │   │   ├── extractor.py    # PyMuPDF + OpenCV + Tesseract OCR
│   │   │   ├── parser.py       # Biomarker extraction & range comparison
│   │   │   ├── ai_summary.py   # Plain-English clinical narrative generator
│   │   │   ├── chat_service.py # Report Q&A conversational agent
│   │   │   └── pdf_generator.py# ReportLab downloadable PDF summary
│   │   ├── config.py           # App settings & environment variables
│   │   ├── database.py         # SQLAlchemy engine (MySQL / SQLite fallback)
│   │   ├── models.py           # DB models: User, Report, Biomarker, Chat
│   │   ├── schemas.py          # Pydantic request & response schemas
│   │   ├── auth.py             # Password hashing (bcrypt) & JWT tokens
│   │   └── sample_reports.py   # Realistic test PDF and image generators
│   ├── sample_reports/         # Generated test reports (Metabolic, CBC, Lipid)
│   ├── test_pipeline.py        # Automated test verification for extraction
│   └── test_e2e.py             # Full end-to-end integration test suite
```

---

## 🔒 Security & Privacy

- All user passwords are encrypted using industry-standard **bcrypt** hashing.
- API endpoints are protected using **JWT (JSON Web Tokens)** with configurable expiration.
- Document processing occurs in isolated storage directories.
- No medical records are sold, transmitted to third parties, or used for model training.

---

## ⚖️ Clinical & Legal Notice

MediLens is strictly an **educational and informational platform**. It does **NOT** provide medical diagnoses, clinical prognoses, prescriptions, or personalized medical care. Always discuss your laboratory results with a licensed physician or medical professional.
