import pickle
import numpy as np
from typing import Optional


class ChurnPredictor:
    def __init__(self, model_path: str):
        self.model = None
        self.features = []
        self.version = "unknown"
        self.metadata = {}
        self._load(model_path)

    def _load(self, path: str):
        try:
            with open(path, "rb") as f:
                payload = pickle.load(f)
            if isinstance(payload, dict):
                self.model = payload["model"]
                self.features = payload.get("features", [])
                self.version = payload.get("version", "1.0.0")
                self.metadata = payload.get("metadata", {})
            else:
                # Legacy: raw model
                self.model = payload
            print(f"Loaded churn model v{self.version}")
        except FileNotFoundError:
            print(f"Model not found at {path}. Using dummy predictor.")
            self.model = None

    def predict_proba(self, features: np.ndarray) -> float:
        """Return churn probability for a single customer feature vector."""
        if self.model is None:
            # Dummy: return 0.5 when no model is loaded
            return 0.5
        proba = self.model.predict_proba(features)
        return float(proba[0][1])  # probability of class 1 (churn)

    def predict(self, features: np.ndarray, threshold: float = 0.5) -> bool:
        return self.predict_proba(features) >= threshold

    @property
    def is_loaded(self) -> bool:
        return self.model is not None
