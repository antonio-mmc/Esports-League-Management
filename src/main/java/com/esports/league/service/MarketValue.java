package com.esports.league.service;

import com.esports.league.model.Coach;
import com.esports.league.model.Player;

/** Deterministic market valuation used for free-agent prices and transfer fees (in euros). */
public final class MarketValue {

    private MarketValue() {}

    /** Player value derived from their record (wins, win rate and experience). */
    public static long of(Player p) {
        int total = p.getWins() + p.getLosses();
        int winRate = total > 0 ? (int) Math.round(100.0 * p.getWins() / total) : 50;
        long v = 200_000L
            + p.getWins() * 15_000L
            + (long) (winRate - 50) * 4_000L
            + p.getMatchesPlayed() * 3_000L;
        v = Math.max(50_000L, v);
        return Math.round(v / 5_000.0) * 5_000L; // round to the nearest €5,000
    }

    /** Coach value scales with how decorated they are. */
    public static long of(Coach c) {
        int achievements = c.getAchievements() != null ? c.getAchievements().size() : 0;
        return 150_000L + achievements * 40_000L;
    }
}
