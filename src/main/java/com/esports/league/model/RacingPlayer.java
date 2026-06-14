package com.esports.league.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("RACING")
public class RacingPlayer extends Player {

    private double avgPosition;
    private int podiums;
    private int fastestLaps;
    private int dnf;

    public RacingPlayer() {}

    public RacingPlayer(String fullName, String nickname,
                        int matchesPlayed, int wins, int losses,
                        double avgPosition, int podiums, int fastestLaps, int dnf) {
        super(fullName, nickname, matchesPlayed, wins, losses);
        this.avgPosition = avgPosition;
        this.podiums = podiums;
        this.fastestLaps = fastestLaps;
        this.dnf = dnf;
    }

    public double getAvgPosition() { return avgPosition; }
    public void setAvgPosition(double avgPosition) { this.avgPosition = avgPosition; }

    public int getPodiums() { return podiums; }
    public void setPodiums(int podiums) { this.podiums = podiums; }

    public int getFastestLaps() { return fastestLaps; }
    public void setFastestLaps(int fastestLaps) { this.fastestLaps = fastestLaps; }

    public int getDnf() { return dnf; }
    public void setDnf(int dnf) { this.dnf = dnf; }

    @Override
    public String getPlayerType() { return "RACING"; }
}
