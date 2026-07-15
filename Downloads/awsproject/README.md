# AI Infrastructure Resilience & Digital Twin Control Room
An enterprise-grade Digital Twin simulation and AI predictive analytics repository for modeling, monitoring, and mitigating critical utility infrastructure risks.

```
AI-Infrastructure-Resilience/
│
├── frontend/                      # React Dashboard sources
│   ├── public/
│   ├── src/                       # Components, Pages & Services
│   └── package.json
│
├── backend/                       # Python FastAPI services
│   ├── main.py
│   └── requirements.txt
│
├── ai_engine/                     # ML Pipelines (XGBoost, LSTM, Ensembles)
│   ├── prediction_models/
│   └── model_training/
│
├── digital_twin/                  # Physics simulations & interdependency cascades
│   └── twin_manager.py
│
├── database/                      # PostGIS Schema Definitions
│   └── schema.sql
│
├── deployment/                    # Multi-stage Docker, Compose and K8s configuration
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── docs/                          # Architecture Workflows & API manuals
    └── architecture/
```

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide icons, Motion (Animate), Recharts
- **Backend (API)**: FastAPI, Python Uvicorn
- **AI/ML Forecasting**: XGBoost, PyTorch, Scikit-learn
- **Datastore / GIS**: PostgreSQL + PostGIS Extension
- **Cloud Persistence**: Google Cloud Firestore & Firebase Auth

## 🚀 Active Control Room
The running applet provides an interactive full-stack **Control Room and Digital Twin Simulation Hub**.

It delivers:
1. **Interactive Topology Map**: Visualizing infrastructure assets, current loads, and coordinates.
2. **Dynamic Digital Twin Stress Simulator**: Slide to trigger heavy environmental storms/floods and watch real-time power failure cascades propagate onto water systems and cell tower links.
3. **Multi-Model AI Prediction Panels**: Read real-time risk scores computed by XGBoost and sequential LSTM neural networks.
4. **Explainable AI (XAI) SHAP Panel**: Explains *why* the AI predicted risk based on soil moisture, age, vibration rates, and winds.
5. **Ensemble-Triggered Mitigation Command Center**: Dispatches direct recovery procedures and tracks implementation states in real time.
6. **Compliance Audit Trails**: Stores all events on Firestore to maintain full historical accountability.
