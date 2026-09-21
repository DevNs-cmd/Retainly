# Retainly AI Services

AI-powered microservice for customer churn prediction, risk scoring, retention recommendations, and messaging.

## Features

- **Churn Prediction** — ML model (Gradient Boosting) with live SHAP feature importance explainability
- **Risk Scoring** — Weighted rule-based risk engine with factor breakdown and recommended next actions
- **Recommendations** — Personalized retention action recommendations tailored by risk tier
- **Student Retention Analysis** — Single & batch (up to 500) unified assessment combining churn, risk, and recommendations
- **Workflow Planning** — Coach-reviewed retention playbooks with strict human-in-the-loop safety limits
- **Outcome Feedback & Analytics** — Record retention action outcomes and track conversion rates across action types
- **Messaging** — Safe simulated delivery when SMTP is unconfigured; templated retention emails and coach alerts
- **Security** — Optional `X-API-Key` service-to-service header authentication

## Project Structure

```
ai-services/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── api/routes/          # Route handlers (churn, risk, recommendations, analysis, workflows, feedback, messages)
│   ├── services/            # Business logic
│   ├── ml/                  # Training, prediction, evaluation
│   ├── data/                # Preprocessing (leak-free) & feature engineering
│   ├── schemas/             # Pydantic request/response models
│   ├── core/                # Logging & security (X-API-Key)
│   └── config/              # App settings & environment config
├── datasets/                # Raw and processed synthetic data
├── trained_models/          # Serialized ML models
├── notebooks/               # Exploratory analysis
├── docs/                    # Detailed API documentation
├── scripts/                 # Sample data generator & model trainer
└── tests/                   # Complete unit and API tests (33 tests)
```

## Quickstart

### 1. Install dependencies
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env  # then edit .env if needed
```

### 3. Generate sample data & train model
```bash
python3 scripts/generate_sample_data.py  # development-only synthetic data
python3 scripts/train_model.py
```

The bundled generator creates synthetic records only. Replace
`datasets/raw/students_sample.csv` with approved, anonymized production data
before using any model output for real retention decisions.

### 4. Start the server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Open the docs
```
http://localhost:8000/docs
```

### Run with Docker
```bash
docker compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/churn/predict` | Single churn prediction with optional SHAP factors |
| POST | `/api/v1/churn/predict/batch` | Batch churn prediction |
| GET  | `/api/v1/churn/health` | Churn model loaded health check |
| GET  | `/api/v1/churn/model-info` | Read model version, feature list, and evaluation metrics |
| POST | `/api/v1/risk/score` | Single explainable rule-based risk score |
| POST | `/api/v1/risk/score/batch` | Batch risk scoring (up to 500 students) |
| POST | `/api/v1/recommendations/` | Get prioritized retention recommendations |
| POST | `/api/v1/analysis/student` | Unified retention analysis (churn + risk + recommendations) |
| POST | `/api/v1/analysis/students/batch` | Batch unified retention analysis (up to 500 students) |
| POST | `/api/v1/workflows/plan` | Coach-reviewed retention playbook planning |
| POST | `/api/v1/feedback/retention-action` | Record a retention action outcome |
| GET  | `/api/v1/feedback/summary` | Retention outcome totals by status |
| GET  | `/api/v1/feedback/action-performance` | Conversion rate and performance analytics by action type |
| POST | `/api/v1/messages/send` | Send or simulate templated email |
| POST | `/api/v1/messages/churn-alert` | Send or simulate high-churn alert |
| GET  | `/health` | Service health status |

## Running Tests

Activate the virtual environment and run pytest:
```bash
source .venv/bin/activate
pytest tests/ -v
```

See [docs/API.md](docs/API.md) for endpoint details and sample payloads.
