import pickle
import os
import numpy as np
from typing import Optional, Dict, Any
from app.schemas.churn import (
    ChurnPredictionRequest, ChurnPredictionResponse,
    BatchChurnRequest, BatchChurnResponse, ChurnRisk
)
from app.config.settings import get_settings
from app.ml.predict import ChurnPredictor
from app.services.explanation_service import ExplanationService

settings = get_settings()


class ChurnService:
    def __init__(self):
        self.predictor = ChurnPredictor(settings.CHURN_MODEL_PATH)
        self.explainer = ExplanationService()
        self.threshold = settings.MODEL_THRESHOLD
        self.model_version = self.predictor.version

    def _risk_label(self, probability: float) -> ChurnRisk:
        if probability >= 0.7:
            return ChurnRisk.HIGH
        elif probability >= 0.4:
            return ChurnRisk.MEDIUM
        return ChurnRisk.LOW

    def predict(self, request: ChurnPredictionRequest) -> ChurnPredictionResponse:
        customer = request.customer
        features = self._extract_features(customer)
        probability = self.predictor.predict_proba(features)
        prediction = probability >= self.threshold
        confidence = abs(probability - 0.5) * 2  # 0-1 scale

        explanation = None
        if request.include_explanation and settings.ENABLE_EXPLANATIONS:
            explanation = self.explainer.explain_churn(features, self.predictor.model)

        return ChurnPredictionResponse(
            customer_id=customer.customer_id,
            churn_probability=round(probability, 4),
            churn_risk=self._risk_label(probability),
            prediction=bool(prediction),
            confidence=round(confidence, 4),
            explanation=explanation,
            model_version=self.model_version,
        )

    def predict_batch(self, request: BatchChurnRequest) -> BatchChurnResponse:
        results = [
            self.predict(ChurnPredictionRequest(
                customer=c, include_explanation=request.include_explanation
            ))
            for c in request.customers
        ]
        return BatchChurnResponse(
            results=results,
            total=len(results),
            high_risk_count=sum(1 for r in results if r.churn_risk == ChurnRisk.HIGH),
            medium_risk_count=sum(1 for r in results if r.churn_risk == ChurnRisk.MEDIUM),
            low_risk_count=sum(1 for r in results if r.churn_risk == ChurnRisk.LOW),
        )

    def model_info(self) -> Dict[str, Any]:
        """Return non-sensitive model metadata for operational monitoring."""
        return {
            "model_loaded": self.predictor.is_loaded,
            "model_version": self.predictor.version,
            "features": self.predictor.features,
            "metadata": self.predictor.metadata,
        }

    def _extract_features(self, customer) -> np.ndarray:
        contract_type = (customer.contract_type or "").strip().lower()
        # Default NPS to neutral training median (7.0) if unrated by student
        nps = float(customer.nps_score) if customer.nps_score is not None else 7.0
        return np.array([[
            customer.tenure_months,
            customer.monthly_charges,
            customer.total_charges,
            customer.num_products,
            customer.support_tickets,
            customer.last_login_days,
            nps,
            1 if contract_type == "monthly" else 0,
            1 if contract_type == "annual" else 0,
        ]])
