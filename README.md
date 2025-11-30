# WhatsApp Dashboard

A modern, full-featured WhatsApp management dashboard built with Next.js 14 and powered by Evolution API v2. This dashboard provides a comprehensive interface for managing WhatsApp instances, viewing conversations, analyzing statistics, and configuring integrations.

![WhatsApp Dashboard](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Evolution API](https://img.shields.io/badge/Evolution%20API-v2.1+-green?style=flat-square)

## Features

### Core Functionality
- **Dashboard Home** - Real-time analytics and statistics overview
- **Instance Management** - Create, manage, and monitor WhatsApp instances
- **Conversations** - WhatsApp-style chat interface (coming soon)
- **Contact Management** - View and manage contacts with search/filter
- **Group Management** - Comprehensive group administration
- **User Management** - Complete user administration with role-based access control
- **Webhook Configuration** - Real-time event notifications (coming soon)
- **Settings Panel** - Instance behavior configuration (coming soon)

### Authentication & Security
- **Secure Authentication** - NextAuth.js v5 with credential-based login
- **Role-Based Access Control (RBAC)** - Fine-grained permissions system
- **User Management** - Add, update, disable, and delete users
- **Permission System** - 5 default roles (Super Admin, Admin, Manager, Operator, Viewer)
- **Protected Routes** - Middleware-based route protection
- **Session Management** - JWT-based sessions with 30-day expiration
- **Password Security** - Bcrypt password hashing

### Key Highlights
- Real-time connection status monitoring
- QR code display for instance pairing
- Message statistics and analytics
- Multi-user support with granular permissions
- Responsive, mobile-friendly design
- Type-safe API integration
- Dark mode support (planned)

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Real-time**: Socket.io client (ready for implementation)
- **Icons**: Lucide React
- **QR Codes**: react-qr-code

### Backend Integration
- **Evolution API v2**: Core WhatsApp functionality
- **Database**: PostgreSQL (analytics & caching)
- **Cache**: Redis (sessions & real-time data)

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for full stack deployment)
- Evolution API v2 instance (included in Docker Compose)

## Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsappx
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and update:
   - `EVOLUTION_API_KEY`: Change from default
   - `WEBHOOK_SECRET`: Set a secure secret
   - Other settings as needed

3. **Update Docker Compose**

   Edit `docker-compose.yml` and change:
   - `AUTHENTICATION_API_KEY` in evolution-api service
   - `EVOLUTION_API_KEY` in dashboard service
   - Database passwords (optional)

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Initialize the database**
   ```bash
   # Initialize main schema
   docker exec -i whatsapp-dashboard-postgres psql -U whatsapp -d whatsapp_dashboard < database/schema.sql

   # Initialize user management schema
   docker exec -i whatsapp-dashboard-postgres psql -U whatsapp -d whatsapp_dashboard < database/user-management-schema.sql
   ```

6. **Access the dashboard**
   - Dashboard: http://localhost:3000
   - Evolution API: http://localhost:8080
   - **Default Login**: admin@whatsapp-dashboard.local / admin123

   **IMPORTANT**: Change the default admin password immediately after first login!

### Option 2: Development Mode

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure your Evolution API URL and credentials

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open the dashboard**
   ```bash
   http://localhost:3000
   ```

## Environment Variables

