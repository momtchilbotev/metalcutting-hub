# Copilot Instructions — metalcutting-hub

## Project Overview

- **Repository:** `momtchilbotev/metalcutting-hub`
- **License:** MIT
- **Status:** Active development

## Architecture and Tech Stack

Classical client-server application:

| Layer | Technology |
|---|---|
| Front-end | Vanilla JS, Bootstrap, HTML, CSS |
| Back-end | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Build tools | Vite, npm |
| API | Supabase REST API |
| Hosting | Netlify |
| Source control | GitHub |

## Modular Design

- Use modular code structure with separate files for different components, pages, and features
- Use ES6 modules to organize the code
- Source code lives in `src/` directory

## UI Guidelines

- Use HTML, CSS, Bootstrap, and Vanilla JS for the front-end
- Use Bootstrap components and utilities for responsive, user-friendly interfaces
- Implement modern, responsive UI design with semantic HTML
- Use consistent color scheme and typography throughout the app
- Use appropriate icons, effects, and visual cues to enhance usability

## Pages and Navigation

- Split the app into multiple pages: login, registration, project list, taskboard, admin panel, etc.
- Implement pages as reusable components (HTML, CSS, and JS code)
- Use routing to navigate between pages
- Use full URLs: `/`, `/login`, `/register`, `/projects`, `/projects/{id}/tasks`, `/admin`, etc.

## Backend and Database

- Use Supabase as the backend and database
- Use PostgreSQL with tables for users, projects, tasks, etc.
- Use Supabase Storage for file uploads (e.g., task attachments)
- **Always use migrations for schema changes** — keep a copy of migration SQL files in the code
- **Never edit existing migrations** after they've been applied — create a new migration instead
- Use Supabase mcp tools for managing migrations and database changes. For pulling migrations use 'supabase_migrations.schema_migrations' table that has a statements column, containing the original with SQL of each migration.

## Authentication and Authorization

- Use Supabase Auth for user authentication and authorization
- Implement RLS (Row Level Security) policies to restrict data access based on user roles and permissions
- User roles are stored in a separate `user_roles` table with an enum `roles` (e.g., `admin`, `user`)

## Code Conventions

| Area | Convention |
|---|---|
| Language | TypeScript (`.ts` / `.tsx`) or JavaScript (`.js` / `.jsx`) |
| Module syntax | ES modules (`import` / `export`) |
| Source code | `src/` directory |
| Tests | Co-located `__tests__/` or `*.test.ts` files |
| Build output | `dist/` (git-ignored) |
| CI/CD | `.github/workflows/` |
| Docs | `docs/` or project root `README.md` |
| Environment config | `.env` files (git-ignored) |
| Dependencies | Minimal; prefer well-maintained, widely-adopted packages |

## Notes for AI Agents

- Follow existing patterns in the codebase when making changes
- Update this file as architecture, workflows, and conventions evolve
