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
- **Language**: TypeScript

## Development Commands

```bash
cd webapp
pnpm install
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test             # Run tests
```

## Key Entities

### Trip
- Destination, dates, purpose
- Associated shopping list
- Flight/hotel/car details
- Status (planning, upcoming, active, completed)

### ShoppingItem
- Name, description, category
- Estimated price, actual price
- Where to buy (store/URL)
- Weight/size estimate
- Recurring flag (buy every trip)
- Status (want, purchased, packed)

### Store
- Name (Amazon, Costco, Target, etc.)
- Location or URL
- Notes

## Database Schema

Key tables:
- `trips` - Trip details and dates
- `shopping_items` - Items to buy
- `trip_items` - Junction table linking items to trips
- `stores` - Where to buy things

## User Flows

1. **Add item to wishlist** - Quick add of something to buy "next trip"
2. **Plan a trip** - Create trip, attach items, estimate luggage
3. **During trip** - Mark items as purchased, track spending
4. **Post-trip** - Review what was bought, update recurring items

## Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
