# PackSci AI — Production Deployment Guide

## 1. Project Overview & Architecture
**PackSci AI** is an AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities. It incorporates multi-criteria barrier screening (OTR, WVTR, CO2TR), produce respiration matching (MAP), shelf-life estimation, Qdrant Cloud semantic RAG knowledge retrieval, Groq LLM grounded synthesis, user accounts, and isolated recommendation history.

### Production Topology
```
                     +---------------------------------+
                     |         Vercel (Frontend)       |
                     |   React 19 + Vite + TypeScript  |
                     |     https://your-app.vercel.app |
                     +----------------+----------------+
                                      |
                                HTTPS | (Bearer JWT / JSON API)
                                      v
                     +---------------------------------+
                     |       Render (Web Service)      |
                     |         FastAPI + Uvicorn       |
                     |   https://your-api.onrender.com |
                     +-------+---------------+---------+
                             |               |
              SQLAlchemy /   |               | Qdrant REST Client + FastEmbed
              Connection Pool|               |
                             v               v
           +--------------------+  +--------------------+  +-------------------+
           |      Supabase      |  |    Qdrant Cloud    |  |     Groq Cloud    |
           | PostgreSQL Database|  |  Vector Database   |  |   LLM Inference   |
           |  (Users, Materials,|  | (Scientific RAG   |  | (qwen/qwen3.8-27b |
           |   Commodities,     |  |  Domain Corpus)    |  |  Fast Reasoning)  |
           |  Recommendations)  |  +--------------------+  +-------------------+
           +--------------------+
```

---

## 2. Directory Structure
```
FoodPackaging/
├── .env.example                # Root environment variables template
├── .gitignore                  # Git exclusion rules
├── render.yaml                 # Render Blueprint deployment definition
├── DEPLOYMENT.md               # This deployment guide
├── datasets/                   # Scientific baseline CSV datasets
│   ├── commodities.csv
│   ├── materials.csv
│   ├── storage_conditions.csv
│   ├── category_rules.csv
│   └── map_gas_guidelines.csv
├── backend/
│   ├── .env.example            # Backend-specific environment variables template
│   ├── requirements.txt        # Production Python dependencies
│   ├── inspect_db.py           # CLI database inspection tool
│   ├── ingest_docs.py          # Standalone Qdrant knowledge ingestion script
│   ├── app/
│   │   ├── main.py             # FastAPI entry point & lifespan handler
│   │   ├── config.py           # Pydantic Settings & environment config
│   │   ├── database.py         # SQLAlchemy engine & session maker
│   │   ├── api/v1/             # REST API routers (auth, recommendations, ai, etc.)
│   │   ├── engine/             # Scientific recommendation, shelf-life, MAP engine
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response validation schemas
│   │   └── services/           # Groq LLM, Qdrant RAG, Auth & Seed services
│   └── tests/                  # Pytest test suite
└── frontend/
    ├── .env.example            # Frontend environment variable template
    ├── package.json            # Node dependencies and scripts
    ├── vercel.json             # Vercel SPA client routing configuration
    ├── vite.config.ts          # Vite build configuration
    └── src/
        ├── App.tsx             # Main portal router & auth gate
        ├── services/api.ts     # Centralized API client with JWT handling
        ├── components/         # Clean public-sector UI components
        └── types/              # TypeScript API contracts
```

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Push Code to GitHub
Ensure all latest code and deployment configurations are committed and pushed:
```bash
git add .
git commit -m "Prepare PackSci AI for Render and Vercel production deployment"
git push origin main
```

---

### Step 2: Supabase PostgreSQL Database Setup
1. Log in to [Supabase](https://supabase.com) and open your project.
2. Navigate to **Project Settings** > **Database** > **Connection string**.
3. Select **URI** (Mode: **Transaction** or **Session**, Port `6543` / `5432`).
4. Copy the connection string. It resembles:
   ```
   postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```
5. *Note:* The backend automatically performs safe table creation and column verifications on startup without deleting or duplicating data.

---

### Step 3: Render Web Service (FastAPI Backend)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `mokshith641/FoodPackaging`.
4. Configure the Web Service settings:
   - **Name:** `packsci-ai-backend` (or your preferred name)
   - **Region:** Choose the region closest to your Supabase/Qdrant clusters (e.g., Oregon / Frankfurt / Singapore)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free or Starter
5. Under **Advanced** > **Environment Variables**, add:

| Key | Example / Format | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres...` | Supabase PostgreSQL Connection URL |
| `GROQ_API_KEY` | `gsk_...` | Groq API Key |
| `GROQ_MODEL_NAME` | `qwen/qwen3.8-27b` | Groq Model Name |
| `QDRANT_URL` | `https://[CLUSTER].cloud.qdrant.io:6333` | Qdrant Cloud URL |
| `QDRANT_API_KEY` | `...` | Qdrant Cloud API Key |
| `QDRANT_COLLECTION_NAME` | `food_packaging_corpus` | Qdrant Vector Collection Name |
| `JWT_SECRET_KEY` | `secure-random-32-char-key` | Secret key for JWT session signing |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Vercel production domain for CORS |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app,http://localhost:5173` | Allowed CORS origins list |
| `ENVIRONMENT` | `production` | Environment flag |
| `LOG_LEVEL` | `INFO` | Logging level |

6. Click **Create Web Service**.
7. Wait for the build to finish. Once live, copy your Render URL:
   `https://packsci-ai-backend.onrender.com`
8. Verify health endpoint:
   `https://packsci-ai-backend.onrender.com/health` -> should return `{"status": "online", "service": "PackSci AI Backend", ...}`.

---

### Step 4: Vercel Frontend Deployment
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `mokshith641/FoodPackaging`.
4. In the configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Expand **Environment Variables** and add:

| Key | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://packsci-ai-backend.onrender.com` | Live Render backend URL |

6. Click **Deploy**.
7. Once deployed, note your Vercel URL (e.g., `https://food-packaging.vercel.app`).

---

### Step 5: Sync CORS on Render
1. Go back to your Render Web Service dashboard > **Environment**.
2. Update `FRONTEND_URL` and `CORS_ORIGINS` with your actual Vercel production domain:
   - `FRONTEND_URL`: `https://food-packaging.vercel.app`
   - `CORS_ORIGINS`: `https://food-packaging.vercel.app,http://localhost:5173`
3. Click **Save Changes** (Render will automatically redeploy with the new settings).

---

## 4. Local Development & Verification Commands

### Backend Local Run
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On macOS/Linux
pip install -r requirements.txt
python -m pytest -v
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Local Run
```bash
cd frontend
npm install
npm run build                  # Verifies production build with zero TypeScript errors
npm run dev                    # Starts Vite dev server at http://localhost:5173
```

---

## 5. Troubleshooting & FAQ

- **Issue:** CORS error when logging in or generating recommendations.
  - **Fix:** Verify that `FRONTEND_URL` or `CORS_ORIGINS` on Render matches your exact Vercel URL (including `https://` and without trailing slash).
- **Issue:** Supabase connection error (`SSL connection has been closed unexpectedly`).
  - **Fix:** Use the Supabase pooled connection string on port `6543` with `?sslmode=require`. Ensure `DATABASE_URL` starts with `postgresql://`.
- **Issue:** Page reload shows 404 on Vercel.
  - **Fix:** The included `frontend/vercel.json` contains SPA rewrite rules to ensure client-side routes (like `/wizard`, `/ai-assistant`) route correctly to `/index.html`.
- **Issue:** Groq LLM rate limit or missing key.
  - **Fix:** The system falls back automatically to structured domain summaries if Groq is unavailable, ensuring uninterrupted recommendation output.
