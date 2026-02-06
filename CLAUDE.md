# CLAUDE.md — GameShop

## Project Overview

GameShop is a new, greenfield project. This repository was initialized without any existing code, framework, or build configuration. All structure and conventions described below should be established as the project is built out.

## Current State

- **Status**: Empty repository — no source code, dependencies, or configuration files exist yet.
- **Repository**: `lennhodes-debug/gameshop`

## Development Guidelines for AI Assistants

### General Principles

- Keep solutions simple and focused. Don't over-engineer or add unnecessary abstractions.
- Prefer editing existing files over creating new ones.
- Don't add features, refactoring, or "improvements" beyond what was requested.
- Validate inputs at system boundaries (user input, external APIs), not deep in internal code.
- Write self-documenting code; only add comments where logic isn't self-evident.

### Git Workflow

- Develop on feature branches prefixed with `claude/`.
- Write clear, descriptive commit messages that explain *why*, not just *what*.
- Never force-push to `main` or `master`.
- Stage specific files rather than using `git add -A`.
- Never commit secrets, credentials, or `.env` files.

### Code Style (to be established)

As the project is initialized, adopt and document:
- Language and framework choices
- Linter and formatter configuration (e.g., ESLint, Prettier)
- Testing framework and conventions
- Directory structure conventions

### When Adding New Frameworks or Tools

- Document the choice and rationale in this file.
- Add build/run/test commands to this file once they exist.
- Keep dependency counts minimal — only add what's genuinely needed.

## Commands

_No build, test, or lint commands exist yet. Update this section as they are added._

<!--
Example (update when project is bootstrapped):
- `npm install` — Install dependencies
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm test` — Run test suite
- `npm run lint` — Run linter
-->

## Architecture

_No architecture decisions have been made yet. Document key decisions here as the project takes shape._

<!--
Example sections to fill in:
- Tech stack (language, framework, database)
- Directory structure
- API design patterns
- State management approach
- Authentication/authorization strategy
-->
