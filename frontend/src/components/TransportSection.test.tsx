import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { type CarbonInput } from "../lib/types";
import { TransportSection } from "./TransportSection";

const defaultInput: CarbonInput["transport"] = {
  car_km_per_week: 0,
  car_fuel: "petrol",
  public_transit_km_per_week: 0,
  short_haul_flights_per_year: 0,
  long_haul_flights_per_year: 0,
};

describe("TransportSection", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<TransportSection input={defaultInput} onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("constrains numeric inputs to the documented bounds", () => {
    render(<TransportSection input={defaultInput} onChange={() => {}} />);
    expect(screen.getByLabelText(/car distance per week/i)).toHaveAttribute("max", "20000");
    expect(screen.getByLabelText(/short-haul flights/i)).toHaveAttribute("max", "200");
  });

  it("calls onChange with updated values", async () => {
    const onChange = vi.fn();
    const Wrapper = () => {
      const [input, setInput] = React.useState<CarbonInput["transport"]>(defaultInput);
      return (
        <TransportSection
          input={input}
          onChange={(patch) => {
            setInput({ ...input, ...patch });
            onChange(patch);
          }}
        />
      );
    };
    render(<Wrapper />);

    const carKm = screen.getByLabelText(/car distance per week/i);
    await userEvent.clear(carKm);
    await userEvent.type(carKm, "120");

    expect(onChange).toHaveBeenLastCalledWith({ car_km_per_week: 120 });
  });
});
