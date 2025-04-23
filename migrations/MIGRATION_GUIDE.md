# Supabase Database Migration Guide

This guide will help you set up the necessary database tables and functions in your Supabase project.

## Prerequisites

- A Supabase project with admin access
- Your Supabase URL and API keys

## Option 1: Using SQL Editor (Recommended)

1. **Create the SQL execution function**:

   - Log in to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `migrations/create_pgmigrate_function.sql`
   - Run the query
   - Alternatively, you can use `migrations/create_exec_sql_function.sql` for a simpler approach

2. **Run the tables migration script**:
   - Copy and paste the contents of `migrations/setup_profiles_tables.sql` to the SQL Editor
   - Run the query

## Option 2: Using NodeJS Scripts

**Note:** This approach requires the SQL execution function to be created first in the SQL Editor.

1. **Set up your environment variables**:

   - Create a `.env.local` file in the project root (if it doesn't exist already)
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     ```

2. **Choose one of the migration methods**:

   - **Using pgmigrate function**:

     ```bash
     npm run db:migrate
     ```

   - **Using exec_sql function**:
     ```bash
     npm run db:migrate:direct
     ```

## Verifying the Migration

After running the migration, you should see three new tables in your Supabase database:

- `profiles`
- `job_seeker_profiles`
- `employer_profiles`

You can verify this by going to the Table Editor in your Supabase dashboard.

## Troubleshooting

- **Error: "Could not find the function public.pgmigrate(query)"**

  - Make sure you've run the `create_pgmigrate_function.sql` in the SQL Editor first.

- **Error: "Could not find the function public.exec_sql(sql_statement)"**

  - Make sure you've run the `create_exec_sql_function.sql` in the SQL Editor first.

- **General errors**
  - Check that you're using the service role key in your .env.local file
  - Ensure you have permissions to create tables and functions in your Supabase project
