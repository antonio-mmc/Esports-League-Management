package com.esports.league.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Player in the eSports League.
 * Players have personal data, statistics, and a list of tournaments they participate in.
 */
public class Player implements Serializable {
    private static final long serialVersionUID = 1L;

    private static int idCounter = 1;
    private final int id;
    private String fullName;
    private String nickname;
    private String password;
    
    // Statistics
    private int matchesPlayed;
    private int wins;
    private int losses;
    private final List<Tournament> tournaments;

    public Player(String fullName, String nickname, String password, int matchesPlayed, int wins, int losses) {
        this.id = idCounter++;
        this.fullName = fullName;
        this.nickname = nickname;
        this.password = password;
        this.matchesPlayed = matchesPlayed;
        this.wins = wins;
        this.losses = losses;
        this.tournaments = new ArrayList<>();
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        if (fullName == null || fullName.strip().isEmpty()) {
            throw new IllegalArgumentException("Full name cannot be empty.");
        }
        this.fullName = fullName;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        if (nickname == null || nickname.strip().isEmpty()) {
            throw new IllegalArgumentException("Nickname cannot be empty.");
        }
        this.nickname = nickname;
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

    public int getMatchesPlayed() {
        return matchesPlayed;
    }

    public void setMatchesPlayed(int matchesPlayed) {
        if (matchesPlayed < 0) {
            throw new IllegalArgumentException("Matches played cannot be negative.");
        }
        this.matchesPlayed = matchesPlayed;
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

    public int getLosses() {
        return losses;
    }

    public void setLosses(int losses) {
        if (losses < 0) {
            throw new IllegalArgumentException("Losses cannot be negative.");
        }
        this.losses = losses;
    }

    public List<Tournament> getTournaments() {
        return new ArrayList<>(tournaments);
    }

    public static void setIdCounter(int counter) {
        if (counter < 0) {
            throw new IllegalArgumentException("ID counter cannot be negative.");
        }
        Player.idCounter = counter;
    }

    // Business Logic Methods
    public void editData(String newName, String newNickname, List<Player> existingPlayers) {
        for (Player p : existingPlayers) {
            if (p.getNickname().equalsIgnoreCase(newNickname) && p.getId() != this.id) {
                throw new IllegalArgumentException("Nickname already in use. Please choose another one.");
            }
        }
        setFullName(newName);
        setNickname(newNickname);
        System.out.println("Data updated successfully!");
    }

    public void listTournaments() {
        if (tournaments.isEmpty()) {
            System.out.println(nickname + " is not participating in any tournaments.");
        } else {
            System.out.println("--- Tournaments for " + nickname + " ---");
            tournaments.forEach(t -> System.out.println("- " + t.getName()));
        }
    }

    public void registerResult(boolean isWinner) {
        matchesPlayed++;
        if (isWinner) {
            wins++;
        } else {
            losses++;
        }
    }

    public void consultStatistics() {
        System.out.println("--- Statistics for " + nickname + " ---");
        System.out.println("Matches Played: " + matchesPlayed);
        System.out.println("Wins: " + wins);
        System.out.println("Losses: " + losses);
    }
}
