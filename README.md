# Match Matrix

A job matching platform connecting job seekers with employers.

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### Database Setup

1. Run the pgmigrate function creation script in the Supabase SQL Editor:

   - Copy the contents of `migrations/create_pgmigrate_function.sql`
   - Paste and run it in the Supabase SQL Editor

2. Run the database migrations:
   ```bash
   npm run db:migrate
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to: `http://localhost:5173`

## Features

- User authentication with Supabase
- Profile setup for job seekers and employers
- Job posting and application management
- Skill-based matching

## Project Structure

- `/src`: Source code
  - `/components`: UI components
  - `/lib`: Utilities and API connections
  - `/pages`: Page components
- `/migrations`: Database migration scripts

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Framework**: Next.js
- **Styling**: Tailwind CSS with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd match-matrix
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following content:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Supabase Setup

1. Create a new project in Supabase
2. Get your project URL and anon key from the Settings > API section
3. Add these to your `.env.local` file
4. Run the migrations:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `src/db/migrations/01_initial_schema.sql` and run it
   - Copy the contents of `src/db/migrations/02_seed_initial_data.sql` and run it

## Project Structure

```
match-matrix/
├── memory-bank/       # Project documentation and planning
├── public/            # Static assets
├── src/
│   ├── components/    # UI components
│   │   ├── auth/      # Authentication components
│   │   └── ui/        # Reusable UI components
│   ├── db/            # Database migrations and utilities
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and services
│   └── pages/         # Page components
└── .env.local         # Environment variables (not committed)
```

## Database Schema

The database includes the following tables:

- `profiles`: Basic user information
- `job_seeker_profiles`: Extended profile for job seekers
- `employer_profiles`: Extended profile for employers
- `skills`: Available skills
- `user_skills`: Skills associated with users
- `jobs`: Job listings
- `job_skills`: Skills required for jobs
- `applications`: Job applications

## Project info

**URL**: https://lovable.dev/projects/d3e4653f-a1a3-4c93-b713-222f7a88efc5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d3e4653f-a1a3-4c93-b713-222f7a88efc5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d3e4653f-a1a3-4c93-b713-222f7a88efc5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
