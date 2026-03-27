package com.esports.league.app;

import com.esports.league.model.*;
import com.esports.league.repository.*;
import java.util.InputMismatchException;
import java.util.Scanner;

/**
 * Main application for the eSports League management system.
 * This class provides a command-line interface (CLI) for administrators, coaches, and players.
 */
public class ESportsLeagueApp {
    private static final AdministratorRepository adminRepo = new AdministratorRepository();
    private static final PlayerRepository playerRepo = new PlayerRepository();
    private static final CoachRepository coachRepo = new CoachRepository();
    private static final TournamentRepository tournamentRepo = new TournamentRepository();
    private static final MatchRepository matchRepo = new MatchRepository();
    private static final TeamRepository teamRepo = new TeamRepository();
    
    private static final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        loadAllData();

        while (true) {
            try {
                System.out.println("\n--- Welcome to the eSports League Management System ---");
                System.out.println("1. Create Administrator Account");
                System.out.println("2. Login (Administrator, Coach, or Player)");
                System.out.println("3. Exit");
                System.out.print("Choose an option: ");
                
                int option = readSafeInt("");
                
                switch (option) {
                    case 1 -> createAdministrator();
                    case 2 -> login();
                    case 3 -> {
                        System.out.println("Saving data and exiting... Goodbye!");
                        saveAllData();
                        System.exit(0);
                    }
                    default -> System.err.println("Invalid option. Please try again.");
                }
            } catch (Exception e) {
                System.err.println("Unexpected error: " + e.getMessage());
                scanner.nextLine(); // Clear buffer
            }
        } 
    }

    private static void createAdministrator() {
        String name = readRequiredString("Administrator Name: ");
        String email = readRequiredString("Email: ");
        String password = readRequiredString("Password: ");

        try { 
            Administrator admin = new Administrator(name, email, password);
            if (adminRepo.addAdministrator(admin)) {
                System.out.println("Administrator account created successfully!");
            } else {
                System.err.println("Error: Email is already in use.");
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }

    private static void login() {
        System.out.println("\n--- Authentication ---");
        System.out.println("1. Administrator");
        System.out.println("2. Coach");
        System.out.println("3. Player");
        int type = readSafeInt("Select login type: ");

        String emailOrNickname = readRequiredString("Email/Nickname: ");
        String password = readRequiredString("Password: ");

        switch (type) {
            case 1 -> {
                Administrator admin = adminRepo.authenticate(emailOrNickname, password);
                if (admin != null) administratorMenu(admin);
                else System.err.println("Login failed. Please check your email and password.");
            }
            case 2 -> {
                Coach coach = coachRepo.authenticate(emailOrNickname, password);
                if (coach != null) coachMenu(coach);
                else System.err.println("Login failed. Please check your email and password.");
            }
            case 3 -> {
                Player player = playerRepo.authenticate(emailOrNickname, password);
                if (player != null) playerMenu(player);
                else System.err.println("Login failed. Please check your nickname and password.");
            }
            default -> System.err.println("Invalid type.");
        }
    }

    private static void administratorMenu(Administrator admin) {
        while (true) {
            System.out.println("\n--- Administrator Dashboard ---");
            System.out.println("1. Add Player");
            System.out.println("2. Add Coach");
            System.out.println("3. Create Tournament");
            System.out.println("4. Schedule Match");
            System.out.println("5. List Tournaments");
            System.out.println("6. Logout");
            int option = readSafeInt("Choose an option: ");

            switch (option) {
                case 1 -> {
                    try {
                        String name = readRequiredString("Player Full Name: ");
                        String nickname = readRequiredString("Nickname: ");
                        String password = readRequiredString("Password: ");
                        Player player = new Player(name, nickname, password, 0, 0, 0);
                        playerRepo.addPlayer(player);
                    } catch (IllegalArgumentException e) {
                        System.err.println("Error: " + e.getMessage());
                    }
                }
                case 2 -> {
                    try {
                        String name = readRequiredString("Coach Name: ");
                        String email = readRequiredString("Email: ");
                        String password = readRequiredString("Password: ");
                        Coach coach = new Coach(name, email, password);
                        if (coachRepo.addCoach(coach)) System.out.println("Coach added successfully!");
                        else System.err.println("Error: Coach with this email already exists.");
                    } catch (IllegalArgumentException e) {
                        System.err.println("Error: " + e.getMessage());
                    }
                }
                case 3 -> {
                    String tournamentName = readRequiredString("Tournament Name: ");
                    String game = readRequiredString("Game Table/eSport: ");
                    admin.createTournament(tournamentRepo, tournamentName, game);
                }
                case 4 -> {
                    try {
                        int team1Id = readSafeInt("Team 1 ID: ");
                        int team2Id = readSafeInt("Team 2 ID: ");
                        String date = readRequiredString("Match Date (YYYY-MM-DD): ");

                        Team team1 = teamRepo.findById(team1Id);
                        Team team2 = teamRepo.findById(team2Id);

                        if (team1 == null || team2 == null) {
                            System.err.println("Error: One or both teams not found.");
                        } else {
                            Match match = new Match(team1, team2, date);
                            matchRepo.addMatch(match);
                            System.out.println("Match scheduled successfully between " + team1.getName() + " and " + team2.getName());
                        }
                    } catch (Exception e) {
                        System.err.println("Error scheduling match: " + e.getMessage());
                    }
                }
                case 5 -> admin.listTournaments(tournamentRepo);
                case 6 -> { return; }
                default -> System.err.println("Invalid option.");
            }
        }
    }

    private static void coachMenu(Coach coach) {
        while (true) {
            System.out.println("\n--- Coach Dashboard ---");
            System.out.println("1. Create New Team");
            System.out.println("2. Add Player to Team");
            System.out.println("3. Register Team in Tournament");
            System.out.println("4. Track Tournament Progress");
            System.out.println("5. Logout");
            int option = readSafeInt("Choose an option: ");

            switch (option) {
                case 1 -> {
                    try {
                        String name = readRequiredString("Team Name: ");
                        Team newTeam = new Team(name, 0);
                        if (teamRepo.addTeam(newTeam)) {
                            coach.assignTeam(newTeam);
                            System.out.println("Team '" + name + "' created and assigned to you!");
                        } else {
                            System.err.println("Error: Team already exists.");
                        }
                    } catch (IllegalArgumentException e) {
                        System.err.println("Error: " + e.getMessage());
                    }
                }
                case 2 -> {
                    if (coach.getTeam() == null) {
                        System.err.println("No team assigned. Please create or assign a team first.");
                        break;
                    }
                    String nickname = readRequiredString("Player Nickname to add: ");
                    Player player = playerRepo.findByNickname(nickname);
                    if (player != null) {
                        if (coach.addPlayerToTeam(player)) System.out.println("Player added to team successfully!");
                        else System.err.println("Player is already in your team.");
                    } else {
                        System.err.println("Player not found in system.");
                    }
                }
                case 3 -> {
                    if (coach.getTeam() == null) {
                        System.err.println("No team assigned.");
                        break;
                    }
                    System.out.println("Available Tournaments:");
                    tournamentRepo.listTournaments().forEach(t -> System.out.println("- " + t.getName()));
                    String tName = readRequiredString("Enter Tournament Name: ");
                    Tournament tournament = tournamentRepo.listTournaments().stream()
                            .filter(t -> t.getName().equalsIgnoreCase(tName)).findFirst().orElse(null);
                    
                    if (tournament != null) coach.registerTeamInTournament(tournament);
                    else System.err.println("Tournament not found.");
                }
                case 4 -> {
                    System.out.println("--- All Tournaments Results ---");
                    tournamentRepo.listTournaments().forEach(Tournament::listResults);
                }
                case 5 -> { return; }
                default -> System.err.println("Invalid option.");
            }
        }
    }

    private static void playerMenu(Player player) {
        while (true) {
            System.out.println("\n--- Player Dashboard ---");
            System.out.println("1. Profile Overview");
            System.out.println("2. Edit Personal Data");
            System.out.println("3. View My Tournaments");
            System.out.println("4. My Statistics");
            System.out.println("5. Logout");
            int option = readSafeInt("Choose an option: ");

            switch (option) {
                case 1 -> {
                    System.out.println("Full Name: " + player.getFullName());
                    System.out.println("Nickname: " + player.getNickname());
                }
                case 2 -> {
                    try {
                        String newName = readRequiredString("New Full Name: ");
                        String newNick = readRequiredString("New Nickname: ");
                        player.editData(newName, newNick, playerRepo.listPlayers());
                    } catch (IllegalArgumentException e) {
                        System.err.println("Error: " + e.getMessage());
                    }
                }
                case 3 -> player.listTournaments();
                case 4 -> player.consultStatistics();
                case 5 -> { return; }
                default -> System.err.println("Invalid option.");
            }
        }
    }

    private static void loadAllData() {
        adminRepo.loadData("administrators.csv");
        playerRepo.loadData("players.csv");
        coachRepo.loadData("coaches.csv");
        tournamentRepo.loadData("tournaments.csv");
        matchRepo.loadData("matches.csv");
        teamRepo.loadData("teams.csv");
    }

    private static void saveAllData() {
        adminRepo.saveData("administrators.csv");
        playerRepo.saveData("players.csv");
        coachRepo.saveData("coaches.csv");
        tournamentRepo.saveData("tournaments.csv");
        matchRepo.saveData("matches.csv");
        teamRepo.saveData("teams.csv");
    }

    private static int readSafeInt(String prompt) {
        while (true) {
            try {
                if (!prompt.isEmpty()) System.out.print(prompt);
                int value = scanner.nextInt();
                scanner.nextLine(); // Clear buffer
                return value;
            } catch (InputMismatchException e) {
                System.err.println("Invalid input. Please enter a number.");
                scanner.nextLine(); // Clear buffer
            }
        }
    }

    private static String readRequiredString(String prompt) {
        String input;
        do {
            System.out.print(prompt);
            input = scanner.nextLine().trim();
            if (input.isEmpty()) System.err.println("This field cannot be empty. Please try again.");
        } while (input.isEmpty());
        return input;
    }
}
