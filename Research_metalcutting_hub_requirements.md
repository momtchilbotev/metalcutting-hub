# Research: Metalcutting-Hub SAAS Requirements & Tech Stack

*Research Date: February 15, 2026*

---

## Executive Summary

This document outlines the comprehensive requirements and recommended technology stack for building **Metalcutting-Hub**, a Bulgarian marketplace SAAS similar to Bazar.bg and OLX.bg, focused on metalcutting tools, measuring equipment, spare parts, and documentation.

---

## Part 1: Business Requirements Analysis

### 1.1 Core Functionality (Based on Bazar.bg/OLX.bg Analysis)

**User Features:**
- User registration & authentication (email, Google OAuth)
- Profile management with watchlist/favorites
- Ad posting with multiple photo uploads
- Category-based browsing
- Location-based filtering (all Bulgarian cities + regions)
- Search with filters (price, location, date, category)
- In-app messaging between buyers and sellers
- "Watch/Observe" listings functionality

**Admin Features:**
- Ad moderation and approval workflow
- User management
- Category management
- Analytics dashboard
- Featured/promoted listings management

**Monetization Models:**
1. **Free basic listings** (market entry strategy)
2. **Premium featured listings** (top placement in search)
3. **Bumping/refreshing listings** (pay to re-list at top)
4. **Urgent/Priority badges** (visual prominence)
5. **Monthly subscription** for power sellers
6. **Commission on transactions** (if integrating payments)

---

### 1.2 Bulgarian Market Specific Requirements

**Localization (bg-BG):**
- Bulgarian language interface (primary)
- Optional English for broader reach
- Currency: Bulgarian Lev (BGN) with EUR conversion (official rate: 1 EUR = 1.95583 BGN)
- Date/time formatting: DD.MM.YYYY format
- Number formatting: comma as decimal separator, space as thousands separator

**Bulgarian Cities & Regions to Support:**
- Major cities: Sofia, Plovdiv, Varna, Burgas, Ruse, Stara Zagora, Pleven, Dobrich
- All 28 administrative districts (oblasti)
- "Ivŭn stranata" (Outside country) option

**Payment Integration Options for Bulgaria:**
- **Stripe** (fully supported in Bulgaria as of 2025)
- **PayPal** (widely accepted)
- **Local options**: ePay, Paynetics, eMerchantPay, Icard
- **Bulgarian carriers**: Ekont shipping integration (very popular)

---

## Part 2: Technical Requirements

### 2.1 Database Schema Requirements

**Core Tables Needed:**
```
users                 - User accounts, profiles, authentication
categories            - Hierarchical categories for metalcutting items
listings              - Product/service ads
listing_images        - Multiple images per listing
messages              - Buyer-seller communication
watchlist             - User favorites/watched items
reviews               - User reputation/ratings
premium_listings      - Paid featured ads
transactions          - Payment records (optional)
locations             - Bulgarian cities/regions
```

**Key Relationships:**
- User → Listings (one-to-many)
- Listing → Images (one-to-many)
- User → Watchlist (one-to-many)
- Listing → Messages (one-to-many)

### 2.2 Security & Compliance Requirements

**GDPR Compliance (Essential for EU/Bulgaria):**
- Explicit consent for data processing
- Right to data export (GDPR data portability)
- Right to account deletion
- Privacy policy page
- Cookie consent banner
- Data breach notification procedures

**Authentication Best Practices (2025-2026):**
- Passwordless authentication (magic links)
- Multi-Factor Authentication (MFA)
- JWT-based sessions
- Secure password hashing (Argon2 or bcrypt)
- OAuth 2.0 for social login (Google)

**Platform Security:**
- Row-Level Security (RLS) for multi-tenant data isolation
- Input validation & sanitization
- XSS protection
- CSRF tokens
- Rate limiting on APIs
- Content Security Policy (CSP)

---

### 2.3 Search & Filtering Requirements

**Essential for Marketplace UX:**
- Full-text search across titles and descriptions
- Faceted search (category, price range, location, condition)
- Auto-suggest/search autocomplete
- Recently viewed items
- "Similar items" recommendations

**Search Engine Options:**
| Solution | Pros | Cons | Best For |
|----------|------|------|----------|
| **Meilisearch** | Fast, open-source, easy API | Less mature than ES | MVP & growing marketplaces |
| **Algolia** | Excellent UX, analytics | Expensive ($10k+/year) | Enterprise-scale |
| **Elasticsearch** | Powerful, highly customizable | Complex setup | Advanced requirements |
| **PostgreSQL Full-Text** | No additional infrastructure | Limited features | MVP, small dataset |

---

### 2.4 Image & Media Requirements

- Image upload (multiple photos per listing)
- Image optimization & compression
- CDN delivery (CloudFlare, CloudFront)
- Image moderation (prevent inappropriate content)
- Thumbnail generation
- Max file size limits
- Supported formats: JPG, PNG, WebP

---

## Part 3: Recommended Tech Stack (2025-2026)

### 3.1 Frontend Stack

