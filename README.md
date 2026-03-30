# Gorivo — Fuel Tracker

A personal fuel tracking web app built for Slovenian drivers. Track your fill-ups, monitor fuel consumption, and stay up to date with national fuel prices.

## Features

- **Fill-up tracking** — log fuel fill-ups with liters, cost, odometer reading and fuel type
- **Multiple vehicles** — manage multiple cars, including bi-fuel (petrol + LPG) vehicles
- **Avg. consumption** — automatic L/100km calculation per vehicle and fuel type
- **Fuel price dashboard** — live national average prices for local and motorway stations in Slovenia
- **Fuel price history** — chart showing how prices have changed over time
- **Statistics** — monthly spending, cost per fill-up, and distance driven charts
- **Dark / light mode** — theme toggle with persistent preference
- **PWA** — installable on mobile as a native-like app

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Database** — PostgreSQL + Prisma ORM
- **Auth** — NextAuth v5 (Google OAuth)
- **Styling** — Tailwind CSS v4
- **Charts** — Recharts
- **Deployment** — VPS with PM2
