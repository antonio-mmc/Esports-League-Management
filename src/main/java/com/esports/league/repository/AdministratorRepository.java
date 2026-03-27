package com.esports.league.repository;

import com.esports.league.model.Administrator;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Repository for managing Administrator data persistence.
 */
public class AdministratorRepository {
    private final List<Administrator> administrators;
    private static final String DELIMITER = ",";

    public AdministratorRepository() {
        this.administrators = new ArrayList<>();
    }

    public Administrator authenticate(String email, String password) {
        for (Administrator admin : administrators) {
            if (admin.authenticate(email, password)) {
                return admin;
            }
        }
        return null;
    }

    public boolean addAdministrator(Administrator administrator) {
        if (findByEmail(administrator.getEmail()) != null) {
            return false;
        }
        administrators.add(administrator);
        return true;
    }

    public boolean removeAdministrator(String email) {
        Administrator admin = findByEmail(email);
        if (admin != null) {
            administrators.remove(admin);
            return true;
        }
        return false;
    }

    public Administrator findByEmail(String email) {
        for (Administrator admin : administrators) {
            if (admin.getEmail().equalsIgnoreCase(email)) {
                return admin;
            }
        }
        return null;
    }

    public List<Administrator> listAdministrators() {
        return new ArrayList<>(administrators);
    }

    public void loadData(String filename) {
        administrators.clear();
        File file = new File(filename);
        if (!file.exists()) {
            System.out.println("File not found: " + filename + ". Starting with an empty repository.");
            return;
        }

        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (firstLine) { // Skip header
                    firstLine = false;
                    continue;
                }
                String[] data = line.split(DELIMITER);
                if (data.length == 3) {
                    administrators.add(new Administrator(data[0].strip(), data[1].strip(), data[2].strip()));
                }
            }
            System.out.println("Administrators loaded successfully from " + filename);
        } catch (IOException e) {
            System.err.println("Error loading administrators: " + e.getMessage());
        }
    }

    public void saveData(String filename) {
        try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
            writer.println("Name" + DELIMITER + "Email" + DELIMITER + "Password");
            for (Administrator admin : administrators) {
                writer.println(admin.getName() + DELIMITER + admin.getEmail() + DELIMITER + admin.getPassword());
            }
            System.out.println("Administrators saved successfully to " + filename);
        } catch (IOException e) {
            System.err.println("Error saving administrators: " + e.getMessage());
        }
    }
}
