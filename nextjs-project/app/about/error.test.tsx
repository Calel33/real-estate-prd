import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AboutError from "./error";

describe("AboutError", () => {
  it("displays an error heading", () => {
    render(
      <AboutError
        error={new Error("Failed to load about page")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
  });

  it("displays the error message", () => {
    render(
      <AboutError
        error={new Error("Failed to fetch about content from server")}
        reset={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Failed to fetch about content from server"),
    ).toBeInTheDocument();
  });

  it("renders a retry button", () => {
    render(<AboutError error={new Error("test")} reset={vi.fn()} />);

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();
  });

  it("calls reset when retry button is clicked", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();

    render(<AboutError error={new Error("test")} reset={reset} />);

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    await user.click(retryBtn);

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("uses centered layout matching existing error.tsx pattern", () => {
    const { container } = render(
      <AboutError error={new Error("test")} reset={vi.fn()} />,
    );

    // Should have centered flex layout
    const centeredDiv = container.querySelector(".items-center");
    expect(centeredDiv).toBeInTheDocument();
  });

  it("applies design system typography tokens", () => {
    render(<AboutError error={new Error("test")} reset={vi.fn()} />);

    const heading = screen.getByRole("heading", { name: /something went wrong/i });
    expect(heading.className).toContain("font-display");
    expect(heading.className).toContain("text-primary");
  });
});
