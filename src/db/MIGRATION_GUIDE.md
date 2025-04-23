# Supabase Database Migration Guide

This guide will help you set up the necessary database tables and functions in your Supabase project.

## Migration File Structure

The following migration files are located in the `/src/db/migrations` folder:

1. `01_initial_schema.sql` - Initial database schema
2. `02_seed_initial_data.sql` - Seed data
3. `03_create_sql_functions.sql` - Helper SQL functions for migrations
4. `04_setup_profiles_tables.sql` - Profile-related tables
5. `05_add_location_to_employer_profiles.sql` - Adds missing columns to employer profiles
6. `06_fix_employer_profile_completeness.sql` - Ensures the profile_completeness column exists
7. `07_add_missing_job_seeker_columns.sql` - Adds missing job seeker profile columns

## Option 1: Using SQL Editor (Recommended)

1. **Create the SQL helper functions**:

   - Log in to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `src/db/migrations/03_create_sql_functions.sql`
   - Run the query

2. **Run the migrations in order**:
   - Copy and paste the contents of each migration file in order to the SQL Editor
   - Run the queries sequentially:
     1. `01_initial_schema.sql`
     2. `02_seed_initial_data.sql`
     3. `04_setup_profiles_tables.sql`
     4. `05_add_location_to_employer_profiles.sql` (if needed)
     5. `06_fix_employer_profile_completeness.sql` (important fix)
     6. `07_add_missing_job_seeker_columns.sql` (adds columns referenced in database.ts)

## Option 2: Using NodeJS Script

This approach requires the SQL execution function to be created first in the SQL Editor.

1. **Set up your environment variables**:

   - Create a `.env.local` file in the project root (if it doesn't exist already)
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

2. **Run the migration script**:
   ```bash
   npm run db:migrate:direct
   ```

## Verifying the Migration

After running the migration, you should see the following tables in your Supabase database:

- Base tables from initial schema
- `profiles`
- `job_seeker_profiles` with all required columns including `desired_role`, `open_to`, and `salary_expectation`
- `employer_profiles` with all required columns including `profile_completeness`

You can verify this by going to the Table Editor in your Supabase dashboard.

## Troubleshooting

- **Error: "Could not find the function public.exec_sql(sql_statement)"**

  - Make sure you've run the `03_create_sql_functions.sql` in the SQL Editor first.

- **Error: "Could not find the 'profile_completeness' column of 'employer_profiles' in the schema cache"**

  - Make sure to run the `06_fix_employer_profile_completeness.sql` migration to add this column.

- **Error: "Could not find columns 'desired_role', 'open_to', etc. in job_seeker_profiles"**

  - Make sure to run the `07_add_missing_job_seeker_columns.sql` migration to add these columns.

- **Permission errors**

  - Ensure you're using the Service Role key in your .env.local file
  - Check that you have permission to create tables and functions

- **SQL Syntax errors**
  - If a specific statement fails, you can run portions of the migration manually in the SQL Editor

## Important Note

We previously had migrations in both `/migrations` and `/src/db/migrations` folders. We have consolidated everything into `/src/db/migrations` to avoid confusion. The `/migrations` folder is now deprecated and should not be used.
