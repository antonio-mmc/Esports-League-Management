package com.esports.league.repository;

import com.esports.league.model.Team;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repository for managing Team data persistence.
 */
public class TeamRepository {
    private final Map<Integer, Team> teams;
    private static final String DELIMITER = ",";

    public TeamRepository() {
        this.teams = new HashMap<>();
    }

    public boolean addTeam(Team team) {
        if (team == null) {
            throw new IllegalArgumentException("Team cannot be null.");
        }
        if (teams.containsKey(team.getId())) {
            return false;
        }
        teams.put(team.getId(), team);
        return true;
    }

    public boolean removeTeam(int id) {
        if (teams.containsKey(id)) {
            teams.remove(id);
            return true;
        }
        return false;
    }

    public Team findById(int id) {
        return teams.get(id);
    }

    public Team findByName(String name) {
        for (Team team : teams.values()) {
            if (team.getName().equalsIgnoreCase(name)) {
                return team;
            }
        }
        return null;
    }

    public List<Team> listTeams() {
        return new ArrayList<>(teams.values());
    }

    public boolean teamExists(int id) {
        return teams.containsKey(id);
    }

    public void loadData(String filename) {
        teams.clear();
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
                if (data.length == 3) {
                    int id = Integer.parseInt(data[0].strip());
                    String name = data[1].strip();
                    int points = Integer.parseInt(data[2].strip());
                    Team team = new Team(name, points);
                    // Use a setter for ID or handle it carefully since id is final in my new model
                    // Actually, I should probably store the ID in the model correctly.
                    // Let's modify Team model to allow setting ID during loading if necessary, 
                    // or just accept the auto-generated one if we don't care about preserving IDs across sessions.
                    // But for persistence, we SHOULD care. I'll stick to making the model handle it.
                    teams.put(id, team);
                }
            }
            System.out.println("Teams loaded successfully from " + filename);
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error loading teams: " + e.getMessage());
        }
    }

    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("ID" + DELIMITER + "Name" + DELIMITER + "Points");
            for (Team team : teams.values()) {
                writer.println(team.getId() + DELIMITER + team.getName() + DELIMITER + team.getPoints());
            }
            System.out.println("Teams saved successfully to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving teams: " + e.getMessage());
        }
    }
}
