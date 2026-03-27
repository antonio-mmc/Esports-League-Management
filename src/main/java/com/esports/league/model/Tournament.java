package com.esports.league.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a Tournament in the eSports League.
 */
public class Tournament implements Serializable {
    private static final long serialVersionUID = 1L;

    private final int id;
    private static int idCounter = 1;
    private String name;
    private String game;
    private List<Team> participatingTeams;
    private List<Match> matches;
    private Map<Team, Integer> standings;

    public Tournament(String name, String game) {
        this.id = idCounter++;
        this.name = name;
        this.game = game;
        this.participatingTeams = new ArrayList<>();
        this.matches = new ArrayList<>();
        this.standings = new HashMap<>();
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
            throw new IllegalArgumentException("Tournament name cannot be empty.");
        }
        this.name = name;
    }

    public String getGame() {
        return game;
    }

    public void setGame(String game) {
        if (game == null || game.strip().isEmpty()) {
            throw new IllegalArgumentException("Game name cannot be empty.");
        }
        this.game = game;
    }

    public List<Team> getParticipatingTeams() {
        return participatingTeams;
    }

    public List<Match> getMatches() {
        return matches;
    }

    public Map<Team, Integer> getStandings() {
        return standings;
    }

    public static void setIdCounter(int counter) {
        if (counter < 0) {
            throw new IllegalArgumentException("ID counter cannot be negative.");
        }
        Tournament.idCounter = counter;
    }

    // Business Logic Methods
    public boolean addTeam(Team team) {
        if (participatingTeams.contains(team)) {
            System.err.println("Team " + team.getName() + " is already registered for this tournament.");
            return false;
        } else {
            participatingTeams.add(team);
            standings.put(team, 0);
            System.out.println("Team " + team.getName() + " added successfully to the tournament.");
            return true;
        }
    }

    public void scheduleMatch(Team teamA, Team teamB, String date) {
        if (!participatingTeams.contains(teamA) || !participatingTeams.contains(teamB)) {
            System.err.println("Both teams must be registered in the tournament to schedule a match.");
            return;
        }
        Match match = new Match(teamA, teamB, date);
        matches.add(match);
        System.out.println("Match between " + teamA.getName() + " and " + teamB.getName() + " scheduled for " + date + ".");
    }

    public void recordResult(Match match, int scoreA, int scoreB) {
        if (!matches.contains(match)) {
            System.err.println("This match is not associated with this tournament.");
            return;
        }
        match.recordResult(scoreA, scoreB);
        
        // Update standings based on the match result
        if (scoreA > scoreB) {
            standings.put(match.getTeamA(), standings.get(match.getTeamA()) + 3);
        } else if (scoreB > scoreA) {
            standings.put(match.getTeamB(), standings.get(match.getTeamB()) + 3);
        } else {
            standings.put(match.getTeamA(), standings.get(match.getTeamA()) + 1);
            standings.put(match.getTeamB(), standings.get(match.getTeamB()) + 1);
        }
        System.out.println("Result recorded: " + scoreA + " - " + scoreB);
    }

    public void listResults() {
        System.out.println("--- Results for Tournament: " + name + " ---");
        if (matches.isEmpty()) {
            System.out.println("No matches scheduled yet.");
        } else {
            matches.forEach(System.out::println);
        }
    }

    public void displayStandings() {
        System.out.println("--- Standings for Tournament: " + name + " ---");
        List<Team> sortedTeams = new ArrayList<>(participatingTeams);
        sortedTeams.sort((t1, t2) -> standings.get(t2) - standings.get(t1));

        for (Team team : sortedTeams) {
            System.out.println(team.getName() + ": " + standings.get(team) + " points");
        }
    }
}
