package com.esports.league.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("EFOOTBALL")
public class EFootballPlayer extends Player {

    private String mainPosition;
    private int goalsScored;
    private int goalsSaved;
    private int efbAssists;
    private Integer shotsOnTarget;
    private Integer ballRecoveries;

    public EFootballPlayer() {}

    public EFootballPlayer(String fullName, String nickname, String password,
                           int matchesPlayed, int wins, int losses,
                           String mainPosition, int goalsScored, int goalsSaved, int assists,
                           int shotsOnTarget, int ballRecoveries) {
        super(fullName, nickname, password, matchesPlayed, wins, losses);
        this.mainPosition = mainPosition;
        this.goalsScored = goalsScored;
        this.goalsSaved = goalsSaved;
        this.efbAssists = assists;
        this.shotsOnTarget = shotsOnTarget;
        this.ballRecoveries = ballRecoveries;
    }

    public String getMainPosition() { return mainPosition; }
    public void setMainPosition(String mainPosition) { this.mainPosition = mainPosition; }

    public int getGoalsScored() { return goalsScored; }
    public void setGoalsScored(int goalsScored) {
        if (goalsScored < 0) throw new IllegalArgumentException("Goals scored cannot be negative.");
        this.goalsScored = goalsScored;
    }

    public int getGoalsSaved() { return goalsSaved; }
    public void setGoalsSaved(int goalsSaved) {
        if (goalsSaved < 0) throw new IllegalArgumentException("Goals saved cannot be negative.");
        this.goalsSaved = goalsSaved;
    }

    public int getEfbAssists() { return efbAssists; }
    public void setEfbAssists(int assists) {
        if (assists < 0) throw new IllegalArgumentException("Assists cannot be negative.");
        this.efbAssists = assists;
    }

    public Integer getShotsOnTarget() { return shotsOnTarget; }
    public void setShotsOnTarget(Integer shotsOnTarget) {
        if (shotsOnTarget != null && shotsOnTarget < 0) throw new IllegalArgumentException("Shots on target cannot be negative.");
        this.shotsOnTarget = shotsOnTarget;
    }

    public Integer getBallRecoveries() { return ballRecoveries; }
    public void setBallRecoveries(Integer ballRecoveries) {
        if (ballRecoveries != null && ballRecoveries < 0) throw new IllegalArgumentException("Ball recoveries cannot be negative.");
        this.ballRecoveries = ballRecoveries;
    }

    @Override
    public String getPlayerType() { return "EFOOTBALL"; }
}
