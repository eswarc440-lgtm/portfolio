-- ==========================================
-- AI Infrastructure Resilience - PostgreSQL + PostGIS Schema
-- Configured for high-throughput spatial indexing and operational telemetry storage.
-- ==========================================

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users & Clearances Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(64) NOT NULL,
    organization VARCHAR(255),
    avatar VARCHAR(512),
    phone VARCHAR(64),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Infrastructure Assets Table (Spatial)
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL, -- 'Power Grid', 'Water System', 'Communication Hub'
    location GEOMETRY(Point, 4326) NOT NULL, -- PostGIS 2D Geographic Coordinate
    health_score DECIMAL(5,2) DEFAULT 100.0,
    critical_threshold DECIMAL(5,2) DEFAULT 40.0,
    status VARCHAR(32) DEFAULT 'NOMINAL', -- 'NOMINAL', 'ELEVATED', 'CRITICAL', 'FAILED'
    asset_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for sub-second bounding box intersections
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets USING GIST(location);

-- 3. Live Telemetry Data Table (Partitioned by timestamp)
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id BIGSERIAL,
    asset_id VARCHAR(128) REFERENCES assets(id) ON DELETE CASCADE,
    vibration_g DECIMAL(6,3) NOT NULL,
    temperature_c DECIMAL(6,2) NOT NULL,
    voltage_v DECIMAL(6,2) NOT NULL,
    pressure_psi DECIMAL(6,2),
    wind_speed_kmh DECIMAL(6,2),
    soil_moisture_pct DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, timestamp)
) PARTITION BY RANGE (timestamp);

-- 4. AI Machine Learning Predictions Table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(128) REFERENCES assets(id) ON DELETE CASCADE,
    failure_risk_pct DECIMAL(5,2) NOT NULL,
    confidence DECIMAL(4,3) NOT NULL,
    explaining_features JSONB, -- SHAP contribution parameters
    predicted_failure_time TIMESTAMP WITH TIME ZONE,
    model_version VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for scanning failure risks above 50%
CREATE INDEX IF NOT EXISTS idx_predictions_high_risk ON ai_predictions(failure_risk_pct) WHERE failure_risk_pct > 50.0;

-- 5. Mitigation & Recovery Tasks Table
CREATE TABLE IF NOT EXISTS mitigation_tasks (
    id VARCHAR(128) PRIMARY KEY,
    asset_id VARCHAR(128) REFERENCES assets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(32) NOT NULL, -- 'Critical', 'High', 'Medium', 'Low'
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    assigned_team VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 6. Audit & Operation Logs Table (Persistent Ledger)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    role VARCHAR(128) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