```env
# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key-here
EVOLUTION_INSTANCE_NAME=main

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/whatsapp_dashboard

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=your-webhook-secret-here

# Authentication (NextAuth.js)
NEXTAUTH_SECRET=your-nextauth-secret-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

## Project Structure

```
whatsappx/
├── app/                      # Next.js App Router pages
│   ├── (dashboard)/         # Dashboard route group (future)
│   ├── api/                 # API routes (webhooks, proxy)
│   ├── instances/           # Instance management
│   ├── conversations/       # Chat interface
│   ├── contacts/            # Contact management
│   ├── groups/              # Group management
│   ├── webhooks/            # Webhook configuration
│   ├── settings/            # Settings panel
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Dashboard home
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── chat/                # Chat-related components
│   ├── dashboard/           # Dashboard components
│   └── shared/              # Shared components
├── lib/                     # Core libraries
│   ├── evolution-api.ts     # Evolution API client
│   ├── providers.tsx        # React Query provider
│   └── utils.ts             # Utility functions
├── hooks/                   # Custom React hooks
│   ├── useInstance.ts       # Instance management hooks
│   ├── useMessages.ts       # Message hooks
│   ├── useContacts.ts       # Contact hooks
│   └── useGroups.ts         # Group hooks
├── types/                   # TypeScript definitions
│   └── evolution.ts         # Evolution API types
├── database/                # Database files
│   └── schema.sql           # PostgreSQL schema
├── docker-compose.yml       # Docker services
├── Dockerfile               # Dashboard container
└── .env.example             # Environment template
```

## Usage Guide

### Creating an Instance

1. Navigate to **Instances** page
2. Click **New Instance** button
3. Enter a unique instance name
4. Click **Create Instance**
5. Scan the QR code with WhatsApp to connect

### Managing Instances

- **Restart**: Restart the instance connection
- **Logout**: Disconnect the instance from WhatsApp
- **Delete**: Remove the instance completely
- **View QR Code**: Display QR code for reconnection

### Viewing Analytics

The dashboard home shows:
- Active conversations count
- Total messages sent/received
- Contact and group statistics
- Recent activity feed
- Connection status

### User Management

#### Default Roles & Permissions

The system includes 5 predefined roles with different permission levels:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| **Super Admin** | Full system access | All permissions |
| **Admin** | Most permissions except user deletion | Create/update users, manage instances, all operations |
| **Manager** | Instance and operational management | Manage instances, send messages, view analytics |
| **Operator** | Day-to-day operations | Send messages, view data, update contacts/groups |
| **Viewer** | Read-only access | View-only permissions across all resources |

#### Creating Users

1. Navigate to **Users** page (requires `users.read` permission)
2. Click **Add User** button
3. Fill in user details:
   - Email address
   - Full name
   - Password
   - Assign a role
4. Click **Create User**

#### Managing Users

- **Edit User**: Update name, role, or password
- **Disable User**: Temporarily disable account (prevents login)
- **Enable User**: Re-enable a disabled account
- **Delete User**: Permanently remove user (requires `users.delete` permission)

#### Permission System

Permissions follow the format: `resource.action`

**Available Resources:**
- `users` - User management
- `instances` - WhatsApp instances
- `messages` - Message operations
- `contacts` - Contact management
- `groups` - Group management
- `webhooks` - Webhook configuration
- `settings` - System settings
- `analytics` - Reports and analytics

**Available Actions:**
- `create` - Create new resources
- `read` - View/list resources
- `update` - Modify existing resources
- `delete` - Remove resources
- `manage` - Full control over resource
- `send` - Send messages (messages only)

#### First Login

1. Access http://localhost:3000
2. Use default credentials:
   - **Email**: admin@whatsapp-dashboard.local
   - **Password**: admin123
3. **IMPORTANT**: Change the default password immediately!

#### Changing Password

1. Navigate to **Users** page
2. Click **Edit** on your user account
3. Enter a new password
4. Click **Update User**

## API Integration

The dashboard uses a type-safe Evolution API client:

```typescript
import { getEvolutionAPI } from '@/lib/evolution-api';

const api = getEvolutionAPI();

// Create instance
await api.createInstance({ instanceName: 'my-instance' });

// Send message
await api.sendText('instance-name', {
  number: '5511999999999',
  text: 'Hello from Evolution API!'
});

// Fetch contacts
const contacts = await api.findContacts('instance-name');
```

## Database Schema

The PostgreSQL database includes tables for:
- Webhook events storage
- Message statistics
- Contact cache
- Conversation cache
- Instance configuration
- Message queue
- Analytics summaries
- Contact labels
- Quick replies
- Auto-reply rules

See `database/schema.sql` for complete schema.

## Docker Services

The Docker Compose stack includes:

1. **PostgreSQL** (port 5432) - Main database
2. **Redis** (port 6379) - Cache and sessions
3. **Evolution API** (port 8080) - WhatsApp integration
4. **Dashboard** (port 3000) - Next.js application

## Development

### Adding New Components

```bash
# Add shadcn/ui component
npx shadcn@latest add [component-name]
```

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## Roadmap

- [ ] Complete Conversations UI with message composer
- [ ] Webhook configuration interface
- [ ] Settings panel implementation
- [ ] WebSocket real-time updates
- [ ] Message templates/quick replies
- [ ] Auto-reply rules engine
- [ ] Bulk message sender
- [ ] Advanced analytics dashboard
- [ ] Typebot integration
- [ ] Chatwoot integration
- [ ] Multi-language support
- [ ] Dark mode theme

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Evolution API Documentation: https://doc.evolution-api.com
- Next.js Documentation: https://nextjs.org/docs

## Acknowledgments

- Built with [Evolution API v2](https://github.com/EvolutionAPI/evolution-api)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [Next.js](https://nextjs.org)

---

**Note**: This is a dashboard interface for Evolution API. You need a running Evolution API instance to use all features. The Docker Compose setup includes everything needed to get started.
