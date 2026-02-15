# Copilot Instructions — metalcutting-hub

## Project Overview

- **Repository:** `momtchilbotev/metalcutting-hub`
- **License:** MIT
- **Status:** Early / greenfield — no application code has been committed yet.
- **Intended stack:** Node.js (inferred from the `.gitignore`, which covers `node_modules/`, TypeScript build info, Next.js, Vite, Nuxt, and other JS ecosystem tooling).

## When Generating or Scaffolding Code

- Default to **TypeScript** (`.ts` / `.tsx`) unless the user explicitly asks for JavaScript.
- Prefer **ES module** syntax (`import` / `export`) over CommonJS (`require`).
- Place environment-specific config in `.env` files (already git-ignored).
- Keep dependencies minimal; prefer well-maintained, widely-adopted packages.

## Repository Conventions (to establish early)

| Area | Convention |
|---|---|
| Source code | `src/` directory |
| Tests | Co-located `__tests__/` or `*.test.ts` files next to the modules they test |
| Build output | `dist/` (git-ignored) |
| CI/CD | `.github/workflows/` |
| Docs | `docs/` or project root `README.md` |

## Key Files

| File | Purpose |
|---|---|
| `README.md` | Project description (currently placeholder) |
| `.gitignore` | Ignores Node.js, TypeScript, and common JS-framework artifacts |
| `LICENSE` | MIT license, © 2026 momtchilbotev |

## Notes for AI Agents

- This repo is empty — there are **no existing patterns to follow yet**. When the user asks you to scaffold features, propose a clean structure following the conventions table above.
- Update this file as architecture, workflows, and conventions are established.
- Do not assume a specific framework (Next.js, Vite, Express, etc.) unless the user specifies one or a `package.json` is present.
