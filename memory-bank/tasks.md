# Tasks - Match Matrix

## Project Setup

- [x] Initialize Next.js project
- [x] Configure TypeScript
- [x] Set up Tailwind CSS
- [x] Initialize Memory Bank
- [x] Create project README

## Supabase Integration

- [x] Install Supabase client packages
- [x] Configure Supabase client
- [x] Create Supabase project on Supabase.com
- [x] Set up environment variables with actual credentials
- [x] Create database schema
- [x] Prepare database migrations
- [x] Consolidate migrations into `/src/db/migrations`
- [x] Create SQL helper functions
- [x] Update migration documentation
- [x] Add missing columns for job seeker profiles

## Authentication

- [x] Implement sign up functionality
- [x] Implement login functionality
- [x] Create protected routes
- [x] Implement role-based access control
- [x] Add user profile management

## Profile Management

- [x] Create job seeker profile form
- [x] Create employer profile form
- [x] Implement skills management
  - [x] Create UpdateSkillsModal component
  - [x] Implement skills fetching from Supabase
  - [x] Add skills update functionality
  - [x] Show real user skills on profile
- [x] Implement profile editing (Basic via EditProfilePage)
- [ ] Add profile picture upload functionality
- [x] Create profile completion indicator (Basic on JobSeekerDashboard)
- [x] Implement profile viewing for job applicants

## UI Development

- [x] Create basic layout components
- [x] Design and implement user dashboard
  - [x] Create Job seeker dashboard page
  - [x] Create Employer dashboard page
  - [x] Implement dashboard routing container
  - [x] Add dashboard route to App router
  - [x] Populate dashboards with real data/widgets (Employer jobs, Job seeker recommendations **w/ company & skills**)
- [ ] Implement navigation (Header exists, needs refinement)
- [x] Create job listing components (Used in EmployerDashboard, JobSearchPage)
- [x] Develop profile creation forms
- [x] Design job search interface (JobSearchPage created)
- [x] Display user full_name in header

## Core Features

- [x] Implement job posting functionality (PostJobPage, PostJobForm)
- [x] Create job search (JobSearchPage - basic, no filters yet)
  - [ ] Add filtering to job search
- [x] Implement job viewing (JobDetailPage)
- [x] Implement job editing (EditJobPage reusing PostJobForm)
- [ ] Develop matching algorithm
  - [ ] Define matching criteria
  - [x] Create skills and preference tables
  - [ ] Implement scoring system
  - [ ] Build recommendation engine (Basic fetch in JobSeekerDashboard)
- [x] Implement application system
  - [x] Create application database functions
  - [x] Display applications to employers
  - [x] Allow employers to view applicant profiles
  - [x] Set up Row Level Security for profile viewing
  - [x] Refine RLS for profile/employer_profile read access
  - [x] Sort applicants by match score then date
- [ ] Add notification system

## AI Profile Summarization (New Feature)

- [x] **Database:** Add `ai_summary` column to `applications` table.
  - [x] Create migration file.
  - [x] Update RLS policy for `applications` table (update/read `ai_summary`).
