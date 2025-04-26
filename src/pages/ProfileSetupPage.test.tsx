import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { ProfileSetupPage } from "./ProfileSetupPage";
import { JobSeekerProfileForm } from "../components/profile/JobSeekerProfileForm";
import { EmployerProfileForm } from "../components/profile/EmployerProfileForm";

// Mock the profile form components using vi.mock
vi.mock("../components/profile/JobSeekerProfileForm", () => ({
  JobSeekerProfileForm: vi.fn(() => (
    <div data-testid="job-seeker-form">Job Seeker Form</div>
  )),
}));

vi.mock("../components/profile/EmployerProfileForm", () => ({
  EmployerProfileForm: vi.fn(() => (
    <div data-testid="employer-form">Employer Form</div>
  )),
}));

// Mock useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProfileSetupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the profile selection options initially", () => {
    render(
      <BrowserRouter>
        <ProfileSetupPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Complete Your Profile")).toBeInTheDocument();
    expect(screen.getByText("I am a:")).toBeInTheDocument();
    expect(screen.getByText("Job Seeker")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  // it("shows JobSeekerProfileForm when job-seeker is selected", () => {
  //   render(
  //     <BrowserRouter>
  //       <ProfileSetupPage />
  //     </BrowserRouter>
  //   );

  //   // Select job seeker radio button
  //   const jobSeekerLabel = screen.getByText("Job Seeker").closest("label");
  //   if (jobSeekerLabel) {
  //     fireEvent.click(jobSeekerLabel);
  //   }

  //   // Click initial continue button
  //   const initialContinueButton = screen.getByRole("button", {
  //     name: "Continue",
  //   });
  //   expect(initialContinueButton).not.toBeDisabled();
  //   fireEvent.click(initialContinueButton);

  //   // Verify JobSeekerProfileForm is rendered (No need to check for "Continue" button again here)
  //   expect(screen.getByTestId("job-seeker-form")).toBeInTheDocument();
  //   expect(JobSeekerProfileForm).toHaveBeenCalled();
  // });

  // it("shows EmployerProfileForm when employer is selected", () => {
  //   render(
  //     <BrowserRouter>
  //       <ProfileSetupPage />
  //     </BrowserRouter>
  //   );

  //   // Select employer radio button
  //   const employerLabel = screen.getByText("Employer").closest("label");
  //   if (employerLabel) {
  //     fireEvent.click(employerLabel);
  //   }

  //   // Click initial continue button
  //   const initialContinueButton = screen.getByRole("button", {
  //     name: "Continue",
  //   });
  //   expect(initialContinueButton).not.toBeDisabled();
  //   fireEvent.click(initialContinueButton);

  //   // Verify EmployerProfileForm is rendered (No need to check for "Continue" button again here)
  //   expect(screen.getByTestId("employer-form")).toBeInTheDocument();
  //   expect(EmployerProfileForm).toHaveBeenCalled();
  // });

  // it("allows user to go back to profile type selection", () => {
  //   render(
  //     <BrowserRouter>
  //       <ProfileSetupPage />
  //     </BrowserRouter>
  //   );

  //   // Select job seeker and click initial continue
  //   const jobSeekerLabel = screen.getByText("Job Seeker").closest("label");
  //   if (jobSeekerLabel) {
  //     fireEvent.click(jobSeekerLabel);
  //   }
  //   const initialContinueButton = screen.getByRole("button", {
  //     name: "Continue",
  //   }); // Find it before clicking
  //   fireEvent.click(initialContinueButton); // Click it

  //   // Verify the form is shown (optional, but good practice)
  //   expect(screen.getByTestId("job-seeker-form")).toBeInTheDocument();

  //   // Click back button
  //   fireEvent.click(
  //     screen.getByRole("button", { name: /back to profile type selection/i })
  //   );

  //   // Verify we're back to the profile selection view
  //   expect(screen.getByText("I am a:")).toBeInTheDocument();
  //   expect(screen.getByText("Job Seeker")).toBeInTheDocument();
  //   expect(screen.getByText("Employer")).toBeInTheDocument();
  // });
});
