# TaskFlow — Modern Todo Management System

A production-ready full-stack task management application with Kanban boards, calendar views, analytics dashboard, and scheduled notifications.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Zustand, TanStack Query, Framer Motion, dnd-kit |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Redis, BullMQ |
| Infrastructure | Docker, Docker Compose |

## Features

- **Authentication** — Register, login, logout, JWT refresh tokens, role-based access (Admin/User)
- **Task Management** — CRUD, duplicate, archive, complete, search, filter, sort
- **Kanban Board** — Drag & drop between columns with database persistence
- **Dashboard** — Stats, completion rate, charts (bar + pie), upcoming tasks
- **Calendar** — Month, week, and day views
- **Notifications** — In-app notifications via BullMQ scheduled jobs (reminders, due soon, overdue)
- **Dark Mode** — System/light/dark theme with persistence

## Deployment (Render + Vercel)

See **[DEPLOY.md](./DEPLOY.md)** for the full guide.

- **Render (recommended):** `Dockerfile.render` — one Docker image (PostgreSQL + Redis + API + Worker). Only set `CORS_ORIGIN` to your Vercel URL.
- **Vercel:** root directory `frontend`, `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api/v1`.
- **Optional:** `render.blueprint.yaml` for managed DB/Redis (Worker plan is paid).

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended)

### 1. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

In a separate terminal, start the notification worker:

```bash
cd backend
npm run worker
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Demo User | demo@todo.app | Password123! |
| Admin | admin@todo.app | Password123! |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/tasks` | List tasks |
| GET | `/api/v1/tasks/kanban` | Kanban board |
| POST | `/api/v1/tasks` | Create task |
| PATCH | `/api/v1/tasks/reorder` | Reorder tasks |
| PATCH | `/api/v1/tasks/:id` | Update task |
| POST | `/api/v1/tasks/:id/complete` | Mark complete |
| POST | `/api/v1/tasks/:id/duplicate` | Duplicate |
| POST | `/api/v1/tasks/:id/archive` | Archive |
| GET | `/api/v1/notifications` | List notifications |
| GET | `/api/v1/dashboard/stats` | Dashboard stats |

## Project Structure

```
├── backend/
│   ├── prisma/          # Schema & seed
│   └── src/
│       ├── config/      # Env, DB, Redis
│       ├── middleware/  # Auth, validation, errors
│       ├── modules/     # Feature modules (auth, tasks, etc.)
│       ├── services/    # BullMQ queue
│       └── workers/     # Background jobs
├── frontend/
│   └── src/
│       ├── app/         # Next.js pages
│       ├── components/  # UI & layout
│       ├── features/    # Feature components
│       ├── services/    # API layer
│       ├── store/       # Zustand stores
│       └── validators/  # Zod schemas
└── docker-compose.yml
```

## Docker (Full Stack)

```bash
docker compose up --build
```

## Architecture

The backend follows **clean architecture** with the repository-service-controller pattern:

```
Request → Route → Controller → Service → Repository → Prisma → PostgreSQL
```

Security: Helmet, CORS, rate limiting, bcrypt password hashing, JWT access + refresh tokens.

Notifications use **BullMQ** with Redis for scheduled reminder, due-soon, and overdue jobs.

## License

MIT
