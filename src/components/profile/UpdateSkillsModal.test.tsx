import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { UpdateSkillsModal } from "./UpdateSkillsModal";
import * as db from "@/lib/database";
import * as auth from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

// Mock the toast function
vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock the database functions
vi.mock("@/lib/database", () => ({
  getSkills: vi.fn(),
  getUserSkills: vi.fn(),
  addUserSkill: vi.fn(),
  removeUserSkill: vi.fn(),
}));

// Mock the auth context
vi.mock("@/lib/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock Skill data
const mockAllSkills = [
  { id: "skill-1", name: "React", category: "Frontend" },
  { id: "skill-2", name: "Node.js", category: "Backend" },
  { id: "skill-3", name: "TypeScript", category: "Language" },
  { id: "skill-4", name: "CSS", category: "Frontend" },
];

const mockUserSkills = [
  {
    id: "us-1",
    user_id: "test-user-id",
    skill_id: "skill-1",
    proficiency_level: 4,
    skill: mockAllSkills[0],
  }, // React
  {
    id: "us-3",
    user_id: "test-user-id",
    skill_id: "skill-3",
    proficiency_level: 3,
    skill: mockAllSkills[2],
  }, // TypeScript
];

describe("UpdateSkillsModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockUser = { id: "test-user-id" };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth.useAuth as Mock).mockReturnValue({ user: mockUser });
    // Mock successful data fetching by default
    (db.getSkills as Mock).mockResolvedValue({
      skills: mockAllSkills,
      error: null,
    });
    (db.getUserSkills as Mock).mockResolvedValue({
      userSkills: mockUserSkills,
      error: null,
    });
    // Mock successful add/remove by default
    (db.addUserSkill as Mock).mockResolvedValue({ userSkill: {}, error: null });
    (db.removeUserSkill as Mock).mockResolvedValue({ error: null });
  });

  const renderModal = (isOpen = true) => {
    render(
      <UpdateSkillsModal
        isOpen={isOpen}
        onOpenChange={mockOnOpenChange}
        onUpdate={mockOnUpdate}
      />
    );
  };

  it("renders the modal with title and loads data when open", async () => {
    renderModal();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Update Skills")).toBeInTheDocument();
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument(); // Or check for Loader2 disappearance
    });
    expect(screen.getByLabelText("React")).toBeInTheDocument();
    expect(screen.getByLabelText("Node.js")).toBeInTheDocument();
  });

  it("checks checkboxes corresponding to current user skills", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByLabelText("React")).toBeChecked();
    });
    expect(screen.getByLabelText("TypeScript")).toBeChecked();
    expect(screen.getByLabelText("Node.js")).not.toBeChecked();
  });

  it("allows checking and unchecking skills", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByLabelText("React")).toBeInTheDocument(); // Ensure loaded
    });

    const nodeCheckbox = screen.getByRole("checkbox", { name: /Node\.js/i }); // Escape dot
    const reactCheckbox = screen.getByRole("checkbox", { name: /React/i });

    // Check initial state
    expect(nodeCheckbox).not.toBeChecked();
    expect(reactCheckbox).toBeChecked();

    // Check a new skill
    fireEvent.click(nodeCheckbox);
    expect(nodeCheckbox).toBeChecked();

    // Uncheck an existing skill
    fireEvent.click(reactCheckbox);
    expect(reactCheckbox).not.toBeChecked();
  });

  it("calls addUserSkill and removeUserSkill correctly on save", async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByLabelText("React")).toBeInTheDocument();
    });

    // Initial: React (skill-1), TypeScript (skill-3)
    // Action: Check Node.js (skill-2), Uncheck TypeScript (skill-3)
    fireEvent.click(screen.getByRole("checkbox", { name: /Node\.js/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /TypeScript/i }));

    // Click Save
    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    // Wait for saves
    await waitFor(() => {
      // Should add Node.js
      expect(db.addUserSkill).toHaveBeenCalledTimes(1);
      expect(db.addUserSkill).toHaveBeenCalledWith({
        user_id: mockUser.id,
        skill_id: "skill-2", // Node.js
        proficiency_level: 3, // Default proficiency
      });

      // Should remove TypeScript (identified by its userSkill ID 'us-3')
      expect(db.removeUserSkill).toHaveBeenCalledTimes(1);
      expect(db.removeUserSkill).toHaveBeenCalledWith("us-3");
    });

    // Check toast and callbacks
    expect(toast).toHaveBeenCalledWith({
      title: "Success",
      description: "Your skills have been updated.",
    });
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error toast if fetching initial data fails", async () => {
    // Mock fetch failure
    const fetchError = new Error("Network Error");
    (db.getSkills as Mock).mockResolvedValue({
      skills: null,
      error: fetchError,
    });
    (db.getUserSkills as Mock).mockResolvedValue({
      userSkills: null,
      error: null,
    }); // Or mock this too

    renderModal();

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to load skills data.",
        variant: "destructive",
      });
    });
    // Modal should close itself on fetch error in this implementation
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error toast if saving fails partially or fully", async () => {
    // Mock remove failure
    const removeError = new Error("Failed to remove skill");
    (db.removeUserSkill as Mock).mockRejectedValue(removeError); // Simulate rejection
    // Mock add success
    (db.addUserSkill as Mock).mockResolvedValue({ userSkill: {}, error: null });

    renderModal();
    await waitFor(() => {
      expect(screen.getByLabelText("React")).toBeInTheDocument();
    });

    // Action: Add Node.js, Remove TypeScript
    fireEvent.click(screen.getByRole("checkbox", { name: /Node\.js/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /TypeScript/i }));

    fireEvent.click(screen.getByRole("button", { name: /Save Changes/i }));

    await waitFor(() => {
      expect(db.addUserSkill).toHaveBeenCalled();
      expect(db.removeUserSkill).toHaveBeenCalled();
    });

    expect(toast).toHaveBeenCalledWith({
      title: "Error",
      description: expect.stringContaining("Some skill updates failed"), // Check for generic error
      variant: "destructive",
    });

    // Check that callbacks were NOT triggered for success/close
    expect(mockOnUpdate).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });
});
