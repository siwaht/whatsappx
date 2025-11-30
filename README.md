# WhatsApp Dashboard

A modern, full-stack WhatsApp management dashboard powered by Evolution API v2 with complete user management and role-based access control.

## Features

### Core Features
- **Dashboard Analytics**: Real-time statistics on messages, contacts, and instance health
- **Instance Management**: Create, delete, and manage WhatsApp instances with QR code connection
- **Conversations**: Full chat interface with history and real-time updates
- **Contacts & Groups**: Manage your address book and groups
- **Webhooks**: Configure webhook events for integration
- **Settings**: Global and instance-level configuration

### User Management
- **Authentication**: Secure JWT-based authentication with session management
- **Role-Based Access Control**: Admin, Operator, and Viewer roles with customizable permissions
- **User Administration**: Create, edit, activate/deactivate users
- **Permission System**: Granular permissions for all resources
- **Audit Logging**: Track all user actions for compliance

### Security Features
- **Rate Limiting**: Protect against brute force attacks
- **Account Lockout**: Automatic lockout after failed login attempts
- **Secure Sessions**: HTTP-only cookies with strict same-site policy
- **Security Headers**: XSS protection, HSTS, Content-Type sniffing prevention
- **Input Validation**: Zod schema validation on all inputs

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Zustand
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis (optional, for Evolution API)
- **API**: Evolution API v2

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd whatsappx
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure at minimum:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key (32+ characters)
- `EVOLUTION_API_KEY` - Your Evolution API key

### 3. Start Backend Services

```bash
docker-compose up -d
```

This starts:
- Evolution API on port 8080
- PostgreSQL on port 5432
- Redis on port 6379

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (creates admin user and default roles)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Login

Default admin credentials (from seed):
- Email: `cc@siwaht.com`
- Password: `Hola173!`

**⚠️ Change the password after first login!**

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

See `.env.example` for all available options:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Required |
| `EVOLUTION_API_URL` | Evolution API URL | `http://localhost:8080` |
| `EVOLUTION_API_KEY` | Evolution API key | Required |
| `NODE_ENV` | Environment | `development` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

## Project Structure

```
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   ├── (dashboard)/      # Protected dashboard pages
│   └── api/              # API routes
├── components/
│   ├── auth/             # Auth components
│   ├── layout/           # Layout components
│   ├── ui/               # shadcn/ui components
│   └── users/            # User management components
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── audit.ts          # Audit logging
│   ├── config.ts         # Environment config
│   ├── db.ts             # Database client
│   ├── errors.ts         # Error handling
│   ├── evolution.ts      # Evolution API client
│   ├── logger.ts         # Logging utilities
│   ├── middleware.ts     # API middleware
│   ├── rate-limit.ts     # Rate limiting
│   └── validations.ts    # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed script
└── middleware.ts         # Next.js middleware
```

## Default Roles

| Role | Description |
|------|-------------|
| `admin` | Full access to all features |
| `operator` | Can manage instances and send messages |
| `viewer` | Read-only access |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique values for `JWT_SECRET`
3. Enable HTTPS
4. Configure proper database credentials
5. Set up database backups
6. Consider using Redis for rate limiting in production

## Security Considerations

- Always use HTTPS in production
- Keep `JWT_SECRET` secure and unique per environment
- Regularly rotate API keys
- Monitor audit logs for suspicious activity
- Keep dependencies updated

## License

MIT
