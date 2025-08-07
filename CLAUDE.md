# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Description / Details
- this project is a prototype for a new feature to add to the claude LLM. It's based on a simplified UI (vercel/ai-chatbot fork) for the claude web chat interface for simplicity. Below we describe this prototype
- purpose: when kids try to use claude to get answers to school work or when they're just to get an explanation for some school work, we will show them a small cute pop-up with an educational game that can help teach them the underlying concept instead of just giving them the answer
- why: so kids learn these basic concepts instead of just developing the habit of asking an AI to do their thinking for them
- general mechanism:
  - when the user is asking to solve or explain a K-6th grade math problem, the LLM uses tool calls to see if there is an appropriate game
  - if so, it will present the game to the user via a pop-up
  - if the user clicks the pop-up, the game will launch with custom questions tailored to the topic they asked about (and the appropriate difficulty along with an art style that could match their preferences)
 - once the game runs out of questions, it can retrieve more questions based on the user's performance
 - if the user leaves the game or dismisses the pop-up, the LLM is notified of that (including the users stats if they played)

## Project Milestones and Development Roadmap

### Milestone 1: Local Chat / Claude Stand-in
- [x] M1: get barebones local chat / claude stand-in
    - [x] pick one: [vercel](https://github.com/vercel)[ai-chatbot](https://github.com/vercel/ai-chatbot)
    - [x] fork it + deploy
    - [x] run locally
    - [x] add claude, set as default
    - [x] security

### Milestone 2: Game API and Tooling
- [x] M2: add tool calls for queryGames + presentGame
    - [x] queryGames API = will search available games, params: topic (eg times tables), age level (eg 5th grade), location (eg CA, for standards look-up), format (eg dinosaurs, strategy, etc)
    - [x] presentGame = will show claudette UI and allows 1 press gameplay

### Milestone 3: Game Discovery
- [ ] M3: add queryGame API
    - [ ] v0: just call Claude with list of all games and the reqs, ask it to reply w/ sorted list of options and score for match
    - [ ] **LATER** v1: (if we succeed in making 100+ games, revisit to use RAG)

### Milestone 4: User Interface
- [ ] M4: add UI for claudette
    - [ ] on presentGame = show popup w/ cute crab and it's message
        - [ ] call fetchGame immediately in background
    - [ ] onClick = show loading, finish fetchGame, then show the game

### Milestone 5: Game Fetching and Core Structure
- [ ] M5: add API to fetchGame (on presentGame call)
    - [ ] have claude code opus 4.1 go off and make core structure for games
        - [ ] TECH: react/tailwind (OR vanilla single file html/css/js web apps), No server-side components or APIs - everything runs client-side, Games reset when page refreshes, No browser storage (localStorage/sessionStorage): games use in-memory state only, External scripts only from cdnjs.cloudflare.com, available libs: three.js (for 3d), canvas (for 2d), lucide react icons, mathjs, lodash, tone.js, recahrts, d2, plotly
        - [ ] come up w/ arch for the game? (somehow can package this into a web reply for the client??)
        - [ ] have shared libs folder
        - [ ] have folder for each core game 
            - [ ] add params for: topic + level + data + art (anything else?)
- [ ] M5: add 1st REAL game (1 core game, 1 hardcoded topic, 1 mvp art style)
    - [ ] on game dismisses (X'd or finished playing), fire callback which sends sys msg saying game is done (and how it went)

### Milestone 6: Game Expansion
- [ ] M6: add more games
    - [ ] ask claude/gpt to make a list of many games/variants
        - [ ] ~10 core games 
            - [ ] look at Prodigy Math, Khan Academy Kids for games to copy
        - [ ] ~10 different popular art styles for each
    - [ ] Iterate list of shared libs necessities (eg physics, art, scoring, etc)
        - [ ] inc LLM "generateData" call (takes in core game type, art style, subject, grade level, state standard, difficulty, topic, sample questions, past performance) (calls Claude, gets json rep of questions)
    - [ ] Make 2 core games+ 2 art styles
        - [ ] play test all combos!
    - [ ] Make 8 more core games (these are all separate game IDs) (and make shared libs as previously discussed and more as needed)
    - [ ] Make 8 more art styles
        - [ ] have it give list of required asset specs
        - [ ] generate assets separately + drop in
    - [ ] Add all details to tool_call spec
        - [ ] list all core games
        - [ ] list all art styles
        - [ ] list all topics + difficulty (give examples?)

### Milestone 7: Deployment and Testing
- [ ] M7: deploy + play test - make this set of milestones our main task list (note M1, ie milestone 1 is done)

## Development Commands

- **Start development**: `pnpm dev` (uses Next.js turbo)
- **Lint**: `pnpm lint` (ESLint + Biome with auto-fix, use this after all major work to ensure there are no errors!)
- **Build application**: `pnpm build` (runs DB migration then builds, use this after all major work to ensure there are no errors!)
- **Production start**: `pnpm start`
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
