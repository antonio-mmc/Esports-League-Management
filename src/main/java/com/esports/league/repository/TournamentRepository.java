package com.esports.league.repository;

import com.esports.league.model.Tournament;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Repository for managing Tournament data persistence.
 */
public class TournamentRepository {
    private final List<Tournament> tournaments;
    private static final String DELIMITER = ",";

    public TournamentRepository() {
        this.tournaments = new ArrayList<>();
    }

    public void addTournament(Tournament tournament) {
        if (tournament == null) {
            throw new IllegalArgumentException("Tournament cannot be null.");
        }
        tournaments.add(tournament);
    }

    public void removeTournament(int id) {
        Tournament tournament = findById(id);
        if (tournament != null) {
            tournaments.remove(tournament);
        } else {
            System.err.println("Tournament not found.");
        }
    }

    public Tournament findById(int id) {
        for (Tournament tournament : tournaments) {
            if (tournament.getId() == id) {
                return tournament;
            }
        }
        return null;
    }

    public List<Tournament> listTournaments() {
        return new ArrayList<>(tournaments);
    }

    public void loadData(String filename) {
        tournaments.clear();
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
                if (data.length == 2) {
                    tournaments.add(new Tournament(data[0].strip(), data[1].strip()));
                }
            }
            System.out.println("Tournaments loaded successfully from " + filename);
        } catch (IOException e) {
            System.err.println("Error loading tournaments: " + e.getMessage());
        }
    }

    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("Name" + DELIMITER + "Game");
            for (Tournament tournament : tournaments) {
                writer.println(tournament.getName() + DELIMITER + tournament.getGame());
            }
            System.out.println("Tournaments saved successfully to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving tournaments: " + e.getMessage());
        }
    }
}
