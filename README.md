# ⚡ AERION

### AI-Powered Thermal Intelligence & Decision System

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:071018,50:0D2735,100:071018&height=220&section=header&text=AERION&fontSize=72&fontColor=58D9FF&animation=fadeIn&fontAlignY=38&desc=Environmental%20Intelligence%20%2F%20Thermal%20Decision%20System&descAlignY=60&descSize=16" width="100%"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&size=15&duration=2800&pause=900&color=58D9FF&center=true&vCenter=true&width=720&lines=Observe+the+environment.;Transform+thermal+data+into+intelligence.;Detect+patterns.;Generate+decision-ready+signals." alt="AERION typing animation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-58D9FF?style=for-the-badge&logo=activity&logoColor=white"/>
  <img src="https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Data-FortyGuard-4E8CFF?style=for-the-badge"/>
</p>

---

## ◈ What is AERION?

**AERION** is an AI-powered environmental intelligence platform designed to transform thermal and spatial observations into understandable decision signals.

Instead of simply displaying raw environmental data, AERION creates an intelligence pipeline that moves from:

```text
LOCATION
   ↓
THERMAL ACQUISITION
   ↓
SPATIAL OBSERVATION
   ↓
AERION ANALYSIS ENGINE
   ↓
RISK + CONFIDENCE
   ↓
DECISION INTELLIGENCE
```

The goal is simple:

> **Turn environmental observations into information that people can actually use.**

---

## ✦ Core Capabilities

| Capability              | Description                                         |
| ----------------------- | --------------------------------------------------- |
| 🌐 Spatial Analysis     | Analyze a selected geographic location              |
| 🌡️ Thermal Intelligence | Process thermal observations                        |
| 🗺️ Heatmap Integration  | Retrieve spatial heatmap data                       |
| 🧠 Intelligence Engine  | Convert observations into structured insights       |
| ⚠️ Risk Analysis        | Produce an environmental risk score                 |
| 🎯 Confidence Analysis  | Estimate confidence based on available observations |
| 📊 Thermal Statistics   | Calculate minimum, maximum, average and variability |
| 🔄 Activity Tracking    | Monitor asynchronous heatmap processing             |
| 🛰️ External Data        | Integrates with FortyGuard                          |
| 📡 API Architecture     | FastAPI-powered backend                             |
| 🖥️ Command Dashboard    | Professional intelligence-oriented interface        |

---

# ◈ System Architecture

```text
                    ┌─────────────────────┐
                    │      AERION UI      │
                    │   React Dashboard   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI API     │
                    │    AERION Backend   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
      ┌─────────────────┐          ┌────────────────────┐
      │   FortyGuard    │          │ AERION Intelligence│
      │  Thermal Data   │          │       Engine       │
      └────────┬────────┘          └──────────┬─────────┘
               │                              │
               ▼                              ▼
      ┌─────────────────┐          ┌────────────────────┐
      │    Heatmap      │          │ Risk + Confidence  │
      │    Activity     │          │ Thermal Statistics │
      └────────┬────────┘          └──────────┬─────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
                    ┌─────────────────────┐
                    │ Decision Intelligence│
                    └─────────────────────┘
```

---

# ◈ Intelligence Pipeline

### 01 — Define the target

The user provides:

- Latitude
- Longitude
- Date
- Time
- Spatial resolution

### 02 — Acquire thermal intelligence

AERION communicates with the FortyGuard heatmap service and submits the requested environmental analysis.

### 03 — Track processing

Every analysis receives an activity identifier that allows AERION to monitor processing status.

### 04 — Retrieve observations

Once processing completes, AERION receives spatial thermal observations in GeoJSON-compatible form.

### 05 — Analyze the field

The intelligence engine extracts meaningful thermal statistics:

```text
Average Temperature
Minimum Temperature
Maximum Temperature
Temperature Range
Thermal Variability
Observation Count
```

### 06 — Generate decision signals

The processed information becomes:

```text
RISK SCORE
      +
RISK LEVEL
      +
MODEL CONFIDENCE
      +
THERMAL PROFILE
```

---

# ◈ Technology Stack

### Frontend

<p>
<img src="https://img.shields.io/badge/React-2026-61DAFB?style=flat-square&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/CSS3-Advanced-1572B6?style=flat-square&logo=css3&logoColor=white"/>
<img src="https://img.shields.io/badge/Vite-Fast-646CFF?style=flat-square&logo=vite&logoColor=white"/>
</p>

### Backend

<p>
<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-API-009688?style=flat-square&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/Pydantic-Validation-E92063?style=flat-square"/>
<img src="https://img.shields.io/badge/Uvicorn-ASGI-499848?style=flat-square"/>
</p>

### Intelligence & Data

<p>
<img src="https://img.shields.io/badge/Thermal_Data-FortyGuard-4E8CFF?style=flat-square"/>
<img src="https://img.shields.io/badge/GeoJSON-Spatial_Data-0E7C86?style=flat-square"/>
<img src="https://img.shields.io/badge/REST-API-FF6F00?style=flat-square"/>
</p>

---

# ◈ Project Structure

