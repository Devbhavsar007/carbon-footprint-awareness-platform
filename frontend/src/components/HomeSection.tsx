import { type CarbonInput } from "../lib/types";
import { MAX_HOUSEHOLD, MAX_KWH_MONTH } from "../lib/constants";
import { NumberField } from "./NumberField";

interface Props {
  input: CarbonInput["home"];
  onChange: (patch: Partial<CarbonInput["home"]>) => void;
}

export function HomeSection({ input, onChange }: Props) {
  return (
    <fieldset>
      <legend>Home energy</legend>
      <NumberField
        id="electricity"
        label="Electricity per month (kWh)"
        max={MAX_KWH_MONTH}
        value={input.electricity_kwh_per_month}
        onChange={(v) => onChange({ electricity_kwh_per_month: v })}
      />
      <NumberField
        id="gas"
        label="Natural gas per month (kWh)"
        max={MAX_KWH_MONTH}
        value={input.natural_gas_kwh_per_month}
        onChange={(v) => onChange({ natural_gas_kwh_per_month: v })}
      />
      <NumberField
        id="household"
        label="People in household"
        min={1}
        max={MAX_HOUSEHOLD}
        step={1}
        hint="Home energy is shared across this many people."
        value={input.household_size}
        onChange={(v) => onChange({ household_size: v })}
      />
    </fieldset>
  );
}
