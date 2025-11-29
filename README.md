# WhatsApp Dashboard

A modern, full-stack WhatsApp management dashboard powered by Evolution API v2.

## Features

- **Dashboard Analytics**: Real-time statistics on messages, contacts, and instance health.
- **Instance Management**: Create, delete, and manage WhatsApp instances. QR code connection.
- **Conversations**: Full chat interface with history and real-time updates.
- **Contacts & Groups**: Manage your address book and groups.
- **Webhooks**: Configure webhook events for integration.
- **Settings**: Global and instance-level configuration.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui, Zustand
- **Backend**: Evolution API v2 (Docker)
- **Database**: PostgreSQL, Redis

## Prerequisites

- Node.js 18+
- Docker & Docker Compose

## Setup Instructions

1.  **Install Dependencies**

    ```bash
    npm install
    ```

    *Note: If you encounter errors about missing UI components, ensure you have the necessary shadcn/ui dependencies installed (already added to package.json).*

2.  **Start Backend Services**

    Start Evolution API, PostgreSQL, and Redis using Docker Compose:

    ```bash
    docker-compose up -d
    ```

3.  **Database Setup**

    Initialize the database schema:

    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run the Application**

    Start the Next.js development server:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- **Environment Variables**: Check `.env` for configuration options.
- **Evolution API**: The dashboard connects to Evolution API at `http://localhost:8080` by default.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components and feature-specific components.
- `lib/`: Utility functions and API clients (`evolution.ts`, `db.ts`).
- `prisma/`: Database schema.
