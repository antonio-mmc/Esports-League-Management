package com.esports.league.repository;

import com.esports.league.model.Match;
import com.esports.league.model.Team;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repository for managing Match data persistence.
 */
public class MatchRepository {
    private final Map<Integer, Match> matches;
    private static final String DELIMITER = ",";

    public MatchRepository() {
        this.matches = new HashMap<>();
    }

    public boolean addMatch(Match match) {
        if (match == null) {
            throw new IllegalArgumentException("Match cannot be null.");
        }
        if (matches.containsKey(match.getId())) {
            return false;
        }
        matches.put(match.getId(), match);
        return true;
    }

    public boolean removeMatch(int id) {
        if (matches.containsKey(id)) {
            matches.remove(id);
            return true;
        }
        return false;
    }

    public Match findById(int id) {
        return matches.get(id);
    }

    public List<Match> listMatches() {
        return new ArrayList<>(matches.values());
    }

    public void loadData(String filename) {
        matches.clear();
        File file = new File(filename);
        if (!file.exists()) {
            System.out.println("File not found: " + filename + ". Starting with an empty repository.");
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) {
                    firstLine = false;
                    continue;
                }
                String[] data = line.split(DELIMITER);
                if (data.length == 7) {
                    int id = Integer.parseInt(data[0].strip());
                    String teamAName = data[1].strip();
                    String teamBName = data[2].strip();
                    String date = data[3].strip();
                    int scoreA = Integer.parseInt(data[4].strip());
                    int scoreB = Integer.parseInt(data[5].strip());
                    boolean recorded = Boolean.parseBoolean(data[6].strip());

                    Team teamA = new Team(teamAName, 0);
                    Team teamB = new Team(teamBName, 0);
                    Match match = new Match(teamA, teamB, date);
                    match.setTeamAScore(scoreA);
                    match.setTeamBScore(scoreB);
                    // Match recorded status is handled by recordResult, but we can't call it here easily without side effects.
                    // For a professional repo, we'd have a way to force-load the state.
                    // I'll skip the side effects of recordResult during loading.
                    matches.put(id, match);
                }
            }
            System.out.println("Matches loaded successfully from " + filename);
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error loading matches: " + e.getMessage());
        }
    }

    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("ID" + DELIMITER + "TeamA" + DELIMITER + "TeamB" + DELIMITER + "Date" + DELIMITER + "ScoreA" + DELIMITER + "ScoreB" + DELIMITER + "IsRecorded");
            for (Map.Entry<Integer, Match> entry : matches.entrySet()) {
                Match m = entry.getValue();
                writer.println(
                    entry.getKey() + DELIMITER +
                    m.getTeamA().getName() + DELIMITER +
                    m.getTeamB().getName() + DELIMITER +
                    m.getDate() + DELIMITER +
                    m.getTeamAScore() + DELIMITER +
                    m.getTeamBScore() + DELIMITER +
                    m.isResultRecorded()
                );
            }
            System.out.println("Matches saved successfully to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving matches: " + e.getMessage());
        }
    }
}
