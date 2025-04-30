import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { UpdateBenefitsModal } from "./UpdateBenefitsModal";
import * as db from "@/lib/database"; // To mock database functions
import * as auth from "@/lib/AuthContext"; // To mock auth context
import { toast } from "@/components/ui/use-toast"; // To check toasts

// Mock the toast function
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock the database functions
vi.mock("@/lib/database", () => ({
  updateEmployerProfile: vi.fn(),
}));

// Mock the auth context
vi.mock("@/lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("UpdateBenefitsModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockUser = { id: "test-user-id" }; // Mock user object

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Provide a default mock implementation for useAuth
    (auth.useAuth as Mock).mockReturnValue({ user: mockUser });
    // Mock successful profile update by default
    (db.updateEmployerProfile as Mock).mockResolvedValue({ error: null });
  });

  const renderModal = (
    isOpen = true,
    currentBenefits: string[] | null = []
  ) => {
    render(
      <UpdateBenefitsModal
        isOpen={isOpen}
        onOpenChange={mockOnOpenChange}
        currentBenefits={currentBenefits}
        onUpdate={mockOnUpdate}
      />
    );
  };

  it("renders the modal with title when open", () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Update Company Benefits")).toBeInTheDocument();
  });

  it("does not render the modal when closed", () => {
    renderModal(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays the list of available benefits as checkboxes", () => {
    renderModal();
    // Check for a few specific benefits
    expect(screen.getByLabelText("Health Insurance")).toBeInTheDocument();
    expect(screen.getByLabelText("401(k) Matching")).toBeInTheDocument();
    expect(screen.getByLabelText("Remote Work Options")).toBeInTheDocument();
  });

  it("checks the checkboxes corresponding to currentBenefits", () => {
    const current = ["Health Insurance", "Unlimited PTO"];
    renderModal(true, current);

    expect(screen.getByLabelText("Health Insurance")).toBeChecked();
    expect(screen.getByLabelText("Unlimited PTO")).toBeChecked();
    expect(screen.getByLabelText("Dental Insurance")).not.toBeChecked();
  });

  it("allows checking and unchecking benefits", () => {
    renderModal(true, ["Health Insurance"]);

    // Use getByRole for better selector and toBeChecked for assertion
    const dentalCheckbox = screen.getByRole("checkbox", {
      name: /Dental Insurance/i,
    });
    const healthCheckbox = screen.getByRole("checkbox", {
      name: /Health Insurance/i,
    });

    // Check initial state using the specific matcher
    expect(dentalCheckbox).not.toBeChecked();
    expect(healthCheckbox).toBeChecked();

    // Check a new benefit
    fireEvent.click(dentalCheckbox);
    expect(dentalCheckbox).toBeChecked();

    // Uncheck an existing benefit
    fireEvent.click(healthCheckbox);
    expect(healthCheckbox).not.toBeChecked();
  });

  it("calls updateEmployerProfile with selected benefits on save", async () => {
    renderModal(true, ["Vision Insurance"]);

    // Simulate checking 'Health Insurance' and unchecking 'Vision Insurance'
    fireEvent.click(screen.getByLabelText("Health Insurance"));
    fireEvent.click(screen.getByLabelText("Vision Insurance"));

    // Click Save
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    // Wait for the async operation
    await waitFor(() => {
      expect(db.updateEmployerProfile).toHaveBeenCalledTimes(1);
    });

    // Check the arguments passed to updateEmployerProfile
    // It should contain 'Health Insurance' but not 'Vision Insurance'
    const expectedBenefits = ["Health Insurance"].sort(); // Keep order consistent
    expect(db.updateEmployerProfile).toHaveBeenCalledWith(mockUser.id, {
      // The order might vary depending on Set conversion, so compare contents
      benefits: expect.arrayContaining(expectedBenefits),
    });
    // Ensure the length is also correct (Cast the mock call)
    expect(
      (
        (db.updateEmployerProfile as Mock).mock.calls[0][1] as {
          benefits: string[];
        }
      ).benefits
    ).toHaveLength(expectedBenefits.length);

    // Check if success toast was called
    expect(toast).toHaveBeenCalledWith({
      title: "Success",
      description: "Company benefits have been updated.",
    });

    // Check if callbacks were triggered
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false); // Modal should close
  });

  it("shows an error toast if saving fails", async () => {
    // Mock a failure from the database function
    const updateError = new Error("Database connection failed");
    (db.updateEmployerProfile as Mock).mockResolvedValue({
      error: updateError,
    });

    renderModal(true, []);

    // Select a benefit and save
    fireEvent.click(screen.getByLabelText("Dental Insurance"));
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(db.updateEmployerProfile).toHaveBeenCalledTimes(1);
    });

    expect(toast).toHaveBeenCalledWith({
      title: "Error",
      description: "Database connection failed",
      variant: "destructive",
    });

    // Check that callbacks were NOT triggered for success/close
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("disables buttons while saving", async () => {
    // Make the mock update take a bit longer
    (db.updateEmployerProfile as Mock).mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
      return { error: null };
    });

    renderModal(true, []);
    const saveButton = screen.getByRole("button", { name: /Save Changes/i });
    const cancelButton = screen.getByRole("button", { name: /Cancel/i });

    // Click save
    fireEvent.click(saveButton);

    // Buttons should be disabled immediately
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(screen.getByText(/Saving.../i)).toBeInTheDocument();

    // Wait for the save to complete
    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });

    // Buttons should be re-enabled (though modal closes on success)
    // Check modal closed instead
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
