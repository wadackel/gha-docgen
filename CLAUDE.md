# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`gha-docgen` is a CLI tool that automatically generates Markdown documentation from GitHub Actions metadata (action.yml).
It searches for specific comment sections in README.md (`<!-- gha-{description|inputs|outputs}-{start|end} -->`) and replaces them with content from action.yml.

## Commands

### Development Commands

```bash
# Build
pnpm build

# Dev execution (builds and runs dist/bin.js)
pnpm dev

# Run tests
pnpm test

# Run tests with snapshot update
pnpm test:update

# Run tests in watch mode
pnpm test:watch

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format (lint fix + prettier)
pnpm format
```

### CLI Usage Examples

```bash
# Default execution (uses README.md and action.yml)
pnpm dev

# Specify different file or action
pnpm dev -- docs.md --action "./subdir/action.yml"

# Specify output style
pnpm dev -- --style "table"
pnpm dev -- --style "section:h2"

# Debug mode
pnpm dev -- --debug
```

## Architecture

### Entry Point and Flow

1. `src/bin.ts` - CLI entry point

   - Parses CLI arguments with meow
   - Validates flags using zod schema
   - Calls `main()` function

2. `src/main.ts` - Core logic

   - Reads and parses action.yml (YAML)
   - Validates against action schema
   - Reads target markdown files
   - Transforms content via `docgen()` function
   - Writes transformed content to files

3. `src/docgen.ts` - Document generation
   - Detects sections using regex (`<!-- gha-*-start -->` ~ `<!-- gha-*-end -->`)
   - Replaces sections via `inject()` function
   - Outputs in section or table format based on `style`

### Schema and Type Definitions

- `src/schema.ts` - Type definitions using zod

  - `Action` type: Represents action.yml structure
  - `DocgenStyle` type: Output styles ("section:h1" ~ "section:h6", "table")

- `src/schema.factory.ts` - Factory functions for testing

### Utilities

- `src/utils.ts`
  - File I/O (tuple-based error handling)
  - Newline conversions (`nl2br`, `nl2md`, `nl2space`)
  - Zod error message generation

### Test Structure

- `src/__snapshots__/` - vitest snapshots
- `src/*.test.ts` - Unit tests for each module
  - `docgen.test.ts` - Output pattern tests for different styles
  - `main.test.ts` - File reading and error handling tests
  - `utils.test.ts` - Newline conversion tests

## Build and Packaging

- **Build tool**: tsup
- **Target**: node16
- **Format**: ESM
- **Entry**: `src/bin.ts` → `dist/bin.js`
- **Published files**: `dist/` only

## Output Style Mechanisms

### section:h{n}

Outputs in section format with heading level n (1-6). For inputs, includes metadata like `Required`, `Default`, `Deprecated`.

### table

Outputs in table format. Newlines are converted to `<br />`, and `|` characters are escaped.

## Key Dependencies

- **meow**: CLI argument parsing
- **yaml**: action.yml parsing
- **zod**: Schema validation
- **debug**: Debug logging
- **vitest**: Test execution
- **tsup**: Build tool

## Coding Standards

### Comments and Documentation

- Write all comments in English
  - Inline comments, JSDoc, configuration files (JSON5, etc.)
  - Ensures consistency and accessibility for international contributors

## Commit Message Convention

This project uses **Conventional Commits** (Angular preset) enforced by commitlint.

### Rules

- Follow the format: `type(scope?): subject`
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, etc.
- **Subject**: Brief description in imperative mood
- **Body**: Optional detailed explanation
  - **Important**: Each line must not exceed 100 characters
  - Use multiple lines if needed to stay within the limit

### Examples

```bash
# Good - body lines are under 100 characters
docs: add CLAUDE.md for AI assistant context

Add CLAUDE.md file to provide guidance to Claude Code when
working in this repository. This includes project overview,
development commands, architecture details, and key dependencies.

# Bad - body line exceeds 100 characters
docs: add CLAUDE.md for AI assistant context

Add CLAUDE.md file to provide guidance to Claude Code when working in this repository.
```
