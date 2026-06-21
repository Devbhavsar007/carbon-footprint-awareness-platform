// Validation bounds matching the backend Pydantic schema (backend/app/models.py).
// These are the single source of truth for input field constraints in the frontend.
//
// Drift detection: `npm run types:sync` compares these values against the
// backend's OpenAPI schema. CI fails if the values diverge.

export const MAX_KM_WEEK = 20_000;
export const MAX_KWH_MONTH = 100_000;
export const MAX_FLIGHTS = 200;
export const MAX_USD_MONTH = 1_000_000;
export const MAX_WASTE_WEEK = 1_000;
export const MAX_HOUSEHOLD = 50;
