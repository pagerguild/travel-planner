# Travel Planner

A personal travel planning app for expats who regularly travel between countries and need to coordinate logistics, shopping lists, and trip details.

## The Problem

When you live abroad (e.g., Costa Rica) and travel back to your home country (e.g., USA) regularly, every trip becomes a logistics exercise:

- **Shopping list management** - Things you can't get locally, or that cost 3x as much
- **Trip timing** - Coordinating flights, accommodations, appointments
- **Weight/space planning** - What fits in your luggage? What needs to ship?
- **Price tracking** - Is it worth buying X in the US vs locally?
- **Recurring items** - Stuff you buy every trip (vitamins, electronics, clothes)

## Core Features

### Shopping Lists
- Maintain a running list of "things to buy next trip"
- Categorize by store (Amazon, Costco, specific stores)
- Track prices and where to buy
- Mark items as "every trip" vs "one-time"
- Estimate weight/size for luggage planning

### Trip Planning
- Create trips with dates and destinations
- Attach shopping lists to specific trips
- Track flights, hotels, car rentals
- Appointment scheduling (doctor visits, etc.)

### Logistics
- Luggage weight calculator
- "Ship vs carry" decision helper
- Customs/duty considerations

## Tech Stack

- **Frontend**: SvelteKit
- **Backend**: Supabase (Auth, Database, Storage)
- **Styling**: Tailwind CSS

## Development

```bash
cd webapp
pnpm install
pnpm dev
```
