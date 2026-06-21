import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { type CarbonInput } from "../lib/types";
import { ConsumptionSection } from "./ConsumptionSection";

const defaultInput: CarbonInput["consumption"] = {
  goods_spend_usd_per_month: 0,
  waste_kg_per_week: 0,
};

describe("ConsumptionSection", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<ConsumptionSection input={defaultInput} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("calls onChange with updated values", async () => {
    const onChange = vi.fn();
    const Wrapper = () => {
      const [input, setInput] = React.useState<CarbonInput["consumption"]>(defaultInput);
      return (
        <ConsumptionSection
          input={input}
          onChange={(patch) => {
            setInput({ ...input, ...patch });
            onChange(patch);
          }}
        />
      );
    };
    render(<Wrapper />);

    const goods = screen.getByLabelText(/goods spending/i);
    await userEvent.clear(goods);
    await userEvent.type(goods, "300");

    expect(onChange).toHaveBeenLastCalledWith({ goods_spend_usd_per_month: 300 });
  });
});
