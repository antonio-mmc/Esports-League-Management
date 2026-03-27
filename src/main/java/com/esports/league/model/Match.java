package com.esports.league.model;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * Represents a Match between two teams.
 */
public class Match implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int id;
    private static int idCounter = 1;
    private Team teamA;
    private Team teamB;
    private int teamAScore;
    private int teamBScore;
    private LocalDate date;
    private boolean isResultRecorded;

    public Match(Team teamA, Team teamB, String date) {
        if (teamA == null || teamB == null) {
            throw new IllegalArgumentException("Teams cannot be null.");
        }
        if (date == null || date.strip().isEmpty()) {
            throw new IllegalArgumentException("Match date cannot be empty.");
        }
        this.id = idCounter++;
        this.teamA = teamA;
        this.teamB = teamB;
        this.date = LocalDate.parse(date);
        this.teamAScore = 0;
        this.teamBScore = 0;
        this.isResultRecorded = false;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public Team getTeamA() {
        return teamA;
    }

    public void setTeamA(Team teamA) {
        if (teamA == null) throw new IllegalArgumentException("Team A cannot be null.");
        this.teamA = teamA;
    }

    public Team getTeamB() {
        return teamB;
    }

    public void setTeamB(Team teamB) {
        if (teamB == null) throw new IllegalArgumentException("Team B cannot be null.");
        this.teamB = teamB;
    }

    public int getTeamAScore() {
        return teamAScore;
    }

    public void setTeamAScore(int score) {
        if (score < 0) throw new IllegalArgumentException("Score cannot be negative.");
        this.teamAScore = score;
    }

    public int getTeamBScore() {
        return teamBScore;
    }

    public void setTeamBScore(int score) {
        if (score < 0) throw new IllegalArgumentException("Score cannot be negative.");
        this.teamBScore = score;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        if (date == null) throw new IllegalArgumentException("Date cannot be null.");
        this.date = date;
    }

    public boolean isResultRecorded() {
        return isResultRecorded;
    }

    public static void setIdCounter(int counter) {
        if (counter < 0) {
            throw new IllegalArgumentException("ID counter cannot be negative.");
        }
        Match.idCounter = counter;
    }

    // Business Logic Methods
    public void recordResult(int scoreA, int scoreB) {
        if (isResultRecorded) {
            throw new IllegalStateException("Result has already been recorded for this match.");
        }
        if (scoreA < 0 || scoreB < 0) {
            throw new IllegalArgumentException("Scores cannot be negative.");
        }
        this.teamAScore = scoreA;
        this.teamBScore = scoreB;

        if (scoreA > scoreB) {
            teamA.registerWin();
            teamB.registerLoss();
            System.out.println("Win recorded for " + teamA.getName() + ".");
        } else if (scoreA < scoreB) {
            teamB.registerWin();
            teamA.registerLoss();
            System.out.println("Win recorded for " + teamB.getName() + ".");
        } else {
            teamA.registerDraw();
            teamB.registerDraw();
            System.out.println("Draw recorded.");
        }
        this.isResultRecorded = true;
    }

    public void displayDetails() {
        System.out.println("Match #" + id + " [" + date + "]");
        System.out.println(teamA.getName() + " " + teamAScore + " - " + teamBScore + " " + teamB.getName());
    }

    @Override
    public String toString() {
        return "Match #" + id + ": " + teamA.getName() + " " + teamAScore + " - " + teamBScore + " " + teamB.getName() + " (" + date + ")";
    }
}