```text
AERION/
│
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── intelligence/
│   │   │   │   └── engine.py
│   │   │   └── fortyguard.py
│   │   │
│   │   └── main.py
│   │
│   ├── .env
│   ├── .gitignore
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ◈ API

AERION exposes a clean FastAPI interface.

| Method | Endpoint                            | Purpose                                |
| ------ | ----------------------------------- | -------------------------------------- |
| `GET`  | `/`                                 | API information                        |
| `GET`  | `/api/health`                       | System health                          |
| `POST` | `/api/heatmap`                      | Submit heatmap request                 |
| `GET`  | `/api/heatmap/status/{activity_id}` | Check processing status                |
| `POST` | `/api/intelligence`                 | Run the complete intelligence pipeline |

### Interactive API Documentation

When running locally:

```text
http://127.0.0.1:8000/docs
```

OpenAPI specification:

```text
http://127.0.0.1:8000/openapi.json
```

---

# ◈ Example Intelligence Request

```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "date": "2026-08-31",
  "time": "11:00",
  "granularity": "100m"
}
```

A successful pipeline can return:

```json
{
  "status": "completed",
  "activity_id": "activity-id",
  "fortyguard": {
    "status": "Completed"
  },
  "aerion": {
    "engine": "AERION Thermal Intelligence Engine",
    "risk": {
      "score": 0,
      "level": "UNKNOWN"
    },
    "confidence": {
      "score": 0,
      "interpretation": "Insufficient data"
    }
  }
}
```

Actual values depend on the thermal observations returned by the external data provider.

---

# ◈ Dashboard

The AERION interface is designed as an **environmental intelligence command center** rather than a conventional analytics dashboard.

### Interface principles

```text
DARK ENVIRONMENT
      +
THERMAL VISUALIZATION
      +
LIVE SYSTEM STATUS
      +
DATA DENSITY
      +
DECISION SIGNALS
      =
AERION COMMAND INTERFACE
```

The dashboard provides:

- Live API connection status
- Spatial analysis controls
- Thermal field visualization
- Processing pipeline state
- Risk index
- Model confidence
- Thermal profile
- Field variability
- Observation count
- Activity tracking
- System refresh controls
- Responsive layouts

---

# ◈ Running AERION Locally

## 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/AERION.git
cd AERION
```

## 2. Backend setup

```bash
cd backend
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment configuration:

```env
FORTYGUARD_API_KEY=your_api_key_here
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Documentation:

```text
http://127.0.0.1:8000/docs
```

---

# ◈ Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# ◈ Environment Variables

AERION uses environment variables for external service credentials.

```env
FORTYGUARD_API_KEY=your_api_key_here
```

**Never commit your real API key to GitHub.**

The `.env` file should remain ignored through `.gitignore`.

---

# ◈ Engineering Highlights

AERION was built around several important engineering principles:

### Separation of concerns

The frontend, API layer, external service integration, and intelligence engine remain separated.

### API validation

Pydantic models validate incoming analysis parameters before processing.

### CORS protection

The backend explicitly controls allowed frontend origins during development.

### Failure handling

External API failures are converted into structured HTTP responses instead of silently failing.

### Asynchronous processing

Heatmap activities can be submitted and monitored through activity identifiers.

### Intelligence abstraction

Raw thermal observations are processed by a dedicated intelligence engine rather than mixing analysis logic into API routes.

---

# ◈ Reliability Model

AERION does **not** treat missing data as valid intelligence.

If usable temperature observations are unavailable, the engine reports:

```text
STATUS
INSUFFICIENT_DATA

RISK
UNKNOWN

CONFIDENCE
INSUFFICIENT DATA
```

This prevents the system from presenting fabricated environmental conclusions when the underlying observation set is incomplete.

---

# ◈ Security

Security considerations include:

- API credentials stored through environment variables
- `.env` excluded from version control
- Request validation through Pydantic
- Controlled CORS configuration
- External API errors handled by the backend
- No hardcoded production secrets

Before production deployment, authentication, rate limiting, stricter CORS policies, HTTPS, monitoring, and secret management should be added.

---

# ◈ Current Status

```text
████████████████████████████████  100%
```

### AERION Core

- [x] Frontend dashboard
- [x] Backend API
- [x] FastAPI architecture
- [x] FortyGuard integration
- [x] Heatmap submission
- [x] Activity tracking
- [x] Thermal data retrieval
- [x] Intelligence engine
- [x] Risk analysis
- [x] Confidence analysis
- [x] Thermal statistics
- [x] Error handling
- [x] Responsive interface
- [x] API documentation

---

# ◈ Roadmap

Future development can extend AERION with:

```text
[ ] Persistent analysis history
[ ] Interactive geographic map layers
[ ] Historical thermal comparison
[ ] Advanced anomaly detection
[ ] Predictive thermal forecasting
[ ] User authentication
[ ] Saved locations
[ ] Exportable intelligence reports
[ ] Production monitoring
[ ] Cloud deployment
[ ] Advanced geospatial analytics
```

---

# ◈ Vision

AERION is built around a broader idea:

> **Environmental data should not stop at visualization. It should become intelligence.**

The long-term vision is to create a platform capable of continuously observing environmental conditions, detecting meaningful changes, understanding their significance, and delivering decision-ready information.

---

# ⚡ AERION

<p align="center">
  <strong>Observe → Analyze → Understand → Decide</strong>
</p>

<p align="center">
  Built as an AI-driven environmental intelligence platform.
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:071018,50:0D2735,100:071018&height=120&section=footer" width="100%"/>
</p>
