# Guildr: AI-Powered Portfolio Coach

Guildr is a personal robo-advisor–style web app that helps individual investors keep their stock, mutual fund, and fixed deposit (FD) portfolios balanced and aligned with their risk profile. It leverages live market context and AI-generated guidance to provide actionable, plain-English rebalancing suggestions—without ever touching your money.

## Architecture Overview

Guildr is built as a modern, microservices-based system with the following key components:

- **Frontend:** Next.js web application for user interaction and visualization.
- **Backend:** Node.js microservices, including:
  - **Portfolio Service:** Manages user portfolios, holdings, and risk profiles.
  - **Market Service:** Ingests and normalizes live market data (stocks, mutual funds, interest rates).
  - **Advice Service:** AI-driven engine that analyzes portfolio drift, concentration risk, and generates ranked rebalancing strategies (conservative, balanced, aggressive) with clear explanations.
  - **Gateway:** API gateway for routing and authentication.
- **Database:** PostgreSQL (local development via Docker Compose).
- **Shared Packages:** TypeScript types, utilities, and UI components for consistency across services.

## Key Features

- **Portfolio Ingestion:** Upload and manage your stocks, mutual funds, and FDs in one place.
- **Live Market Tracking:** Continuously updates portfolio context with real-time market data.
- **AI-Generated Guidance:** Suggests three ranked rebalancing strategies, each explained in simple language.
- **Risk Alignment:** Detects drift and concentration risk, ensuring allocations match user risk profiles.
- **API-First Design:** All functionality exposed via RESTful APIs for extensibility.
- **Responsible AI:** Advice is educational only—Guildr never executes trades or handles user funds.

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- pnpm (for monorepo management)
- Docker (for local Postgres)

### Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   ```

2. **Start the local Postgres database:**
   ```sh
   docker-compose up -d
   ```
   - Default credentials: `guildr_user` / `guildr_pass`, database: `guildr_db` (see `docker-compose.yml`)

3. **Run all services in development mode:**
   ```sh
   pnpm turbo run dev
   ```
   - Or run individual services from their respective directories.

4. **Access the web app:**
   - Navigate to `http://localhost:3000` (default Next.js port)

### Project Structure

- `apps/`
  - `web/` – Next.js frontend
  - `portfolio-service/` – Portfolio management microservice
  - `market-service/` – Market data microservice
  - `advice-service/` – AI/Advice microservice
  - `gateway/` – API gateway
- `packages/`
  - `shared-types/` – TypeScript types
  - `shared-utils/` – Shared utility functions
  - `ui/` – Reusable UI components
  - `eslint-config/`, `typescript-config/` – Monorepo configs

### Configuration
- Environment variables for each service should be defined in their respective `.env` files.
- Database connection strings should match the credentials in `docker-compose.yml`.

### Scripts
- `pnpm turbo run build` – Build all apps and packages
- `pnpm turbo run lint` – Lint all code
- `pnpm turbo run dev` – Start all services in dev mode

## Engineering Highlights
- **Microservices:** Node.js services for separation of concerns and scalability.
- **Type Safety:** TypeScript across all layers.
- **Monorepo:** Managed with pnpm and Turborepo for efficient builds and code sharing.
- **API-First:** All business logic exposed via APIs.
- **Explainable AI:** Advice service provides not just recommendations, but rationale for each move.

## Responsible AI & Security
- Guildr never executes trades or handles user funds—advice is for educational purposes only.
- All sensitive data is stored securely in Postgres; no financial credentials are required.

## License
MIT

---

For more details, see individual service READMEs or contact the maintainers.
