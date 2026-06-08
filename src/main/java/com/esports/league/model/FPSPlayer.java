package com.esports.league.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("FPS")
public class FPSPlayer extends Player {

    private double accuracy;
    private int headshots;

    public FPSPlayer() {}

    public FPSPlayer(String fullName, String nickname, String password,
                     int matchesPlayed, int wins, int losses,
                     double accuracy, int headshots) {
        super(fullName, nickname, password, matchesPlayed, wins, losses);
        this.accuracy = accuracy;
        this.headshots = headshots;
    }

    public double getAccuracy() { return accuracy; }
    public void setAccuracy(double accuracy) { this.accuracy = accuracy; }

    public int getHeadshots() { return headshots; }
    public void setHeadshots(int headshots) { this.headshots = headshots; }

    @Override
    public String getPlayerType() { return "FPS"; }
}
