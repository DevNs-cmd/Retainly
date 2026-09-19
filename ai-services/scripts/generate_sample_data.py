"""Generate synthetic student-retention data for local development only.

The generated records are statistically shaped examples, not real student data.
Run from the service root: python3 scripts/generate_sample_data.py
"""

from pathlib import Path

import numpy as np
import pandas as pd


OUTPUT_PATH = Path("datasets/raw/students_sample.csv")
RANDOM_SEED = 42
ROW_COUNT = 2_000


def generate_sample_data(row_count: int = ROW_COUNT, seed: int = RANDOM_SEED) -> pd.DataFrame:
    """Return reproducible, privacy-safe sample retention records."""
    rng = np.random.default_rng(seed)
    tenure = rng.integers(1, 49, size=row_count)
    monthly_charges = rng.uniform(29, 199, size=row_count).round(2)
    support_tickets = rng.poisson(1.2, size=row_count).clip(0, 8)
    last_login_days = rng.gamma(shape=2.0, scale=8.0, size=row_count).clip(0, 90).round().astype(int)
    nps_score = rng.choice(np.arange(0, 11), size=row_count, p=[.03, .03, .04, .05, .06, .08, .12, .18, .18, .13, .10])
    num_products = rng.choice([1, 2, 3, 4], size=row_count, p=[.42, .34, .17, .07])
    contract_type = rng.choice(["monthly", "annual", "quarterly"], size=row_count, p=[.55, .30, .15])
    payment_method = rng.choice(["card", "paypal", "bank_transfer"], size=row_count, p=[.60, .25, .15])
    internet_service = rng.choice(["basic", "standard", "premium"], size=row_count, p=[.30, .50, .20])
    total_charges = (tenure * monthly_charges * rng.uniform(.85, 1.05, size=row_count)).round(2)

    # A transparent synthetic probability rule with small noise creates a learnable
    # target while preserving the relationships the service is designed to detect.
    log_odds = (
        -2.3
        + (last_login_days / 18)
        + (support_tickets * .42)
        + np.where(nps_score <= 6, .75, -.25)
        + np.where(contract_type == "monthly", .55, -.35)
        + np.where(tenure < 6, .35, -.15)
        + rng.normal(0, .55, size=row_count)
    )
    churn_probability = 1 / (1 + np.exp(-log_odds))
    churned = rng.binomial(1, churn_probability)

    return pd.DataFrame({
        "student_id": [f"sample_student_{i:04d}" for i in range(1, row_count + 1)],
        "tenure_months": tenure,
        "monthly_charges": monthly_charges,
        "total_charges": total_charges,
        "num_products": num_products,
        "support_tickets": support_tickets,
        "last_login_days": last_login_days,
        "nps_score": nps_score,
        "contract_type": contract_type,
        "payment_method": payment_method,
        "internet_service": internet_service,
        "churned": churned,
    })


def main() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    data = generate_sample_data()
    data.to_csv(OUTPUT_PATH, index=False)
    print(f"Wrote {len(data)} synthetic records to {OUTPUT_PATH}")
    print(f"Synthetic churn rate: {data['churned'].mean():.1%}")


if __name__ == "__main__":
    main()
