package com.esports.league.repository;

import com.esports.league.model.Player;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Repository for managing Player data persistence.
 */
public class PlayerRepository {
    private final List<Player> players;
    private static final String DELIMITER = ",";

    public PlayerRepository() {
        this.players = new ArrayList<>();
    }

    public Player authenticate(String nickname, String password) {
        for (Player player : players) {
            if (player.getNickname().equalsIgnoreCase(nickname) && player.getPassword().equals(password)) {
                return player;
            }
        }
        return null;
    }

    public void addPlayer(Player player) {
        if (findByNickname(player.getNickname()) != null) {
            throw new IllegalArgumentException("Nickname is already in use.");
        }
        players.add(player);
        System.out.println("Player added successfully.");
    }

    public boolean removePlayer(String nickname) {
        Player player = findByNickname(nickname);
        if (player != null) {
            players.remove(player);
            return true;
        }
        return false;
    }

    public Player findByNickname(String nickname) {
        for (Player player : players) {
            if (player.getNickname().equalsIgnoreCase(nickname)) {
                return player;
            }
        }
        return null;
    }

    public List<Player> listPlayers() {
        return new ArrayList<>(players);
    }

    public void loadData(String filename) {
        players.clear();
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
                if (data.length == 6) {
                    players.add(new Player(
                        data[0].strip(), // fullName
                        data[1].strip(), // nickname
                        data[2].strip(), // password
                        Integer.parseInt(data[3].strip()), // matchesPlayed
                        Integer.parseInt(data[4].strip()), // wins
                        Integer.parseInt(data[5].strip())  // losses
                    ));
                }
            }
            System.out.println("Players loaded successfully from " + filename);
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error loading players: " + e.getMessage());
        }
    }

    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("FullName" + DELIMITER + "Nickname" + DELIMITER + "Password" + DELIMITER + "MatchesPlayed" + DELIMITER + "Wins" + DELIMITER + "Losses");
            for (Player player : players) {
                writer.println(
                    player.getFullName() + DELIMITER +
                    player.getNickname() + DELIMITER +
                    player.getPassword() + DELIMITER +
                    player.getMatchesPlayed() + DELIMITER +
                    player.getWins() + DELIMITER +
                    player.getLosses()
                );
            }
            System.out.println("Players saved successfully to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving players: " + e.getMessage());
        }
    }
}
