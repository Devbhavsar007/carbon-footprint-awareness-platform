import { useState } from "react";
import { type CarbonInput, type DietType, emptyInput } from "../lib/types";
import { TransportSection } from "./TransportSection";
import { HomeSection } from "./HomeSection";
import { ConsumptionSection } from "./ConsumptionSection";

interface Props {
  onSubmit: (input: CarbonInput) => void;
  loading: boolean;
}

const DIET_OPTIONS: { value: DietType; label: string }[] = [
  { value: "heavy_meat", label: "Heavy meat eater" },
  { value: "medium_meat", label: "Average meat eater" },
  { value: "low_meat", label: "Low meat" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
];

/** Accessible footprint input form: labelled controls grouped in fieldsets. */
export function CalculatorForm({ onSubmit, loading }: Props) {
  const [input, setInput] = useState<CarbonInput>(emptyInput);

  // Type-safe section updaters
  type SectionKey = "transport" | "home" | "consumption";
  const patchSection = <K extends SectionKey>(section: K, patch: Partial<CarbonInput[K]>) => {
    setInput((p) => ({ ...p, [section]: { ...p[section], ...patch } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(input);
  };

  return (
    <form className="card" onSubmit={handleSubmit} aria-labelledby="calc-heading">
      <h2 id="calc-heading">Estimate your annual footprint</h2>

      <TransportSection
        input={input.transport}
        onChange={(patch) => patchSection("transport", patch)}
      />
      <HomeSection input={input.home} onChange={(patch) => patchSection("home", patch)} />

      <fieldset>
        <legend>Diet &amp; consumption</legend>
        <div className="field">
          <label htmlFor="diet">Diet</label>
          <select
            id="diet"
            value={input.diet}
            onChange={(e) => setInput((p) => ({ ...p, diet: e.target.value as DietType }))}
          >
            {DIET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <ConsumptionSection
          input={input.consumption}
          onChange={(patch) => patchSection("consumption", patch)}
        />
      </fieldset>

      <button className="btn" type="submit" disabled={loading} aria-busy={loading}>
        {loading ? "Calculating…" : "Calculate my footprint"}
      </button>
    </form>
  );
}
