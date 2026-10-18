# DevBoard — Job Application Tracker

DevBoard is a full-stack app for keeping job applications in one place. Create an account, add applications, update their status, and remove entries when you no longer need them.

## Live app

- **Frontend:** [https://devboard-two-rho.vercel.app](https://devboard-two-rho.vercel.app)
- **API health:** [https://devboard-api-i5fa.onrender.com/api/health](https://devboard-api-i5fa.onrender.com/api/health)
- **Database health:** [https://devboard-api-i5fa.onrender.com/api/health/db](https://devboard-api-i5fa.onrender.com/api/health/db)

The API is a backend service and does not have a homepage at `/`. Use one of the health links above to check it. The free Render service may take a little time to wake after inactivity.

## Features

- Account registration and login with password hashing and JWT-based authentication stored in an HTTP-only cookie.
- Private application records associated with the signed-in user.
- Add an application with company, role, status, application date, and optional notes.
- Update an application's status or delete the application.
- PostgreSQL persistence through Prisma.
- Responsive interface built with Tailwind CSS.

## Tech stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Backend:** Node.js, Express 5, TypeScript
- **Database:** PostgreSQL on Neon
- **ORM:** Prisma
- **Hosting:** Vercel (frontend), Render (API), Neon (database)

## Repository layout

```text
devboard/
├── apps/
│   ├── api/   # Express API and Prisma schema/migrations
│   └── web/   # Next.js frontend
└── README.md
```

## Run locally

### Requirements

- Node.js and npm
- A PostgreSQL database (the deployed project uses Neon)

### 1. Clone the repository

```bash
git clone https://github.com/Karan-1108/devboard.git
cd devboard
```

### 2. Install API dependencies

```bash
cd apps/api
npm ci
```

Create `apps/api/.env` with your own database URLs and a strong secret:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

Use your provider's pooled connection string for `DATABASE_URL` and its direct connection string for `DIRECT_URL`. Keep real credentials private; never commit `.env` files.

Generate Prisma Client and apply local migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the API in this terminal:

```bash
npm run dev
```

The API listens on `http://localhost:4000`.

### 3. Install and start the frontend

Open a second terminal from the repository root:

```bash
cd apps/web
npm ci
```

Create `apps/web/.env.local`:

```dotenv
API_INTERNAL_URL="http://localhost:4000"
```

Then start Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is already in use, Next.js may use port 3001; set `FRONTEND_URL` in `apps/api/.env` to that frontend origin and restart the API so cookie and CORS checks match.

## Deployment configuration

The project is deployed as two services from this repository:

- **Render API:** set the service root directory to `apps/api`; configure `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and `FRONTEND_URL`. `FRONTEND_URL` must be the deployed Vercel site origin. The current API build runs Prisma Client generation and `prisma migrate deploy`; the start command is `npm start`.
- **Vercel frontend:** set the project root directory to `apps/web` and configure `API_INTERNAL_URL` to the Render API origin (for example, `https://devboard-api-i5fa.onrender.com`).

Do not put database credentials or JWT secrets in this README or in frontend environment variables.
