package com.esports.league.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("FPS")
public class FPSPlayer extends Player {

    private double accuracy;
    private int headshots;
    private Double kast;
    private Double adr;

    public FPSPlayer() {}

    public FPSPlayer(String fullName, String nickname,
                     int matchesPlayed, int wins, int losses,
                     double accuracy, int headshots, double kast, double adr) {
        super(fullName, nickname, matchesPlayed, wins, losses);
        this.accuracy = accuracy;
        this.headshots = headshots;
        this.kast = kast;
        this.adr = adr;
    }

    public double getAccuracy() { return accuracy; }
    public void setAccuracy(double accuracy) { this.accuracy = accuracy; }

    public int getHeadshots() { return headshots; }
    public void setHeadshots(int headshots) { this.headshots = headshots; }

    public Double getKast() { return kast; }
    public void setKast(Double kast) { this.kast = kast; }

    public Double getAdr() { return adr; }
    public void setAdr(Double adr) { this.adr = adr; }

    @Override
    public String getPlayerType() { return "FPS"; }
}
