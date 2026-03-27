package com.esports.league.repository;

import com.esports.league.model.Coach;
import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Repository for managing Coach data persistence.
 */
public class CoachRepository {
    private final Map<Integer, Coach> coaches;
    private static final String DELIMITER = ",";

    public CoachRepository() {
        this.coaches = new HashMap<>();
    }

    public boolean addCoach(Coach coach) {
        if (coach == null) {
            throw new IllegalArgumentException("Coach cannot be null.");
        }
        if (coaches.containsKey(coach.getId()) || findByEmail(coach.getEmail()) != null) {
            return false;
        }
        coaches.put(coach.getId(), coach);
        return true;
    }

    public boolean removeCoach(int id) {
        if (coaches.containsKey(id)) {
            coaches.remove(id);
            return true;
        }
        return false;
    }

    public Coach findById(int id) {
        return coaches.get(id);
    }

    public Coach findByEmail(String email) {
        for (Coach coach : coaches.values()) {
            if (coach.getEmail().equalsIgnoreCase(email)) {
                return coach;
            }
        }
        return null;
    }

    public Coach authenticate(String email, String password) {
        Coach coach = findByEmail(email);
        if (coach != null && coach.authenticate(email, password)) {
            return coach;
        }
        return null;
    }

    public List<Coach> listCoaches() {
        return new ArrayList<>(coaches.values());
    }

    public boolean coachExists(int id) {
        return coaches.containsKey(id);
    }

    public void loadData(String filename) {
        coaches.clear();
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
                if (data.length == 4) {
                    int id = Integer.parseInt(data[0].strip());
                    Coach coach = new Coach(data[1].strip(), data[2].strip(), data[3].strip());
                    coaches.put(id, coach);
                }
            }
            System.out.println("Coaches loaded successfully from " + filename);
        } catch (IOException | NumberFormatException e) {
            System.err.println("Error loading coaches: " + e.getMessage());
        }
    }

    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("ID" + DELIMITER + "Name" + DELIMITER + "Email" + DELIMITER + "Password");
            for (Map.Entry<Integer, Coach> entry : coaches.entrySet()) {
                Coach coach = entry.getValue();
                writer.println(entry.getKey() + DELIMITER + coach.getName() + DELIMITER + coach.getEmail() + DELIMITER + coach.getPassword());
            }
            System.out.println("Coaches saved successfully to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving coaches: " + e.getMessage());
        }
    }
}