**Option A: Modern Web-First (Recommended for MVP)**
```
Framework:     Next.js 15/16 (React 19)
Language:      TypeScript
Styling:       Tailwind CSS or shadcn/ui
State:         Zustand or React Context
Forms:         React Hook Form + Zod validation
i18n:          next-intl or next-i18next
```

**Why Next.js?**
- Server-Side Rendering (SSR) for SEO (critical for marketplace)
- API routes for backend
- Excellent performance
- Large ecosystem & community
- Vercel deployment optimization

### 3.2 Mobile App (Phase 2)

**Cross-Platform Options:**

| Framework | Language | Performance | Time to Market | Recommendation |
|-----------|----------|-------------|----------------|----------------|
| **Flutter** | Dart | 20% faster than RN | Excellent | **Best for marketplaces** |
| **React Native** | JavaScript/TS | Good | Good | If web is React/Next.js |
| **Progressive Web App** | - | Moderate | Fastest | Start here before native |

**Flutter vs React Native (2025-2026):**
- Flutter compiles to native ARM code (faster startup, lower memory)
- Flutter offers more consistent UI across platforms
- React Native has better ecosystem if web is already React

### 3.3 Backend Stack

**Option A: Supabase (Recommended - Already Configured)**
```
Backend:       Supabase (PostgreSQL + Auth + Storage)
Database:     PostgreSQL 17
Auth:         Supabase Auth (built-in)
Storage:      Supabase Storage (images)
Real-time:    Supabase Realtime (messaging)
Edge Functions: Deno-based serverless functions
```

**Why Supabase?**
- Already configured in project
- PostgreSQL with RLS built-in
- Built-in authentication (email, OAuth)
- File storage included
- Real-time subscriptions for messaging
- Auto-generated TypeScript types
- Free tier generous for MVP

**Option B: Custom Node.js Backend**
```
Runtime:       Node.js with Bun or Deno
Framework:     Hono, Fastify, or Express
ORM:           Drizzle ORM or Prisma
Validation:    Zod
Auth:         Lucia Auth or NextAuth.js
```

### 3.4 Database

**PostgreSQL (Recommended)**
- ACID compliance built-in
- Strong data consistency & integrity
- Full-text search capabilities
- JSON support for flexible attributes
- Already in Supabase stack
- Better for structured data vs MongoDB

**Extensions to Consider:**
- `pg_trgm` - fuzzy text matching
- `postgis` - location-based queries
- `pgcrypto` - encryption
- `uuid-ossp` - UUID generation

### 3.5 Deployment & Infrastructure

**Hosting Options:**

| Provider | Pros | Cons | Best For |
|----------|------|------|----------|
| **Vercel** | Best Next.js integration, edge functions | Can get expensive | Frontend |
| **Supabase Cloud** | Managed PostgreSQL, built-in auth | Vendor lock-in | Backend |
| **AWS** | Full control, scalability | Complex, expensive | Scaling phase |
| **DigitalOcean** | Simple, predictable pricing | Fewer features | MVP |

**MVP Recommendation:**
- Frontend: Vercel (free tier)
- Backend: Supabase Cloud (free tier)
- Images: Supabase Storage
- DNS: CloudFlare (free)

### 3.6 Development Tools

```
Package Manager:   pnpm (faster, more efficient)
Monorepo:         Nx or Turborepo (if scaling)
Testing:          Vitest, Playwright, MSW
Linting:          ESLint + Prettier + Biome
Type Checking:    TypeScript strict mode
CI/CD:            GitHub Actions
```

---

## Part 4: Feature Phasing Roadmap

### Phase 1: MVP (Months 1-3)
- User authentication (email + Google)
- Basic ad posting (title, description, price, location, 1 image)
- Category browsing
- Search by keyword and location
- User profile with "My Listings"
- Responsive web design

### Phase 2: Core Features (Months 3-6)
- Multiple image uploads
- In-app messaging
- Watchlist/favorites
- Advanced filters (price range, condition, date posted)
- User ratings and reviews
- Email notifications
- Mobile-responsive PWA

### Phase 3: Monetization (Months 6-9)
- Premium listing placement
- Featured ads homepage
- Payment integration (Stripe)
- Subscription plans for power sellers
- Analytics dashboard
- Admin moderation tools

### Phase 4: Scale & Polish (Months 9-12)
- Native mobile apps (Flutter)
- Advanced search with Meilisearch
- Recommendation engine
- Machine learning for fraud detection
- SMS notifications
- Multi-language support (English)

---

## Part 5: Database Schema Overview

### Core Tables Structure

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash,
  full_name,
  phone VARCHAR,
  location_id FK,
  created_at,
  updated_at,
  is_verified BOOLEAN,
  is_premium BOOLEAN
)

-- Categories (hierarchical)
categories (
  id UUID PRIMARY KEY,
  name VARCHAR,
  slug VARCHAR UNIQUE,
  parent_id FK (self-reference),
  icon_url,
  sort_order
)