- [x] **Backend:** Create Supabase Edge Function (`summarize-applicant`).
  - [x] Implement security check (verify user is the job's employer).
  - [x] Implement data fetching for applicant details (profile, skills, experience).
  - [x] Implement prompt engineering for AI summarization.
  - [x] Integrate OpenAI API call (using secure environment variable).
  - [x] Implement logic to store summary in database (if Step 1 is done).
  - [x] Define function response (summary or status).
- [x] **Frontend Utility:** Create helper function to call Edge Function.
  - [x] Add `generateAISummary` to `supabase.ts`.
- [x] **Frontend Integration:** Integrate the feature into `ViewApplicantsPage.tsx` (awaiting implementation).
  - [x] Add state management for summaries (per applicant: loading, error, data).
  - [x] Add UI element to display summary/loading/error.
  - [x] Add "Summarize" button to applicant actions.
  - [x] Implement button `onClick` handler to call Edge Function.
  - [x] Handle function response and update UI state.
  - [x] Implement logic to display existing stored summaries.
- [x] **Configuration:** Set up OpenAI API key in local environment.
  - [x] Set up OpenAI API key in Supabase environment variables (when deploying Edge Function).
- [x] **Testing:** Test the end-to-end flow, error handling, and UI updates.

## Job Enhancements

- [ ] **Company Benefits Integration**
  - [ ] **Database:** Add `benefits` column (e.g., `TEXT[]`) to `jobs` table.
  - [ ] **Database:** Create migration file for benefits column.
  - [ ] **Database:** Update RLS policies for `jobs` if needed (read access).
  - [ ] **Backend:** Update `Job` type definition to include `benefits`.
  - [ ] **Backend:** Update `getJob` function to select `benefits`.
  - [ ] **Backend:** Update `createJob` and `updateJob` functions to handle `benefits`.
  - [ ] **Frontend:** Add benefits input field to `PostJobForm.tsx`.
  - [ ] **Frontend:** Display benefits section on `JobDetailPage.tsx`.
  - [ ] **Testing:** Verify benefits are saved, updated, and displayed correctly.

## Application Management Enhancements

- [x] **Application Stages**

  - [x] **Database:** Define standard application stages (e.g., 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Withdrawn').
  - [x] **Database:** Update `applications` table: Add a new `stage` column.
  - [x] **Database:** Create migration file for application stage changes.
  - [x] **Database:** Update RLS policies for `applications` (allow employer read access to stage).
  - [x] **Backend:** Update `Application` type definition.
  - [x] **Backend:** Update `createApplication` to set initial stage ('Applied').
  - [x] **Backend:** Update relevant query functions (`getJobApplications`, `getUserApplications`, etc.) to select the stage.
  - [x] **Frontend (Employer):** Display application stage badge/text on `ViewApplicantsPage.tsx`.
  - [x] **Testing:** Verify stage is set correctly and displayed.

- [x] **Employer Ability to Change Application Stage**

  - [x] **Database:** Update RLS policy for `applications` to allow employers to `UPDATE` the stage column for jobs they own.
  - [x] **Backend:** Create `updateApplicationStage` function in `database.ts`.
  - [x] **Backend:** Define type for `updateApplicationStage` parameters and return value.
  - [x] **Frontend (Employer):** Add UI element (e.g., dropdown menu, status buttons) to `ViewApplicantsPage.tsx` for changing stage.
  - [x] **Frontend (Employer):** Implement `onClick` handler to call `updateApplicationStage` function.
  - [x] **Frontend (Employer):** Update UI optimistically or refetch data after stage change.
  - [x] **Testing:** Verify employers can change stages, RLS prevents unauthorized changes.

- [x] **Employer Batch Actions for Applications**
  - [x] **Frontend (Employer):** Add checkboxes to applicant list rows in `ViewApplicantsPage.tsx`.
  - [x] **Frontend (Employer):** Add state management for selected applicants.
  - [x] **Frontend (Employer):** Add batch action controls (e.g., "Change Stage to...", "Generate Rejection Email for Selected").
  - [x] **Backend:** Create `batchUpdateApplicationStage` function (or similar) in `database.ts` or potentially an Edge Function for complex logic/atomicity.
  - [x] **Backend:** Implement logic to handle multiple application updates securely and efficiently.
  - [x] **Frontend (Employer):** Implement logic to call batch update function with selected applicant IDs and target stage/action.
  - [x] **Testing:** Verify batch actions work correctly for various scenarios (stage change, etc.).

## AI Features

- [ ] **AI-Generated Rejection Email**
  - [ ] **Database:** Consider adding `rejection_email_sent_at` (TIMESTAMPZ) or `generated_rejection_email` (TEXT) to `applications` table. Create migration if needed.
  - [ ] **Backend:** Create Supabase Edge Function (`generate-rejection-email`).
    - [ ] Implement security check (verify user is the job's employer, application belongs to job).
    - [ ] Implement data fetching: job details, applicant profile (skills, bio, etc.), application details.
    - [ ] Develop prompt engineering strategy for constructive feedback.
    - [ ] Integrate OpenAI API call.
    - [ ] Define function input (application_id, maybe custom notes) and output (email content).
  - [ ] **Frontend Utility:** Add helper function (e.g., `generateRejectionEmail`) to `supabase.ts` to call the Edge Function.
  - [ ] **Frontend (Employer):** Add "Generate Rejection Email" button/action on `ViewApplicantsPage.tsx` (perhaps visible when stage is 'Rejected' or as part of changing stage to 'Rejected').
  - [ ] **Frontend (Employer):** Implement UI to trigger generation, potentially show preview, and maybe trigger sending (or just provide content).
  - [ ] **Testing:** Test Edge Function logic, prompt effectiveness, API integration, and frontend interaction.

## Developer Experience

- [ ] **Basic CI/CD Pipeline**
  - [ ] Choose CI/CD platform (e.g., GitHub Actions, Vercel, Netlify).
  - [ ] Configure build script in `package.json` if necessary.
  - [ ] Create workflow configuration file (e.g., `.github/workflows/deploy.yml`).
  - [ ] Define trigger (e.g., push to `main`).
  - [ ] Add steps: checkout, setup Node, install dependencies, build.
  - [ ] (Optional) Add step: run tests (if tests exist).
  - [ ] Configure deployment step (e.g., using Vercel CLI, Netlify CLI, or GitHub Actions deploy actions).
  - [ ] Set up environment variables (Supabase URL/Key, OpenAI Key) as secrets in the CI/CD platform.
  - [ ] **Testing:** Trigger pipeline and verify successful build and deployment.

## Pro Job Seeker Feature

- [x] **Database: Update Schema for Pro Features**

  - [x] Add `is_pro` boolean column to `job_seeker_profiles` table.
  - [x] Add `pro_active_status` boolean column to `job_seeker_profiles` table.
  - [x] Add `last_active_check_in` timestamp column to `job_seeker_profiles` table.
  - [x] Create `assessment_skills` table with columns:
    - [x] `id` (primary key)
    - [x] `user_id` (foreign key to profiles)
    - [x] `skill_id` (foreign key to skills)
    - [x] `assessment_score` (numeric)
    - [x] `verified_at` (timestamp)
  - [x] Create `power_matches` table with columns:
    - [x] `id` (primary key)
    - [x] `user_id` (foreign key to profiles)
    - [x] `job_id` (foreign key to jobs)
    - [x] `application_id` (foreign key to applications, nullable)
    - [x] `match_score` (numeric)
    - [x] `created_at` (timestamp)
    - [x] `viewed_at` (timestamp, nullable)
    - [x] `applied_at` (timestamp, nullable)
  - [x] Create migration file for all pro-related schema changes.
  - [x] Update RLS policies for new tables (user can view/modify own data).

- [ ] **Backend: Pro Features Core Functions**

  - [x] Create types for `AssessmentSkill` and `PowerMatch` in `database.ts`.
  - [x] Implement `upgradeToProAccount` function.
  - [x] Implement `checkInActiveStatus` function to update last active check-in.
  - [x] Implement `getAssessmentSkills` function.
  - [x] Implement `addAssessmentSkill` function.
  - [x] Implement `updateAssessmentSkill` function.
  - [x] Implement `getPowerMatches` function.
  - [x] Implement `markPowerMatchViewed` function.
  - [ ] Implement Edge Function for daily power_match generation.

- [ ] **Backend: Pro Features Automation Functions**

  - [x] Create SQL function for finding eligible power_match jobs (>80% match score, not applied).
  - [x] Create Edge Function `generate-power-matches` to:
    - [x] Select pro users with active status
    - [x] Find top 3 matching jobs for each user
    - [x] Create power_match entries
  - [x] Create Edge Function `auto-apply-power-matches` to:
    - [x] Create applications for power_matches without applications
    - [x] Update power_matches with applied_at timestamp
  - [x] Create Edge Function `check-power-match-views` to:
    - [x] Identify power_matches not viewed within 2 days
    - [x] Auto-withdraw applications for these power_matches
  - [x] Create SQL functions for scheduled tasks (daily check-ins, autowithdrawals)

- [ ] **Frontend: Pro Upgrade UI**

  - [x] Create `ProFeatureBanner` component for job seeker dashboard.
  - [x] Create `UpgradeToProModal` component with toggle and explanations.
  - [x] Add pro badge/indicator to job seeker profile UI.
  - [ ] Implement stripe or other payment integration for pro upgrade.

- [ ] **Frontend: Active Check-in UI**

  - [x] Create `DailyCheckInModal` to appear for pro users who haven't checked in.
  - [x] Add check-in reminder notification to header for pro users.
  - [x] Implement auto check-in when pro user logs in.

- [ ] **Frontend: Assessment Skills UI**

  - [x] Create `AssessmentSkillsModal` component.
  - [ ] Design assessment process UI flow.
  - [x] Implement assessment skills listing and management page.
  - [ ] Add assessment score badges to profile skills display.

- [ ] **Frontend: Power Match UI**

  - [x] Create `PowerMatchesSection` for job seeker dashboard.
  - [x] Design power match card with match score, job details.
  - [x] Implement "View Job" and "Opt-out" actions for power matches.
  - [x] Add toast notifications for new power matches.
  - [x] Add warnings for power matches approaching 2-day view deadline.

- [ ] **Testing: Pro Features**
  - [ ] Write unit tests for pro feature database functions.
  - [ ] Test daily check-in flow and status updates.
  - [ ] Test power match generation, application, and auto-withdrawal.
  - [ ] Verify assessment skills management UI.
  - [ ] Test pro upgrade flow and feature toggles.

## Pro Job Seeker Feature Enhancements (Planned)

- [ ] **Assessment Skill Expiration Display**

  - [ ] **Frontend (`AssessmentSkillsModal.tsx`):** Calculate expiration date (verified_at + 90 days).
  - [ ] **Frontend (`AssessmentSkillsModal.tsx`):** Display expiration date or days remaining for each assessed skill.
  - [ ] **Frontend (`AssessmentSkillsModal.tsx`):** Add visual indicator for expired/expiring soon skills.

- [ ] **Manual Power Match Trigger**
  - [ ] **Database (SQL):** Create RPC function `trigger_user_power_match(p_user_id UUID)` in `18_add_pro_automation_functions.sql`.
    - [ ] Function should verify `auth.uid() = p_user_id`.
    - [ ] Function should call `find_eligible_power_match_jobs`.
    - [ ] Function should insert results into `power_matches`.
    - [ ] Function should return status/count.
  - [ ] **Backend (`database.ts`):** Add `triggerUserPowerMatch` function to call the new RPC.
  - [ ] **Frontend (`PowerMatchesSection.tsx`):** Add "Find Matches Now" button for Pro users.
  - [ ] **Frontend (`PowerMatchesSection.tsx`):** Implement onClick handler, loading state, and toast feedback.
  - [ ] **Frontend (`PowerMatchesSection.tsx`):** Refresh power match list on success.

## Testing

- [ ] Write unit tests for components
- [ ] Implement integration tests
- [ ] Test authentication flows
- [ ] Verify database operations
- [ ] User acceptance testing
- [ ] **Testing: Pro Features**
  - [ ] Write unit tests for pro feature database functions.
  - [ ] Test daily check-in flow and status updates.
  - [ ] Test power match generation, application, and auto-withdrawal.
  - [ ] Verify assessment skills management UI (including add/delete/expiration).
  - [ ] Test pro upgrade flow and feature toggles.
  - [ ] Test manual power match trigger.
