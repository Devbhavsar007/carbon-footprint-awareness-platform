import fs from "fs";
import { execSync } from "child_process";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
const openapiUrl = `${backendUrl}/openapi.json`;
const outputFile = "src/lib/generated-types.ts";
const constantsFile = "src/lib/constants.ts";

console.log(`Fetching OpenAPI spec from ${openapiUrl}...`);
let openapiJson;
try {
  const res = await fetch(openapiUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  openapiJson = await res.json();
  fs.writeFileSync("openapi.json", JSON.stringify(openapiJson));
} catch (e) {
  console.error(`ERROR: Could not reach ${openapiUrl}. Is the backend running?`);
  console.error(
    "Start it with: cd ../backend && USE_GEMINI=false USE_FIRESTORE=false python -m uvicorn app.main:app",
  );
  process.exit(1);
}

console.log("Generating TypeScript types...");
try {
  execSync(`npx -y openapi-typescript openapi.json -o ${outputFile}`, { stdio: "inherit" });
} catch (e) {
  process.exit(1);
}

console.log(`Types written to ${outputFile}`);
console.log(`Compare with src/lib/types.ts to check for drift.\n`);

console.log(`Checking validation bounds in ${constantsFile} against OpenAPI schema...`);

const CHECKS = {
  MAX_KM_WEEK: ["TransportInput", "car_km_per_week"],
  MAX_FLIGHTS: ["TransportInput", "short_haul_flights_per_year"],
  MAX_KWH_MONTH: ["HomeInput", "electricity_kwh_per_month"],
  MAX_USD_MONTH: ["ConsumptionInput", "goods_spend_usd_per_month"],
  MAX_WASTE_WEEK: ["ConsumptionInput", "waste_kg_per_week"],
  MAX_HOUSEHOLD: ["HomeInput", "household_size"],
};

const constantsContent = fs.readFileSync(constantsFile, "utf8");
let drift = false;

for (const [constName, [schemaName, propName]] of Object.entries(CHECKS)) {
  const schemaVal = parseInt(
    openapiJson.components.schemas[schemaName].properties[propName].maximum || "0",
    10,
  );

  const match = constantsContent.match(new RegExp(`export const ${constName}\\s*=\\s*([0-9_,]+)`));
  if (!match) {
    console.log(`  WARN: ${constName} not found in constants.ts`);
    drift = true;
    continue;
  }

  const tsVal = parseInt(match[1].replace(/_/g, "").replace(/,/g, ""), 10);

  if (schemaVal !== tsVal) {
    console.log(`  DRIFT: ${constName} — constants.ts has ${tsVal}, schema has ${schemaVal}`);
    drift = true;
  }
}

if (drift) {
  console.log(
    `FAIL: Validation bounds have drifted — update ${constantsFile} to match the backend.`,
  );
  process.exit(1);
} else {
  console.log("OK: All validation bounds match.");
}
