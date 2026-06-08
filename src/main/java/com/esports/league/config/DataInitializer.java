package com.esports.league.config;

import com.esports.league.model.*;
import com.esports.league.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final TeamRepository teamRepo;
    private final PlayerRepository playerRepo;
    private final CoachRepository coachRepo;
    private final TournamentRepository tournamentRepo;
    private final MatchRepository matchRepo;

    public DataInitializer(TeamRepository teamRepo, PlayerRepository playerRepo,
                           CoachRepository coachRepo, TournamentRepository tournamentRepo,
                           MatchRepository matchRepo) {
        this.teamRepo = teamRepo;
        this.playerRepo = playerRepo;
        this.coachRepo = coachRepo;
        this.tournamentRepo = tournamentRepo;
        this.matchRepo = matchRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (teamRepo.count() > 0) return;

        // ── Teams ──────────────────────────────────────────────────────────────
        Team nexus   = team("Team Nexus",    9,  3, 0, 1);
        Team storm   = team("Storm Raiders", 6,  2, 0, 2);
        Team phantom = team("Phantom Squad", 12, 4, 0, 0);
        Team iron    = team("Iron Wolves",   3,  1, 0, 3);
        Team echo    = team("Echo Strike",   7,  2, 1, 1);
        Team apex    = team("Apex Horizon",  10, 3, 1, 0);
        teamRepo.saveAll(List.of(nexus, storm, phantom, iron, echo, apex));

        // ── Coaches ────────────────────────────────────────────────────────────
        coachRepo.saveAll(List.of(
            coach("Marcus Webb",  "marcus@nexus.gg",   nexus),
            coach("Sofia Reyes",  "sofia@storm.gg",    storm),
            coach("Jin Park",     "jin@phantom.gg",    phantom),
            coach("Lena Müller",  "lena@iron.gg",      iron),
            coach("Dario Costa",  "dario@echo.gg",     echo),
            coach("Priya Nair",   "priya@apex.gg",     apex)
        ));

        // ── FPS Players (Nexus + Storm + Phantom) ──────────────────────────────
        playerRepo.saveAll(List.of(
            fps("Carlos Mendes",   "cMendes99",  nexus,   12, 8, 4, 71.4, 234),
            fps("Ana Torres",      "xAna7",      nexus,   10, 7, 3, 68.2, 198),
            fps("Ricardo Fonseca", "rickF",      nexus,   14, 9, 5, 74.1, 312),
            fps("Beatriz Lima",    "bLima",      nexus,    8, 6, 2, 65.8, 143),
            fps("Diogo Pinto",     "dPinto",     nexus,   11, 7, 4, 70.3, 267),

            fps("Jake Morris",     "jakeMorris", storm,    9, 5, 4, 63.5, 178),
            fps("Yuki Tanaka",     "yukiT",      storm,   13, 8, 5, 72.0, 289),
            fps("Elena Popova",    "elenaP",     storm,    7, 4, 3, 61.2, 134),
            fps("Kwame Asante",    "kAsante",    storm,   10, 5, 5, 66.7, 201),
            fps("Mia Jensen",      "mJensen",    storm,    6, 3, 3, 59.4, 112),

            fps("Sven Larsson",    "svenL",      phantom, 15, 12, 3, 80.5, 421),
            fps("Nina Rossi",      "nRossi",     phantom, 13, 10, 3, 77.3, 367),
            fps("Omar Hassan",     "oHassan",    phantom, 11,  9, 2, 75.8, 298),
            fps("Chloe Dubois",    "cDubois",    phantom, 14, 11, 3, 78.2, 344),
            fps("Leo Santos",      "lSantos",    phantom, 12, 10, 2, 76.1, 310)
        ));

        // ── MOBA Players (Iron + Echo) ─────────────────────────────────────────
        playerRepo.saveAll(List.of(
            moba("Max Fischer",    "mFischer",  iron,  8, 3, 5, "Darius",   47, 62, 38),
            moba("Sara Kim",       "sKim",      iron,  9, 4, 5, "Lux",      31, 44, 91),
            moba("Pavel Novak",    "pNovak",    iron,  7, 2, 5, "Jinx",     58, 71, 27),
            moba("Aisha Diallo",   "aDiallo",   iron, 10, 4, 6, "Thresh",   22, 55, 112),
            moba("Tom Walsh",      "tWalsh",    iron,  6, 2, 4, "Yasuo",    73, 89, 41),

            moba("Luca Bianchi",   "lBianchi",  echo, 11, 7, 4, "Ezreal",   88, 54, 63),
            moba("Hana Kovač",     "hKovac",    echo,  9, 6, 3, "Syndra",   64, 48, 79),
            moba("Ryo Suzuki",     "rSuzuki",   echo, 12, 8, 4, "Lee Sin", 102, 67, 58),
            moba("Fatima Al-Amin", "fatimaa",   echo,  8, 5, 3, "Soraka",   15, 38, 134),
            moba("Diego Vargas",   "dVargas",   echo, 10, 6, 4, "Zed",      91, 72, 44)
        ));

        // ── eFootball Players (Apex) ───────────────────────────────────────────
        playerRepo.saveAll(List.of(
            efb("Ingrid Berg",      "iBerg",    apex, 13, 9, 4, "ST",  22, 0,  8),
            efb("Kofi Mensah",      "kMensah",  apex, 11, 8, 3, "CM",   7, 0, 14),
            efb("Zara Ahmed",       "zAhmed",   apex, 14, 10, 4, "LW", 18, 0, 11),
            efb("Marco Ruiz",       "mRuiz",    apex, 10,  7, 3, "GK",  0, 31,  2),
            efb("Ayumi Nakamura",   "ayumiN",   apex, 12,  9, 3, "CB",  3,  8,  5)
        ));

        // ── Tournaments ────────────────────────────────────────────────────────
        Tournament valorant = tournament("Valorant Spring Cup 2026", "FPS",       "ACTIVE",    nexus, storm, phantom);
        Tournament lol      = tournament("LoL Summer League 2026",   "MOBA",      "ACTIVE",    iron, echo, nexus);
        Tournament fifa     = tournament("FIFA eLeague 2026",         "eFootball", "UPCOMING",  apex, storm);
        tournamentRepo.saveAll(List.of(valorant, lol, fifa));

        // ── Matches ────────────────────────────────────────────────────────────
        matchRepo.saveAll(List.of(
            played(phantom, nexus,   "2026-05-10", valorant, 13,  8),
            played(storm,   nexus,   "2026-05-12", valorant, 11, 13),
            played(nexus,   storm,   "2026-05-17", valorant, 13, 10),
            played(phantom, storm,   "2026-05-19", valorant, 13,  6),
            played(echo,    iron,    "2026-05-14", lol,      25, 18),
            played(nexus,   iron,    "2026-05-16", lol,      31, 22),
            upcoming(phantom, storm,  "2026-06-08", valorant),
            upcoming(nexus,  phantom, "2026-06-10", valorant),
            upcoming(iron,   echo,    "2026-06-12", lol),
            upcoming(echo,   nexus,   "2026-06-15", lol),
            upcoming(apex,   storm,   "2026-07-05", fifa)
        ));

        teamRepo.saveAll(List.of(nexus, storm, phantom, iron, echo, apex));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Team team(String name, int pts, int w, int d, int l) {
        Team t = new Team(name);
        t.setPoints(pts); t.setWins(w); t.setDraws(d); t.setLosses(l);
        return t;
    }

    private Coach coach(String name, String email, Team team) {
        Coach c = new Coach(name, email, "password");
        c.setTeam(team);
        team.setCoach(c);
        return c;
    }

    private FPSPlayer fps(String fullName, String nick, Team team,
                          int mp, int w, int l, double accuracy, int headshots) {
        FPSPlayer p = new FPSPlayer(fullName, nick, "password", mp, w, l, accuracy, headshots);
        p.setTeam(team);
        return p;
    }

    private MOBAPlayer moba(String fullName, String nick, Team team,
                            int mp, int w, int l,
                            String character, int kills, int deaths, int assists) {
        MOBAPlayer p = new MOBAPlayer(fullName, nick, "password", mp, w, l, character, kills, deaths, assists);
        p.setTeam(team);
        return p;
    }

    private EFootballPlayer efb(String fullName, String nick, Team team,
                                int mp, int w, int l,
                                String position, int goals, int saved, int assists) {
        EFootballPlayer p = new EFootballPlayer(fullName, nick, "password", mp, w, l, position, goals, saved, assists);
        p.setTeam(team);
        return p;
    }

    private Tournament tournament(String name, String game, String status, Team... teams) {
        Tournament t = new Tournament(name, game);
        t.setStatus(status);
        for (Team team : teams) t.getParticipatingTeams().add(team);
        return t;
    }

    private Match played(Team a, Team b, String date, Tournament t, int sa, int sb) {
        Match m = new Match(a, b, LocalDate.parse(date), t);
        m.setTeamAScore(sa);
        m.setTeamBScore(sb);
        m.setResultRecorded(true);
        return m;
    }

    private Match upcoming(Team a, Team b, String date, Tournament t) {
        return new Match(a, b, LocalDate.parse(date), t);
    }
}
