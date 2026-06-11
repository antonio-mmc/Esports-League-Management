package com.esports.league.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_a_id", nullable = false)
    @JsonIgnoreProperties({"players", "coach", "tournaments", "hibernateLazyInitializer"})
    private Team teamA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_b_id", nullable = false)
    @JsonIgnoreProperties({"players", "coach", "tournaments", "hibernateLazyInitializer"})
    private Team teamB;

    private int teamAScore;
    private int teamBScore;
    private LocalDate date;
    private boolean resultRecorded;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id")
    @JsonIgnoreProperties({"matches", "participatingTeams", "hibernateLazyInitializer"})
    private Tournament tournament;

    public Match() {}

    public Match(Team teamA, Team teamB, LocalDate date, Tournament tournament) {
        this.teamA = teamA;
        this.teamB = teamB;
        this.date = date;
        this.tournament = tournament;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Team getTeamA() { return teamA; }
    public void setTeamA(Team teamA) { this.teamA = teamA; }

    public Team getTeamB() { return teamB; }
    public void setTeamB(Team teamB) { this.teamB = teamB; }

    public int getTeamAScore() { return teamAScore; }
    public void setTeamAScore(int teamAScore) { this.teamAScore = teamAScore; }

    public int getTeamBScore() { return teamBScore; }
    public void setTeamBScore(int teamBScore) { this.teamBScore = teamBScore; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public boolean isResultRecorded() { return resultRecorded; }
    public void setResultRecorded(boolean resultRecorded) { this.resultRecorded = resultRecorded; }

    public Tournament getTournament() { return tournament; }
    public void setTournament(Tournament tournament) { this.tournament = tournament; }

    /** Records a result for the first time, applying its effect to both teams' records. */
    public void recordResult(int scoreA, int scoreB) {
        if (resultRecorded) throw new IllegalStateException("Result already recorded.");
        this.teamAScore = scoreA;
        this.teamBScore = scoreB;
        this.resultRecorded = true;
        applyOutcome();
    }

    /**
     * Edits an existing result: reverts the previous outcome from both teams' records,
     * then applies the new one so points/wins/losses stay consistent.
     */
    public void updateResult(int scoreA, int scoreB) {
        if (resultRecorded) revertOutcome();
        this.teamAScore = scoreA;
        this.teamBScore = scoreB;
        this.resultRecorded = true;
        applyOutcome();
    }

    /** Reverts this match's effect on both teams' records (used before deleting a played match). */
    public void revertResultEffect() {
        if (resultRecorded) revertOutcome();
    }

    private void applyOutcome() {
        if (teamAScore > teamBScore) {
            teamA.registerWin();
            teamB.registerLoss();
        } else if (teamBScore > teamAScore) {
            teamB.registerWin();
            teamA.registerLoss();
        }
        // Equal scores → draw: no win/loss is registered for either team.
    }

    private void revertOutcome() {
        if (teamAScore > teamBScore) {
            teamA.unregisterWin();
            teamB.unregisterLoss();
        } else if (teamBScore > teamAScore) {
            teamB.unregisterWin();
            teamA.unregisterLoss();
        }
    }
}
