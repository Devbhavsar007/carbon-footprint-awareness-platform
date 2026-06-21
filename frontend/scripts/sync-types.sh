#!/usr/bin/env bash
# API Contract Sync — generates TypeScript types from the FastAPI OpenAPI schema.
#
# Usage (requires a running backend at http://localhost:8000):
#   cd frontend && npm run types:sync
#
# How it works:
#   1. Fetches the OpenAPI JSON spec from the running FastAPI backend
#   2. Generates TypeScript types using openapi-typescript
#   3. Writes the output to src/lib/generated-types.ts
#   4. Extracts validation bounds from the schema and checks for drift
#      against src/lib/constants.ts
#
# CI drift detection: the ci.yml workflow runs this script and checks if the
# generated types differ from the committed types.ts. If they drift apart,
# the build fails — ensuring frontend/backend schema agreement.

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
OPENAPI_URL="${BACKEND_URL}/openapi.json"
OUTPUT_FILE="src/lib/generated-types.ts"
CONSTANTS_FILE="src/lib/constants.ts"

echo "Fetching OpenAPI spec from ${OPENAPI_URL}..."
if ! curl -sf "${OPENAPI_URL}" -o /tmp/openapi.json; then
  echo "ERROR: Could not reach ${OPENAPI_URL}. Is the backend running?"
  echo "Start it with: cd ../backend && USE_GEMINI=false USE_FIRESTORE=false uvicorn app.main:app"
  exit 1
fi

echo "Generating TypeScript types..."
npx -y openapi-typescript /tmp/openapi.json -o "${OUTPUT_FILE}"

echo "Types written to ${OUTPUT_FILE}"
echo "Compare with src/lib/types.ts to check for drift."

# ── Validation-bounds drift check ────────────────────────────────────
# Extracts numeric constraints (le/maximum) from the OpenAPI schema and
# verifies they match the values in constants.ts.
echo ""
echo "Checking validation bounds in ${CONSTANTS_FILE} against OpenAPI schema..."

DRIFT=0

check_bound() {
  local name="$1" schema_val="$2"
  local ts_val
  ts_val=$(grep "export const ${name}" "${CONSTANTS_FILE}" | grep -oP '[\d_,]+' | tr -d '_,' || true)
  schema_int=$(echo "${schema_val}" | tr -d '._,')
  if [ -z "${ts_val}" ]; then
    echo "  WARN: ${name} not found in ${CONSTANTS_FILE}"
    DRIFT=1
  elif [ "${ts_val}" != "${schema_int}" ]; then
    echo "  DRIFT: ${name} — constants.ts has ${ts_val}, schema has ${schema_int}"
    DRIFT=1
  fi
}

# Pull key bounds from the OpenAPI schema (TransportInput.car_km_per_week.maximum, etc.)
if command -v python3 &>/dev/null; then
  MAX_KM=$(python3 -c "import json; s=json.load(open('/tmp/openapi.json')); print(int(s['components']['schemas']['TransportInput']['properties']['car_km_per_week'].get('maximum',0)))" 2>/dev/null || echo "")
  MAX_FLIGHTS=$(python3 -c "import json; s=json.load(open('/tmp/openapi.json')); print(int(s['components']['schemas']['TransportInput']['properties']['short_haul_flights_per_year'].get('maximum',0)))" 2>/dev/null || echo "")
  MAX_KWH=$(python3 -c "import json; s=json.load(open('/tmp/openapi.json')); print(int(s['components']['schemas']['HomeInput']['properties']['electricity_kwh_per_month'].get('maximum',0)))" 2>/dev/null || echo "")
  MAX_USD=$(python3 -c "import json; s=json.load(open('/tmp/openapi.json')); print(int(s['components']['schemas']['ConsumptionInput']['properties']['goods_spend_usd_per_month'].get('maximum',0)))" 2>/dev/null || echo "")
  MAX_WASTE=$(python3 -c "import json; s=json.load(open('/tmp/openapi.json')); print(int(s['components']['schemas']['ConsumptionInput']['properties']['waste_kg_per_week'].get('maximum',0)))" 2>/dev/null || echo "")
  MAX_HH=$(python3 -c "import json; s=json.load(open('/tmp/openapi.json')); print(int(s['components']['schemas']['HomeInput']['properties']['household_size'].get('maximum',0)))" 2>/dev/null || echo "")

  [ -n "${MAX_KM}" ] && check_bound "MAX_KM_WEEK" "${MAX_KM}"
  [ -n "${MAX_FLIGHTS}" ] && check_bound "MAX_FLIGHTS" "${MAX_FLIGHTS}"
  [ -n "${MAX_KWH}" ] && check_bound "MAX_KWH_MONTH" "${MAX_KWH}"
  [ -n "${MAX_USD}" ] && check_bound "MAX_USD_MONTH" "${MAX_USD}"
  [ -n "${MAX_WASTE}" ] && check_bound "MAX_WASTE_WEEK" "${MAX_WASTE}"
  [ -n "${MAX_HH}" ] && check_bound "MAX_HOUSEHOLD" "${MAX_HH}"
else
  echo "  SKIP: python3 not available for bounds extraction"
fi

if [ "${DRIFT}" -eq 1 ]; then
  echo "FAIL: Validation bounds have drifted — update ${CONSTANTS_FILE} to match the backend."
  exit 1
fi
echo "OK: All validation bounds match."

