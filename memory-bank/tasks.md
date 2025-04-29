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
- [x] Implement navigation (Header exists, needs refinement)
  - [x] Create `/about` page placeholder
  - [x] Create `/pricing` page placeholder
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
    - [x] Add missing INSERT policy for power_matches for RPC calls (Fixes manual trigger issue)

- [ ] **Backend: Pro Features Core Functions**

  - [x] Create types for `AssessmentSkill` and `PowerMatch` in `database.ts`.
  - [x] Implement `upgradeToProAccount` function.
  - [x] Implement `checkInActiveStatus` function to update last active check-in.
  - [x] Implement `getAssessmentSkills` function.
  - [x] Implement `addAssessmentSkill` function.
  - [x] Implement `updateAssessmentSkill` function.
  - [x] Implement `getPowerMatches` function.
  - [x] Implement `markPowerMatchViewed` function.
  - [x] Implement `triggerUserPowerMatch` function (for manual trigger)
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
    - [x] Fix company name fetching in `getPowerMatches`.
    - [x] Add "Viewed" indicator to card.
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

- [x] **Assessment Skill Expiration Display**

  - [x] Calculate expiration date (verified_at + 90 days) in `AssessmentSkillsModal.tsx`.
  - [x] Display expiration date.
  - [x] Add visual cues (color/icon) for expired/expiring skills.

- [x] **Manual Power Match Trigger**
  - [x] Create SQL RPC function `trigger_user_power_match`.
  - [x] Create migration file `19_add_manual_power_match_trigger.sql`.
  - [x] Modify SQL RPC function `trigger_user_power_match` to auto-apply immediately (Migration `23_modify_trigger_user_power_match_to_autoapply.sql`).
  - [x] Add `triggerUserPowerMatch` helper to `database.ts`.
  - [x] Update `TriggerPowerMatchResult` type and validation in `database.ts`.
  - [x] Add "Find Matches Now" button to `PowerMatchesSection.tsx`.
  - [x] Implement button handler to call RPC, show feedback (reflecting auto-apply), and refresh list.

## Employer Power Match & Invitations

- [x] **Database: Schema Setup**
  - [x] Create `employer_power_matches` table
  - [x] Create `candidate_invitations` table
  - [x] Create migrations for new tables
  - [x] Define RLS policies for `employer_power_matches` (Employer can view/update own)
  - [x] Define RLS policies for `candidate_invitations` (Employer can create, Candidate can read/update own)
  - [x] **FIXED:** Update `profiles` RLS to allow employers to view matched candidate profiles
- [x] **Backend: Core Functions**
  - [x] Create types for `EmployerPowerMatch` and `CandidateInvitation`
  - [x] Implement `getEmployerPowerMatches` function (fetches potential candidates for a job)
    - [x] **FIXED:** Correct data mapping logic to handle Supabase join results (object vs array)
    - [x] **FIXED:** Resolve linter errors related to typing
  - [x] Implement `markEmployerPowerMatchViewed` function
  - [x] Implement `sendCandidateInvitation` function (updates power match, creates invitation)
  - [x] Implement `getCandidateInvitations` function (fetches invitations for a job seeker)
  - [x] Implement `respondToCandidateInvitation` function (updates invitation and power match status)
  - [x] Implement `getEmployerInvitationStats` function
- [x] **Backend: Automation/Triggers**
  - [x] Implement `trigger_employer_power_match` SQL function (finds potential matches for a job)
  - [x] Implement `triggerEmployerPowerMatch` wrapper function in `database.ts`
- [x] **Frontend: Employer View (`EmployerPowerMatchesSection.tsx`)**
  - [x] Create component to display potential candidates for a job
  - [x] Integrate `getEmployerPowerMatches` fetch
  - [x] Display candidate info (name, match score, etc.)
    - [x] **FIXED:** Ensure correct candidate name is displayed (not "Anonymous Candidate")
  - [x] Add "View Profile" action (marks as viewed, potentially navigates later)
  - [x] Add "Invite to Apply" action
    - [x] Implement invitation dialog with customizable message
    - [x] Integrate `sendCandidateInvitation` function call
  - [x] Add filtering options (e.g., by match score)
- [ ] **Frontend: Candidate View (Invitation Handling)**
  - [ ] Create UI section/page to display received invitations
  - [ ] Integrate `getCandidateInvitations` fetch
  - [ ] Add actions to accept/decline invitations
  - [ ] Integrate `respondToCandidateInvitation` function call
- [ ] **Notifications**
  - [ ] Implement notification system for new invitations (candidate)
  - [ ] Implement notification system for invitation responses (employer)

## Enhanced Match Score Calculation

