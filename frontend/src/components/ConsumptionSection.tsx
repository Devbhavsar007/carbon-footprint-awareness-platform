import { type CarbonInput } from "../lib/types";
import { MAX_USD_MONTH, MAX_WASTE_WEEK } from "../lib/constants";
import { NumberField } from "./NumberField";

interface Props {
  input: CarbonInput["consumption"];
  onChange: (patch: Partial<CarbonInput["consumption"]>) => void;
}

export function ConsumptionSection({ input, onChange }: Props) {
  return (
    <>
      <NumberField
        id="goods"
        label="Goods spending per month (USD)"
        max={MAX_USD_MONTH}
        value={input.goods_spend_usd_per_month}
        onChange={(v) => onChange({ goods_spend_usd_per_month: v })}
      />
      <NumberField
        id="waste"
        label="Landfill waste per week (kg)"
        max={MAX_WASTE_WEEK}
        value={input.waste_kg_per_week}
        onChange={(v) => onChange({ waste_kg_per_week: v })}
      />
    </>
  );
}
