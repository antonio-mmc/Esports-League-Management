package com.esports.league.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Team in the eSports League.
 * A team consists of a name, several players, and a coach.
 */
public class Team implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int id;
    private static int idCounter = 1;
    private String name;
    private int wins;
    private int draws;
    private int losses;
    private int points;
    private final List<Player> players;
    private Coach coach;

    public Team(String name, int points) {
        this.id = idCounter++;
        this.name = name;
        this.points = points;
        this.wins = 0;
        this.draws = 0;
        this.losses = 0;
        this.players = new ArrayList<>();
        this.coach = null;
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
            throw new IllegalArgumentException("Team name cannot be empty.");
        }
        this.name = name;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        if (points < 0) {
            throw new IllegalArgumentException("Points cannot be negative.");
        }
        this.points = points;
    }

    public int getWins() {
        return wins;
    }

    public void setWins(int wins) {
        if (wins < 0) {
            throw new IllegalArgumentException("Wins cannot be negative.");
        }
        this.wins = wins;
    }

    public int getDraws() {
        return draws;
    }

    public void setDraws(int draws) {
        if (draws < 0) {
            throw new IllegalArgumentException("Draws cannot be negative.");
        }
        this.draws = draws;
    }

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        if (losses < 0) {
            throw new IllegalArgumentException("Losses cannot be negative.");
        }
        this.losses = losses;
    }

    public List<Player> getPlayers() {
        return new ArrayList<>(players);
    }

    public Coach getCoach() {
        return coach;
    }

    public void setCoach(Coach coach) {
        if (this.coach != null) {
            throw new IllegalStateException("Team already has a coach.");
        }
        this.coach = coach;
    }

    public static void setIdCounter(int counter) {
        if (counter < 0) {
            throw new IllegalArgumentException("ID counter cannot be negative.");
        }
        Team.idCounter = counter;
    }

    // Business Logic Methods
    public boolean addPlayer(Player player) {
        if (player == null) {
            throw new IllegalArgumentException("Player cannot be null.");
        }
        if (!players.contains(player)) {
            players.add(player);
            return true;
        }
        return false;
    }

    public boolean removePlayer(Player player) {
        if (player == null) {
            throw new IllegalArgumentException("Player cannot be null.");
        }
        return players.remove(player);
    }

    public void listPlayers() {
        if (players.isEmpty()) {
            System.out.println("No players associated with team: " + name);
        } else {
            System.out.println("--- Players of " + name + " ---");
            players.forEach(p -> System.out.println("- ID: " + p.getId() + ", Name: " + p.getFullName() + ", Nickname: " + p.getNickname()));
        }
    }

    public void registerWin() {
        wins++;
        updatePoints();
    }

    public void registerDraw() {
        draws++;
        updatePoints();
    }

    public void registerLoss() {
        losses++;
    }

    private void updatePoints() {
        this.points = (wins * 3) + (draws * 1);
    }

    public void consultStatistics() {
        System.out.println("--- Statistics for Team: " + name + " ---");
        System.out.println("Wins: " + wins);
        System.out.println("Draws: " + draws);
        System.out.println("Losses: " + losses);
        System.out.println("Total Points: " + points);
        System.out.println("Number of Players: " + players.size());
    }
}
