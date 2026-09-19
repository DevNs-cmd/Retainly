"""Local persistence for retention-action outcomes.

SQLite is used for development. Production deployments should point DATABASE_URL at
the team's managed database or have the backend persist these records.
"""

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.config.settings import get_settings
from app.schemas.feedback import (
    ActionPerformance,
    ActionPerformanceResponse,
    ActionOutcome,
    FeedbackSummaryResponse,
    RetentionFeedbackRequest,
    RetentionFeedbackResponse,
)


class FeedbackService:
    def __init__(self) -> None:
        database_url = get_settings().DATABASE_URL
        prefix = "sqlite:///"
        if not database_url.startswith(prefix):
            raise ValueError("FeedbackService currently supports SQLite DATABASE_URL values only")
        self.database_path = database_url.removeprefix(prefix)
        self._create_table()

    def _connection(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _create_table(self) -> None:
        Path(self.database_path).parent.mkdir(parents=True, exist_ok=True)
        with self._connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS retention_feedback (
                    id TEXT PRIMARY KEY,
                    customer_id TEXT NOT NULL,
                    recommendation_id TEXT,
                    action_type TEXT NOT NULL,
                    outcome TEXT NOT NULL,
                    notes TEXT,
                    recorded_at TEXT NOT NULL
                )
                """
            )

    def record(self, request: RetentionFeedbackRequest) -> RetentionFeedbackResponse:
        feedback_id = str(uuid.uuid4())
        recorded_at = datetime.now(timezone.utc)
        with self._connection() as connection:
            connection.execute(
                """
                INSERT INTO retention_feedback
                    (id, customer_id, recommendation_id, action_type, outcome, notes, recorded_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    feedback_id,
                    request.customer_id,
                    request.recommendation_id,
                    request.action_type,
                    request.outcome.value,
                    request.notes,
                    recorded_at.isoformat(),
                ),
            )
        return RetentionFeedbackResponse(
            id=feedback_id,
            customer_id=request.customer_id,
            action_type=request.action_type,
            outcome=request.outcome,
            recorded_at=recorded_at,
        )

    def summary(self) -> FeedbackSummaryResponse:
        counts = {outcome: 0 for outcome in ActionOutcome}
        with self._connection() as connection:
            rows = connection.execute(
                "SELECT outcome, COUNT(*) AS total FROM retention_feedback GROUP BY outcome"
            ).fetchall()
        for row in rows:
            counts[ActionOutcome(row["outcome"])] = row["total"]
        return FeedbackSummaryResponse(total=sum(counts.values()), by_outcome=counts)

    def action_performance(self) -> ActionPerformanceResponse:
        """Aggregate outcomes by action type for retention reporting."""
        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT
                    action_type,
                    COUNT(*) AS total,
                    SUM(CASE WHEN outcome = 'converted' THEN 1 ELSE 0 END) AS converted,
                    SUM(CASE WHEN outcome = 'churned' THEN 1 ELSE 0 END) AS churned
                FROM retention_feedback
                GROUP BY action_type
                ORDER BY total DESC, action_type ASC
                """
            ).fetchall()
        actions = [
            ActionPerformance(
                action_type=row["action_type"],
                total=row["total"],
                converted=row["converted"],
                churned=row["churned"],
                conversion_rate=round(row["converted"] / row["total"], 4),
            )
            for row in rows
        ]
        return ActionPerformanceResponse(actions=actions)
