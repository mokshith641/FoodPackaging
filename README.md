# AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities

An industrial-grade, full-stack decision-support system and candidate screening engine for food packaging engineering. The system couples deterministic multi-criteria decision analysis (MCDA), biological produce respiration kinetics (Q10/EMAP), ASTM polymer barrier modeling, and Groq Cloud LLM intelligence to evaluate and recommend optimal packaging materials for diverse food commodities.

---

## Architecture Overview

```mermaid
graph TD
    A[React 19 + TypeScript + Vite + Tailwind CSS] -->|REST API Requests / JSON| B[FastAPI Backend Engine]
    B --> C[Deterministic Multi-Criteria Scoring Engine]
    C --> D[Produce Respiration & EMAP Model]
    C --> E[Experimental Shelf-Life Kinetic Model]
    C --> F[Hard Constraint & Hazard Filters]
    B --> G[(Supabase PostgreSQL / SQLite)]
    B --> H[Groq Cloud AI Service - llama-3.3-70b-versatile]
    H -->|Technical Explanations & Trade-offs| B
    B -->|Ranked Candidates, Specs & AI Analysis| A
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.x, Pandas, Uvicorn
- **Database**: Supabase-hosted PostgreSQL (with automatic local SQLite fallback)
- **AI Service**: Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with deterministic expert fallback generator
- **Testing**: Pytest, FastAPI TestClient, HTTPX

---

## Key Features

1. **Deterministic Scientific Recommendation Engine**:
   - Barrier evaluation against product moisture and lipid oxidation thresholds ($OTR$, $WVTR$).
   - Fresh produce equilibrium modified atmosphere packaging (EMAP) gas flux matching.
   - Elimination of hazardous materials (e.g., anaerobic fermentation risks in respiring produce, low-temperature embrittlement at $<0^\circ\text{C}$).
   - Transparent, normalized subscore breakdown: Moisture, Oxygen, Thermal, Mechanical, Cost, and Circularity.

2. **Groq AI Technical Packaging Scientist**:
   - Generates contextual polymer science trade-off explanations without altering scores or inventing citations.
   - Full fallback resilience when offline or if API key is not configured.

3. **Traceable Authoritative Datasets**:
   - **USDA FoodData Central**: Nutritional baseline (moisture, lipids, pH).
   - **UC Davis Postharvest Technology Center**: Produce respiration rates ($mg\text{ CO}_2/\text{kg}\cdot\text{h}$) and chilling thresholds.
   - **MatWeb Materials Database**: ASTM standardized barrier ($OTR$, $WVTR$) and mechanical properties.
   - **FAO**: Postharvest guidelines and equilibrium storage targets.

4. **Multi-View Scientific Dashboard**:
   - **Overview Dashboard**: Live statistics, KPI cards, polymer distribution charts, and quick presets.
   - **Recommendation Wizard**: Form with live database auto-fill and degradation controls.
   - **Recommendation Results**: Candidate cards, radar chart comparisons, dual unit specifications, and experimental shelf-life estimates.
   - **Side-by-Side Material Comparison**: Multi-select comparison matrix with barrier charts.
   - **Food Commodity Explorer**: Searchable catalog of 53+ food items.
   - **Packaging Material Database**: Datasheets with ASTM test conditions.
   - **Saved History**: Historical log persisted in PostgreSQL.
   - **Data Quality & Provenance**: Live health check, missing fields analysis, and integrity audits.

---

## Quick Start & Setup Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js v18+ and npm

### 1. Backend Setup

#### Windows PowerShell:
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run database migration & seed script (creates tables in Supabase Postgres or local SQLite)
python -c "import sys; sys.path.insert(0, '.'); from app.database import engine, Base, SessionLocal; from app.services.seed_service import seed_database_if_empty; from pathlib import Path; Base.metadata.create_all(bind=engine); db = SessionLocal(); res = seed_database_if_empty(db, Path('../datasets')); print('Database Ready:', res)"

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### macOS / Linux:
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

FastAPI OpenAPI interactive docs will be available at: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup

In a new terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at: `http://localhost:5173`

---

### 3. Running Automated Tests

```powershell
# In backend/ directory with venv activated:
pytest -v -o pythonpath=. tests
```

All 16 unit, engine, API, and fallback tests should execute and pass.

---

## Environment Configuration

Create a `.env` file in the root or `backend/` directory (see `backend/.env.example`):

```env
# Database Configuration
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
# Or fallback to local SQLite:
# DATABASE_URL=sqlite:///./food_packaging.db

# Groq API Configuration for AI Explanation Service
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL_NAME=llama-3.3-70b-versatile

# Frontend CORS Origin
FRONTEND_ORIGIN=http://localhost:5173
```

---

## REST API Specification

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | System health, database connectivity, and Groq status |
| `GET` | `/api/v1/commodities` | List food commodities with search and category filters |
| `GET` | `/api/v1/commodities/{id}` | Get detailed commodity specifications |
| `GET` | `/api/v1/materials` | List packaging materials with barrier and polymer filters |
| `GET` | `/api/v1/materials/{id}` | Get material specifications and ASTM standards |
| `POST` | `/api/v1/recommendations` | Run deterministic recommendation engine and persist results |
| `GET` | `/api/v1/recommendations` | List saved recommendation history |
| `GET` | `/api/v1/recommendations/{id}`| Retrieve a saved recommendation |
| `DELETE` | `/api/v1/recommendations/{id}`| Delete a saved recommendation |
| `POST` | `/api/v1/ai/explain` | Generate AI technical explanation via Groq (with fallback) |
| `GET` | `/api/v1/sources` | List authoritative data sources & licenses |
| `GET` | `/api/v1/sources/report` | Comprehensive data quality and missing fields audit |

---

## Engineering Limitations & Scientific Validation Notice

> [!WARNING]
> **Industrial Packaging Engineering Notice**:
> 1. **Candidate Screening Only**: Recommendations produced by this system represent preliminary engineering screenings based on typical polymer literature values and standard Arrhenius/Q10 kinetic models.
> 2. **Regulatory Compliance**: All food contact structures must undergo specific migration testing (OML/SML) and supplier certification under US FDA 21 CFR 177, EU Regulation 10/2011, or FSSAI regulations.
> 3. **Validation Requirements**: Commercial deployment mandates:
>    - Real-time physical shelf-life trials under target storage and temperature-abuse conditions.
>    - ASTM F88 / ASTM F2096 package seal integrity and hermetic bubble leak tests.
>    - Microbial challenge testing for pathogenic and spoilage organisms.
>    - Sensory panel evaluations for texture and flavor preservation.

---

## Feature Checklist

- [x] Full-stack architecture (FastAPI + React 19 + TypeScript + Vite + Tailwind CSS)
- [x] SQLAlchemy 2.x models with Supabase PostgreSQL connection & local SQLite fallback
- [x] Idempotent seed script with 53+ food commodities and 20+ verified packaging materials
- [x] Deterministic multi-criteria scoring algorithm with transparent weight breakdowns
- [x] Biological produce respiration modeling (Q10 scaling & EMAP gas transmission matching)
- [x] Temperature constraint and anaerobic hazard filters
- [x] Groq LLM integration with strict prompt guardrails and deterministic fallback
- [x] Dual unit scientific conversions (metric and imperial)
- [x] Scientific dashboard with interactive Recharts visualizations
- [x] Side-by-side material comparison matrix
- [x] Food Commodity Explorer and Packaging Material Database with ASTM test data
- [x] Complete automated Pytest test suite (16 passing tests)
- [x] Traceability and data quality audit reporting
