# ESports League Management System

A full-stack eSports league management platform built with Spring Boot and React.
Manages players, coaches, teams, tournaments and matches across **five game modes** —
FPS, MOBA, eFootball, Racing and Battle Royale — each spanning two real-world titles.

---

## Tech Stack

**Backend**
- Java 21 + Spring Boot 3.3.5
- Spring Data JPA + Hibernate
- H2 (file-based, persistent) — H2 console at `/h2-console`
- Bean Validation (`spring-boot-starter-validation`)
- RESTful API on `localhost:8080` (all endpoints under `/api`)

**Frontend**
- React 19 + Vite 8
- Tailwind CSS 3
- React Router 7 + Axios
- Framer Motion (animations), lucide-react (icons), flag-icons
- Light/dark theme toggle and in-app language switcher (EN/PT)
- Runs on `localhost:5173`

---

## Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+

### 1. Start the Backend

```bash
mvn spring-boot:run
```

On first run the database is automatically seeded. On later runs a lightweight
migration step in `DataInitializer` backfills any data added in newer versions,
so an existing database is upgraded in place rather than wiped.

The seed currently produces:
- **36 teams** across 5 game modes
- **110 players** (including free agents with no team)
- **24 coaches** (including free-agent coaches)
- **39 tournaments** (active, upcoming and completed history)
- **261 matches** (≈204 with recorded results, the rest scheduled/upcoming)

Highlights include three realistic flagship events: a **16-team Valorant single-elimination**
bracket (Round of 16 → Grand Final), a full **8-team League of Legends round-robin**, and an
**in-progress Valorant league** (some rounds played, others still scheduled).

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Features

- **Dashboard** — totals, team leaderboard, top players by win rate (min. 3 games played), and a per-mode player breakdown
- **Players** — full CRUD with mode-specific stats:
  - FPS — accuracy, headshots, KAST, ADR
  - MOBA — main champion, kills/deaths/assists
  - eFootball — position, goals, assists, shots on target, ball recoveries
  - Racing — average position, podiums, fastest laps, DNFs
  - Battle Royale — average placement, kills, top-10 rate, damage per match
- **Coaches** — profile, specialization, achievements and team assignment (assigning a coach displaces any existing one); free agents supported
- **Teams** — a modality (`game`) plus a specific title (`specificGame`, e.g. Valorant, CS2); standings with W/L and points (`points = wins × 3`), trophies, founded year, roster, coach and coach history; deleting a team releases its players and coach to free agency (logged as transfers) and reverts its recorded match results
- **Tournaments** — multiple formats (`LEAGUE`, `SINGLE_ELIMINATION`, `DOUBLE_ELIMINATION`, `GROUP_STAGE`), prize pools, participating teams and a computed standings endpoint (tiebreak: points → wins → score difference). **Status is derived automatically from the dates** (`UPCOMING` before the start, `ACTIVE` in between, `COMPLETED` after the end) — it is no longer set by hand. When a tournament becomes COMPLETED its standings winner is crowned and awarded a trophy automatically; moving it back out of COMPLETED (or deleting it) gives the trophy back. Inputs are validated: a team's title must match its modality, a tournament's end date cannot precede its start date, and the team count cannot exceed the format's maximum
- **Matches** — schedule fixtures (only between teams that take part in the tournament) and record results; recording or editing a result automatically updates both teams' win/loss/points totals **and every roster player's matches/wins/losses**, and deleting a played match reverts all of it
- **Transfer market** — a dedicated **Transfers** page lists current free agents (with valuations) and the full transfer history, and lets you sign a free agent to a team in one click. Every roster/coaching move is logged as a transfer with a deterministic market value (fee)
- **UX** — global search with live results, sortable and **paginated** tables/lists across every page, clickable rows that open detail views, and an elimination bracket that adapts to any power-of-two field (4, 8, 16 teams)

---

## REST API

All routes are prefixed with `/api`.

| Resource    | Endpoints |
|-------------|-----------|
| Dashboard   | `GET /dashboard/stats`, `/dashboard/top-players`, `/dashboard/game-breakdown`, `/dashboard/free-agents`, `/dashboard/recent-transfers` |
| Players     | `GET /players`, `GET /players/{id}`, `POST /players`, `PUT /players/{id}`, `PUT /players/{id}/team/{teamId}`, `DELETE /players/{id}/team`, `DELETE /players/{id}` |
| Coaches     | `GET /coaches`, `GET /coaches/{id}`, `POST /coaches`, `PUT /coaches/{id}`, `PUT /coaches/{id}/team/{teamId}`, `DELETE /coaches/{id}/team`, `DELETE /coaches/{id}` |
| Teams       | `GET /teams`, `GET /teams/{id}`, `GET /teams/{id}/players`, `GET /teams/{id}/matches`, `POST /teams`, `PUT /teams/{id}`, `DELETE /teams/{id}` |
| Tournaments | `GET /tournaments`, `GET /tournaments/{id}`, `GET /tournaments/{id}/standings`, `POST /tournaments`, `PUT /tournaments/{id}`, `POST /tournaments/{id}/teams/{teamId}`, `DELETE /tournaments/{id}` |
| Matches     | `GET /matches`, `GET /matches/{id}`, `POST /matches`, `PUT /matches/{id}/result`, `DELETE /matches/{id}` |
| Transfers   | `GET /transfers` (full history; signing a free agent reuses `PUT /players/{id}/team/{teamId}` and `PUT /coaches/{id}/team/{teamId}`) |

Errors are returned as JSON: `{ "error": "...", "status": <code>, "timestamp": "..." }`.

---

## Project Structure

```
├── src/                    # Spring Boot backend
│   └── main/java/com/esports/league/
│       ├── model/          # Entities (Player + 5 subtypes, Team, Coach, Tournament, Match, Transfer)
│       ├── repository/     # Spring Data JPA repositories
│       ├── service/        # Business logic
│       ├── controller/     # REST controllers
│       └── config/         # CORS, exception handler, data initializer
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # Layout, Sidebar, DataTable, Modal, Toast, etc.
│       ├── pages/          # Dashboard, Players, Coaches, Teams, Tournaments, Matches, Transfers (+ detail pages)
│       ├── context/        # Theme, language and game-filter contexts
│       ├── services/       # Axios API client
│       └── utils/          # Stats, game metadata, helpers
├── data/                   # H2 database files (auto-generated, git-ignored)
└── pom.xml
```

Players use single-table inheritance (`player_type` discriminator) with five
concrete subtypes, serialized polymorphically to JSON via a `playerType` field.

---

## Data Persistence

Data is stored in a local H2 file database (`data/esportsdb`). It persists between
restarts. To reset to the initial seed data, stop the backend, delete the `data/`
folder and restart.
```
