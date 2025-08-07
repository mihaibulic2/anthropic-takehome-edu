# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development**: `pnpm dev` (uses Next.js turbo)
- **Build application**: `pnpm build` (runs DB migration then builds)
- **Production start**: `pnpm start`
- **Lint**: `pnpm lint` (ESLint + Biome with auto-fix)
- **Format**: `pnpm format` (Biome formatter)
- **Run tests**: `pnpm test` (Playwright E2E tests)

## Database Commands

- **Run migrations**: `pnpm db:migrate`
- **Generate migrations**: `pnpm db:generate`
- **Database studio**: `pnpm db:studio`
- **Push schema**: `pnpm db:push`

## Architecture Overview

This is an AI chatbot application built with Next.js 15 and the AI SDK. The application uses a modern stack with the following key architectural patterns:

### Core Structure
- **Next.js App Router**: Uses the new app directory structure with parallel routes
- **Authentication**: NextAuth.js with guest user support via middleware
- **Database**: Drizzle ORM with PostgreSQL (Neon Serverless)
- **AI Integration**: Vercel AI SDK with xAI Grok as default model
- **File Storage**: Vercel Blob for document/artifact storage

### Key Directories
- `app/`: Next.js app router pages and API routes
  - `(auth)/`: Authentication-related pages and API
  - `(chat)/`: Chat interface and chat-related API endpoints
- `lib/`: Core business logic and utilities
  - `ai/`: AI providers, models, prompts, and tools
  - `db/`: Database schema, queries, and migrations
  - `artifacts/`: Document/artifact handling logic
- `components/`: React components (uses shadcn/ui)
- `artifacts/`: Artifact rendering components (code, text, image, sheet)

### Database Schema
The application uses versioned schemas with migration support:
- `User`: User accounts with email/password auth
- `Chat`: Chat sessions with visibility controls
- `Message_v2`: Structured messages with parts and attachments
- `Document`: Artifacts/documents with different kinds (text, code, image, sheet)
- `Suggestion`: AI-generated document suggestions
- `Vote_v2`: Message voting system

### AI Tools Integration
The chat system includes several AI tools:
- `create-document`: Creates different types of documents/artifacts
- `update-document`: Modifies existing documents
- `get-weather`: Weather information tool
- `request-suggestions`: Generates content suggestions

### Authentication Flow
- Middleware handles auth state and guest user creation
- Supports both registered users and temporary guest sessions
- Auth pages redirect authenticated users to main chat interface

### Testing Setup
Uses Playwright for E2E testing with two test projects:
- `e2e/`: End-to-end user workflow tests
- `routes/`: API route testing

## Environment Setup
Requires environment variables defined in `.env.local` (see README for deployment guide with Vercel CLI).