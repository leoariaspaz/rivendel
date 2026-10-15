# Rivendel — Backend

API server for Rivendel, a case management platform for labor conciliators designated under DICLO (Dirección de Conciliación Laboral Obligatoria) in Santiago del Estero, Argentina.

[Frontend repo](https://github.com/leoariaspaz/rivendel-client) · [Case study](https://github.com/leoariaspaz/leoariaspaz/blob/main/doc/case-studies/conciliaciones.md)

## Live Demo
[Try the live API](https://rivendel-h23y.onrender.com/) — demo credentials available on request (reach out via [LinkedIn](https://www.linkedin.com/in/leonardo-arias-paz)).

## Overview

This backend serves the Rivendel frontend, exposing a REST API for managing labor claims, claim parties (claimants and respondents), their sponsoring counsels, settlement clause drafting, user accounts, and Google Calendar synchronization for scheduling conciliation hearings.

## Tech Stack

- **Framework:** NestJS
- **ORM:** Prisma
- **Database:** MySQL (hosted on Aiven)
- **Auth:** JWT with refresh tokens, cross-domain session cookies
- **Validation:** Joi (environment config), class-validator (DTOs)
- **Security:** `@nestjs/throttler` (rate limiting), `helmet`, JWT with refresh tokens
- **Deployment:** Render

## Architecture

```mermaid
flowchart LR
  subgraph frontend["<div style='font-size:20px; margin-top:10px;'>Frontend</div>"]
      web["🌐 Website"]
  end

  subgraph backend["<div style='font-size:20px; font-weight:bold; margin-top:10px;'>Backend</div>"]
      api["⚙️ API Server"]
      subgraph services["<div style='font-size:14px; font-weight:bold; margin-top:10px;'>Servicios / Integraciones</div>"]
          bank["🏦 Bank"]
          db[("🛢️️ Database")]
          google["📅 Google Calendar"]        
      end
  end

  web --> api
  api --> bank
  api --> db
  api --> google

%% Estilos de alto contraste optimizados
    style frontend fill:#f1f5f9,stroke:#64748b,stroke-width:1px
    style backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style services fill:#fffde7,stroke:#fbc02d,stroke-width:2px
    
    style web fill:#ffffff,stroke:#64748b,stroke-width:1px
    style api fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style bank fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style db fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style google fill:#fff9c4,stroke:#fbc02d,stroke-width:2px

    linkStyle default stroke:#0288d1,stroke-width:2px;
```

The backend and frontend run on different domains, which required secure, partitioned, cross-domain session cookies (`httpOnly`, `sameSite: 'none'`, `secure: true`, `partitioned: true`) instead of relying on same-origin defaults.

## Data Model

![Entity-relationship diagram](/doc/images/er-diagram.png)

The data model is built around claims (`Reclamos`) and the parties involved in them (`Parte`), linked through `PartesReclamos`, which also stores the per-claim role (claimant or respondent), the contact numbers and the attendance flags of both the party and its sponsoring counsel. Claims and parties belong to a user and are isolated per account, while sponsoring counsels (`Patrocinante`) and document types (`TipoDocumento`) are reference data shared across all users. Resolution types are defined as constants in the application rather than as a table.

## API Documentation

The API is documented with OpenAPI (Swagger), and the interactive documentation is available at [render.com](https://rivendel-h23y.onrender.com/), where every endpoint, DTO and response can be explored and tried out. Access requires authentication: sign in with a user account to try the endpoints (demo credentials available on request, as for the live demo).

## Key Technical Decisions

### 1. Selective multi-user data isolation

User isolation is implemented at the data layer via a `userId` foreign key on user-owned tables, validated against a dedicated users table. Claims and parties are scoped per user and never visible across accounts. Sponsoring counsels, however, are deliberately shared across all users rather than duplicated per account, since they represent the actual pool of local-jurisdiction lawyers — a real-world entity that exists independently of which conciliator is using the system, making per-user duplication both incorrect and wasteful.

### 2. Diagnosing TLS and driver-level database connectivity issues with Aiven

Connecting to a managed MySQL instance on Aiven surfaced a chain of infrastructure-level problems that don't show up in local development: DNS resolution failures, TLS/SSL handshake errors with the MariaDB client, and IP allowlist restrictions that had to be configured against Render's outbound IPs. Resolving this required working through certificate handling (the CA certificate is injected through an environment variable, written to disk at startup and loaded with `NODE_EXTRA_CA_CERTS`), careful staged testing of IP filtering rules to avoid locking out the production database, and debugging shadow-database permission errors and migration checksum drift along the way.

### 3. OAuth2 over a service account for Google Calendar integration

Scheduling conciliation hearings required syncing events to each conciliator's own Google Calendar, not a shared service account calendar. This meant implementing a full OAuth2 flow — `access_type: 'offline'` and `prompt: 'consent'` to obtain refresh tokens, and passing `userId` through the OAuth `state` parameter — with refresh tokens stored in MySQL via Prisma, so each user authorizes and syncs to their own calendar.

### 4. Keeping a free-tier backend awake

Render's free tier spins down the service after about 15 minutes of inactivity, which is unacceptable for a production tool conciliators rely on during working hours. Instead of a plain cron job, the backend is kept warm with Upstash QStash: scheduled messages are queued every 14 minutes, just under Render's inactivity threshold, and delivered to a dedicated endpoint on the backend. That endpoint is protected by a guard that verifies the `Upstash-Signature` header, so only requests actually signed by QStash are accepted. The global rate limiter runs before that guard, which means forged requests are cut off before any signature verification is attempted.

### 5. Layered application-level protection for a free-tier deployment

The production and demo environments run on free tiers (Render, Aiven), so the real risk is not volumetric network attacks, which the platform and Vercel's CDN already filter, but application-level abuse of expensive endpoints and exhaustion of the database connection limit. The API registers `@nestjs/throttler` as a global guard with a default limit of 100 requests per minute per IP, and stricter limits on the endpoints that are unauthenticated or costly: 5 requests per minute on login, and a tight limit on the endpoint that queries the third-party bank API. Because Render sits behind a reverse proxy, the app sets `trust proxy` so the limiter sees the client's real IP instead of the proxy's. `helmet` adds standard security headers, request validation uses a `ValidationPipe` with `whitelist: true`, listings are paginated with a hard cap on page size, and the Prisma connection pool is limited through the connection string so a traffic spike can't exhaust the managed database's connections. Cloudflare with Turnstile in front of the API was evaluated and deliberately deferred, since it requires a custom domain and the current measures cover the observed risk.

### 6. Short-lived access tokens with rotating, revocable refresh tokens

Authentication uses two JWTs signed with different secrets. The access token is short-lived and held only in the frontend's memory, so it is never exposed to persistent storage. The refresh token is long-lived and travels exclusively in an `httpOnly` cookie whose `Path` is restricted to the refresh endpoint, which keeps it out of reach of client-side scripts and prevents the browser from sending it on any other request. On every refresh the server issues a new refresh token and invalidates the previous one (rotation), and the current token is persisted against the user record, so a token that has already been used or replaced no longer matches and is rejected. Logout clears that stored value, which revokes the session on the server instead of merely deleting the cookie in the browser. Since the access token lives in memory, a page reload loses it, and the frontend recovers it transparently by calling the refresh endpoint with the cookie.

### 7. Other Technical Notes

- **Bank verification integration:** Verifying CBU (bank account) data for settlement payments requires querying a third-party banking API protected by F5 BIG-IP anti-bot measures and a Java session (`JSESSIONID`). This is handled with a dedicated axios client using a cookie jar (`axios-cookiejar-support` + `tough-cookie`) that performs a warm-up request before hitting the real endpoint.
- **Environment configuration:** Multi-environment config via NestJS `ConfigModule` with Joi schema validation and dynamic `envFilePath` resolution; secrets are injected directly in production via Render's Secret Files feature.
- **Composed read model for document generation:** `GET /reclamos/:id` does not return a bare claim record. It returns a composed view of the claim together with its parties, their sponsoring counsels and the conciliator who owns it, resolved in a single database request and scoped to the authenticated user. That is everything the frontend needs to generate the conciliation record as a PDF in one round trip, without assembling it from several calls and without any risk of reading another conciliator's data.

*For the end-to-end story of the project and the frontend decisions (form state, rich-text documents and PDF generation, onboarding tour), see the [case study](https://github.com/leoariaspaz/leoariaspaz/blob/main/doc/case-studies/conciliaciones.md) and the [frontend repository](https://github.com/leoariaspaz/rivendel-client).*

## Features

- Authentication with short-lived JWT access tokens and rotating, revocable refresh tokens
- Multi-user support with per-user data isolation, plus sponsoring counsels shared across all users
- Management of labor claims, claim parties, sponsoring counsels and document types, with a composed claim view that serves as the data source for generating the conciliation record
- Settlement clauses stored as rich-text (Tiptap) documents and validated on the server
- Google Calendar integration through OAuth 2.0, syncing each conciliator's hearings to their own calendar
- CBU verification against a third-party bank API
- Interactive, authenticated API documentation (Swagger / OpenAPI)
- Health endpoint and a signature-verified endpoint for the QStash keep-alive
- Rate limiting, security headers, request validation and paginated listings
- Maintenance scripts for creating users, updating passwords and bulk import/export of sponsoring counsels

## Project Structure

```text
rivendel/
├─ doc/db/
│  └─ diagram.db                          # Database diagram
├─ prisma/
│  ├─ migrations/                         # Prisma migrations
│  └─ schema.prisma                       # Data model
├─ scripts/                               # Maintenance scripts
│  ├─ create-user.ts                      # Create a user
│  ├─ update-password.ts                  # Update a user's password
│  ├─ export-patrocinantes.ts             # Export sponsoring counsels
│  ├─ import-patrocinantes.ts             # Import sponsoring counsels
│  ├─ jwt-secret-generator.sh             # Generate JWT secrets
│  └─ prisma.service.ts                   # Prisma client used by the scripts
├─ src/
│  ├─ auth/                               # Authentication and session
│  │  ├─ dto/                             # Login, refresh and logout DTOs
│  │  ├─ local.strategy.ts / local.guard.ts          # Credentials login
│  │  ├─ jwt.strategy.ts / jwt.guard.ts              # Access token validation
│  │  ├─ jwt-refresh.strategy.ts / jwt-refresh.guard.ts  # Refresh token validation and rotation
│  │  ├─ qstash.guard.ts                  # Upstash-Signature verification
│  │  ├─ public.decorator.ts              # Marks routes as public
│  │  └─ skip-jwt.decorator.ts            # Skips the JWT guard on a route
│  ├─ banking/                            # CBU verification against the third-party bank API
│  ├─ config/                             # Typed configuration and Joi environment validation
│  ├─ google-calendar/                    # Google Calendar OAuth 2.0 and event sync
│  ├─ health/                             # Health endpoint
│  ├─ partes/                             # Claim parties (claimants and respondents)
│  ├─ partes-reclamos/                    # Relationship between parties and claims
│  ├─ patrocinantes/                      # Sponsoring counsels (shared across users)
│  ├─ reclamos/                           # Labor claims
│  ├─ resoluciones/                       # Resolution types and their constants
│  ├─ tipdocs/                            # Document types
│  ├─ tiptap/                             # Tiptap document types
│  ├─ users/                              # User profile and account settings
│  ├─ validators/                         # Custom validators (relations, Tiptap documents, field matching)
│  ├─ pipes/                              # Relationship validation pipe
│  ├─ shared/                             # Prisma module and service, exception filter, constants
│  ├─ app.module.ts                       # Root module
│  └─ main.ts                             # Bootstrap: CORS, helmet, trust proxy, global pipes
├─ test/
│  ├─ health.e2e-spec.ts                  # End-to-end test of the health endpoint
│  └─ jest-e2e.json                       # E2E Jest configuration
├─ eslint.config.mjs                      # ESLint
├─ knip.json                              # Unused code and dependency detection
├─ nest-cli.json                          # Nest CLI configuration
├─ package.json                           # Scripts and dependencies
├─ pnpm-lock.yaml                         # Lockfile
├─ pnpm-workspace.yaml                    # pnpm configuration
├─ tsconfig.json / tsconfig.build.json    # TypeScript configuration
└─ README.md                              # Project documentation (this file)
```

Each feature module follows the same layout: controller, service, module, DTOs, Swagger decorators and colocated `*.spec.ts` tests.

## Getting Started

### Prerequisites

- Node.js 24.11.1 (see `engines` in `package.json`), pnpm, a MySQL instance

### Installation

```bash
git clone <repo>
cd <repo>
pnpm install
```

### Environment Variables

Configuration is loaded through NestJS `ConfigModule` with a dynamic `envFilePath` based on `NODE_ENV`, so each environment has its own file (for local development, `NODE_ENV=local` with .env.local), and all values are validated against a Joi schema at startup, so the application refuses to start if a variable is missing or malformed. In production the variables are injected directly by the hosting provider (Render), and sensitive values are provided as secret files. The JWT secrets can be generated with `scripts/jwt-secret-generator.sh`. You can copy .env.example to .env.local and fill in the values with the expected schema found at [src/config/env-validation.schema.ts](src/config/env-validation.schema.ts).

```bash
# database
DATABASE_URL=                  # MySQL connection string (include pool params such as connection_limit and pool_timeout)
DATABASE_CA_CERT=              # database CA certificate, in plain text (PEM)
DATABASE_CA_TEMP_PATH=         # directory where the CA certificate file is written at startup
DATABASE_CA_NAME=              # file name used to store the CA certificate

# app
NODE_ENV=                      # runtime environment (e.g. local, production)
FRONTEND_URL=                  # base URL of the frontend (optional)
ALLOWED_ORIGINS=               # regex matching the origins allowed by CORS

# auth
JWT_ACCESS_SECRET=             # secret used to sign and verify access tokens
JWT_ACCESS_EXPIRES_IN=         # access token lifetime, in seconds
JWT_REFRESH_SECRET=            # secret used to sign and verify refresh tokens
JWT_REFRESH_EXPIRES_IN=        # refresh token lifetime, in seconds
SAME_SITE=                     # cookie SameSite policy: lax, none or strict (none requires secure cookies)
USE_SECURE_COOKIES=            # boolean, whether cookies are flagged as Secure
PATH_REFRESH_TOKEN=            # route of the token refresh endpoint; also the Path of the refresh_token cookie, so it is only sent to that route
REFRESH_TOKEN_COOKIE_MAX_AGE=  # refresh token cookie lifetime, in milliseconds

# Google Calendar (OAuth 2.0)
GOOGLE_CLIENT_ID=              # OAuth 2.0 client ID from Google Cloud
GOOGLE_CLIENT_SECRET=          # OAuth 2.0 client secret from Google Cloud
GOOGLE_REDIRECT_URI=           # URL Google redirects to after the user grants consent (must match the one registered in Google Cloud)

# Upstash QStash
QSTASH_CURRENT_SIGNING_KEY=    # current signing key, used to verify the Upstash-Signature header
QSTASH_NEXT_SIGNING_KEY=       # next signing key, used during key rotation
```

### Running locally

```bash
npx prisma migrate deploy
pnpm start:dev
```

## Testing

The test suite runs on **Jest** with `ts-jest`, `@nestjs/testing`, `supertest` and `jest-mock-extended`, and consists of 41 suites and 211 tests. Coverage sits at 97.6% of statements, 91.2% of branches, 93.5% of functions and 97.7% of lines, against a global threshold of 90% enforced on every metric, so the run fails if coverage drops below it. Tests are fully isolated: Prisma, `ConfigService`, the Google client and `axios` are replaced with strictly typed mocks, so no test touches a real database or the network. The suite covers authentication and session handling, per-user data isolation by `userId` (including the intentionally shared sponsoring counsels), CRUD operations and DTO validation, the Google Calendar OAuth2 flow, CBU verification against the third-party bank API, the signature guard that protects the QStash keep-alive endpoint, the Joi environment validation and the custom validation pipes. A small end-to-end suite exercises the `/health` endpoint over HTTP. Linting reports zero errors and zero warnings and the project type-checks cleanly, tests included, with no `eslint-disable`, `@ts-ignore` or rule overrides.

```bash
pnpm test        # run once
pnpm test:cov    # run with coverage report and threshold check
pnpm test:e2e    # end-to-end tests with supertest
```

## Related Repository

This is the backend half of a full-stack project. :link: [Frontend](https://github.com/leoariaspaz/rivendel-client) (React + Vite)

## Roadmap

These items are out of scope for the current MVP but represent natural next steps for the product:

- ARCA invoicing for settlement agreements processed in a given period.
  - Requires linking the user's account to their ARCA account (ARCA is Argentina's federal tax collection agency).
  - Each conciliation, whether settled or failed, has an associated amount based on its resolution type.
  - Each claim included in an invoice should be marked as processed, with the related invoice number attached.
  - Generated invoices should be stored, including invoice number, date, total amount, and description.

- Document management for conciliation-related files.
  - Sponsoring counsels and their parties submit documentation related to the conciliation, such as powers of attorney, salary settlement statements, and formal notices (telegrams).
  - This documentation could be stored in Google Drive folders linked to the corresponding claim.
  - This would require linking the user's account to their Google Drive, following the same OAuth2 pattern already used for Google Calendar.

- Add caching (e.g. Redis) for database queries.

- Broaden end-to-end test coverage beyond the health endpoint, exercising the authentication flow and the claims lifecycle against a test database.

- Encrypt third-party credentials at rest, such as the stored Google OAuth refresh tokens, using an application-level key kept outside the database.

## License

This project is publicly available for viewing and educational purposes only.
No permission is granted to use, modify, or distribute this code without explicit authorization.
