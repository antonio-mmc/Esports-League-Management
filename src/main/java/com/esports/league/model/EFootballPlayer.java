package com.esports.league.model;

/**
 * Specialization of Player for eFootball.
 */
public class EFootballPlayer extends Player {
    private static final long serialVersionUID = 1L;

    private String mainPosition;
    private int goalsScored;
    private int goalsSaved;
    private int assists;

    public EFootballPlayer(String fullName, String nickname, String password, int matchesPlayed, int wins, int losses, String mainPosition, int goalsScored, int goalsSaved, int assists) {
        super(fullName, nickname, password, matchesPlayed, wins, losses);
        this.mainPosition = mainPosition;
        this.goalsScored = goalsScored;
        this.goalsSaved = goalsSaved;
        this.assists = assists;
    }

    public String getMainPosition() {
        return mainPosition;
    }

    public void setMainPosition(String mainPosition) {
        this.mainPosition = mainPosition;
    }

    public int getGoalsScored() {
        return goalsScored;
    }

    public void setGoalsScored(int goalsScored) {
        if (goalsScored < 0) throw new IllegalArgumentException("Goals scored cannot be negative.");
        this.goalsScored = goalsScored;
    }

    public int getGoalsSaved() {
        return goalsSaved;
    }

    public void setGoalsSaved(int goalsSaved) {
        if (goalsSaved < 0) throw new IllegalArgumentException("Goals saved cannot be negative.");
        this.goalsSaved = goalsSaved;
    }

    public int getAssists() {
        return assists;
    }

    public void setAssists(int assists) {
        if (assists < 0) throw new IllegalArgumentException("Assists cannot be negative.");
        this.assists = assists;
    }

    @Override
    public void consultStatistics() {
        super.consultStatistics();
        System.out.println("Main Position: " + mainPosition);
        System.out.println("Goals Scored: " + goalsScored);
        System.out.println("Goals Saved: " + goalsSaved);
        System.out.println("Assists: " + assists);
    }
}
