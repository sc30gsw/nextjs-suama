# nextjs-suama (Work Hours Management & Reporting System)

## Metadata

- **Version**: 1.0
- **Created Date**: 2025-09-16
- **Target AI**: Claude Code (claude.ai/code)
- **Project Name**: nextjs-suama (Work Hours Management & Reporting System)
- **Language**: English
- **Encoding**: UTF-8

# Claude Code Spec-Driven Development

Kiro-style Spec Driven Development implementation using claude code slash commands, hooks and agents.

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`
- Commands: `.claude/commands/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in English

## Workflow

### Phase 0: Steering (Optional)

`/kiro:steering` - Create/update steering documents
`/kiro:steering-custom` - Create custom steering for specialized contexts

Note: Optional for new features or small additions. You can proceed directly to spec-init.

### Phase 1: Specification Creation

1. `/kiro:spec-init [detailed description]` - Initialize spec with detailed project description
2. `/kiro:spec-requirements [feature]` - Generate requirements document
3. `/kiro:spec-design [feature]` - Interactive: "Have you reviewed requirements.md? [y/N]"
4. `/kiro:spec-tasks [feature]` - Interactive: Confirms both requirements and design review

### Phase 2: Progress Tracking

`/kiro:spec-status [feature]` - Check current progress and phases

## Development Rules

1. **Consider steering**: Run `/kiro:steering` before major development (optional for new features)
2. **Follow 3-phase approval workflow**: Requirements → Design → Tasks → Implementation
3. **Approval required**: Each phase requires human review (interactive prompt or manual)
4. **No skipping phases**: Design requires approved requirements; Tasks require approved design
5. **Update task status**: Mark tasks as completed when working on them
6. **Keep steering current**: Run `/kiro:steering` after significant changes
7. **Check spec compliance**: Use `/kiro:spec-status` to verify alignment

## Steering Configuration

### Current Steering Files

Managed by `/kiro:steering` command. Updates here reflect command changes.

### Active Steering Files

- `product.md`: Always included - Product context and business objectives
- `tech.md`: Always included - Technology stack and architectural decisions
- `structure.md`: Always included - File organization and code patterns

### Custom Steering Files

<!-- Added by /kiro:steering-custom command -->
<!-- Format:
- `filename.md`: Mode - Pattern(s) - Description
  Mode: Always|Conditional|Manual
  Pattern: File patterns for Conditional mode
-->

### Inclusion Modes

- **Always**: Loaded in every interaction (default)
- **Conditional**: Loaded for specific file patterns (e.g., "\*.test.js")
- **Manual**: Reference with `@filename.md` syntax

## AI Operation Principles (Highest Priority)

1. **Pre-execution Confirmation Required**: AI must report its work plan before file generation, updates, or program execution, obtain y/n user confirmation, and halt all execution until receiving "y".
2. **Plan Change Confirmation**: AI must not perform workarounds or alternative approaches without permission. If the initial plan fails, AI must obtain confirmation for the next plan.
3. **User Decision Authority**: AI is a tool and decision authority always belongs to the user. Even if user proposals are inefficient or irrational, AI must not optimize but execute as instructed.
4. **Rule Adherence Absoluteness**: AI must not distort or reinterpret these rules and must absolutely comply with them as top-priority commands.
5. **Guideline Compliance**: AI must not violate CLAUDE.md prohibitions and must develop according to CODING-STANDARDS.md.md coding conventions.
6. **6 Principles Mandatory Display**: AI must verbatim display these 6 principles at the beginning of every chat before responding.

## Development Commands

### Development Server

```bash
bun dev  # Start development server using Turbopack
```

### Build

```bash
bun run build:clean  # Clean build (delete .next directory before build) [Required before PR]
bun run build        # Standard production build
```

### Code Quality

```bash
bun run format       # Format code with Biome
bun run lint         # Run Biome linter with auto-fix
bun run check:biome  # Run Biome check with auto-apply
```

### Database

```bash
bunx drizzle-kit push     # Push schema changes to Turso
bunx drizzle-kit generate # Generate migrations
bunx drizzle-kit migrate  # Apply migrations
bunx @better-auth/cli generate  # Generate Better Auth schema
```

### Turso Branching

```bash
turso db create new-db --from-db old-db  # Create new branch from existing database
turso db destroy new-db                  # Manually delete unnecessary branches
```

## Architecture Overview

**Description**: Work hours management and reporting system using Next.js 15 and React 19 (with App Router)

### Technology Stack

| Category             | Technology                                        | Details/Notes                     |
| -------------------- | ------------------------------------------------- | --------------------------------- |
| **Framework**        | Next.js with React Compiler                       | Experimental feature              |
| **Package Manager**  | Bun                                               | Do not use npm/yarn               |
| **Styling**          | Tailwind CSS                                      | Intent UI components              |
| **State Management** | TanStack Query (server state)<br>nuqs (URL state) |                                   |
| **Backend**          | Hono                                              | Backend framework                 |
| **API**              | up-fetch                                          | fetch extension library           |
| **Database**         | Drizzle with Turso                                | ORM (Edge SQLite)                 |
| **Authentication**   | Better Auth                                       | passkey support                   |
| **Forms**            | Conform                                           | form management library           |
| **Code Quality**     | Biome                                             | Do not use ESLint/Prettier        |
| **Validation**       | Zod                                               | validation schema definition      |
| **Utility**          | Remeda                                            | TypeScript utility library        |
| **Date**             | date-fns                                          | date manipulation library         |
| **UI**               | TanStack Table                                    | Unstyled UI table library         |
| **Virtualization**   | React Virtuoso                                    | virtualized rendering library     |
| **Dialog**           | react-call                                        | Confirm dialog management library |

