# -*- coding: utf-8 -*-
"""
AI Infrastructure Resilience - Long Short-Term Memory (LSTM) Neural Network
Optimized for sequential temporal data ingestion from IoT sensor nodes.
Forecasts sudden dynamic stresses, voltage micro-spikes, and rapid pressure drops.
"""

import numpy as np
try:
    import torch
    import torch.nn as nn
except ImportError:
    torch = None
    nn = None

class LSTMInfrastructurePredictor:
    def __init__(self, sequence_length: int = 24, input_dim: int = 3, hidden_dim: int = 64):
        self.seq_len = sequence_length
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.model = None

        if torch is not None and nn is not None:
            class PyTorchLSTM(nn.Module):
                def __init__(self, in_dim, hid_dim):
                    super().__init__()
                    self.lstm = nn.LSTM(in_dim, hid_dim, num_layers=2, batch_first=True, dropout=0.2)
                    self.fc = nn.Linear(hid_dim, 1) # Probability of critical surge/rupture in next hour
                    self.sigmoid = nn.Sigmoid()

                def forward(self, x):
                    out, _ = self.lstm(x)
                    out = out[:, -1, :] # Select last temporal slice
                    out = self.sigmoid(self.fc(out))
                    return out
            
            self.model = PyTorchLSTM(input_dim, hidden_dim)

    def predict_anomaly_prob(self, timeseries_sensor_sequence: list) -> float:
        """
        Receives historical sequence of sensor inputs and computes failure surge risk.
        Expected format: list of [temperature_c, vibration_g, pressure_psi/voltage_v]
        """
        # Ensure array shape matching: (Batch Size=1, Sequence Length, Feature Dim)
        input_arr = np.array(timeseries_sensor_sequence)
        if input_arr.ndim == 2:
            input_arr = np.expand_dims(input_arr, axis=0)

        if torch is not None and self.model is not None:
            self.model.eval()
            with torch.no_grad():
                tensor_in = torch.FloatTensor(input_arr)
                prob = self.model(tensor_in).item()
                return float(prob)
        else:
            # Fallback deterministic forecasting simulation based on wave resonance
            # If vibration rates increase exponentially over the last 3 timestamps, spike risk
            if len(timeseries_sensor_sequence) < 4:
                return 0.05
            
            recent_vibs = [step[1] for step in timeseries_sensor_sequence[-4:]]
            recent_temps = [step[0] for step in timeseries_sensor_sequence[-4:]]
            
            vib_trend = recent_vibs[-1] - recent_vibs[0]
            temp_trend = recent_temps[-1] - recent_temps[0]
            
            base_prob = 0.02
            if vib_trend > 1.2:
                base_prob += 0.45
            if temp_trend > 5.0:
                base_prob += 0.35
            
            # Bound probability securely
            return min(max(base_prob, 0.0), 1.0)
