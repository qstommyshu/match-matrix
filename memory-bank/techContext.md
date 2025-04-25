# Technical Context - Match Matrix

## Tech Stack Details

### Frontend

- React for component-based UI
- TypeScript for type safety
- Tailwind CSS for utility-first styling
- Shadcn/UI for component patterns
- React Hook Form for form handling
- Zod for form validation
- React Router DOM for client-side routing

### Backend

- Supabase for:
  - Authentication
  - Database (PostgreSQL)
  - Storage
  - Realtime subscriptions
  - Serverless functions

### Development Tools

- ESLint for code linting
- Vite for fast development
- TypeScript for type checking

## Database Schema (Implemented)

### Profiles Table

- id (UUID, primary key)
- email (TEXT)
- full_name (TEXT)
- type (user_type ENUM: 'job_seeker' or 'employer')
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

### Job Seeker Profiles Table

- id (UUID, foreign key to profiles)
- headline (TEXT)
- bio (TEXT)
- location (TEXT)
- years_of_experience (INTEGER)
- education (TEXT)
- resume_url (TEXT)
- desired_role (TEXT)
- open_to (TEXT)
- salary_expectation (TEXT)
- profile_completeness (NUMERIC)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

### Employer Profiles Table

- id (UUID, foreign key to profiles)
- company_name (TEXT)
- industry (TEXT)
- company_size (TEXT)
- website (TEXT)
- logo_url (TEXT)
- company_description (TEXT)
- location (TEXT)
- benefits (TEXT[])
- profile_completeness (NUMERIC)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

### Skills Table

- id (UUID, primary key)
- name (TEXT, unique)
- category (TEXT)
- created_at (TIMESTAMPTZ)

### UserSkills Table

- id (UUID, primary key)
- user_id (UUID, foreign key to profiles)
- skill_id (UUID, foreign key to skills)
- proficiency_level (INTEGER, 1-5)
- created_at (TIMESTAMPTZ)
- UNIQUE constraint on (user_id, skill_id)

## Database RLS Patterns

- **General Principle:** Start restrictive, open up as needed.
- **Own Data:** Users can generally view, create, update, delete their _own_ entries in tables directly linked via `user_id` or `id` (e.g., `profiles`, `job_seeker_profiles`, `employer_profiles` for the owner, `user_skills`, `experiences`).
- **Public Read Access:** For data needed across different user types (e.g., viewing job details, viewing basic employer info on job cards), RLS policies allowing reads for any `authenticated` user are necessary.
  - **`employer_profiles`:** Authenticated users can read any employer profile (needed for job listings).
  - **`profiles`:** Authenticated users can read any base profile (needed for fetching nested employer profile data in job listings).
  - **`jobs`:** (Implicitly) Authenticated users can read job details (ensure RLS is set correctly if added).
- **Specific Role Access:** (Not extensively used yet) Could be used if, e.g., only employers could read certain aggregated data.
- **Implementation:** RLS policies are defined in SQL migrations (`src/db/migrations`).

## Database Schema (Planned)

### Jobs Table

- id (primary key)
- employer_id (foreign key to profiles)
- title
- description
- location
- remote (boolean)
- job_type
- salary_min
- salary_max
- experience_level
- status
- created_at
- updated_at

### Applications Table

- id (primary key)
- job_id (foreign key)
- user_id (foreign key)
- cover_letter
- status
- created_at
- updated_at

### JobSkills Table

- id (primary key)
- job_id (foreign key)
- skill_id (foreign key)
- importance_level (INTEGER, 1-5)
- created_at
- UNIQUE constraint on (job_id, skill_id)

## Integrations & External Services (Planned)

- **OpenAI API (for AI Summarization):**
  - **Purpose:** Generate concise summaries of applicant profiles.
  - **Implementation:** Called via a Supabase Edge Function (`summarize-applicant`).
  - **Authentication:** Requires an API key stored securely as a Supabase environment variable.
  - **Trigger:** Button click in `ViewApplicantsPage.tsx`.
  - **Data Handling:** Function fetches applicant data, sends to OpenAI, optionally stores result in `applications.ai_summary`.

## Implemented Features

### Authentication & Routing

- Login, Register pages
- `AuthContext` and `ProfileContext` for state management
- `ProtectedRoute` component
- Main router setup in `App.tsx`

### Skills Management

- Implemented in `src/components/profile/UpdateSkillsModal.tsx`
- Used Dialog component from shadcn/ui for modal
- Real-time skills fetching from Supabase
- Allows adding and removing skills
- Uses checkboxes for selection
- Real-time display in candidate profile (`CandidateProfile.tsx`)
- Error handling and loading states

### Dashboards

- `DashboardPage.tsx` created to route based on user type
- `JobSeekerDashboardPage.tsx` created with basic layout/placeholders
- `EmployerDashboardPage.tsx` created with basic layout/placeholders
- `/dashboard` route added and protected
