# ESports League Management System

A full-stack eSports league management platform built with Spring Boot and React. Manages players, coaches, teams, tournaments and matches across multiple game types (FPS, MOBA, eFootball).

---

## Tech Stack

**Backend**
- Java 21 + Spring Boot 3.3
- Spring Data JPA + H2 (file-based, persistent)
- RESTful API on `localhost:8080`

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router + Axios
- Runs on `localhost:5173`

---

## Getting Started

### Prerequisites
- Java 21+
- Maven
- Node.js 18+

### 1. Start the Backend

```bash
mvn spring-boot:run
```

On first run, the database is automatically seeded with:
- 6 teams (FPS, MOBA, eFootball)
- 30 players across all game types
- 6 coaches
- 3 tournaments
- 11 matches (6 completed, 5 upcoming)

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Features

- **Dashboard** — live stats, team leaderboard, top players by win rate, game type breakdown
- **Players** — full CRUD with type-specific stats (accuracy/headshots for FPS, KDA for MOBA, goals for eFootball)
- **Coaches** — manage coaches and team assignments
- **Teams** — standings table with W/D/L/points, detail page with roster and coach
- **Tournaments** — manage tournaments with participating teams
- **Matches** — schedule matches, record results, automatic win/loss tracking

---

## Project Structure

```
├── src/                    # Spring Boot backend
│   └── main/java/com/esports/league/
│       ├── model/          # Entities (Player, Team, Coach, Tournament, Match)
│       ├── repository/     # Spring Data JPA repositories
│       ├── service/        # Business logic
│       ├── controller/     # REST controllers
│       └── config/         # CORS, exception handler, data initializer
├── frontend/               # React frontend
│   └── src/
│       ├── components/     # Layout, Sidebar, Table, Modal, Toast, etc.
│       ├── pages/          # Dashboard, Players, Coaches, Teams, Tournaments, Matches
│       └── services/       # Axios API client
├── data/                   # H2 database files (auto-generated, not committed)
└── pom.xml
```

---

## Data Persistence

Data is stored in a local H2 file database (`data/esportsdb`). It persists between restarts. To reset to the initial seed data, delete the `data/` folder and restart the backend.
