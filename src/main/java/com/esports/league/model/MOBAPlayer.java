package com.esports.league.model;

/**
 * Specialization of Player for MOBA games.
 */
public class MOBAPlayer extends Player {
    private static final long serialVersionUID = 1L;

    private String mainCharacter;
    private int kills;
    private int deaths;
    private int assists;

    public MOBAPlayer(String fullName, String nickname, String password, int matchesPlayed, int wins, int losses, String mainCharacter, int kills, int deaths, int assists) {
        super(fullName, nickname, password, matchesPlayed, wins, losses);
        this.mainCharacter = mainCharacter;
        this.kills = kills;
        this.deaths = deaths;
        this.assists = assists;
    }

    public String getMainCharacter() {
        return mainCharacter;
    }

    public void setMainCharacter(String mainCharacter) {
        if (mainCharacter == null) throw new IllegalArgumentException("Main character name cannot be null.");
        this.mainCharacter = mainCharacter;
    }

    public int getKills() {
        return kills;
    }

    public void setKills(int kills) {
        if (kills < 0) throw new IllegalArgumentException("Kills cannot be negative.");
        this.kills = kills;
    }

    public int getDeaths() {
        return deaths;
    }

    public void setDeaths(int deaths) {
        if (deaths < 0) throw new IllegalArgumentException("Deaths cannot be negative.");
        this.deaths = deaths;
    }

    public int getAssists() {
        return assists;
    }

    public void setAssists(int assists) {
        if (assists < 0) throw new IllegalArgumentException("Assists cannot be negative.");
        this.assists = assists;
    }

    public void registerKDA(int newKills, int newDeaths, int newAssists) {
        if (newKills < 0 || newDeaths < 0 || newAssists < 0) {
            throw new IllegalArgumentException("Values of kills, deaths, or assists cannot be negative.");
        }
        this.kills += newKills;
        this.deaths += newDeaths;
        this.assists += newAssists;
    }

    public double calculateKDARatio() {
        if (deaths == 0) return (double) (kills + assists);
        return (double) (kills + assists) / deaths;
    }

    @Override
    public void consultStatistics() {
        super.consultStatistics();
        System.out.println("Main Character: " + mainCharacter);
        System.out.println("Kills: " + kills);
        System.out.println("Deaths: " + deaths);
        System.out.println("Assists: " + assists);
        System.out.println(String.format("KDA Ratio: %.2f", calculateKDARatio()));
    }
}
