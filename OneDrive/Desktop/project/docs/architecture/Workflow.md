# System Workflow & Data Pipeline
## AI-Infrastructure-Resilience System

This document outlines the operational data pipeline, machine learning modeling layers, digital twin couplings, and closed-loop mitigation actions.

```
+-------------------------------------------------------------+
|                     Ingestion Stage                         |
|  [IoT Vibration Sensors] [Soil Moisture] [Weather Forecast]  |
+----------------------------------------+--------------------+
                                         | (JSON / MQTT)
                                         v
+-------------------------------------------------------------+
|                     Database Store                          |
|    PostgreSQL + PostGIS (Spatially Indexed Asset Nodes)      |
+----------------------------------------+--------------------+
                                         |
                                         v
+-------------------------------------------------------------+
|                 Dual ML Model Pipelines                     |
|  - XGBoost (Environmental / Static material fatigue score)  |
|  - LSTM (Temporal Sequential Vibration & Temperature Trend) |
+----------------------------------------+--------------------+
                                         | (Risk Probabilities)
                                         v
+-------------------------------------------------------------+
|               Digital Twin Coupling Engine                  |
|  - Models interdependencies & critical failure cascades     |
|  - Runs physics-based stress simulations (e.g. storm load)  |
+----------------------------------------+--------------------+
                                         |
                                         v
+-------------------------------------------------------------+
|               Explainable AI & Closed-Loop                  |
|  - SHAP value attribution reports (why risks are elevated)  |
|  - Automated mitigation recommendations and control dispatches|
+-------------------------------------------------------------+
```

### 1. Telemetry Ingest & Storage
- Dynamic asset sensors stream coordinate-bound telemetry to the FastAPI ingestion routes (`/api/telemetry/ingest`).
- Data is normalized and stored inside partitioned Postgres tables.
- Coordinate-based queries resolve asset density and proximity alerts via **PostGIS geographic spatial indices**.

### 2. Multi-Model AI Predictions
- **XGBoost Classifier**: Analyzes static dimensions including installation date, historical weather extremes, material types, and current soil moisture profiles. It generates structural erosion ratings.
- **LSTM Networks**: Decodes rapid time-series dynamic signals (vibration sequences, voltage micro-spikes) over a rolling 24-sequence history to alert on imminent physical fracture or grid breakdown.
- **Resilience Weighted Ensemble**: Combines outputs of both models. If total integrated risk exceeds critical limits, estimated Time-To-Failure (TTF) is computed.

### 3. Digital Twin Modeling & Physics Simulations
- Models inter-asset topology coupling.
- Simulates domino failure cascades. If a substation is overloaded, the digital twin propagates battery fallback states and voltage sags across dependent communication cells and pumping stations.
- Provides interactive stress-testing controls so disaster personnel can forecast infrastructure durability during a flood or category storm.

### 4. Closed-Loop Mitigation Action Logs
- Suggests optimized action commands (e.g. engaging auxiliary floodgates or shifting grid nodes).
- Integrates persistent auditing trails synchronized in Google Cloud Firestore for complete regulatory compliance, visibility, and tracking.
