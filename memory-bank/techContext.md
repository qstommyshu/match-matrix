# Technical Context - Match Matrix

## Tech Stack Details

### Frontend

- Next.js for server-side rendering and routing
- React for component-based UI
- TypeScript for type safety
- Tailwind CSS for utility-first styling
- Shadcn/UI for component patterns
- React Hook Form for form handling
- Zod for form validation

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

## Database Schema (Planned)

### Users Table

- id (primary key)
- email
- name
- user_type (job_seeker or employer)
- created_at

### Profiles Table

- id (primary key)
- user_id (foreign key)
- bio
- location
- profile_type (job_seeker or employer)
- additional fields based on profile type

### Jobs Table

- id (primary key)
- employer_id (foreign key to users)
- title
- description
- location
- salary_range
- requirements
- created_at
- status

### Applications Table

- id (primary key)
- job_id (foreign key)
- user_id (foreign key)
- status
- created_at
- updated_at

### Skills Table

- id (primary key)
- name
- category

### UserSkills Table

- id (primary key)
- user_id (foreign key)
- skill_id (foreign key)
- proficiency_level

### JobSkills Table

- id (primary key)
- job_id (foreign key)
- skill_id (foreign key)
- importance_level
