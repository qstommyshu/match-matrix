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
- [ ] **Frontend Integration:** Integrate the feature into `ViewApplicantsPage.tsx` (awaiting implementation).
  - [ ] Add state management for summaries (per applicant: loading, error, data).
  - [ ] Add UI element to display summary/loading/error.
  - [ ] Add "Summarize" button to applicant actions.
  - [ ] Implement button `onClick` handler to call Edge Function.
  - [ ] Handle function response and update UI state.
  - [ ] Implement logic to display existing stored summaries.
- [x] **Configuration:** Set up OpenAI API key in local environment.
  - [ ] Set up OpenAI API key in Supabase environment variables (when deploying Edge Function).
- [ ] **Testing:** Test the end-to-end flow, error handling, and UI updates.

## Testing

- [ ] Write unit tests for components
- [ ] Implement integration tests
- [ ] Test authentication flows
- [ ] Verify database operations
- [ ] User acceptance testing