### Directory Structure (Bulletproof React Pattern)

You must refer to @CODING-STANDARDS.md

## Development Guidelines

### Core Principles (High Priority)

1. **Follow Next.js App Router patterns** and properly set server/client component boundaries
2. **Use React Compiler** (avoid manual useMemo/useCallback)
3. **Apply "use client" directive** only to boundary components to minimize client module graph
4. **Follow AHA Programming** (avoid hasty abstraction)
5. **Data fetching colocation**: Use RequestMemoization to fetch in leaf components
6. **Utilize routing functionality** and Suspense for proper chunking
7. **Leverage slots concept and Composition Pattern** to minimize Client Module Graph and reduce JS bundle sent to client (move descriptions that can be moved to RSC, adopting a policy of enlarging Server Module Graph)

### Naming Conventions

- **Files and Folders**: kebab-case (except dynamic routes [id])
- **Variables and Functions**: camelCase
- **Function Definitions**: Use function declarations: `export default async function componentName() {}`

### Data Fetching Strategy

1. **Use RequestMemoization** and parallel fetch/preload to avoid data fetching waterfalls
2. **Data fetching follows data fetching colocation** - perform in terminal leaf components
3. **Use extended fetch function** in `src/lib/fetcher.ts` for fetch operations
4. **Use Hono RPC functionality** with url and `InferResponseType` for type-safe fetch implementation
5. **Server Actions for mutations only** (do not use as fetch alternative in client components)
6. **Cache management** with React.cache and Next.js cache tags

### Cache Strategy

- **Declare React.cache or Next.js `use cache`** and use `cacheTag`・`cacheLife` appropriately for On-demand Cache

### Server Actions Guidelines

1. **Use only for mutation processing**
2. **Absolutely do not use as fetch alternative in Client Components** (if implementing this, consider introducing client fetch libraries like tanstack-query or SWR)
3. **Use with-callback handling** whenever possible

### Code Quality Requirements

- **TypeScript**: Enable strict mode
- **Path Mapping**: Use ~/ for imports (./src/\*)
- **Biome Configuration**: 2-space indentation, single quotes for JS
- **Build Verification**: Implementers must run `bun run build` or `bun run build:clean` before PR to confirm build passes
- **Database Development**: When DB changes are needed in development, utilize Turso's "branching" feature to switch environments

### Component Architecture

1. **Component strategy** follows [AHA Programming](https://kentcdodds.com/blog/aha-programming) to avoid hasty abstraction
2. **Directory strategy** follows [bulletproof-react](https://github.com/alan2207/bulletproof-react) for implementation
3. **Use function declarations** for props etc. to avoid individual variations (example: `export default async function sample() {}`)

### API Integration

1. **Use extended fetch function** in src/lib/fetcher.ts for RPC type-safe API calls
2. **Use Hono RPC's `InferResponseType`** for type definitions
3. **Zod validation** for runtime type checking
4. **Environment variable validation** with @t3-oss/env-nextjs

### Performance Considerations

1. **React Compiler automatically handles memoization** (since this project uses it, memoization hooks like `useMemo` and `useCallback` are unnecessary in principle)
2. **Use server components** whenever possible
3. **Implement proper error boundaries**
4. **URL-driven state management** for shareable state (using nuqs)

## Environment Variables

| Variable Name         | Value                   |
| --------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL` | http://localhost:3000   |
| `TURSO_DATABASE_URL`  | {Shared in NotePM}      |
| `TURSO_AUTH_TOKEN`    | {Shared in NotePM}      |
| `BETTER_AUTH_SECRET`  | openssl rand -base64 32 |
| `BETTER_AUTH_URL`     | http://localhost:3000   |

## Additional Information Files

### Project conventions, directory structure, prohibitions

@README.md

### Coding standards

@CODING-STANDARDS.md

## AI Assistant Instructions (High Priority)

1. **No Testing Required**: This project does not introduce testing, so test-related work is unnecessary
2. **Type Safety Priority**: Prioritize TypeScript type safety above all
3. **Security**: Follow security best practices
4. **Performance**: Always consider performance
5. **Japanese Comments**: Write code comments in Japanese
6. **Design Confirmation**: Always confirm design before implementation

## Prohibited Items (Highest Priority)

- ❌ **Excessive use of any type** (use TypeScript Utility types whenever possible)
- ❌ **console.log remaining in production**
- ❌ **Direct description of security keys**
- ❌ **Use of npm/yarn** (use bun only)
- ❌ **Manual memoization** (useMemo/useCallback) usage
- ❌ **Using Server Actions as fetch alternative in Client Components**

## Chat Output Format

```
[AI Operation 6 Principles]
[main_output]
#[n] times. # n = increment in each chat (#1, #2...)
```
