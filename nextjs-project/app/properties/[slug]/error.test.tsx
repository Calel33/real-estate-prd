import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyError from "./error";

describe("PropertyDetailError", () => {
  it("displays an error heading", () => {
    render(
      <PropertyError
        error={new Error("Failed to load property")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("displays the error message", () => {
    render(
      <PropertyError
        error={new Error("Failed to load property data from server")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Failed to load property data from server"),
    ).toBeInTheDocument();
  });

  it("renders a retry button", () => {
    render(
      <PropertyError error={new Error("test")} reset={vi.fn()} />,
    );

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it("calls reset when retry button is clicked", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();

    render(<PropertyError error={new Error("test")} reset={reset} />);

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await user.click(retryBtn);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
