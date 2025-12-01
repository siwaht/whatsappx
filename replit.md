# WhatsApp Dashboard - Replit Project

## Overview
This is a full-featured WhatsApp management dashboard built with Next.js 16 and powered by Evolution API v2. The dashboard provides comprehensive management for WhatsApp instances, conversations, contacts, groups, users, webhooks, and settings.

**Current State**: Fully configured and running on Replit with PostgreSQL database integration.

## Recent Changes (December 1, 2024)
- ✅ Migrated from GitHub to Replit environment
- ✅ Configured PostgreSQL database using Replit's built-in Neon database
- ✅ Downgraded Prisma from v7 to v6 for compatibility
- ✅ Set up environment variables (DATABASE_URL, NEXTAUTH_SECRET, EVOLUTION_API_KEY)
- ✅ Ran Prisma migrations and seeded database with admin user
- ✅ Fixed Next.js configuration to work with Replit proxy
- ✅ Configured dev server to run on port 5000 with 0.0.0.0 binding
- ✅ Removed duplicate page directories to fix routing conflicts
- ✅ Disabled Edge runtime middleware (incompatible with bcrypt)
- ✅ Installed missing dependencies (@radix-ui/react-popover, tailwindcss-animate)
- ✅ Set up deployment configuration for Replit Autoscale

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 16.0.5 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS 4, Radix UI components
- **State Management**: TanStack Query (React Query), Zustand
- **Authentication**: NextAuth.js v5 (Credentials provider with bcrypt)
- **Database**: PostgreSQL (Neon-hosted via Replit)
- **ORM**: Prisma 6.19.0
- **Real-time**: Socket.io client (ready for implementation)
- **External API**: Evolution API v2 for WhatsApp integration

### Key Features
1. **Authentication & Authorization**
   - Credential-based login with NextAuth.js
   - Role-based access control (RBAC)
   - Three default roles: admin, operator, viewer
   - 35 granular permissions across 7 resources

2. **Dashboard & Analytics**
   - Real-time instance status monitoring
   - Message statistics and analytics
   - Activity overview charts

3. **Instance Management**
   - Create/delete WhatsApp instances
   - QR code pairing
   - Connection status monitoring
   - Instance restart/logout capabilities

4. **User Management**
   - Full CRUD operations for users
   - Role assignment
   - Account activation/deactivation
   - Audit logging

5. **Contact & Group Management**
   - Contact list with search/filter
   - Group administration
   - Profile picture caching

6. **Future Features** (Roadmap)
   - Conversations UI with message composer
   - Webhook configuration interface
   - Settings panel implementation
   - Real-time WebSocket updates
   - Message templates and auto-replies

### Project Structure
```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── auth/               # Auth guards
│   ├── chat/               # Chat components
│   ├── dashboard/          # Dashboard widgets
│   └── layout/             # Layout components
├── lib/                     # Core libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── evolution-api.ts    # Evolution API client
│   └── utils.ts            # Utilities
├── prisma/                  # Database
│   ├── schema.prisma       # Prisma schema
│   └── seed.ts             # Database seeding
└── types/                   # TypeScript types
```

## Environment Variables

### Required (Already Configured)
- `DATABASE_URL` - PostgreSQL connection string (Replit secret)
- `NEXTAUTH_SECRET` - NextAuth.js secret for JWT signing
- `NEXTAUTH_URL` - Application URL (https://workspace.mediumreach2025.repl.co)
- `NODE_ENV` - Set to "development"

### Evolution API Configuration
- `EVOLUTION_API_URL` - Evolution API endpoint (default: http://localhost:8080)
- `EVOLUTION_API_KEY` - API key for Evolution API (default: "change-this-api-key")

**Note**: To use WhatsApp features, you need to deploy an Evolution API v2 instance separately and update these variables.

## Database

### Schema
The PostgreSQL database includes:
- **Users & Auth**: users, roles, permissions, user_roles, role_permissions, sessions
- **WhatsApp Data**: webhook_events, message_stats, contacts_cache
- **Audit**: audit_logs, rate_limit_entries

### Admin User
Default admin credentials (created via seed):
- **Email**: cc@siwaht.com
- **Password**: Hola173!
- **Role**: admin (full access)

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## Running the Project

### Development Mode
The project runs automatically via the workflow:
```bash
npm run dev
```
- Binds to: 0.0.0.0:5000
- Auto-restarts on file changes
- Accessible via Replit webview

### Key Commands
```bash
npm run build       # Build for production
npm run start       # Start production server
npx prisma studio   # Open Prisma Studio for DB management
npx prisma generate # Regenerate Prisma client
npx prisma db push  # Push schema changes to database
```

## Deployment
Configured for **Replit Autoscale**:
- Build: `npm run build`
- Run: `npm run start`
- Port: 5000
- Output: standalone

To deploy: Click the "Deploy" button in Replit

## Known Issues & Limitations

### Current Limitations
1. **No Evolution API**: The Evolution API is not included in this Replit. You need to deploy it separately (Docker recommended).
2. **Middleware Disabled**: Edge runtime middleware is disabled due to bcrypt incompatibility. Authentication is handled at the component/API level.
3. **WebSocket Not Connected**: Real-time features require Evolution API WebSocket connection.

### Resolved Issues
- ✅ Fixed duplicate route errors (removed /login, /contacts, etc. at root)
- ✅ Fixed Edge runtime crypto errors (disabled middleware)
- ✅ Fixed missing dependencies (radix-ui/react-popover, tailwindcss-animate)
- ✅ Downgraded Prisma from v7 to v6 for stability

## User Preferences
- **Coding Style**: TypeScript with strict typing, functional components with hooks
- **Authentication**: NextAuth.js v5 with database session strategy
- **Database**: Prisma ORM with PostgreSQL
- **UI Framework**: shadcn/ui components with Tailwind CSS

## Integration with Evolution API

To fully use this dashboard:

1. **Deploy Evolution API v2**:
   - Option A: Use Docker Compose (see project README)
   - Option B: Deploy on another Replit or cloud service
   - Option C: Use a managed Evolution API service

2. **Update Environment Variables**:
   ```
   EVOLUTION_API_URL=https://your-evolution-api-url.com
   EVOLUTION_API_KEY=your-secure-api-key
   ```

3. **Test Connection**:
   - Navigate to Instances page
   - Click "New Instance"
   - If successful, you'll see a QR code to scan

## Support & Resources
- Evolution API Docs: https://doc.evolution-api.com
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- shadcn/ui: https://ui.shadcn.com

---
**Last Updated**: December 1, 2024
**Maintained By**: Replit Agent
