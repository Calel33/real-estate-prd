import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomeError from "./error";

describe("HomeError", () => {
  it("displays an error heading", () => {
    const reset = vi.fn();
    render(<HomeError error={new Error("Test error")} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("displays the error message", () => {
    const reset = vi.fn();
    render(
      <HomeError error={new Error("Strapi connection failed")} reset={reset} />,
    );

    expect(screen.getByText(/strapi connection failed/i)).toBeInTheDocument();
  });

  it("renders a retry button", () => {
    const reset = vi.fn();
    render(<HomeError error={new Error("Test error")} reset={reset} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it("calls reset() when retry button is clicked", () => {
    const reset = vi.fn();
    render(<HomeError error={new Error("Test error")} reset={reset} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
