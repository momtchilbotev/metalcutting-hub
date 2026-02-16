# Metalcutting-Hub

A Bulgarian marketplace SAAS for buying and selling metalcutting tools, measuring equipment, spare parts, and documentation. Similar to Bazar.bg and OLX.bg but focused specifically on the metalworking industry.

## Status

**Active Development** — Core application is built and functional. MVP feature set is largely complete.

## What's Built

### Frontend Architecture
- **Build System**: Vite with ES modules
- **UI Framework**: Bootstrap 5.3.8
- **Client-side Routing**: Custom router implementation
- **Language**: JavaScript (vanilla, no framework)

### Pages Implemented

| Category | Pages |
|----------|-------|
| **Public** | Home, Login, Register |
| **Listings** | List view, Details, Create, Edit |
| **User** | Profile, My Listings, Watchlist |
| **Admin** | Dashboard, Listings, Users, Categories, Audit |
| **Messages** | Messages page |

### Services & Architecture

| Layer | Components |
|-------|------------|
| **Services** | Auth (Supabase), Listings CRUD, Storage (images), Admin |
| **Utilities** | Validators, Formatters, Helpers, Supabase client |
| **Components** | Navbar, Footer, ListingCard, Toast notifications |

### Backend
- **Supabase**: PostgreSQL + Auth + Storage
- **MCP**: Supabase MCP server configured in `.vscode/mcp.json`

## Tech Stack

| Area | Technology |
|------|------------|
| **Frontend** | Vanilla JavaScript + Vite |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Database** | PostgreSQL with Row-Level Security |
| **Styling** | Bootstrap 5 + Custom CSS + Sass |
| **Language** | Bulgarian (bg-BG) primary |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Documentation

- **[Research & Requirements](./Research_metalcutting_hub_requirements.md)** - Comprehensive research on marketplace SAAS requirements, tech stack recommendations, and Bulgarian market considerations

## Remaining Work

- [ ] TypeScript migration (optional)
- [ ] Testing suite (no tests yet)
- [ ] Framework decision (stay vanilla or migrate to Next.js)
- [ ] Production deployment configuration
- [ ] Additional features (payments, advanced search, etc.)

## License

MIT
