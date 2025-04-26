import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const isError = false;
    expect(cn("base", isActive && "active", isError && "error")).toBe(
      "base active"
    );
  });

  it("should override conflicting Tailwind classes", () => {
    expect(cn("p-4", "p-2")).toBe("p-2"); // tailwind-merge handles this
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("should handle null, undefined, and boolean values", () => {
    expect(cn("base", null, undefined, true, false, "extra")).toBe(
      "base extra"
    );
  });
});
