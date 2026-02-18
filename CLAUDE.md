# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

- **Repository:** `momtchilbotev/metalcutting-hub`
- **License:** MIT
- **Status:** Early / greenfield — no application code has been committed yet

## MCP Configuration

The Supabase MCP server is configured in `.vscode/mcp.json` and available for database operations:

```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=tpjlvwuvxuhyrzsfjmof"
    }
  }
}
```

When working with the database, use the Supabase MCP tools.
But when need DB migrations use "apply-migration" (after approval) instead of DDL operation.
## Code Conventions

When generating or scaffolding code:

- Default to **TypeScript** (`.ts` / `.tsx`) unless the user explicitly asks for JavaScript
- Prefer **ES module** syntax (`import` / `export`) over CommonJS (`require`)
- Place environment-specific config in `.env` files (already git-ignored)
- Keep dependencies minimal; prefer well-maintained, widely-adopted packages

## Directory Structure (to establish)

| Area | Convention |
|---|---|
| Source code | `src/` directory |
| Tests | Co-located `__tests__/` or `*.test.ts` files next to the modules they test |
| Build output | `dist/` (git-ignored) |
| CI/CD | `.github/workflows/` |
| Docs | `docs/` or project root `README.md` |

## Notes

- This repo is currently empty — there are **no existing patterns to follow yet**. When scaffolding features, propose a clean structure following the conventions above.
- Do not assume a specific framework (Next.js, Vite, Express, etc.) unless the user specifies one or a `package.json` is present.
- Update this file as architecture, workflows, and conventions are established.
