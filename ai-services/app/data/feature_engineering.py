import pandas as pd
import numpy as np


def add_charge_ratio(df: pd.DataFrame) -> pd.DataFrame:
    """Ratio of monthly to total charges — proxy for tenure consistency."""
    df = df.copy()
    df["charge_ratio"] = df["monthly_charges"] / (df["total_charges"] + 1e-6)
    return df


def add_engagement_score(df: pd.DataFrame) -> pd.DataFrame:
    """Composite engagement score from login days, products, support tickets."""
    df = df.copy()
    login_factor = np.clip(1 - df["last_login_days"] / 90, 0, 1)
    product_factor = np.clip(df["num_products"] / 5, 0, 1)
    ticket_penalty = np.clip(df["support_tickets"] / 10, 0, 0.5)
    df["engagement_score"] = (login_factor * 0.5 + product_factor * 0.3 - ticket_penalty * 0.2) * 100
    return df


def add_tenure_bucket(df: pd.DataFrame) -> pd.DataFrame:
    """Bucket tenure into lifecycle stages."""
    df = df.copy()
    df["tenure_bucket"] = pd.cut(
        df["tenure_months"],
        bins=[-1, 3, 12, 24, float("inf")],
        labels=["new", "growing", "established", "loyal"],
    )
    return df


def add_nps_sentiment(df: pd.DataFrame) -> pd.DataFrame:
    """Map NPS to sentiment category."""
    df = df.copy()
    def nps_label(score):
        if pd.isna(score):
            return "unknown"
        if score >= 9:
            return "promoter"
        elif score >= 7:
            return "passive"
        return "detractor"
    df["nps_sentiment"] = df["nps_score"].apply(nps_label)
    return df


def run_all_feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Apply all feature engineering steps."""
    df = add_charge_ratio(df)
    df = add_engagement_score(df)
    df = add_tenure_bucket(df)
    df = add_nps_sentiment(df)
    return df
