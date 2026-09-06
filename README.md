# Zyence — Fine Fragrance Store

Zyence is a fragrance-focused e-commerce storefront and admin app built with React, TanStack Start, Tailwind CSS, and MongoDB. The project is centered on a premium perfume brand experience with catalog browsing, product discovery, cash-on-delivery checkout, and admin management workflows.

## Overview

This app includes:

- Customer storefront for browsing fragrance collections and product detail pages
- Category-based shopping experience with responsive product layouts
- Cart, wishlist, and checkout flows designed for COD-style ordering
- Account and login flows with demo credentials for local testing
- Admin dashboard for catalog, inventory, orders, and customer management
- Zyence-specific branding, metadata, and product data seeding

## Live demo

- Production: https://e-comerce-store-two.vercel.app/
- Repository: https://github.com/abdulbasit-25/E-Comerce-Store

## Tech stack

- React 19
- TanStack Start / TanStack Router
- TypeScript
- Tailwind CSS
- Zustand for client state
- MongoDB + mongodb driver
- JWT + bcryptjs for auth
- Vitest for tests
- Vite for local development and builds

## Key features

### Storefront

- Fragrance collections and curated product landing pages
- Product detail and category browsing
- Cart persistence and quantity updates
- Checkout flow built around cash on delivery
- Account area for customer access and order tracking
- Theme variants and branding-focused storefront polish

### Admin

- Product and category management
- Inventory and order workflows
- Customer and review management
- Internal admin access for Zyence Studio operations

### Authentication

- Email normalization and password hashing
- JWT token generation and validation
- MongoDB-backed user lookup with local demo fallback credentials
- Role-based admin/customer access patterns

## Demo accounts

The project includes demo login accounts for local testing:

- Admin: admin@zyence.local / Admin@12345
- Customer: customer@zyence.local / Customer@12345

## Getting started

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance or connection URI for database-backed features

### Install dependencies

```bash
npm install
```

### Run the app in development mode

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Environment variables

Create a local environment file with your MongoDB connection string:

```bash
MONGODB_URI=mongodb://localhost:27017/zyence
```

The app is configured to use the Zyence database name by default in MongoDB, and it includes local demo fallback behavior for development workflows.

## Available scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run format
npm run seed:users
npm run seed:products
npm run test
npm run test:watch
```

### Zyence-specific seed scripts

The app includes a fragrance seed loader for the Zyence catalog:

```bash
npx tsx scripts/seed-zyence-products.ts
```

This creates the Zyence categories and sample fragrance products used by the storefront.

## Project structure

```text
src/
  components/
  lib/
  routes/
  assets/
  styles/
scripts/
  seed-users.ts
  seed-products.ts
  seed-zyence-products.ts
Docs/
```

## Notes

- The storefront and admin experience are branded around Zyence throughout.
- The checkout flow remains cash-on-delivery based and is not a third-party payment gateway implementation.
- For a fully populated local catalog, seed the demo users and Zyence product data after setting your MongoDB URI.

## Status

This project is actively being developed as a fragrance commerce storefront with a functional admin layer and Mongo-backed persistence.
