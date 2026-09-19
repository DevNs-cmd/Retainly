import pandas as pd
import numpy as np
from typing import Tuple, List


CATEGORICAL_COLS = ["contract_type", "payment_method", "internet_service"]
NUMERIC_COLS = [
    "tenure_months", "monthly_charges", "total_charges",
    "num_products", "support_tickets", "last_login_days", "nps_score",
]
TARGET_COL = "churned"


def load_raw_data(filepath: str) -> pd.DataFrame:
    """Load raw CSV dataset."""
    df = pd.read_csv(filepath)
    print(f"Loaded {len(df)} rows from {filepath}")
    return df


def clean_and_impute(
    train_df: pd.DataFrame, test_df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Impute missing values using statistics computed strictly from train_df."""
    train_df = train_df.copy()
    test_df = test_df.copy()

    # Numeric imputation using train medians
    for col in NUMERIC_COLS:
        if col in train_df.columns:
            train_df[col] = pd.to_numeric(train_df[col], errors="coerce")
            test_df[col] = pd.to_numeric(test_df[col], errors="coerce")
            median_val = train_df[col].median()
            train_df[col] = train_df[col].fillna(median_val)
            test_df[col] = test_df[col].fillna(median_val)

    # Categorical imputation using train modes
    for col in CATEGORICAL_COLS:
        if col in train_df.columns:
            mode_val = train_df[col].mode()[0] if not train_df[col].dropna().empty else "unknown"
            train_df[col] = train_df[col].fillna(mode_val)
            test_df[col] = test_df[col].fillna(mode_val)

    return train_df, test_df


def encode_categoricals(
    train_df: pd.DataFrame, test_df: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """One-hot encode categorical columns aligned to training columns."""
    cat_cols = [c for c in CATEGORICAL_COLS if c in train_df.columns]
    train_encoded = pd.get_dummies(train_df, columns=cat_cols, drop_first=False)
    test_encoded = pd.get_dummies(test_df, columns=cat_cols, drop_first=False)

    # Align test columns to train columns
    test_encoded = test_encoded.reindex(columns=train_encoded.columns, fill_value=0)
    return train_encoded, test_encoded


def train_test_split_df(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Stratified train/test split."""
    from sklearn.model_selection import train_test_split
    train, test = train_test_split(
        df, test_size=test_size, random_state=random_state,
        stratify=df[TARGET_COL] if TARGET_COL in df.columns else None
    )
    return train.copy(), test.copy()


def preprocess_pipeline(filepath: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Full preprocessing pipeline with train/test isolation to prevent leakage."""
    df = load_raw_data(filepath)
    df = df.drop_duplicates()
    if TARGET_COL in df.columns:
        df[TARGET_COL] = pd.to_numeric(df[TARGET_COL], errors="coerce").fillna(0).astype(int)

    train_df, test_df = train_test_split_df(df)
    train_df, test_df = clean_and_impute(train_df, test_df)
    train_df, test_df = encode_categoricals(train_df, test_df)
    return train_df, test_df
