import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { NumberField, coerceNumber } from "./NumberField";

describe("coerceNumber", () => {
  it("coerces invalid and empty strings to 0", () => {
    expect(coerceNumber("abc")).toBe(0);
    expect(coerceNumber("")).toBe(0);
  });

  it("parses valid numeric strings", () => {
    expect(coerceNumber("123")).toBe(123);
    expect(coerceNumber("1.23")).toBe(1.23);
  });
});

describe("NumberField", () => {
  it("has no accessibility violations (with and without a hint)", async () => {
    const { container } = render(
      <>
        <NumberField id="plain" label="Plain" max={10} value={0} onChange={() => {}} />
        <NumberField
          id="hinted"
          label="Hinted"
          max={10}
          hint="Some help text."
          value={0}
          onChange={() => {}}
        />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("emits numeric values through onChange", async () => {
    const onChange = vi.fn();
    render(<NumberField id="n" label="Amount" max={100} value={0} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Amount"), "7");
    expect(onChange).toHaveBeenLastCalledWith(7);
  });

  it("associates the hint via aria-describedby only when present", () => {
    render(
      <>
        <NumberField id="a" label="With hint" max={10} hint="Hint." value={0} onChange={() => {}} />
        <NumberField id="b" label="No hint" max={10} value={0} onChange={() => {}} />
      </>,
    );
    expect(screen.getByLabelText("With hint")).toHaveAccessibleDescription("Hint.");
    expect(screen.getByLabelText("No hint")).not.toHaveAttribute("aria-describedby");
  });

  it("renders browser-level bounds and integer steps when requested", () => {
    render(
      <NumberField id="i" label="Count" min={1} max={50} step={1} value={1} onChange={() => {}} />,
    );
    const input = screen.getByLabelText("Count");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "50");
    expect(input).toHaveAttribute("step", "1");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });
});
