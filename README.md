# 🏆 eSports League Management System

A professional Java-based management system for eSports leagues, featuring role-based access control for **Administrators**, **Coaches**, and **Players**. This project demonstrates Object-Oriented Programming (OOP) principles, data persistence using CSV, and a clean command-line interface.

---

## 🚀 Features

- **Multi-Role System**:
  - **🛡️ Administrators**: Create and manage tournaments, schedule matches, and manage user accounts (Players/Coaches).
  - **🧠 Coaches**: Create teams, recruit players, and register teams for upcoming tournaments.
  - **🎮 Players**: Manage personal profiles, view tournament participation, and track performance statistics.
- **Dynamic Tournament Logic**: Supports multiple tournament types (e.g., FIFA/eFootball, FPS, MOBA) with specialized player statistics.
- **Persistence Layer**: Data is automatically saved and loaded from standard CSV files, ensuring session-to-session continuity.
- **Clean Architecture**: Organized into `model`, `repository`, and `app` layers for high maintainability.

---

## 🛠️ Technologies Used

- **Language**: Java 17+
- **Persistence**: File-based CSV (Custom Repository Pattern)
- **Build Tool**: Maven (for dependency management and packaging)
- **Concepts**: Inheritance, Polymorphism, Encapsulation, Exception Handling.

---

## 📥 Getting Started

### Prerequisites
- [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
- [Maven](https://maven.apache.org/download.cgi) (optional, if you want to use the build script)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/esports-league-management.git
   ```
2. Navigate to the project directory:
   ```bash
   cd esports-league-management
   ```

### Running the App
You can run the application directly using Maven:
```bash
mvn compile exec:java -Dexec.mainClass="com.esports.league.app.ESportsLeagueApp"
```
Or simply run the `ESportsLeagueApp.java` main class in your favorite IDE.

---

## 📈 Learning Outcomes

During the development of this project, I strengthened my understanding of:
- **Object-Oriented Design**: Implementing complex class hierarchies with inheritance (e.g., specialised Players for different game types).
- **Data Persistence**: Architecting a CSV-based storage solution from scratch without external databases.
- **Logic & Validation**: Implementing robust input validation and rule-based systems for tournament standings.
- **Code Organization**: Transitioning from a flat project structure to a professional, package-based Java architecture.

---

## 🛠️ Future Improvements

- [ ] **GUI Implementation**: Transition from a CLI to a modern JavaFX or Swing interface.
- [ ] **Database Integration**: Replace CSV storage with a relational database (SQLite/MySQL) using JDBC.
- [ ] **REST API**: Expose the league logic via a Spring Boot backend.
- [ ] **Unit Testing**: Implement JUnit tests for core business logic.

---

## 📄 License
This project was developed for academic purposes as part of the **Object-Oriented Programming (POO)** course.

---
*Developed by [Your Name] - Ready for professional challenges!*
