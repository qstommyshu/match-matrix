import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProfileSetupPage } from "./ProfileSetupPage";
import { JobSeekerProfileForm } from "../components/profile/JobSeekerProfileForm";
import { EmployerProfileForm } from "../components/profile/EmployerProfileForm";

// Mock the profile form components
jest.mock("../components/profile/JobSeekerProfileForm", () => ({
  JobSeekerProfileForm: jest.fn(() => (
    <div data-testid="job-seeker-form">Job Seeker Form</div>
  )),
}));

jest.mock("../components/profile/EmployerProfileForm", () => ({
  EmployerProfileForm: jest.fn(() => (
    <div data-testid="employer-form">Employer Form</div>
  )),
}));

// Mock useNavigate hook
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("ProfileSetupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("shows JobSeekerProfileForm when job-seeker is selected", () => {
    render(
      <BrowserRouter>
        <ProfileSetupPage />
      </BrowserRouter>
    );

    // Select job seeker radio button
    const jobSeekerLabel = screen.getByText("Job Seeker").closest("label");
    if (jobSeekerLabel) {
      fireEvent.click(jobSeekerLabel);
    }

    // Click continue
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).not.toBeDisabled();
    fireEvent.click(continueButton);

    // Verify JobSeekerProfileForm is rendered
    expect(screen.getByTestId("job-seeker-form")).toBeInTheDocument();
    expect(JobSeekerProfileForm).toHaveBeenCalled();
  });

  it("shows EmployerProfileForm when employer is selected", () => {
    render(
      <BrowserRouter>
        <ProfileSetupPage />
      </BrowserRouter>
    );

    // Select employer radio button
    const employerLabel = screen.getByText("Employer").closest("label");
    if (employerLabel) {
      fireEvent.click(employerLabel);
    }

    // Click continue
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).not.toBeDisabled();
    fireEvent.click(continueButton);

    // Verify EmployerProfileForm is rendered
    expect(screen.getByTestId("employer-form")).toBeInTheDocument();
    expect(EmployerProfileForm).toHaveBeenCalled();
  });

  it("allows user to go back to profile type selection", () => {
    render(
      <BrowserRouter>
        <ProfileSetupPage />
      </BrowserRouter>
    );

    // Select job seeker and continue
    const jobSeekerLabel = screen.getByText("Job Seeker").closest("label");
    if (jobSeekerLabel) {
      fireEvent.click(jobSeekerLabel);
    }
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Click back button
    fireEvent.click(
      screen.getByRole("button", { name: /back to profile type selection/i })
    );

    // Verify we're back to the profile selection view
    expect(screen.getByText("I am a:")).toBeInTheDocument();
    expect(screen.getByText("Job Seeker")).toBeInTheDocument();
    expect(screen.getByText("Employer")).toBeInTheDocument();
  });
});
