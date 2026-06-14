package com.esports.league.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Single source of truth for game titles, tournament formats and status derivation. */
public final class GameCatalog {

    private GameCatalog() {}

    /** Real-world titles available within each modality (mirrors the frontend GAME_TITLES). */
    public static final Map<String, List<String>> TITLES = Map.of(
        "FPS",           List.of("Valorant", "CS2"),
        "MOBA",          List.of("League of Legends", "Dota 2"),
        "EFOOTBALL",     List.of("FIFA", "EA FC 25", "eFootball"),
        "RACING",        List.of("iRacing", "Gran Turismo 7"),
        "BATTLE_ROYALE", List.of("PUBG", "Fortnite")
    );

    /** Maximum number of teams a format supports (min is left as soft UI guidance). */
    public static final Map<String, Integer> MAX_TEAMS = Map.of(
        "LEAGUE",             16,
        "SINGLE_ELIMINATION", 16,
        "DOUBLE_ELIMINATION", 8,
        "GROUP_STAGE",        16
    );

    /**
     * Validates that a title belongs to a modality. Unknown modalities and null
     * titles are accepted (treated as "not specified") so legacy rows stay editable.
     */
    public static void validateTitle(String game, String specificGame) {
        if (game == null || specificGame == null || specificGame.isBlank()) return;
        List<String> titles = TITLES.get(game.toUpperCase());
        if (titles != null && !titles.contains(specificGame)) {
            throw new IllegalArgumentException(
                specificGame + " is not a valid " + game + " title.");
        }
    }

    public static int maxTeams(String format) {
        return MAX_TEAMS.getOrDefault(format == null ? "LEAGUE" : format, 16);
    }

    /**
     * Tournament status implied by its dates: UPCOMING before the start, COMPLETED
     * after the end, ACTIVE in between (or when dates are missing).
     */
    public static String deriveStatus(LocalDate start, LocalDate end) {
        LocalDate today = LocalDate.now();
        if (start != null && today.isBefore(start)) return "UPCOMING";
        if (end != null && today.isAfter(end))      return "COMPLETED";
        return "ACTIVE";
    }
}
