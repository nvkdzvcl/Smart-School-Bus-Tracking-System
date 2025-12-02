# Smart School Bus Tracking System

A comprehensive system for tracking school buses, managing schedules, and facilitating communication between parents, drivers, and schools.

## Project Overview

This project is a monorepo containing the following applications:

-   **Web Dashboard** (`apps/web-dashboard`): A React-based admin dashboard for school managers to manage buses, drivers, students, routes, and view reports.
-   **Driver App** (`apps/driver-app`): A mobile-first web application for drivers to view their schedules, check-in students, and report incidents.
-   **Parent App** (`apps/parent-app`): A mobile-first web application for parents to track their children's bus location and receive notifications.
-   **Dashboard API** (`apps/server/dashboard-api`): The backend API service for the dashboard, built with NestJS.
-   **Driver API** (`apps/server/driver-api`): The backend API service for the driver app, built with NestJS.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18 or higher recommended)
-   **pnpm** (Package manager)
-   **PostgreSQL** (Database)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd Smart-School-Bus-Tracking-System
    ```

2.  Install dependencies for all workspaces:
    ```bash
    pnpm install
    ```

## Configuration

You need to configure environment variables for the backend services.

### Database Setup

Ensure you have a PostgreSQL database running. You can create a database named `smart_school_bus` (or any name you prefer).

### Backend Configuration

Create a `.env` file in `apps/server/dashboard-api` and `apps/server/driver-api` with the following content (adjust values to match your local setup):

**`apps/server/dashboard-api/.env`**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=smart_school_bus
JWT_SECRET=your_jwt_secret
PORT=3001
```

**`apps/server/driver-api/.env`**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=smart_school_bus
JWT_SECRET=your_jwt_secret
PORT=3002
```

### Frontend Configuration

The frontends use `Vite` and load environment variables from `.env` files.

**`apps/web-dashboard/.env`**
```env
VITE_DASHBOARD_API_URL=http://localhost:3001
```

**`apps/driver-app/.env`**
```env
VITE_API_URL=http://localhost:3002
```

## Running the Application

You can run the applications individually or concurrently.

### 1. Start the Backends

Open a terminal for the Dashboard API:
```bash
cd apps/server/dashboard-api
pnpm start:dev
```
*Runs on http://localhost:3001*

Open another terminal for the Driver API:
```bash
cd apps/server/driver-api
pnpm start:dev
```
*Runs on http://localhost:3002*

### 2. Start the Frontends

You can use the root scripts to start the frontends:

**Web Dashboard:**
```bash
pnpm dev:web
```
*Runs on http://localhost:5173 (default)*

**Driver App:**
```bash
pnpm dev:driver
```
*Runs on http://localhost:5174 (default)*

**Parent App:**
```bash
pnpm dev:parent
```

## Project Structure

```
Smart-School-Bus-Tracking-System/
├── apps/
│   ├── web-dashboard/       # Admin Dashboard (React + Vite)
│   ├── driver-app/          # Driver App (React + Vite)
│   ├── parent-app/          # Parent App (React + Vite)
│   └── server/
│       ├── dashboard-api/   # NestJS API for Dashboard
│       └── driver-api/      # NestJS API for Driver App
├── packages/                # Shared packages (if any)
├── package.json             # Root configuration & scripts
└── pnpm-workspace.yaml      # Workspace definition
```

## Features

-   **Real-time Tracking**: Track bus locations in real-time.
-   **Management**: CRUD operations for Buses, Drivers, Students, and Routes.
-   **Scheduling**: Manage daily trips and assignments.
-   **Notifications**: Alert parents about pickup/drop-off status.
-   **Reporting**: Drivers can report incidents directly from the app.
