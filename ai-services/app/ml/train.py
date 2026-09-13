import os
import pickle
from datetime import datetime, timezone
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from app.data.preprocessing import preprocess_pipeline, TARGET_COL
from app.data.feature_engineering import run_all_feature_engineering
from app.ml.evaluate import evaluate_model

MODEL_OUTPUT_PATH = "trained_models/churn_model.pkl"

# This order must match ChurnService._extract_features exactly.
FEATURE_COLS = [
    "tenure_months", "monthly_charges", "total_charges",
    "num_products", "support_tickets", "last_login_days", "nps_score",
    "contract_monthly", "contract_annual",
]


def get_model(model_type: str = "gradient_boosting"):
    models = {
        "gradient_boosting": GradientBoostingClassifier(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=200, max_depth=6, random_state=42),
        "logistic_regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, C=1.0)),
        ]),
    }
    if model_type not in models:
        raise ValueError(f"Unknown model: {model_type}")
    return models[model_type]


def train(
    data_path: str = "datasets/raw/students_sample.csv",
    model_type: str = "gradient_boosting",
    output_path: str = MODEL_OUTPUT_PATH,
) -> dict:
    print(f"Training {model_type} model on {data_path}...")

    train_df, test_df = preprocess_pipeline(data_path)
    train_df = run_all_feature_engineering(train_df)
    test_df = run_all_feature_engineering(test_df)

    # Normalise encoded column names into the stable API/model contract.
    for frame in (train_df, test_df):
        for source, destination in (
            ("contract_type_monthly", "contract_monthly"),
            ("contract_type_annual", "contract_annual"),
        ):
            frame[destination] = (
                frame[source].astype(int) if source in frame.columns else 0
            )

    missing_features = [c for c in FEATURE_COLS if c not in train_df.columns]
    if missing_features:
        raise ValueError(f"Required training features missing from dataset: {missing_features}")

    X_train = train_df[FEATURE_COLS].fillna(0)
    y_train = train_df[TARGET_COL]
    X_test = test_df[FEATURE_COLS].fillna(0)
    y_test = test_df[TARGET_COL]

    model = get_model(model_type)
    # The API supplies ordered numeric arrays, so fit on the same representation.
    model.fit(X_train.to_numpy(), y_train)

    metrics = evaluate_model(model, X_test.to_numpy(), y_test)
    print(f"Evaluation: {metrics}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        pickle.dump(
            {
                "model": model,
                "features": FEATURE_COLS,
                "version": "0.1.0-sample",
                "metadata": {
                    "dataset_type": "synthetic",
                    "trained_at": datetime.now(timezone.utc).isoformat(),
                    "row_count": len(train_df) + len(test_df),
                    "metrics": metrics,
                },
            },
            f,
        )
    print(f"Model saved to {output_path}")

    return metrics


if __name__ == "__main__":
    train()
