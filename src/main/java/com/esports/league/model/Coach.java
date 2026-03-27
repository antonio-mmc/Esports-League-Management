package com.esports.league.model;

import java.io.Serializable;
import java.util.List;

/**
 * Represents a Coach in the eSports League.
 * Coaches are associated with a single team and can manage its players and tournament registrations.
 */
public class Coach implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int id;
    private static int idCounter = 1;
    private String name;
    private String email;
    private String password;
    private Team team;

    public Coach(String name, String email, String password) {
        this.id = idCounter++;
        this.name = name;
        this.email = email;
        this.password = password;
        this.team = null;
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
            throw new IllegalArgumentException("Name cannot be empty.");
        }
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || email.strip().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
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

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        if (this.team != null) {
            throw new IllegalStateException("Coach already has a team assigned.");
        }
        this.team = team;
    }

    public static void setIdCounter(int counter) {
        if (counter < 0) {
            throw new IllegalArgumentException("ID counter cannot be negative.");
        }
        Coach.idCounter = counter;
    }

    // Business Logic Methods
    public boolean authenticate(String email, String password) {
        return this.email.equals(email) && this.password.equals(password);
    }

    public void assignTeam(Team team) {
        if (this.team == null) {
            if (team.getCoach() == null) {
                this.team = team;
                team.setCoach(this);
                System.out.println("Coach " + this.name + " is now managing " + team.getName() + ".");
            } else {
                System.out.println("Team " + team.getName() + " already has a coach.");
            }
        } else {
            throw new IllegalStateException("Coach already manages a team.");
        }
    }

    public boolean addPlayerToTeam(Player player) {
        if (this.team != null) {
            return team.addPlayer(player);
        }
        throw new IllegalStateException("No team assigned to this coach.");
    }

    public boolean removePlayerFromTeam(Player player) {
        if (this.team != null) {
            return team.removePlayer(player);
        }
        throw new IllegalStateException("No team assigned to this coach.");
    }

    public void listTeamPlayers() {
        if (this.team != null) {
            team.listPlayers();
        } else {
            System.err.println("No team assigned to this coach.");
        }
    }

    public boolean registerTeamInTournament(Tournament tournament) {
        if (this.team != null) {
            boolean success = tournament.addTeam(team);
            if (success) {
                System.out.println("Team " + team.getName() + " registered for tournament " + tournament.getName() + ".");
            }
            return success;
        } else {
            System.err.println("No team assigned. Cannot register for tournament.");
            return false;
        }
    }

    public void trackTournaments(List<Tournament> tournaments) {
        if (this.team != null) {
            System.out.println("Tournaments for team " + team.getName() + ":");
            tournaments.stream()
                .filter(t -> t.getParticipatingTeams().contains(team))
                .forEach(t -> System.out.println("- " + t.getName()));
        } else {
            System.err.println("No team assigned.");
        }
    }

    public void trackResults(Tournament tournament) {
        if (tournament == null) {
            System.err.println("Invalid tournament.");
            return;
        }
        if (this.team != null && tournament.getParticipatingTeams().contains(team)) {
            tournament.listResults();
        } else {
            System.err.println("Team is not registered for this tournament.");
        }
    }
}
