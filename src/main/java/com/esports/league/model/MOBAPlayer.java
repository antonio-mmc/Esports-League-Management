package com.esports.league.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("MOBA")
public class MOBAPlayer extends Player {

    private String mainCharacter;
    private int kills;
    private int deaths;
    private int mobaAssists;

    public MOBAPlayer() {}

    public MOBAPlayer(String fullName, String nickname,
                      int matchesPlayed, int wins, int losses,
                      String mainCharacter, int kills, int deaths, int assists) {
        super(fullName, nickname, matchesPlayed, wins, losses);
        this.mainCharacter = mainCharacter;
        this.kills = kills;
        this.deaths = deaths;
        this.mobaAssists = assists;
    }

    public String getMainCharacter() { return mainCharacter; }
    public void setMainCharacter(String mainCharacter) {
        if (mainCharacter == null) throw new IllegalArgumentException("Main character cannot be null.");
        this.mainCharacter = mainCharacter;
    }

    public int getKills() { return kills; }
    public void setKills(int kills) {
        if (kills < 0) throw new IllegalArgumentException("Kills cannot be negative.");
        this.kills = kills;
    }

    public int getDeaths() { return deaths; }
    public void setDeaths(int deaths) {
        if (deaths < 0) throw new IllegalArgumentException("Deaths cannot be negative.");
        this.deaths = deaths;
    }

    public int getMobaAssists() { return mobaAssists; }
    public void setMobaAssists(int assists) {
        if (assists < 0) throw new IllegalArgumentException("Assists cannot be negative.");
        this.mobaAssists = assists;
    }

    public double getKdaRatio() {
        if (deaths == 0) return kills + mobaAssists;
        return (double) (kills + mobaAssists) / deaths;
    }

    @Override
    public String getPlayerType() { return "MOBA"; }
}
