# Match Matrix - Implementation Plan

## Overview

This document outlines the implementation plan for the following new features:

1. Employer Power Match functionality
2. Enhanced Match Score Calculation
3. UI Dashboard Enhancements
4. Unit Tests Implementation

## 1. Employer Power Match

### Background & Rationale

Currently, the platform offers "Power Matches" only for job seekers, where job seekers who are Pro users receive AI-powered job recommendations. This feature will extend similar functionality to employers, allowing them to discover qualified candidates that match their job requirements without waiting for applications.

### Technical Approach

#### Workflow Design (Invitation-First Approach)

Unlike the job seeker power matches which can automatically apply to jobs, the employer power match system will follow an invitation-first approach:

1. The system identifies potential candidate matches for each job posting
2. Employers review these candidate matches (with relevant skills highlighted)
3. Employers send invitations to candidates they're interested in
4. Candidates receive notifications about invitations
5. Candidates can review job details and employer information
6. Candidates respond to invitations (accept or decline)
7. When accepted, a formal connection is established (similar to an application)

This approach ensures candidate privacy and gives them control over which employers can engage with them, while still providing employers with an active recruiting tool.

#### Database Structure

The implementation includes two main tables:

```sql
-- Table for identifying matches (internal to the system)
CREATE TABLE employer_power_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES profiles(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  match_score NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  sent_invitation_at TIMESTAMPTZ,
  invitation_status TEXT,
  invitation_response_at TIMESTAMPTZ,
  UNIQUE(job_id, user_id)
);

-- Table for candidate-facing invitations
CREATE TABLE candidate_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID REFERENCES profiles(id) NOT NULL,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  employer_power_match_id UUID REFERENCES employer_power_matches(id),
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMPTZ,
  UNIQUE(employer_power_match_id)
);

-- Notification system for real-time updates
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

Row Level Security policies will ensure employers can only access their own matches and candidates can only see invitations sent to them.

#### Backend Implementation

1. Match Generation:

   - Edge Function `generate-employer-power-matches` will run on a scheduled basis
   - For each active job posting, it will calculate match scores for potential candidates
   - It will create employer_power_match entries, which are initially only visible to employers

2. Invitation System:

   - `sendCandidateInvitation`: Creates an invitation and links it to a power match
   - `getCandidateInvitations`: Allows candidates to view invitations they've received
   - `respondToCandidateInvitation`: Handles candidate acceptance or rejection
   - Database trigger will create a notification when an invitation is sent

3. Notification System:

   - `createNotification`: Generates notification records
   - `getUserNotifications`: Fetches pending notifications for a user
   - `markNotificationRead`: Updates read status
   - Real-time subscription capabilities for instant updates

4. Tracking and Stats:
   - `getEmployerInvitationStats`: Provides metrics on invitation performance

#### Frontend Implementation

1. Employer Experience:

   - `EmployerPowerMatchesSection`: Dashboard component showing potential candidates
   - `CandidateCard`: Displays candidate information with skills alignment
   - `SendInvitationModal`: Interface for sending custom invitations
   - `InvitationTrackingSection`: Shows sent invitations and their status
   - Filtering tools for reviewing candidates by match score, skills, etc.

2. Candidate Experience:
   - `NotificationsDropdown`: Header component showing unread notifications
   - `CandidateInvitationsPage`: Dedicated page for reviewing received invitations
   - `InvitationCard`: Displays job and employer details with accept/decline actions
   - Badge/counter in the header when new invitations are received
   - `InvitationsSummaryCard`: Dashboard component showing recent invitations with quick actions
   - Dashboard integration with invitation metrics and status indicators
   - Invitation comparison tools to evaluate against current applications and job preferences
   - Sorting and filtering capabilities on the invitations page (by date, match score, etc.)
   - Visual status indicators (new, viewed, accepted, declined) with consistent color coding
   - Confirmation dialogs for key actions with optional feedback collection
   - Real-time updates when new invitations are received while using the application

#### Job Seeker Dashboard Integration

The job seeker dashboard will be enhanced to prominently feature employer invitations:

1. **Invitations Summary Section:**

   - Displays the 3-5 most recent invitations with key details
   - Shows company logo/name, job title, match score, and invitation date
   - Provides quick accept/decline actions directly from the dashboard
   - Includes a "View All" link to the dedicated invitations page

2. **Invitation Notifications:**

   - Real-time alerts when new invitations are received
   - Visual indicators to distinguish between regular notifications and employer invitations
   - Status badges showing counts of unread/pending invitations

3. **Invitation Management Flow:**

   ```
   Dashboard Summary → Invitations Page → Invitation Details → Response Action → Confirmation
   ```

4. **Integration with Existing Features:**
   - Match score display consistent with other match-based components
   - Skill alignment indicators similar to job recommendations
   - Status tracking integrated with application pipeline (if accepted)

This approach creates a seamless experience for job seekers to receive, evaluate, and respond to employer invitations as part of their normal dashboard workflow.

### Considerations

- Privacy: Candidates remain anonymous until they accept an invitation
- User Experience: Make the invitation flow intuitive for both parties
- Notification Balance: Ensure candidates aren't overwhelmed with invitations
- Analytics: Provide employers with insights on invitation effectiveness
- Performance: Consider database load with large numbers of potential matches

### Difference from Job Seeker Power Matches

| Aspect      | Job Seeker Power Matches                | Employer Power Matches                               |
| ----------- | --------------------------------------- | ---------------------------------------------------- |
| Initiation  | System-generated for Pro users          | System-generated for employers                       |
| Visibility  | Immediately visible to job seekers      | Visible only to employers until invitation sent      |
| Application | Can auto-apply to matched jobs          | Requires candidate acceptance before connection      |
| Control     | Job seekers can opt-out                 | Candidates must opt-in via acceptance                |
| Timing      | Auto-applications if not viewed in time | No automatic actions, always requires explicit steps |

This approach balances the needs of employers to proactively find talent while respecting candidate privacy and control over their job search process.

## 2. Enhanced Match Score Calculation

### Background & Rationale

The current matching algorithm is basic and doesn't allow for customization of criteria importance. Enhancing the match score calculation will:

- Allow employers to prioritize certain criteria over others
- Include additional factors like benefits matching
- Provide more accurate and relevant matches for both parties

### Technical Approach

#### Database Updates

1. New `job_match_criteria` table:

   ```sql
   CREATE TYPE criteria_type AS ENUM ('skills', 'experience', 'location', 'education', 'benefits', 'salary');

   CREATE TABLE job_match_criteria (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     job_id UUID REFERENCES jobs(id) NOT NULL,
     criteria_type criteria_type NOT NULL,
     weight INTEGER NOT NULL CHECK (weight BETWEEN 0 AND 10),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(job_id, criteria_type)
   );
   ```

2. Additional columns for benefits:
   - `benefits` column (TEXT[]) to `jobs` table
   - `desired_benefits` column (TEXT[]) to `job_seeker_profiles` table

#### Score Calculation Algorithm

The updated scoring function will:

1. Calculate individual scores for each criteria type:

   - Skills match score (existing)
   - Experience level match
   - Location match (remote preference, physical location)
   - Education match
   - Benefits match
   - Salary expectations match

2. Apply weights from `job_match_criteria` table:

   ```
   final_score = (skills_score * skills_weight + experience_score * experience_weight + ...) / sum_of_weights
   ```

3. Create a view that breaks down score components for transparency

#### Frontend Implementation

1. Job Posting Form Enhancement:

   - Add match criteria section with sliders or weight inputs
   - Add benefits selection interface with common options
   - Provide explanations of how weights affect matching

2. Job Seeker Profile Form Enhancement:
   - Add desired benefits selection
   - Improve desired role and expectations sections

### Considerations

- Default Weights: Provide sensible defaults when criteria aren't specified
- Performance: Optimize the calculation for large datasets
- Transparency: Show match score breakdowns to both employers and job seekers

## 3. User Dashboard Enhancements

### Background & Rationale

Current dashboards provide basic functionality but lack comprehensive insights and have some redundant information. Enhanced dashboards will:

- Provide better at-a-glance information
- Reduce cognitive load by organizing information more effectively
- Add valuable insights not currently available

### Technical Approach

#### Job Seeker Dashboard

1. Unified Layout Structure:

   - Header with profile completion and account status
   - Main content area with cards for different information categories
   - Sidebar with quick actions and stats

2. Key Components:
   - Profile completion card with specific improvement suggestions
   - Application status summary showing current applications by stage
   - Skills gap analysis comparing user skills to desired role requirements
   - Enhanced power matches display with match breakdown
   - Recent activity feed

#### Employer Dashboard

1. Unified Layout Structure:

   - Header with company profile completion
   - Main content with job posting analytics and applicant pipeline
   - Sidebar with quick actions

2. Key Components:
   - Job posting metrics card (views, applications, conversion rate)
   - Applicant pipeline visualization by stage
   - Power matches overview showing potential candidates
   - Recent activity feed
   - Talent insights showing application trends

#### UI Refinements

1. Component Consistency:

   - Create reusable card components with consistent styling
   - Implement collapsible sections for information density management
   - Add tooltips for explaining complex metrics or features

2. Information Hierarchy:
   - Prioritize most important/actionable information
   - Group related information
   - Use progressive disclosure for detailed information

### Considerations

- Mobile Responsiveness: Ensure all dashboard enhancements work well on mobile
- Performance: Optimize data fetching to maintain good dashboard load times
- Personalization: Consider allowing users to customize their dashboard layout

## 4. Unit Tests Implementation

### Background & Rationale

The codebase currently lacks comprehensive test coverage. Adding unit tests will:

- Ensure reliability of core functionality
- Prevent regressions when adding new features
- Provide documentation of expected behavior
- Facilitate future refactoring

### Technical Approach

#### Testing Infrastructure

1. Setup:

   - Configure Vitest and React Testing Library
   - Create test utilities for mocking Supabase client
   - Set up test data generators

2. Core Function Tests:

   - Database helper function tests
   - Match algorithm tests
   - Application logic tests
   - Edge function tests

3. UI Component Tests:
   - Form component tests (validation, submission)
   - Dashboard component tests (rendering, interactivity)
   - End-to-end tests for critical user flows

#### Test Coverage Priorities

Focus on testing:

1. Matching algorithm (highest priority - business critical)
2. Application management flow
3. Power match generation
4. Authentication and authorization
5. Core UI components

### Considerations

- Test Environment: Configure separate test database
- Mocks vs. Integration: Balance between unit tests with mocks and integration tests
- CI Integration: Set up tests to run in CI pipeline

## Implementation Phases

### Phase 1: Enhanced Match Score (2 weeks)

- Update database schema
- Implement new scoring algorithm
- Add UI for criteria customization

### Phase 2: Employer Power Match (2 weeks)

- Create database tables and functions
- Implement backend logic for match generation
- Develop employer-facing UI components

### Phase 3: Dashboard Enhancements (3 weeks)

- Redesign dashboard layouts
- Implement new components
- Optimize information display

### Phase 4: Unit Testing (Ongoing)

- Set up testing infrastructure
- Write tests for new features as they're developed
- Backfill tests for existing core functionality

## Dependencies and Considerations

- The Enhanced Match Score feature should be implemented before Employer Power Match as the latter depends on the improved algorithm
- Dashboard enhancements can proceed in parallel with other features
- Testing should begin early and continue throughout development
- Consider the impact on database performance with new tables and calculations
