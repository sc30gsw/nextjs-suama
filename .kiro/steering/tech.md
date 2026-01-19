# Technology Stack

## Architecture Overview

Modern full-stack web application built on Next.js App Router foundation, achieving high-performance SEO-friendly applications through proper separation of Server Components and Client Components.

### System Architecture

```
Frontend (React 19) ←→ API Layer (Hono) ←→ Database (Turso)
    ↓                       ↓                    ↓
Client Components      Route Handlers       Edge SQLite
Server Components      Server Actions       Drizzle ORM
    ↓                       ↓                    ↓
Intent UI             Type-Safe RPC        Schema Migration
Tailwind CSS          up-fetch            Branch Management
```

## Frontend Technology

### Core Framework

- **Next.js 15** (with App Router): Modern React framework
- **React 19** (with React Compiler): Experimental features enabled, automatic optimization
- **TypeScript 5**: Strict type safety

### UI & Styling

- **Tailwind CSS 4**: Utility-first CSS framework
- **Intent UI**: High-quality component library
- **React Aria Components**: Accessibility-enabled UI components
- **Lucide React**: Icon library

### State Management & Data Fetching

- **TanStack Query**: Server state management
- **nuqs**: URL state management
- **up-fetch**: Extended fetch library

### Form Management

- **Conform**: Form management library
- **Zod**: Validation schema definition

### Specialized Libraries

- **React Virtuoso**: Virtualized rendering
- **TanStack Table**: Unstyled table components
- **react-call**: Confirmation dialog management
- **date-fns**: Date manipulation
- **Remeda**: TypeScript utility library

## Backend Technology

### API Framework

- **Hono**: Fast and lightweight web framework
- **Hono RPC**: Type-safe API communication

### Database & ORM

- **Turso**: Edge SQLite (distributed SQLite)
- **Drizzle ORM**: Type-safe ORM
- **@libsql/client**: Turso connection client

### Authentication

- **Better Auth**: Modern authentication library
- **Passkey Support**: Biometric authentication support

## Development Environment

### Package Management

- **Bun**: Fast JavaScript runtime and package manager
- ⚠️ **npm/yarn prohibited**: Use Bun only

### Code Quality

- **Biome**: Integrated linter and formatter
- ⚠️ **ESLint/Prettier prohibited**: Unified with Biome

### Build & Development

- **Turbopack**: Next.js development server acceleration
- **React Compiler**: Automatic optimization (experimental feature)

## Common Commands

### Development Server

```bash
bun dev              # Start development server (using Turbopack)
```

### Build Commands

```bash
bun run build        # Production build
bun run build:clean  # Clean build (delete .next directory before build)
```

### Code Quality

```bash
bun run format       # Execute Biome formatting
bun run lint         # Execute Biome linter (with auto-fix)
bun run check:biome  # Execute Biome check (with auto-apply)
```

### Database Operations

```bash
# Schema generation and migration
bunx drizzle-kit push      # Push schema changes to Turso
bunx drizzle-kit generate  # Generate migration files
bunx drizzle-kit migrate   # Execute migrations

# Better Auth schema generation
bunx @better-auth/cli generate

# Turso branching
turso db create new-db --from-db old-db  # Create DB branch
turso db destroy new-db                  # Delete DB branch
```

## Environment Variables

### Required Variables

```env
# Application settings
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database settings (shared in NotePM)
TURSO_DATABASE_URL={Shared in NotePM}
TURSO_AUTH_TOKEN={Shared in NotePM}

# Authentication settings
BETTER_AUTH_SECRET=openssl rand -base64 32  # Random generation
BETTER_AUTH_URL=http://localhost:3000
```

## Port Configuration

### Development Ports

- **3000**: Next.js development server (main)
- **3001**: Storybook (unused, future use)

### Database Connections

- **Turso**: Cloud Edge SQLite (no port specification)

## Performance Considerations

### React Compiler Benefits

- **Automatic Memoization**: useMemo/useCallback not required
- **Re-render Optimization**: Automatic optimization
- **Bundle Size Reduction**: Elimination of unnecessary code

### Next.js App Router Advantages

- **Server Components**: Fast initial loading through server-side rendering
- **Parallel Routes**: UX improvement through parallel routes
- **Streaming**: Improved perceived speed through streaming SSR

### Database Performance

- **Edge SQLite**: Low latency through global distribution
- **Connection Pooling**: Efficient connection management via Drizzle
- **Branching**: Safe DB operations in development environment

## Security Considerations

### Authentication Security

- **Better Auth**: Secure authentication flow
- **Passkey Support**: Phishing-resistant authentication
- **Session Management**: Secure session management

### Database Security

- **Turso**: End-to-end encryption
- **Environment Variables**: Proper management of sensitive information
- **Input Validation**: Strict validation with Zod

### Code Security

- **TypeScript Strict Mode**: Vulnerability prevention through type safety
- **Server Actions**: Built-in CSRF protection
- **Biome**: Automatic security rule checking

## Development Guidelines

### Critical Rules

1. **Use React Compiler**: useMemo/useCallback prohibited
2. **Bun Only**: npm/yarn usage prohibited
3. **Biome Only**: ESLint/Prettier usage prohibited
4. **Server Actions**: Use only for mutations
5. **Type Safety**: Avoid excessive use of any type

### Performance Rules

1. **Prioritize Server Components**: Client Components only at boundaries
2. **Data Fetch Colocation**: Fetch in leaf components
3. **Request Memoization**: Avoid waterfalls with parallel fetching
4. **Proper Cache Strategy**: Utilize cacheTag and cacheLife
