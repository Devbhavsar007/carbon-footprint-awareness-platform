import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { type CarbonInput } from "../lib/types";
import { HomeSection } from "./HomeSection";

const defaultInput: CarbonInput["home"] = {
  electricity_kwh_per_month: 0,
  natural_gas_kwh_per_month: 0,
  household_size: 1,
};

describe("HomeSection", () => {
  it("associates the household hint with its input for screen readers", () => {
    render(<HomeSection input={defaultInput} onChange={() => {}} />);
    expect(screen.getByLabelText(/people in household/i)).toHaveAccessibleDescription(
      /home energy is shared/i,
    );
  });

  it("constrains numeric inputs to the documented bounds", () => {
    render(<HomeSection input={defaultInput} onChange={() => {}} />);
    expect(screen.getByLabelText(/people in household/i)).toHaveAttribute("max", "50");
  });

  it("calls onChange with updated values", async () => {
    const onChange = vi.fn();
    const Wrapper = () => {
      const [input, setInput] = React.useState<CarbonInput["home"]>(defaultInput);
      return (
        <HomeSection
          input={input}
          onChange={(patch) => {
            setInput({ ...input, ...patch });
            onChange(patch);
          }}
        />
      );
    };
    render(<Wrapper />);

    const electricity = screen.getByLabelText(/electricity per month/i);
    await userEvent.clear(electricity);
    await userEvent.type(electricity, "250");

    expect(onChange).toHaveBeenLastCalledWith({ electricity_kwh_per_month: 250 });
  });
});
