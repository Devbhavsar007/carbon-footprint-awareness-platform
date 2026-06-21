import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFootprint } from "./useFootprint";
import * as api from "../lib/api";

vi.mock("../lib/api", () => ({
  listEntries: vi.fn(),
  calculate: vi.fn(),
  getInsights: vi.fn(),
  saveEntry: vi.fn(),
}));

describe("useFootprint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails silently when loadHistory throws", async () => {
    // Suppress console.error in the test output so it doesn't look like a crash
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(api.listEntries).mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useFootprint());

    // We expect listEntries to have been called on mount
    await waitFor(() => expect(api.listEntries).toHaveBeenCalledTimes(1));

    // Wait to ensure the catch block has executed.
    // The entries should remain empty, error state should not be populated (history is non-critical)
    expect(result.current.entries).toEqual([]);
    expect(result.current.error).toBeNull();

    // Assert console.error was called with the prefix
    expect(consoleSpy).toHaveBeenCalledWith(
      "[useFootprint] loadHistory failed:",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });

  it("does nothing if save is called before calculate", async () => {
    const { result } = renderHook(() => useFootprint());

    // Wait for the mount-time listEntries effect to settle before acting
    await waitFor(() => expect(api.listEntries).toHaveBeenCalled());

    await result.current.save(); // early return branch

    expect(api.saveEntry).not.toHaveBeenCalled();
  });
});
