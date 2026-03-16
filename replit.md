# OWAAR CLOUD Workspace

## Overview

pnpm workspace monorepo using TypeScript. OWAAR CLOUD is a multi-language (Arabic/English) SaaS Marketplace platform enabling one-click deployment of applications via Coolify API.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, Zustand, Lucide React)
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Custom JWT (HMAC-SHA256, no external deps)

## Project Features

- **Multi-Language (AR/EN)**: Full RTL/LTR support with language switcher in header
- **Landing Page** `/` — Hero section, feature showcase, service cards
- **Auth** `/login`, `/register` — JWT-based, first registered user becomes admin
- **User Dashboard** `/dashboard` — Services grid, one-click deploy, deployment status tracking
- **Admin Panel** `/admin` — Branding settings, service CRUD, user list, system update trigger
- **Dark Mode**: Professional dark UI with Sapphire Blue (#0055ff) accents

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, settings, services, deployments, admin)
│   └── owaar-cloud/        # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── src/schema/
│           ├── users.ts
│           ├── settings.ts
│           ├── services.ts
│           └── deployments.ts
```

## Database Schema

- **users**: id, email, password (hashed), name, role (user|admin), createdAt
- **settings**: key (PK), value_ar, value_en — for site branding
- **services**: id, name_ar, name_en, desc_ar, desc_en, icon, template_id, provider (coolify|cloudron), createdAt
- **deployments**: id, user_id, service_id, status (deploying|running|stopped|failed), domain_url, createdAt, updatedAt

## API Routes

- `POST /api/auth/login` — Login with email/password, returns JWT
- `POST /api/auth/register` — Register (first user → admin role)
- `GET /api/auth/me` — Get current user (auth required)
- `GET /api/settings` — Get all settings (public)
- `PUT /api/settings/:key` — Update a setting (admin only)
- `GET /api/services` — List all deployable services (public)
- `POST /api/services` — Create service (admin)
- `PUT /api/services/:id` — Update service (admin)
- `DELETE /api/services/:id` — Delete service (admin)
- `GET /api/deployments` — List deployments (user sees own, admin sees all)
- `POST /api/deployments` — One-click deploy a service
- `DELETE /api/deployments/:id` — Stop/delete deployment
- `GET /api/admin/users` — List all users (admin)
- `POST /api/admin/update` — Trigger git pull self-update (admin)

## Seeded Data

- Settings: site_name (AR+EN), site_tagline, site_logo
- Services: WordPress, Nextcloud, Email Server, Matomo, Gitea, Uptime Kuma

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
