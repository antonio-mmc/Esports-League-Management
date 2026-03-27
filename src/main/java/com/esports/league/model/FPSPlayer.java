package com.esports.league.model;

/**
 * Specialization of Player for FPS games.
 */
public class FPSPlayer extends Player {
    private static final long serialVersionUID = 1L;
    
    private double accuracy;
    private int headshots;

    public FPSPlayer(String fullName, String nickname, String password, int matchesPlayed, int wins, int losses, double accuracy, int headshots) {
        super(fullName, nickname, password, matchesPlayed, wins, losses);
        this.accuracy = accuracy;
        this.headshots = headshots;
    }

    public double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(double accuracy) {
        this.accuracy = accuracy;
    }

    public int getHeadshots() {
        return headshots;
    }

    public void setHeadshots(int headshots) {
        this.headshots = headshots;
    }

    @Override
    public void consultStatistics() {
        super.consultStatistics();
        System.out.println("Accuracy: " + accuracy + "%");
        System.out.println("Headshots: " + headshots);
    }
}