- [ ] **Database: Update Schema for Customized Match Criteria**

  - [ ] **Database:** Add `job_match_criteria` table with columns:
    - [ ] `id` (primary key)
    - [ ] `job_id` (foreign key to jobs)
    - [ ] `criteria_type` (enum: 'skills', 'experience', 'location', 'education', 'benefits', etc.)
    - [ ] `weight` (numeric, 0-10 representing importance)
    - [ ] `created_at` (timestamp)
  - [ ] **Database:** Add `benefits` column (TEXT[]) to `jobs` table if not already done.
  - [ ] **Database:** Add `desired_benefits` column (TEXT[]) to `job_seeker_profiles` table.
  - [ ] **Database:** Create migration file for match criteria schema changes.
  - [ ] **Database:** Update RLS policies for new tables.

- [ ] **Backend: Enhanced Match Score Functions**

  - [ ] **Backend:** Create types for `JobMatchCriteria` in `database.ts`.
  - [ ] **Backend:** Implement `getJobMatchCriteria` function.
  - [ ] **Backend:** Implement `updateJobMatchCriteria` function.
  - [ ] **Backend:** Update match score SQL function to use weighted criteria.
  - [ ] **Backend:** Create or update Edge Function for generating power matches to use new scoring system.
  - [ ] **Backend:** Create database view for score breakdown by criteria for transparency.

- [ ] **Frontend: Match Criteria Management UI**
  - [ ] **Frontend:** Add match criteria section to job posting form.
  - [ ] **Frontend:** Create sliders or input fields for criteria weights.
  - [ ] **Frontend:** Add benefits selection to job posting form.
  - [ ] **Frontend:** Add desired benefits selection to job seeker profile form.

## User Dashboards Enhancement

- [ ] **Frontend: Job Seeker Dashboard Enhancement**
  - [ ] **Frontend:** Create a unified dashboard layout with clear sections.
  - [ ] **Frontend:** Add profile completion progress card with suggestions.
  - [ ] **Frontend:** Add application status summary card.
  - [ ] **Frontend:** Create recent activity feed.
  - [ ] **Frontend:** Add skills gap analysis based on desired roles.
  - [ ] **Frontend:** Enhance power matches display with score breakdown.
  - [ ] **Frontend:** Add market insights section (future feature).
- [ ] **Frontend: Employer Dashboard Enhancement**

  - [ ] **Frontend:** Create a unified dashboard layout with clear sections.
  - [ ] **Frontend:** Add job posting metrics (views, applications, etc.).
  - [ ] **Frontend:** Create applicant pipeline summary.
  - [ ] **Frontend:** Add recent activity feed.
  - [ ] **Frontend:** Create power matches overview section.
  - [ ] **Frontend:** Add talent pool insights section (future feature).

- [ ] **Frontend: UI Refinements**
  - [ ] **Frontend:** Audit and reduce redundant information across pages.
  - [ ] **Frontend:** Create consistent card components for different content types.
  - [ ] **Frontend:** Implement collapsible sections for dense information.
  - [ ] **Frontend:** Add tooltips for explaining complex features.
  - [ ] **Frontend:** Enhance navigation with breadcrumbs where appropriate.
  - [ ] **Frontend:** Ensure mobile responsiveness for all dashboard components.

## Unit Tests

- [ ] **Testing: Core Functions**

  - [ ] **Testing:** Set up testing infrastructure (Jest/Vitest)
  - [ ] **Testing:** Create test utilities for mocking Supabase client
  - [ ] **Testing:** Write tests for database helper functions
  - [ ] **Testing:** Write tests for matching algorithm
  - [ ] **Testing:** Write tests for application logic

- [ ] **Testing: UI Components**

  - [ ] **Testing:** Set up React Testing Library
  - [ ] **Testing:** Write tests for form components
  - [ ] **Testing:** Write tests for dashboard components
  - [ ] **Testing:** Write tests for critical user flows
  - [ ] **Testing:** Create test data generators

- [ ] **Testing: Edge Functions**
  - [ ] **Testing:** Create test suite for edge functions
  - [ ] **Testing:** Write tests for power match generation
  - [ ] **Testing:** Write tests for AI summary generation
  - [ ] **Testing:** Write tests for employer power matches

## Testing

- [ ] Write unit tests for components
- [ ] Implement integration tests
- [ ] Test authentication flows
- [ ] Verify database operations
- [ ] User acceptance testing
- [x] **Setup:** Choose and install testing framework (Vitest + Testing Library)
- [x] **Setup:** Configure testing environment (vite.config.ts, setupTests.ts)
- [x] **Setup:** Add test scripts to package.json
- [ ] **Testing: Pro Features**
  - [ ] Write unit tests for pro feature database functions.
  - [ ] Test daily check-in flow and status updates.
  - [ ] Test power match generation, application, and auto-withdrawal.
  - [ ] Verify assessment skills management UI (including add/delete/expiration).
  - [ ] Test pro upgrade flow and feature toggles.
  - [ ] Test manual power match trigger.
