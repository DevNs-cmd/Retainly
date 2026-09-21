import numpy as np
from typing import Dict, Any
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report, confusion_matrix
)


def evaluate_model(model, X_test, y_test, threshold: float = 0.5) -> Dict[str, Any]:
    """Evaluate a trained classification model."""
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= threshold).astype(int)

    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_pred_proba), 4),
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
    }
    return metrics


def print_evaluation_report(metrics: Dict[str, Any]):
    print("\n=== Model Evaluation ===")
    for k, v in metrics.items():
        if k not in ("confusion_matrix", "classification_report"):
            print(f"  {k}: {v}")
    cm = metrics.get("confusion_matrix", [])
    if cm:
        print(f"  Confusion Matrix:")
        print(f"    TN={cm[0][0]}, FP={cm[0][1]}")
        print(f"    FN={cm[1][0]}, TP={cm[1][1]}")
