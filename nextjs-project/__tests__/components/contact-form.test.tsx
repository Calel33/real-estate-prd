/**
 * @vitest-environment jsdom
 *
 * Component tests for the ContactForm component.
 * Covers: inline blur validation, success/error states, and network errors.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/ContactForm";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(message = "Message sent successfully") {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ message }),
  });
}

function mockFetchError(status = 400, body?: Record<string, unknown>) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    json: async () => body ?? { error: "Something went wrong." },
  });
}

function mockFetchNetworkError() {
  mockFetch.mockRejectedValueOnce(new Error("Network Error"));
}

function fillForm(user: ReturnType<typeof userEvent.setup>) {
  return {
    name: async (value: string) => {
      const input = screen.getByLabelText("Name");
      await user.clear(input);
      await user.type(input, value);
    },
    email: async (value: string) => {
      const input = screen.getByLabelText("Email");
      await user.clear(input);
      await user.type(input, value);
    },
    message: async (value: string) => {
      const textarea = screen.getByLabelText("Message");
      await user.clear(textarea);
      await user.type(textarea, value);
    },
  };
}

// ----------

describe("ContactForm", () => {
  // ----------
  // Rendering
  // ----------

  it("renders name, email, message fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<ContactForm />);

    expect(
      screen.getByRole("button", { name: "Send Message" }),
    ).toBeInTheDocument();
  });

  it("renders with an accessible form label", () => {
    render(<ContactForm />);

    expect(screen.getByRole("form", { name: "Contact form" })).toBeInTheDocument();
  });

  it("marks required fields with the required attribute", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Message")).toBeRequired();
  });

  // ----------
  // Blur-based inline validation
  // ----------

  it("shows inline error on blur when name is empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText("Name");
    await user.click(nameInput);      // focus
    await user.tab();                // blur — field is empty, should trigger validation

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    });
  });

  it("shows inline error on blur when email is invalid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.click(emailInput);
    await user.type(emailInput, "not-an-email");
    await user.tab(); // blur

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Please enter a valid email address",
      );
    });
  });

  it("clears inline error on blur when field becomes valid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText("Name");

    // First pass: focus then blur empty → error
    await user.click(nameInput);
    await user.tab();
    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    // Second pass: type something + fill email to avoid cascade → error clears
    const emailInput = screen.getByLabelText("Email");
    await user.click(nameInput);
    await user.type(nameInput, "John");
    await user.click(emailInput);
    await user.type(emailInput, "jane@example.com");
    // Blur the email (valid) so no email error lingers
    await user.click(nameInput);

    await waitFor(() => {
      expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });
  });

  it("shows inline error on blur when message is empty", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const messageInput = screen.getByLabelText("Message");
    await user.click(messageInput);
    await user.tab(); // blur — empty message

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Message is required");
    });
  });

  it("does not show error on blur when field is prefilled and valid", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText("Email");
    await user.click(emailInput);
    await user.type(emailInput, "john@example.com");
    await user.tab();

    // Wait to ensure no alert appears
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // ----------
  // Form submission — success
  // ----------

  it("shows success message after successful submission", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("John Doe");
    await form.email("john@example.com");
    await form.message("I am interested in a property.");
    await user.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Message sent successfully",
      );
    });
  });

  it("calls POST /api/contact with the correct JSON body", async () => {
    mockFetchSuccess();
    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("Jane");
    await form.email("jane@example.com");
    await form.message("Hello from Jane");
    await user.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/contact",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Jane",
            email: "jane@example.com",
            message: "Hello from Jane",
          }),
        }),
      );
    });
  });

  // ----------
  // Form submission — validation errors from server
  // ----------

  it("shows server error when validation fails (400)", async () => {
    mockFetchError(400, { error: "Validation failed", fieldErrors: { email: ["Not a valid email"] } });
    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("Test");
    // Use a valid-looking email locally so blur doesn't show local error;
    // server still rejects and returns fieldErrors.
    await form.email("test@example.com");
    await form.message("msg");
    await user.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      const hasValidationFailed = alerts.some(
        (a) => a.textContent === "Validation failed",
      );
      expect(hasValidationFailed).toBe(true);
    });
  });

  it("displays server field errors for specific fields", async () => {
    mockFetchError(400, { error: "Validation failed", fieldErrors: { email: ["Not a valid email"] } });
    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("Test");
    await form.email("test@example.com");
    await form.message("Some message");
    await user.click(screen.getByRole("button", { name: "Send Message" }));

    // Server field error should appear as inline error
    await waitFor(() => {
      expect(screen.getByText("Not a valid email")).toBeInTheDocument();
    });
  });

  it("shows error alert on 500 server error", async () => {
    mockFetchError(500, { error: "Internal server error" });
    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("Test");
    await form.email("test@test.com");
    await form.message("message");
    await user.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Internal server error");
    });
  });

  // ----------
  // Network error
  // ----------

  it("shows network error message when fetch rejects", async () => {
    mockFetchNetworkError();
    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("Test");
    await form.email("test@test.com");
    await form.message("message");
    await user.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Network error. Please try again.",
      );
    });
  });

  // ----------
  // Submit button pending state
  // ----------

  it("shows Sending... text on the button during submission", async () => {
    // Don't resolve the fetch — keep the pending state
    let resolveFetch: (value: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<ContactForm />);

    const form = fillForm(user);
    await form.name("Test");
    await form.email("test@test.com");
    await form.message("message");

    const button = screen.getByRole("button", { name: "Send Message" });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument();
    });

    // Cleanup: resolve the promise to avoid hanging
    resolveFetch!({ ok: true, json: async () => ({ message: "sent" }) });
  });
});
