package com.esports.league.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("BATTLE_ROYALE")
public class BattleRoyalePlayer extends Player {

    private double avgPlacement;
    private int kills;
    private double top10Rate;
    private double damagePerMatch;

    public BattleRoyalePlayer() {}

    public BattleRoyalePlayer(String fullName, String nickname,
                               int matchesPlayed, int wins, int losses,
                               double avgPlacement, int kills, double top10Rate, double damagePerMatch) {
        super(fullName, nickname, matchesPlayed, wins, losses);
        this.avgPlacement = avgPlacement;
        this.kills = kills;
        this.top10Rate = top10Rate;
        this.damagePerMatch = damagePerMatch;
    }

    public double getAvgPlacement() { return avgPlacement; }
    public void setAvgPlacement(double avgPlacement) { this.avgPlacement = avgPlacement; }

    public int getKills() { return kills; }
    public void setKills(int kills) { this.kills = kills; }

    public double getTop10Rate() { return top10Rate; }
    public void setTop10Rate(double top10Rate) { this.top10Rate = top10Rate; }

    public double getDamagePerMatch() { return damagePerMatch; }
    public void setDamagePerMatch(double damagePerMatch) { this.damagePerMatch = damagePerMatch; }

    @Override
    public String getPlayerType() { return "BATTLE_ROYALE"; }
}
