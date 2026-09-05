# External Integrations Strategy

Third-party platform integrations (Kajabi, Teachable, Thinkific, Mailchimp, Stripe, Slack, etc.) are implemented behind provider interfaces/adapters.

## Principles
- Business logic consumes abstract interfaces (e.g. `ICourseProvider`, `IEmailProvider`).
- Adapters normalize external data structures into canonical internal types.