-- Listings
listings (
  id UUID PRIMARY KEY,
  user_id FK,
  category_id FK,
  title VARCHAR,
  description TEXT,
  price DECIMAL,
  currency VARCHAR DEFAULT 'BGN',
  condition VARCHAR, -- new, used, refurbished
  location_id FK,
  status VARCHAR, -- active, sold, draft, expired
  is_featured BOOLEAN,
  is_urgent BOOLEAN,
  views_count INTEGER,
  created_at,
  expires_at
)

-- Listing Images
listing_images (
  id UUID PRIMARY KEY,
  listing_id FK,
  storage_path VARCHAR,
  order_index INTEGER,
  is_primary BOOLEAN
)

-- Bulgarian Locations
locations (
  id UUID PRIMARY KEY,
  name VARCHAR, -- "гр. София"
  name_en VARCHAR, -- "Sofia"
  type VARCHAR, -- city or region
  parent_id FK
)

-- Messages
messages (
  id UUID PRIMARY KEY,
  listing_id FK,
  sender_id FK,
  receiver_id FK,
  content TEXT,
  is_read BOOLEAN,
  created_at
)

-- Watchlist
watchlist (
  user_id FK,
  listing_id FK,
  created_at,
  PRIMARY KEY (user_id, listing_id)
)
```

---

## Part 6: Estimated Costs (Bulgaria)

### Development Costs (First Year)
| Item | Monthly | Annual |
|------|---------|--------|
| Supabase Pro | ~$25 | $300 |
| Vercel Pro | ~$20 | $240 |
| Domain | ~$1 | $12 |
| Custom emails | ~$3 | $36 |
| **Total (MVP)** | **~$50** | **~$600** |

### Scaling Costs (Year 2+)
| Item | Monthly | Annual |
|------|---------|--------|
| Supabase (scale) | ~$100+ | $1,200+ |
| Meilisearch hosting | ~$50 | $600 |
| CDN (CloudFlare) | ~$20 | $240 |
| Developer tools | ~$50 | $600 |
| **Total (Scale)** | **~$220+** | **~$2,640+** |

---

## Part 7: Legal & Compliance (Bulgaria)

### Requirements Checklist
- [ ] Register as legal entity (EOOD or AD)
- [ ] VAT registration (if annual revenue > BGN 50,000)
- [ ] Terms of Service page
- [ ] Privacy Policy page (GDPR compliant)
- [ ] Cookie consent implementation
- [ ] User data export functionality
- [ ] Account deletion process
- [ ] Data breach notification procedure
- [ ] Personal Data Protection Commission registration

### Bulgarian E-Commerce Act
- Clear pricing in BGN
- Seller identification information
- Order confirmation emails
- Return policy documentation
- Contact information prominently displayed

---

## Part 8: Marketing & Growth Strategy

### Initial Launch Strategy
1. **Target Bulgarian metalworking communities**
2. **Facebook/Instagram ads** targeting manufacturing professionals
3. **Partnerships with**:
   - Metalworking training centers
   - Industrial equipment suppliers
   - Technical universities (TU Sofia, etc.)
4. **SEO focus**: "машини за рязане на метали", "резбофрези", "металорежещи инструменти"

### Growth Metrics to Track
- Monthly active users (MAU)
- Listings posted per day
- Message response rate
- Conversion rate (listing → sold)
- User retention rate

---

## Part 9: Recommended Project Structure

```
metalcutting-hub/
├── apps/
│   ├── web/              # Next.js frontend
│   └── mobile/           # Flutter app (Phase 2)
├── packages/
│   ├── ui/               # Shared UI components
│   ├── config/           # ESLint, TSConfig, etc.
│   ├── types/            # Shared TypeScript types
│   └── db/               # Database migrations & seeds
├── supabase/
│   ├── migrations/       # SQL migrations
│   ├── functions/        # Edge functions
│   └── seed.sql          # Sample data
├── docs/                 # Project documentation
└── README.md
```

---

## Sources & References

1. Sharetribe - How to build a website like OLX
2. Medium - 10 Marketplace Monetisation Strategies
3. Webscension - Best Tech Stack for Marketplace in 2026
4. Bazar.bg - Feature analysis (direct observation)
5. Stripe - Payments in Bulgaria guide
6. SecurePrivacy - SaaS Privacy Compliance 2025
7. Meilisearch - Marketplace Search Engine Guide
8. UlanSoftware - Best Stack to Build Marketplace Platform
9. CMS Law - E-commerce in Bulgaria Guide
10. Richestsoft - Build a Classified App Like OLX

---

## Next Steps

This research provides the foundation for building Metalcutting-Hub. The recommended approach is:

1. **Start with Supabase + Next.js** (already configured)
2. **Build MVP with core features** (auth, listings, search)
3. **Iterate based on user feedback**
4. **Add monetization when you have traction**
5. **Consider mobile apps after web validation**

The tech stack chosen balances:
- **Development speed** (using established, well-documented tools)
- **Cost-effectiveness** (generous free tiers)
- **Scalability** (can grow with the business)
- **Local market needs** (Bulgarian localization, payment options)
