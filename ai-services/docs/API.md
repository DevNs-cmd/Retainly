# Retainly AI Services API

The service exposes a versioned REST API under `/api/v1`.

## Authentication

Local development leaves authentication disabled. For a deployed environment, set
`REQUIRE_API_KEY=true` and a long, secret `API_KEY` in `.env`. Clients must then
send the key in an `X-API-Key` header with every `/api/v1` request. Keep the key
out of source control and do not expose it in a browser application.

## Local run

1. Copy `.env.example` to `.env` and adjust only the values you need.
2. Install dependencies: `pip install -r requirements.txt`.
3. Start the service: `uvicorn app.main:app --reload`.
4. Open interactive API documentation at `http://localhost:8000/docs`.

## Main endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/risk/score` | Produce an explainable rule-based retention risk score. |
| POST | `/api/v1/risk/score/batch` | Score up to 500 students in one request. |
| POST | `/api/v1/churn/predict` | Predict churn probability and optional feature explanation. |
| POST | `/api/v1/churn/predict/batch` | Predict churn for up to 500 students. |
| GET | `/api/v1/churn/model-info` | Read model version, training dataset type, and evaluation metrics. |
| POST | `/api/v1/recommendations/` | Recommend retention actions from risk and engagement data. |
| POST | `/api/v1/messages/send` | Send or locally simulate a retention email. |
| POST | `/api/v1/analysis/student` | Get churn, risk, and retention recommendations in one call. |
| POST | `/api/v1/analysis/students/batch` | Analyze up to 500 students in one call. |
| POST | `/api/v1/feedback/retention-action` | Record a retention-action outcome for future model improvement. |
| GET | `/api/v1/feedback/summary` | Get local outcome counts. |
| GET | `/api/v1/feedback/action-performance` | Compare conversion and churn outcomes by retention action. |
| POST | `/api/v1/workflows/plan` | Create an ordered, coach-reviewed retention workflow plan. |
| GET | `/health` | Confirm that the service is running. |

## Example risk-score request

```json
{
  "customer_id": "student_123",
  "tenure_months": 3,
  "monthly_charges": 49,
  "support_tickets": 1,
  "last_login_days": 18,
  "payment_failures": 0,
  "engagement_score": 45,
  "nps_score": 6
}
```

The response includes the total score, risk level, factor breakdown, reasons, and suggested next actions.

## Model development

For a local end-to-end demonstration, run `python3 scripts/generate_sample_data.py`
followed by `python3 -m app.ml.train`. This produces a model from synthetic data
only; it must not be used for real student decisions.
