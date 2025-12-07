# WhatsApp Dashboard

A modern, full-featured WhatsApp management dashboard built with Next.js 14 and powered by Evolution API v2.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Evolution API](https://img.shields.io/badge/Evolution%20API-v2.1+-green?style=flat-square)

## Features

### Core Functionality
- **Dashboard** - Real-time analytics and statistics
- **Instance Management** - Create, manage, and monitor WhatsApp instances
- **Conversations** - View and manage chats
- **Contact Management** - View and manage contacts
- **Group Management** - Manage WhatsApp groups
- **Webhook Configuration** - Configure event webhooks
- **Settings** - Instance configuration

### Authentication & Security
- **NextAuth.js v5** - Secure credential-based authentication
- **Role-Based Access Control** - Fine-grained permissions (Super Admin, Admin, Manager, Operator, Viewer)
- **Session Management** - JWT-based sessions with 30-day expiration
- **Protected Routes** - Middleware-based route protection

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query (React Query)
- **Auth**: NextAuth.js v5
- **Database**: PostgreSQL
- **Cache**: Redis
- **API**: Evolution API v2

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd whatsappx
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure your variables:

```bash
cp .env.example .env.local
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Deployment

### Netlify
1. Connect your repository to Netlify.
2. The `netlify.toml` file is included to handle build settings automatically.
3. Set your environment variables in the Netlify dashboard (Database URL, NextAuth Secret, etc.).

### Vercel
1. Import your project to Vercel.
2. Vercel automatically detects Next.js.
3. Add your environment variables in the Vercel project settings.

### Docker / AWS / VPS
The included `Dockerfile` allows for containerized deployment.

```bash
# Build the image
docker build -t whatsapp-dashboard .

# Run the container
docker run -p 3000:3000 --env-file .env whatsapp-dashboard
```

### Bolt.new / Lovable
This project is compatible with cloud development environments like Bolt.new and Lovable. Ensure you install dependencies (`npm install`) and start the dev server (`npm run dev`).

## Database Management
This project uses Prisma with PostgreSQL.
- **Generate Client**: `npx prisma generate`
- **Push Schema**: `npx prisma db push`
- **Seed Data**: `npm run seed` (if available)

## Environment Variables
Refer to `.env.example` for a complete list of required variables.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `EVOLUTION_API_URL` | Evolution API URL |
| `EVOLUTION_API_KEY` | Evolution API key |
| `NEXTAUTH_SECRET` | NextAuth secret key |
| `NEXTAUTH_URL` | Application URL (e.g. https://your-domain.com) |

## License

MIT
