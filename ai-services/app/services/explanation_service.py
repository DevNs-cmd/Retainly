from typing import Dict, Any, Optional
import numpy as np


class ExplanationService:
    """Generates SHAP-style feature importance explanations."""

    FEATURE_NAMES = [
        "tenure_months",
        "monthly_charges",
        "total_charges",
        "num_products",
        "support_tickets",
        "last_login_days",
        "nps_score",
        "contract_monthly",
        "contract_annual",
    ]

    def explain_churn(self, features: np.ndarray, model) -> Optional[Dict[str, Any]]:
        try:
            import shap
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(features)
            values = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]

            raw_base = explainer.expected_value
            if isinstance(raw_base, (list, np.ndarray)):
                flat_base = np.ravel(raw_base)
                base_value = float(flat_base[1 if len(flat_base) > 1 else 0])
            else:
                base_value = float(raw_base)

            top_factors = sorted(
                zip(self.FEATURE_NAMES, values),
                key=lambda x: abs(x[1]),
                reverse=True
            )[:5]
            return {
                "method": "SHAP",
                "top_factors": [
                    {"feature": name, "shap_value": round(float(val), 4),
                     "impact": "increases" if val > 0 else "decreases"}
                    for name, val in top_factors
                ],
                "base_value": round(base_value, 4),
            }
        except ImportError:
            return self._fallback_explanation(features)
        except Exception:
            return self._fallback_explanation(features)

    def _fallback_explanation(self, features: np.ndarray) -> Dict[str, Any]:
        """Simple rule-based explanation when SHAP is unavailable."""
        vals = features[0]
        factors = []
        if vals[4] >= 3:
            factors.append({"feature": "support_tickets", "impact": "increases", "note": "High ticket volume"})
        if vals[5] > 30:
            factors.append({"feature": "last_login_days", "impact": "increases", "note": "Low recent engagement"})
        if vals[0] < 6:
            factors.append({"feature": "tenure_months", "impact": "increases", "note": "New customer"})
        return {"method": "rule_based", "top_factors": factors}
