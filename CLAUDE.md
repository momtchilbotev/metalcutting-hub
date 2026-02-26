# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bulgarian marketplace SAAS for buying/selling metalcutting tools, measuring equipment, spare parts, and documentation. Similar to Bazar.bg and OLX.bg but focused on the metalworking industry.

## Development Commands

```bash
npm run dev      # Start Vite dev server (port 3000)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

**Vanilla JavaScript SPA** with modular architecture:

```
src/
├── index.html              # Main HTML template
├── pages/                  # Page components by feature
│   ├── auth/               # Login, Register
│   ├── listings/           # List, Details, Create, Edit
│   ├── user/               # Profile, My Listings, Watchlist
│   ├── admin/              # Admin panel pages
│   └── moderator/          # Moderator panel pages
├── scripts/
│   ├── components/         # Navbar, Footer, ListingCard, Toast
│   ├── services/           # auth, listings, admin, moderator, contact
│   ├── utils/              # supabaseClient, validators, formatters, helpers
│   ├── router.js           # Client-side router with route guards
│   └── main.js             # App entry point
└── styles/
    └── main.css
```

### Key Patterns

- **Pages**: Classes with `render()` and `destroy()` lifecycle methods
- **Router**: Custom implementation in `router.js` with auth/role guards and dynamic imports
- **Services**: Centralized business logic, all data through Supabase
- **Components**: Reusable UI elements (Navbar, Footer, Toast notifications)

## Backend (Supabase)

- **Database**: PostgreSQL with Row-Level Security
- **Auth**: Supabase Auth with three roles: `user`, `moderator`, `admin`
- **Storage**: Buckets for `listing-images`, `category-icons`, `avatars`

### Database Migrations

- **Always use migrations for schema changes** — keep SQL copies in code
- **Never edit applied migrations** — create a new migration instead
- Use Supabase MCP tools for migrations; for pulling existing migrations query `supabase_migrations.schema_migrations` (has `statements` column with original SQL)

## MCP Configuration

Supabase MCP server in `.vscode/mcp.json`:
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
- **Always use migrations for schema changes** — keep a copy of migration SQL files in the code
- **Never edit existing migrations** after they've been applied — create a new migration instead
- Use Supabase mcp tools for managing migrations and database changes. For pulling migrations use 'supabase_migrations.schema_migrations' table that has a statements column, containing the original with SQL of each migration.
When need DB migrations use "apply-migration" (after approval) instead of DDL operation.

## Code Conventions
When generating or scaffolding code:
- Prefer **ES module** syntax (`import` / `export`) over CommonJS (`require`)
- Place environment-specific config in `.env` files (already git-ignored)
- Keep dependencies minimal; prefer well-maintained, widely-adopted packages
| Area | Convention |
|---|---|
| Language | JavaScript (ES modules) |
| Module syntax | `import` / `export` |
| Source code | `src/` directory |
| Build output | `dist/` (git-ignored) |
| Styling | Bootstrap 5 + Custom CSS/SCSS |
| Primary language | Bulgarian (bg-BG) |
| Currency | BGN |

## Core Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User data (extends auth.users), roles |
| `listings` | Marketplace items with status workflow |
| `categories` | Hierarchical category structure |
| `locations` | Bulgarian cities/regions |
| `messages` | User-to-user messaging |
| `reports` | User reports for moderation |
| `admin_audit_log` | Admin action audit trail |
| `contact_submissions` | Contact form submissions |

See README.md for complete schema documentation.

## Notes

-  When scaffolding features, propose a clean structure following the conventions above.
- Do not assume a specific framework (Next.js, Express, etc.) unless the user specifies one or a `package.json` is present.
- Update this file as architecture, workflows, and conventions are established.
