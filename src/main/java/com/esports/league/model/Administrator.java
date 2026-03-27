package com.esports.league.model;

import com.esports.league.repository.PlayerRepository;
import com.esports.league.repository.CoachRepository;
import com.esports.league.repository.TournamentRepository;
import java.io.Serializable;
import java.util.List;

/**
 * Represents an Administrator in the eSports League system.
 * Administrators can manage players, coaches, tournaments, and matches.
 */
public class Administrator implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int id;
    private static int idCounter = 1;
    private String name;
    private String email;
    private String password;

    public Administrator(String name, String email, String password) {
        this.id = idCounter++;
        this.name = name;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.strip().isEmpty()) {
            throw new IllegalArgumentException("Administrator name cannot be empty.");
        }
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || email.strip().isEmpty()) {
            throw new IllegalArgumentException("Administrator email cannot be empty.");
        }
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        if (password == null || password.strip().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty.");
        }
        this.password = password;
    }

    // Business Logic Methods
    public boolean authenticate(String email, String password) {
        return this.email.equals(email) && this.password.equals(password);
    }

    public void addPlayer(PlayerRepository repository, Player player) {
        repository.addPlayer(player);
    }

    public void removePlayer(PlayerRepository repository, String nickname) {
        if (!repository.removePlayer(nickname)) {
            System.err.println("Player not found: " + nickname);
        } else {
            System.out.println("Player " + nickname + " removed successfully.");
        }
    }

    public void addCoach(CoachRepository repository, Coach coach) {
        repository.addCoach(coach);
    }

    public void removeCoach(CoachRepository repository, String email) {
        Coach coach = repository.findByEmail(email);
        if (coach == null) {
            System.err.println("Coach not found with email: " + email);
        } else {
            if (repository.removeCoach(coach.getId())) {
                System.out.println("Coach " + coach.getName() + " removed successfully.");
            }
        }
    }

    public void createTournament(TournamentRepository repository, String tournamentName, String game) {
        Tournament tournament = new Tournament(tournamentName, game);
        repository.addTournament(tournament);
        System.out.println("Tournament '" + tournamentName + "' created successfully.");
    }

    public void listTournaments(TournamentRepository repository) {
        List<Tournament> tournaments = repository.listTournaments();
        if (tournaments.isEmpty()) {
            System.out.println("No tournaments available.");
        } else {
            System.out.println("--- Tournament List ---");
            tournaments.forEach(t -> System.out.println("- " + t.getName()));
        }
    }

    public void scheduleMatch(Tournament tournament, Team team1, Team team2, String date) {
        if (tournament == null) {
            System.err.println("Invalid tournament.");
            return;
        }
        tournament.scheduleMatch(team1, team2, date);
    }

    public void recordResult(Tournament tournament, Match match, int team1Score, int team2Score) {
        if (tournament == null || match == null) {
            System.err.println("Tournament or match is invalid.");
            return;
        }
        tournament.recordResult(match, team1Score, team2Score);
    }

    public void trackTournamentStatistics(Tournament tournament) {
        if (tournament == null) {
            System.err.println("Invalid tournament.");
            return;
        }
        tournament.listResults();
    }
}
