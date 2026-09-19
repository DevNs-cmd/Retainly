"""Convenience entry point for training the churn model.

Run from the repository root with: python3 scripts/train_model.py
"""

import sys
from pathlib import Path

# Ensure repository root is on sys.path when invoked directly
repo_root = Path(__file__).resolve().parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from app.ml.train import train


if __name__ == "__main__":
    train()
