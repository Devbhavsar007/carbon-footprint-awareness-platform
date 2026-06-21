/**
 * Public type API — re-exports generated OpenAPI types with frontend-friendly
 * names. CarbonInput uses Required<> because the frontend always supplies all
 * sections (transport, home, consumption), even though the backend marks them
 * optional (with server-side defaults).
 *
 * If the backend schema changes, run `npm run types:sync` to regenerate
 * generated-types.ts. A structural mismatch will surface here as a TS error.
 */
import type { components } from "./generated-types";

export type CarFuel = components["schemas"]["CarFuel"];
export type DietType = components["schemas"]["DietType"];

/**
 * The frontend always provides all sections. The generated type marks
 * transport/home/consumption as optional because Pydantic fills defaults,
 * but the UI always sends complete objects. Required<> bridges this gap.
 */
export type CarbonInput = Required<components["schemas"]["CarbonInput-Input"]>;

export type Comparison = components["schemas"]["Comparison"];
export type FootprintResult = components["schemas"]["FootprintResult"];
export type Recommendation = components["schemas"]["Recommendation"];
export type InsightsResponse = components["schemas"]["InsightsResponse"];
export type Entry = components["schemas"]["Entry"];
export type EntryCreate = components["schemas"]["EntryCreate"];

/** A fresh, all-zero input with sensible defaults (average diet, petrol car). */
export const emptyInput = (): CarbonInput => ({
  transport: {
    car_km_per_week: 0,
    car_fuel: "petrol",
    public_transit_km_per_week: 0,
    short_haul_flights_per_year: 0,
    long_haul_flights_per_year: 0,
  },
  home: {
    electricity_kwh_per_month: 0,
    natural_gas_kwh_per_month: 0,
    household_size: 1,
  },
  diet: "medium_meat",
  consumption: {
    goods_spend_usd_per_month: 0,
    waste_kg_per_week: 0,
  },
});
