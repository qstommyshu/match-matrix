# System Patterns - Match Matrix

## Architecture

- Next.js pages for routing
- React components for UI
- Supabase for backend services
- TypeScript for type safety
- Tailwind CSS for styling

## Component Structure

- UI components in src/components/ui/
- Feature-specific components in src/components/[feature-name]/
- Page components in src/pages/
- Hooks in src/hooks/
- Utility functions in src/lib/

## State Management

- React hooks for component-level state
- React Context for shared state
- Supabase for data persistence

## Authentication Flow

- Supabase Authentication for user management
- Protected routes for authenticated users
- Role-based access control for different user types

## Data Flow

- API calls to Supabase for data operations
- Client-side caching for performance
- Optimistic UI updates for better user experience

## Code Conventions

- Functional React components only
- TypeScript for all code
- PascalCase for component files
- camelCase for variables and functions
- Organized imports alphabetically
- Destructured props
- Tailwind CSS for styling with cn utility
