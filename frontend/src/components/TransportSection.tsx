import { type CarbonInput, type CarFuel } from "../lib/types";
import { MAX_FLIGHTS, MAX_KM_WEEK } from "../lib/constants";
import { NumberField } from "./NumberField";

interface Props {
  input: CarbonInput["transport"];
  onChange: (patch: Partial<CarbonInput["transport"]>) => void;
}

const FUEL_OPTIONS: { value: CarFuel; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

export function TransportSection({ input, onChange }: Props) {
  return (
    <fieldset>
      <legend>Transport</legend>
      <NumberField
        id="car_km"
        label="Car distance per week (km)"
        max={MAX_KM_WEEK}
        value={input.car_km_per_week}
        onChange={(v) => onChange({ car_km_per_week: v })}
      />
      <div className="field">
        <label htmlFor="car_fuel">Car fuel type</label>
        <select
          id="car_fuel"
          value={input.car_fuel}
          onChange={(e) => onChange({ car_fuel: e.target.value as CarFuel })}
        >
          {FUEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <NumberField
        id="transit_km"
        label="Public transit per week (km)"
        max={MAX_KM_WEEK}
        value={input.public_transit_km_per_week}
        onChange={(v) => onChange({ public_transit_km_per_week: v })}
      />
      <NumberField
        id="short_flights"
        label="Short-haul flights per year"
        max={MAX_FLIGHTS}
        step={1}
        value={input.short_haul_flights_per_year}
        onChange={(v) => onChange({ short_haul_flights_per_year: v })}
      />
      <NumberField
        id="long_flights"
        label="Long-haul flights per year"
        max={MAX_FLIGHTS}
        step={1}
        value={input.long_haul_flights_per_year}
        onChange={(v) => onChange({ long_haul_flights_per_year: v })}
      />
    </fieldset>
  );
}
