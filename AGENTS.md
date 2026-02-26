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

## Database

Use the supabase CLI to run migrations.
SUPABASE_DB_PASSWORD is in the .env

Connect to the application for RLS-enabled queries using the following:

PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sb_publishable_ML8nknFZvpn3eB08yyLLjg_ENOjarGV"
PUBLIC_SUPABASE_URL="https://iqunclrwzxulzyuzgcgl.supabase.co"

