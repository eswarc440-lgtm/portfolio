# -*- coding: utf-8 -*-
"""
AI Infrastructure Resilience - Prediction Ensemble Engine
Integrates static classification forecasts from XGBoost and time-series dynamic forecasts
from LSTM models. Combines scores using weighted aggregation to produce an unified risk metric.
"""

from .xgboost import InfrastructureXGBModel
from .lstm import LSTMInfrastructurePredictor

class ResilienceEnsembleEngine:
    def __init__(self, xgb_weight: float = 0.6, lstm_weight: float = 0.4):
        self.xgb_weight = xgb_weight
        self.lstm_weight = lstm_weight
        self.xgb_model = InfrastructureXGBModel()
        self.lstm_model = LSTMInfrastructurePredictor()

    def evaluate_asset_health(self, xgb_features: dict, timeseries_data: list) -> dict:
        """
        Runs dual inference pipelines and yields the master health index and failure time estimates.
        """
        # 1. Evaluate XGBoost static/ambient risk
        xgb_result = self.xgb_model.predict_risk(xgb_features)
        xgb_risk = xgb_result["risk_score_pct"]

        # 2. Evaluate LSTM sequential risk
        lstm_risk = self.lstm_model.predict_anomaly_prob(timeseries_data) * 100.0

        # 3. Perform weighted ensemble merging
        fused_risk = (xgb_risk * self.xgb_weight) + (lstm_risk * self.lstm_weight)

        # 4. Infer structural status condition
        if fused_risk > 75.0:
            health_status = "CRITICAL"
            action_recommended = "IMMEDIATE AUXILIARY SHUTDOWN / LOAD BALANCING DISPATCH"
            time_to_failure = max(0.5, round(24.0 * (1.0 - (fused_risk / 100.0)), 1))
        elif fused_risk > 45.0:
            health_status = "ELEVATED RISK"
            action_recommended = "SCHEDULE ONSITE FLUID-LEVEL & SATELLITE RADAR EXAMINATIONS"
            time_to_failure = round(120.0 * (1.0 - (fused_risk / 100.0)), 1)
        else:
            health_status = "NOMINAL"
            action_recommended = "STANDARD PREVENTATIVE RECONCILIATIONS"
            time_to_failure = None

        # 5. Explanatory attribution (SHAP/LIME style)
        attributions = self.xgb_model.get_feature_importances()
        # Add sequential bias to soil moisture if dynamic stress is noted
        if lstm_risk > 50.0:
            attributions["soil_moisture_saturation"] += 0.15

        return {
            "combined_failure_risk_pct": round(fused_risk, 2),
            "status": health_status,
            "estimated_time_to_failure_hours": time_to_failure,
            "recommended_mitigation": action_recommended,
            "contributing_failure_drivers": sorted(
                [{"feature": k, "impact": round(v, 2)} for k, v in attributions.items()],
                key=lambda x: x["impact"],
                reverse=True
            )[:4]
        }
