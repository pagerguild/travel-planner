# Travel Planner - Agent Instructions

## Project Overview

Travel Planner is a SvelteKit + Supabase web application for expats who regularly travel between countries. The primary use case is managing shopping lists and logistics for trips from Costa Rica to the USA.

## Repository Structure

```
travel-planner/
├── webapp/              # SvelteKit application
│   ├── src/
│   │   ├── routes/      # SvelteKit routes
│   │   ├── lib/         # Shared components and utilities
│   │   └── hooks/       # SvelteKit hooks
│   └── supabase/        # Supabase migrations and config
└── docs/                # Documentation
```

## Technology Stack

- **Framework**: SvelteKit
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS
- Runtime: Bun

## Testing

1. Make sure migrations have been run; run them if needed.
2. Use tests where needed against the database.

## Database

Use the supabase CLI to run migrations.
SUPABASE_DB_PASSWORD is in the .env, along with
PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY and PUBLIC_SUPABASE_URL

RLS is enabled on all tables and must be used.

