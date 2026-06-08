package com.esports.league.config;

import com.esports.league.model.*;
import com.esports.league.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    // eFootball nickname → [shotsOnTarget, ballRecoveries]
    private static final Map<String, int[]> EFB_STATS = Map.of(
        "iBerg",   new int[]{31,  8},
        "kMensah", new int[]{14, 21},
        "zAhmed",  new int[]{24, 13},
        "mRuiz",   new int[]{ 0,  5},
        "ayumiN",  new int[]{ 8, 29}
    );

    // FPS nickname → [kast, adr]
    private static final Map<String, double[]> FPS_STATS = Map.ofEntries(
        Map.entry("cMendes99",  new double[]{74.2, 152.3}),
        Map.entry("xAna7",      new double[]{71.5, 143.8}),
        Map.entry("rickF",      new double[]{76.8, 161.4}),
        Map.entry("bLima",      new double[]{68.3, 131.7}),
        Map.entry("dPinto",     new double[]{73.1, 148.9}),
        Map.entry("jakeMorris", new double[]{69.4, 138.2}),
        Map.entry("yukiT",      new double[]{75.3, 156.7}),
        Map.entry("elenaP",     new double[]{66.8, 127.4}),
        Map.entry("kAsante",    new double[]{70.9, 142.1}),
        Map.entry("mJensen",    new double[]{64.2, 119.8}),
        Map.entry("svenL",      new double[]{82.1, 178.6}),
        Map.entry("nRossi",     new double[]{79.4, 168.3}),
        Map.entry("oHassan",    new double[]{77.6, 163.9}),
        Map.entry("cDubois",    new double[]{80.3, 171.2}),
        Map.entry("lSantos",    new double[]{78.5, 165.8})
    );

    // Nickname → [nationality, city, birthDate]
    private static final Map<String, String[]> PROFILES = Map.ofEntries(
        Map.entry("cMendes99",  new String[]{"Portugal",       "Porto",       "2000-05-22"}),
        Map.entry("xAna7",      new String[]{"Spain",          "Madrid",      "2002-08-14"}),
        Map.entry("rickF",      new String[]{"Portugal",       "Lisbon",      "1999-12-03"}),
        Map.entry("bLima",      new String[]{"Portugal",       "Braga",       "2003-03-29"}),
        Map.entry("dPinto",     new String[]{"Portugal",       "Faro",        "2001-07-11"}),
        Map.entry("jakeMorris", new String[]{"USA",            "Los Angeles", "2001-09-19"}),
        Map.entry("yukiT",      new String[]{"Japan",          "Tokyo",       "2000-02-28"}),
        Map.entry("elenaP",     new String[]{"Russia",         "Moscow",      "2002-11-05"}),
        Map.entry("kAsante",    new String[]{"Ghana",          "Accra",       "2001-04-17"}),
        Map.entry("mJensen",    new String[]{"Denmark",        "Copenhagen",  "2004-01-30"}),
        Map.entry("svenL",      new String[]{"Sweden",         "Stockholm",   "1998-06-23"}),
        Map.entry("nRossi",     new String[]{"Italy",          "Milan",       "2000-09-08"}),
        Map.entry("oHassan",    new String[]{"Egypt",          "Cairo",       "1999-03-14"}),
        Map.entry("cDubois",    new String[]{"France",         "Paris",       "2002-12-01"}),
        Map.entry("lSantos",    new String[]{"Brazil",         "São Paulo",   "2001-05-20"}),
        Map.entry("mFischer",   new String[]{"Germany",        "Berlin",      "2000-07-04"}),
        Map.entry("sKim",       new String[]{"South Korea",    "Seoul",       "2003-02-16"}),
        Map.entry("pNovak",     new String[]{"Czech Republic", "Prague",      "2001-10-22"}),
        Map.entry("aDiallo",    new String[]{"Senegal",        "Dakar",       "2002-06-30"}),
        Map.entry("tWalsh",     new String[]{"Ireland",        "Dublin",      "2004-04-08"}),
        Map.entry("lBianchi",   new String[]{"Italy",          "Rome",        "1999-08-15"}),
        Map.entry("hKovac",     new String[]{"Croatia",        "Zagreb",      "2002-01-25"}),
        Map.entry("rSuzuki",    new String[]{"Japan",          "Osaka",       "2000-11-10"}),
        Map.entry("fatimaa",    new String[]{"Lebanon",        "Beirut",      "2003-07-22"}),
        Map.entry("dVargas",    new String[]{"Colombia",       "Bogotá",      "2001-03-05"}),
        Map.entry("iBerg",      new String[]{"Norway",         "Oslo",        "2000-04-12"}),
        Map.entry("kMensah",    new String[]{"Ghana",          "Accra",       "2002-09-27"}),
        Map.entry("zAhmed",     new String[]{"Pakistan",       "Karachi",     "2001-12-18"}),
        Map.entry("mRuiz",      new String[]{"Spain",          "Barcelona",   "1999-06-09"}),
        Map.entry("ayumiN",     new String[]{"Japan",          "Kyoto",       "2003-05-04"})
    );

    @Override
    @Transactional
    public void run(String... args) {
        if (teamRepo.count() > 0) {
            boolean playersMissing  = playerRepo.findAll().stream().anyMatch(p -> p.getNationality() == null);
            boolean tourneysMissing = tournamentRepo.findAll().stream().anyMatch(t -> t.getStartDate() == null);
            boolean fpsMissing      = playerRepo.findAll().stream().anyMatch(p -> p instanceof FPSPlayer fps && fps.getKast() == null);
            boolean efbMissing      = playerRepo.findAll().stream().anyMatch(p -> p instanceof EFootballPlayer efb && efb.getBallRecoveries() == null);
            boolean racingMissing   = playerRepo.findAll().stream().noneMatch(p -> p instanceof RacingPlayer);
            boolean brMissing       = playerRepo.findAll().stream().noneMatch(p -> p instanceof BattleRoyalePlayer);
            boolean historyMissing  = tournamentRepo.findAll().stream().noneMatch(t -> "COMPLETED".equals(t.getStatus()));
            if (!playersMissing && !tourneysMissing && !fpsMissing && !efbMissing && !racingMissing && !brMissing && !historyMissing) return;

            if (playersMissing) {
                playerRepo.findAll().forEach(p -> {
                    String[] d = PROFILES.get(p.getNickname());
                    if (d != null) {
                        p.setNationality(d[0]);
                        p.setCity(d[1]);
                        p.setBirthDate(LocalDate.parse(d[2]));
                        playerRepo.save(p);
                    }
                });
            }

            if (fpsMissing) {
                playerRepo.findAll().forEach(p -> {
                    if (!(p instanceof FPSPlayer fps) || fps.getKast() != null) return;
                    double[] s = FPS_STATS.get(fps.getNickname());
                    if (s != null) { fps.setKast(s[0]); fps.setAdr(s[1]); playerRepo.save(fps); }
                });
            }

            if (tourneysMissing) {
                tournamentRepo.findAll().forEach(t -> {
                    if (t.getStartDate() != null) return;
                    if (t.getGame().equalsIgnoreCase("FPS"))       t.setStartDate(LocalDate.of(2026,  4,  1));
                    else if (t.getGame().equalsIgnoreCase("MOBA")) t.setStartDate(LocalDate.of(2026,  4, 15));
                    else                                           t.setStartDate(LocalDate.of(2026,  7,  1));
                    tournamentRepo.save(t);
                });
            }

            if (efbMissing) {
                playerRepo.findAll().forEach(p -> {
                    if (!(p instanceof EFootballPlayer efb) || efb.getBallRecoveries() != null) return;
                    int[] s = EFB_STATS.get(efb.getNickname());
                    if (s != null) { efb.setShotsOnTarget(s[0]); efb.setBallRecoveries(s[1]); playerRepo.save(efb); }
                });
            }

            if (racingMissing) seedRacing();
            if (brMissing)     seedBattleRoyale();
            if (historyMissing) seedHistory();

            return;
        }

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
            fps("Carlos Mendes",   "cMendes99",  nexus,   12, 8, 4, 71.4, 234, 74.2, 152.3, "Portugal",  "Porto",       LocalDate.of(2000,  5, 22)),
            fps("Ana Torres",      "xAna7",      nexus,   10, 7, 3, 68.2, 198, 71.5, 143.8, "Spain",     "Madrid",      LocalDate.of(2002,  8, 14)),
            fps("Ricardo Fonseca", "rickF",      nexus,   14, 9, 5, 74.1, 312, 76.8, 161.4, "Portugal",  "Lisbon",      LocalDate.of(1999, 12,  3)),
            fps("Beatriz Lima",    "bLima",      nexus,    8, 6, 2, 65.8, 143, 68.3, 131.7, "Portugal",  "Braga",       LocalDate.of(2003,  3, 29)),
            fps("Diogo Pinto",     "dPinto",     nexus,   11, 7, 4, 70.3, 267, 73.1, 148.9, "Portugal",  "Faro",        LocalDate.of(2001,  7, 11)),

            fps("Jake Morris",     "jakeMorris", storm,    9, 5, 4, 63.5, 178, 69.4, 138.2, "USA",       "Los Angeles", LocalDate.of(2001,  9, 19)),
            fps("Yuki Tanaka",     "yukiT",      storm,   13, 8, 5, 72.0, 289, 75.3, 156.7, "Japan",     "Tokyo",       LocalDate.of(2000,  2, 28)),
            fps("Elena Popova",    "elenaP",     storm,    7, 4, 3, 61.2, 134, 66.8, 127.4, "Russia",    "Moscow",      LocalDate.of(2002, 11,  5)),
            fps("Kwame Asante",    "kAsante",    storm,   10, 5, 5, 66.7, 201, 70.9, 142.1, "Ghana",     "Accra",       LocalDate.of(2001,  4, 17)),
            fps("Mia Jensen",      "mJensen",    storm,    6, 3, 3, 59.4, 112, 64.2, 119.8, "Denmark",   "Copenhagen",  LocalDate.of(2004,  1, 30)),

            fps("Sven Larsson",    "svenL",      phantom, 15, 12, 3, 80.5, 421, 82.1, 178.6, "Sweden",   "Stockholm",   LocalDate.of(1998,  6, 23)),
            fps("Nina Rossi",      "nRossi",     phantom, 13, 10, 3, 77.3, 367, 79.4, 168.3, "Italy",    "Milan",       LocalDate.of(2000,  9,  8)),
            fps("Omar Hassan",     "oHassan",    phantom, 11,  9, 2, 75.8, 298, 77.6, 163.9, "Egypt",    "Cairo",       LocalDate.of(1999,  3, 14)),
            fps("Chloe Dubois",    "cDubois",    phantom, 14, 11, 3, 78.2, 344, 80.3, 171.2, "France",   "Paris",       LocalDate.of(2002, 12,  1)),
            fps("Leo Santos",      "lSantos",    phantom, 12, 10, 2, 76.1, 310, 78.5, 165.8, "Brazil",   "São Paulo",   LocalDate.of(2001,  5, 20))
        ));

        // ── MOBA Players (Iron + Echo) ─────────────────────────────────────────
        playerRepo.saveAll(List.of(
            moba("Max Fischer",    "mFischer",  iron,  8, 3, 5, "Darius",   47,  62,  38, "Germany",      "Berlin",  LocalDate.of(2000,  7,  4)),
            moba("Sara Kim",       "sKim",      iron,  9, 4, 5, "Lux",      31,  44,  91, "South Korea",  "Seoul",   LocalDate.of(2003,  2, 16)),
            moba("Pavel Novak",    "pNovak",    iron,  7, 2, 5, "Jinx",     58,  71,  27, "Czech Republic","Prague", LocalDate.of(2001, 10, 22)),
            moba("Aisha Diallo",   "aDiallo",   iron, 10, 4, 6, "Thresh",   22,  55, 112, "Senegal",      "Dakar",   LocalDate.of(2002,  6, 30)),
            moba("Tom Walsh",      "tWalsh",    iron,  6, 2, 4, "Yasuo",    73,  89,  41, "Ireland",      "Dublin",  LocalDate.of(2004,  4,  8)),

            moba("Luca Bianchi",   "lBianchi",  echo, 11, 7, 4, "Ezreal",   88,  54,  63, "Italy",        "Rome",    LocalDate.of(1999,  8, 15)),
            moba("Hana Kovač",     "hKovac",    echo,  9, 6, 3, "Syndra",   64,  48,  79, "Croatia",      "Zagreb",  LocalDate.of(2002,  1, 25)),
            moba("Ryo Suzuki",     "rSuzuki",   echo, 12, 8, 4, "Lee Sin", 102,  67,  58, "Japan",        "Osaka",   LocalDate.of(2000, 11, 10)),
            moba("Fatima Al-Amin", "fatimaa",   echo,  8, 5, 3, "Soraka",   15,  38, 134, "Lebanon",      "Beirut",  LocalDate.of(2003,  7, 22)),
            moba("Diego Vargas",   "dVargas",   echo, 10, 6, 4, "Zed",      91,  72,  44, "Colombia",     "Bogotá",  LocalDate.of(2001,  3,  5))
        ));

        // ── eFootball Players (Apex) ───────────────────────────────────────────
        playerRepo.saveAll(List.of(
            efb("Ingrid Berg",    "iBerg",    apex, 13,  9, 4, "ST",  22,  0,  8, 31,  8, "Norway",   "Oslo",      LocalDate.of(2000,  4, 12)),
            efb("Kofi Mensah",    "kMensah",  apex, 11,  8, 3, "CM",   7,  0, 14, 14, 21, "Ghana",    "Accra",     LocalDate.of(2002,  9, 27)),
            efb("Zara Ahmed",     "zAhmed",   apex, 14, 10, 4, "LW",  18,  0, 11, 24, 13, "Pakistan", "Karachi",   LocalDate.of(2001, 12, 18)),
            efb("Marco Ruiz",     "mRuiz",    apex, 10,  7, 3, "GK",   0, 31,  2,  0,  5, "Spain",    "Barcelona", LocalDate.of(1999,  6,  9)),
            efb("Ayumi Nakamura", "ayumiN",   apex, 12,  9, 3, "CB",   3,  8,  5,  8, 29, "Japan",    "Kyoto",     LocalDate.of(2003,  5,  4))
        ));

        // ── Tournaments ────────────────────────────────────────────────────────
        Tournament valorant = tournament("Valorant Spring Cup 2026", "FPS",       "ACTIVE",   "2026-04-01", nexus, storm, phantom);
        Tournament lol      = tournament("LoL Summer League 2026",   "MOBA",      "ACTIVE",   "2026-04-15", iron, echo, nexus);
        Tournament fifa     = tournament("FIFA eLeague 2026",         "eFootball", "UPCOMING", "2026-07-01", apex, storm);
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

        seedRacing();
        seedBattleRoyale();
        seedHistory();
    }

    // ── Racing seed ────────────────────────────────────────────────────────────

    private void seedRacing() {
        // Velocity Grid: Mediterranean squad (IT/PT/MX/MA/NL), pts=9, 3W-5L
        // Nitro Kings: Northern European powerhouse (DE/SE/RU/JP/GH), pts=15, 5W-3L
        Team velocity = team("Velocity Grid", 9,  3, 0, 5);
        Team nitro    = team("Nitro Kings",  15,  5, 0, 3);
        teamRepo.saveAll(List.of(velocity, nitro));

        coachRepo.saveAll(List.of(
            coach("Alessandro Romano", "a.romano@velocitygrid.gg", velocity),
            coach("Hans Brauer",       "h.brauer@nitrokings.gg",   nitro)
        ));

        // avgPosition, podiums, fastestLaps, dnf — career stats across the full season
        playerRepo.saveAll(List.of(
            // Velocity Grid
            racing("Marco Ferretti",  "ferriV",    velocity, 8, 3, 5, 2.3,  5, 4, 2, "Italy",     "Turin",       LocalDate.of(2001,  3, 18)),
            racing("Sofia Almeida",   "sofiaSpeed", velocity, 8, 3, 5, 4.1,  3, 2, 3, "Portugal",  "Lisbon",      LocalDate.of(2002,  9,  7)),
            racing("Carlos Espinoza", "espinozaGP", velocity, 8, 3, 5, 5.8,  2, 3, 1, "Mexico",    "Mexico City", LocalDate.of(2000, 12, 24)),
            racing("Yasmin Nouri",    "ynouri",     velocity, 8, 3, 5, 7.3,  1, 1, 4, "Morocco",   "Casablanca",  LocalDate.of(2003,  4, 16)),
            racing("Pieter Van Horn", "pvhorn",     velocity, 8, 3, 5, 9.1,  0, 1, 5, "Netherlands","Amsterdam",  LocalDate.of(2004,  7,  2)),

            // Nitro Kings
            racing("Sebastian Hartmann", "hartXX",    nitro, 8, 5, 3, 1.8,  8, 6, 1, "Germany",   "Munich",        LocalDate.of(1999, 11,  5)),
            racing("Elin Svensson",      "elinRace",  nitro, 8, 5, 3, 3.2,  4, 3, 2, "Sweden",    "Gothenburg",    LocalDate.of(2001,  6, 14)),
            racing("Dmitri Volkov",      "volkovGP",  nitro, 8, 5, 3, 4.9,  3, 4, 3, "Russia",    "St. Petersburg",LocalDate.of(2000,  8, 30)),
            racing("Kaito Yamamoto",     "kaitoV8",   nitro, 8, 5, 3, 6.5,  2, 2, 4, "Japan",     "Nagoya",        LocalDate.of(2002,  2, 22)),
            racing("Amara Osei",         "aOsei_nk",  nitro, 8, 5, 3, 8.7,  0, 1, 6, "Ghana",     "Kumasi",        LocalDate.of(2003, 10, 11))
        ));

        Tournament simRacing = tournament("SimRacing Pro League 2026", "Racing", "ACTIVE", "2026-03-15", velocity, nitro);
        tournamentRepo.save(simRacing);

        // Scores = combined championship points across both team drivers in that round
        // NK dominant early season, VG closed the gap in rounds 4 & 7
        matchRepo.saveAll(List.of(
            played(nitro,    velocity, "2026-03-15", simRacing, 38, 22),  // NK wins R1
            played(velocity, nitro,    "2026-03-22", simRacing, 34, 28),  // VG wins R2
            played(nitro,    velocity, "2026-03-29", simRacing, 42, 18),  // NK wins R3
            played(velocity, nitro,    "2026-04-05", simRacing, 31, 25),  // VG wins R4
            played(nitro,    velocity, "2026-04-12", simRacing, 35, 21),  // NK wins R5
            played(nitro,    velocity, "2026-04-19", simRacing, 32, 27),  // NK wins R6
            played(velocity, nitro,    "2026-04-26", simRacing, 35, 30),  // VG wins R7
            played(nitro,    velocity, "2026-05-03", simRacing, 40, 24),  // NK wins R8
            upcoming(velocity, nitro,    "2026-06-21", simRacing),        // R9
            upcoming(nitro,    velocity, "2026-06-28", simRacing)         // R10 — finale
        ));

        teamRepo.saveAll(List.of(velocity, nitro));
    }

    // ── Battle Royale seed ─────────────────────────────────────────────────────

    private void seedBattleRoyale() {
        // Drop Zone: LatAm/South Asia squad (BR/AR/CO/IN/NG), pts=6, 2W-3L
        // Zone Control: East/South-East Asian powerhouse (KR/CN/JP/BD/UA), pts=9, 3W-2L
        Team dropZone    = team("Drop Zone",    6,  2, 0, 3);
        Team zoneControl = team("Zone Control", 9,  3, 0, 2);
        teamRepo.saveAll(List.of(dropZone, zoneControl));

        coachRepo.saveAll(List.of(
            coach("Rafael Souza", "r.souza@dropzone.gg",    dropZone),
            coach("Ji-ho Cho",    "j.cho@zonecontrol.gg",   zoneControl)
        ));

        // avgPlacement, kills, top10Rate (%), damagePerMatch
        playerRepo.saveAll(List.of(
            // Drop Zone — aggressive early-game style, high kill potential
            br("Gabriel Silva",   "gSilva_br",  dropZone,    5, 2, 3, 3.2, 187, 78.4,  892.0, "Brazil",    "Rio de Janeiro", LocalDate.of(2001,  7, 15)),
            br("Valentina Cruz",  "vCruz_dz",   dropZone,    5, 2, 3, 5.1, 143, 71.2,  734.0, "Argentina", "Buenos Aires",   LocalDate.of(2002, 11,  3)),
            br("Javier Morales",  "jMoral_dz",  dropZone,    5, 2, 3, 6.8, 121, 64.5,  612.0, "Colombia",  "Medellín",       LocalDate.of(2000,  5, 28)),
            br("Priya Sharma",    "priyaApex",  dropZone,    5, 2, 3, 4.3, 156, 74.8,  801.0, "India",     "Mumbai",         LocalDate.of(2003,  1,  9)),
            br("Nonso Adeyemi",   "nAdeyemi",   dropZone,    5, 2, 3, 7.4,  98, 59.3,  541.0, "Nigeria",   "Lagos",          LocalDate.of(2001,  9, 22)),

            // Zone Control — methodical zone-play, elite late-game survival
            br("Min-jun Lee",    "mjLee_zc",   zoneControl, 5, 3, 2, 2.7, 214, 82.1, 1024.0, "South Korea", "Seoul",    LocalDate.of(2000,  3, 17)),
            br("Xiao Wei",       "xWei_zc",    zoneControl, 5, 3, 2, 3.8, 178, 76.5,  923.0, "China",       "Shenzhen", LocalDate.of(2001, 12,  8)),
            br("Hina Fujimoto",  "hinaFuji",   zoneControl, 5, 3, 2, 5.5, 132, 68.7,  678.0, "Japan",       "Fukuoka",  LocalDate.of(2003,  6, 25)),
            br("Tanveer Rahman", "tRahman",     zoneControl, 5, 3, 2, 6.2, 109, 62.4,  589.0, "Bangladesh",  "Dhaka",    LocalDate.of(2002,  4, 14)),
            br("Nadia Petrov",   "nPetrov_zc", zoneControl, 5, 3, 2, 4.9, 148, 72.3,  756.0, "Ukraine",     "Kyiv",     LocalDate.of(2001,  8, 31))
        ));

        Tournament brSeries = tournament("Battle Royale World Series 2026", "BattleRoyale", "ACTIVE", "2026-05-08", zoneControl, dropZone);
        tournamentRepo.save(brSeries);

        // Scores = total match points (placement pts + kill pts combined for the team)
        // ZC dominates through zone control, DZ steals rounds via aggressive pushes
        matchRepo.saveAll(List.of(
            played(zoneControl, dropZone,    "2026-05-08", brSeries, 45, 32),  // ZC wins — methodical zone win
            played(dropZone,    zoneControl, "2026-05-15", brSeries, 38, 29),  // DZ wins — high-kill upset
            played(zoneControl, dropZone,    "2026-05-22", brSeries, 52, 27),  // ZC wins — dominant
            played(dropZone,    zoneControl, "2026-05-29", brSeries, 41, 35),  // DZ wins — late circle chaos
            played(zoneControl, dropZone,    "2026-06-05", brSeries, 48, 30),  // ZC wins — takes series lead
            upcoming(dropZone,    zoneControl, "2026-06-14", brSeries),        // DZ must win to stay alive
            upcoming(zoneControl, dropZone,    "2026-06-21", brSeries),
            upcoming(dropZone,    zoneControl, "2026-06-28", brSeries)         // potential decider
        ));

        teamRepo.saveAll(List.of(dropZone, zoneControl));
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
                          int mp, int w, int l, double accuracy, int headshots, double kast, double adr,
                          String nationality, String city, LocalDate birthDate) {
        FPSPlayer p = new FPSPlayer(fullName, nick, "password", mp, w, l, accuracy, headshots, kast, adr);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }

    private MOBAPlayer moba(String fullName, String nick, Team team,
                            int mp, int w, int l,
                            String character, int kills, int deaths, int assists,
                            String nationality, String city, LocalDate birthDate) {
        MOBAPlayer p = new MOBAPlayer(fullName, nick, "password", mp, w, l, character, kills, deaths, assists);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }

    private EFootballPlayer efb(String fullName, String nick, Team team,
                                int mp, int w, int l,
                                String position, int goals, int saved, int assists,
                                int shotsOnTarget, int ballRecoveries,
                                String nationality, String city, LocalDate birthDate) {
        EFootballPlayer p = new EFootballPlayer(fullName, nick, "password", mp, w, l, position, goals, saved, assists, shotsOnTarget, ballRecoveries);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }

    private Tournament tournament(String name, String game, String status, String startDate, Team... teams) {
        Tournament t = new Tournament(name, game);
        t.setStatus(status);
        t.setStartDate(LocalDate.parse(startDate));
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

    // ── History seed (past tournaments, matches, achievements, career stats) ──

    private void seedHistory() {
        Map<String, Team>   t = new HashMap<>();
        Map<String, Player> p = new HashMap<>();
        teamRepo.findAll().forEach(x   -> t.put(x.getName(),     x));
        playerRepo.findAll().forEach(x -> p.put(x.getNickname(), x));
        if (t.isEmpty()) return;

        Team nexus     = t.get("Team Nexus");
        Team storm     = t.get("Storm Raiders");
        Team phantom   = t.get("Phantom Squad");
        Team iron      = t.get("Iron Wolves");
        Team echo      = t.get("Echo Strike");
        Team apex      = t.get("Apex Horizon");
        Team velocity  = t.get("Velocity Grid");
        Team nitro     = t.get("Nitro Kings");
        Team dropZone  = t.get("Drop Zone");
        Team zoneCtrl  = t.get("Zone Control");

        // ── PAST FPS ──────────────────────────────────────────────────────────
        // Valorant Champions 2025: Phantom wins, Nexus 2nd, Storm 3rd
        Tournament vc2025 = tournament("Valorant Champions 2025", "FPS", "COMPLETED", "2025-01-15", nexus, storm, phantom);
        tournamentRepo.save(vc2025);
        matchRepo.saveAll(List.of(
            played(phantom, storm,  "2025-01-18", vc2025, 13,  7),
            played(nexus,   storm,  "2025-01-20", vc2025, 13,  9),
            played(phantom, nexus,  "2025-01-22", vc2025, 13, 10),
            played(phantom, nexus,  "2025-01-25", vc2025, 13,  9)   // FINAL
        ));

        // Valorant World Cup 2024: Nexus wins, Phantom 2nd, Storm 3rd
        Tournament vwc2024 = tournament("Valorant World Cup 2024", "FPS", "COMPLETED", "2024-05-01", nexus, storm, phantom);
        tournamentRepo.save(vwc2024);
        matchRepo.saveAll(List.of(
            played(nexus,   storm,   "2024-05-05", vwc2024, 13,  9),
            played(phantom, storm,   "2024-05-07", vwc2024, 13,  8),
            played(nexus,   phantom, "2024-05-09", vwc2024, 13, 11),
            played(nexus,   phantom, "2024-05-12", vwc2024, 13,  8)  // FINAL
        ));

        // ── PAST MOBA ─────────────────────────────────────────────────────────
        // LoL Spring Championship 2025: Echo wins, Iron 2nd, Nexus 3rd
        Tournament lsc2025 = tournament("LoL Spring Championship 2025", "MOBA", "COMPLETED", "2025-02-01", iron, echo, nexus);
        tournamentRepo.save(lsc2025);
        matchRepo.saveAll(List.of(
            played(echo,  iron,  "2025-02-05", lsc2025, 28, 15),
            played(nexus, iron,  "2025-02-07", lsc2025, 22, 19),
            played(echo,  nexus, "2025-02-09", lsc2025, 31, 18),
            played(echo,  iron,  "2025-02-12", lsc2025, 30, 21)      // FINAL
        ));

        // LoL Pro League 2024: Iron wins, Echo 2nd (best-of-5 tiebreak)
        Tournament lpl2024 = tournament("LoL Pro League 2024", "MOBA", "COMPLETED", "2024-03-15", iron, echo);
        tournamentRepo.save(lpl2024);
        matchRepo.saveAll(List.of(
            played(iron, echo, "2024-03-18", lpl2024, 25, 17),
            played(echo, iron, "2024-03-22", lpl2024, 28, 24),
            played(iron, echo, "2024-03-25", lpl2024, 29, 22),
            played(echo, iron, "2024-03-28", lpl2024, 26, 23),
            played(iron, echo, "2024-03-31", lpl2024, 31, 24)        // FINAL G5
        ));

        // ── PAST eFOOTBALL ────────────────────────────────────────────────────
        // FIFA World Cup Sim 2025: Apex wins, Storm 2nd
        Tournament fwcs2025 = tournament("FIFA World Cup Sim 2025", "eFootball", "COMPLETED", "2025-01-20", apex, storm);
        tournamentRepo.save(fwcs2025);
        matchRepo.saveAll(List.of(
            played(apex,  storm, "2025-01-22", fwcs2025, 3, 1),
            played(storm, apex,  "2025-01-24", fwcs2025, 2, 1),
            played(apex,  storm, "2025-01-26", fwcs2025, 2, 0)       // FINAL: apex wins
        ));

        // FIFA eLeague 2024: Storm wins, Apex 2nd (best-of-5)
        Tournament fel2024 = tournament("FIFA eLeague 2024", "eFootball", "COMPLETED", "2024-06-01", apex, storm);
        tournamentRepo.save(fel2024);
        matchRepo.saveAll(List.of(
            played(storm, apex,  "2024-06-05", fel2024, 2, 1),
            played(apex,  storm, "2024-06-09", fel2024, 3, 2),
            played(storm, apex,  "2024-06-12", fel2024, 1, 0),
            played(apex,  storm, "2024-06-16", fel2024, 2, 0),
            played(storm, apex,  "2024-06-19", fel2024, 2, 1)        // FINAL G5: storm wins
        ));

        // ── PAST RACING ───────────────────────────────────────────────────────
        // SimRacing World Cup 2025: Nitro wins, Velocity 2nd (3-2)
        Tournament src2025 = tournament("SimRacing World Cup 2025", "Racing", "COMPLETED", "2025-03-01", velocity, nitro);
        tournamentRepo.save(src2025);
        matchRepo.saveAll(List.of(
            played(nitro,    velocity, "2025-03-08", src2025, 38, 25),
            played(velocity, nitro,    "2025-03-15", src2025, 31, 28),
            played(nitro,    velocity, "2025-03-22", src2025, 40, 22),
            played(velocity, nitro,    "2025-03-29", src2025, 33, 30),
            played(nitro,    velocity, "2025-04-05", src2025, 37, 26) // FINAL G5: nitro wins
        ));

        // SimRacing Pro League 2024: Velocity wins, Nitro 2nd (4-2)
        Tournament srp2024 = tournament("SimRacing Pro League 2024", "Racing", "COMPLETED", "2024-03-15", velocity, nitro);
        tournamentRepo.save(srp2024);
        matchRepo.saveAll(List.of(
            played(velocity, nitro,    "2024-03-22", srp2024, 31, 24),
            played(nitro,    velocity, "2024-03-29", srp2024, 35, 28),
            played(velocity, nitro,    "2024-04-05", srp2024, 33, 29),
            played(nitro,    velocity, "2024-04-12", srp2024, 32, 30),
            played(velocity, nitro,    "2024-04-19", srp2024, 38, 31),
            played(velocity, nitro,    "2024-04-26", srp2024, 29, 27) // velocity seals 4-2
        ));

        // ── PAST BATTLE ROYALE ────────────────────────────────────────────────
        // BR World Series 2025: Zone Control wins, Drop Zone 2nd (3-2)
        Tournament brws2025 = tournament("BR World Series 2025", "BattleRoyale", "COMPLETED", "2025-05-01", dropZone, zoneCtrl);
        tournamentRepo.save(brws2025);
        matchRepo.saveAll(List.of(
            played(zoneCtrl, dropZone, "2025-05-08", brws2025, 49, 35),
            played(dropZone, zoneCtrl, "2025-05-15", brws2025, 42, 36),
            played(zoneCtrl, dropZone, "2025-05-22", brws2025, 55, 28),
            played(dropZone, zoneCtrl, "2025-05-29", brws2025, 44, 39),
            played(zoneCtrl, dropZone, "2025-06-05", brws2025, 51, 33) // FINAL G5: ZC wins
        ));

        // BR Nations Cup 2024: Drop Zone wins, Zone Control 2nd (3-2)
        Tournament brnc2024 = tournament("BR Nations Cup 2024", "BattleRoyale", "COMPLETED", "2024-05-01", dropZone, zoneCtrl);
        tournamentRepo.save(brnc2024);
        matchRepo.saveAll(List.of(
            played(dropZone, zoneCtrl, "2024-05-08", brnc2024, 45, 39),
            played(zoneCtrl, dropZone, "2024-05-15", brnc2024, 48, 35),
            played(dropZone, zoneCtrl, "2024-05-22", brnc2024, 43, 37),
            played(zoneCtrl, dropZone, "2024-05-29", brnc2024, 50, 44),
            played(dropZone, zoneCtrl, "2024-06-05", brnc2024, 47, 41) // FINAL G5: DZ wins
        ));

        // ── CAREER STATS (full 3-season history) ─────────────────────────────
        // FPS — Phantom Squad (Champions 2025 + Runner-Up 2024)
        career(p, "svenL",    42, 33,  9);
        career(p, "nRossi",   38, 29,  9);
        career(p, "oHassan",  36, 27,  9);
        career(p, "cDubois",  40, 31,  9);
        career(p, "lSantos",  37, 28,  9);
        // FPS — Team Nexus (Champions 2024 + Runner-Up 2025)
        career(p, "cMendes99", 43, 30, 13);
        career(p, "xAna7",     36, 24, 12);
        career(p, "rickF",     48, 34, 14);
        career(p, "bLima",     32, 20, 12);
        career(p, "dPinto",    40, 27, 13);
        // FPS — Storm Raiders (no titles, cross-discipline with eFootball)
        career(p, "jakeMorris", 41, 23, 18);
        career(p, "yukiT",      46, 27, 19);
        career(p, "elenaP",     36, 20, 16);
        career(p, "kAsante",    43, 25, 18);
        career(p, "mJensen",    34, 17, 17);
        // MOBA — Echo Strike (Champions 2025 + Runner-Up 2024)
        career(p, "lBianchi",  36, 26, 10);
        career(p, "hKovac",    32, 22, 10);
        career(p, "rSuzuki",   38, 28, 10);
        career(p, "fatimaa",   30, 21,  9);
        career(p, "dVargas",   34, 24, 10);
        // MOBA — Iron Wolves (Champions 2024 + Runner-Up 2025)
        career(p, "mFischer",  37, 24, 13);
        career(p, "sKim",      41, 27, 14);
        career(p, "pNovak",    34, 21, 13);
        career(p, "aDiallo",   43, 29, 14);
        career(p, "tWalsh",    30, 18, 12);
        // eFootball — Apex Horizon (Champions 2025 + Runner-Up 2024)
        career(p, "iBerg",     30, 22,  8);
        career(p, "kMensah",   27, 18,  9);
        career(p, "zAhmed",    32, 23,  9);
        career(p, "mRuiz",     28, 20,  8);
        career(p, "ayumiN",    25, 17,  8);
        // Racing — Velocity Grid (Champions 2024 + Runner-Up 2025)
        career(p, "ferriV",     22, 10, 12);
        career(p, "sofiaSpeed", 20,  9, 11);
        career(p, "espinozaGP", 21, 10, 11);
        career(p, "ynouri",     19,  8, 11);
        career(p, "pvhorn",     18,  7, 11);
        // Racing — Nitro Kings (Champions 2025 + Runner-Up 2024)
        career(p, "hartXX",     23, 13, 10);
        career(p, "elinRace",   22, 12, 10);
        career(p, "volkovGP",   21, 11, 10);
        career(p, "kaitoV8",    20, 10, 10);
        career(p, "aOsei_nk",   18,  8, 10);
        // BR — Drop Zone (Champions 2024 + Runner-Up 2025)
        career(p, "gSilva_br",  16,  7,  9);
        career(p, "vCruz_dz",   15,  7,  8);
        career(p, "jMoral_dz",  14,  6,  8);
        career(p, "priyaApex",  15,  7,  8);
        career(p, "nAdeyemi",   13,  5,  8);
        // BR — Zone Control (Champions 2025 + Runner-Up 2024)
        career(p, "mjLee_zc",   16,  9,  7);
        career(p, "xWei_zc",    15,  8,  7);
        career(p, "hinaFuji",   14,  8,  6);
        career(p, "tRahman",    13,  7,  6);
        career(p, "nPetrov_zc", 14,  8,  6);

        // ── ACHIEVEMENTS ─────────────────────────────────────────────────────
        // Phantom Squad — Champions 2025, Runner-Up 2024
        achieve(p, "svenL",    "Champion — Valorant Champions 2025",  "Runner-Up — Valorant World Cup 2024",  "Tournament MVP — Valorant Champions 2025", "Most Kills — Season 2025");
        achieve(p, "nRossi",   "Champion — Valorant Champions 2025",  "Runner-Up — Valorant World Cup 2024",  "Top Fragger — Valorant Champions 2025");
        achieve(p, "oHassan",  "Champion — Valorant Champions 2025",  "Runner-Up — Valorant World Cup 2024");
        achieve(p, "cDubois",  "Champion — Valorant Champions 2025",  "Runner-Up — Valorant World Cup 2024",  "Best Support Player — Season 2025");
        achieve(p, "lSantos",  "Champion — Valorant Champions 2025",  "Runner-Up — Valorant World Cup 2024");
        // Team Nexus — Champions 2024, Runner-Up 2025
        achieve(p, "cMendes99","Champion — Valorant World Cup 2024",  "Runner-Up — Valorant Champions 2025",  "Best Portuguese Player — Season 2024");
        achieve(p, "xAna7",    "Champion — Valorant World Cup 2024",  "Runner-Up — Valorant Champions 2025");
        achieve(p, "rickF",    "Champion — Valorant World Cup 2024",  "Runner-Up — Valorant Champions 2025",  "Tournament MVP — Valorant World Cup 2024", "Top Fragger — Season 2024");
        achieve(p, "bLima",    "Champion — Valorant World Cup 2024",  "Runner-Up — Valorant Champions 2025");
        achieve(p, "dPinto",   "Champion — Valorant World Cup 2024",  "Runner-Up — Valorant Champions 2025");
        // Storm Raiders — no titles (versatile cross-discipline team)
        achieve(p, "jakeMorris","Champion — FIFA eLeague 2024",       "Top 4 — Valorant World Cup 2024",      "Top 4 — Valorant Champions 2025");
        achieve(p, "yukiT",    "Champion — FIFA eLeague 2024",        "Top 4 — Valorant World Cup 2024",      "Top 4 — Valorant Champions 2025", "Best Individual Performance — Season 2024");
        achieve(p, "elenaP",   "Champion — FIFA eLeague 2024",        "Top 4 — Valorant World Cup 2024");
        achieve(p, "kAsante",  "Champion — FIFA eLeague 2024",        "Top 4 — Valorant Champions 2025");
        achieve(p, "mJensen",  "Champion — FIFA eLeague 2024",        "Top 4 — Valorant Champions 2025");
        // Echo Strike — Champions 2025, Runner-Up 2024
        achieve(p, "lBianchi", "Champion — LoL Spring Championship 2025", "Runner-Up — LoL Pro League 2024");
        achieve(p, "hKovac",   "Champion — LoL Spring Championship 2025", "Runner-Up — LoL Pro League 2024");
        achieve(p, "rSuzuki",  "Champion — LoL Spring Championship 2025", "Runner-Up — LoL Pro League 2024",  "Tournament MVP — LoL Spring Championship 2025", "Best Jungler — Season 2025");
        achieve(p, "fatimaa",  "Champion — LoL Spring Championship 2025", "Runner-Up — LoL Pro League 2024");
        achieve(p, "dVargas",  "Champion — LoL Spring Championship 2025", "Runner-Up — LoL Pro League 2024");
        // Iron Wolves — Champions 2024, Runner-Up 2025
        achieve(p, "mFischer", "Champion — LoL Pro League 2024",      "Runner-Up — LoL Spring Championship 2025");
        achieve(p, "sKim",     "Champion — LoL Pro League 2024",      "Runner-Up — LoL Spring Championship 2025", "Best Support Player — Season 2024");
        achieve(p, "pNovak",   "Champion — LoL Pro League 2024",      "Runner-Up — LoL Spring Championship 2025");
        achieve(p, "aDiallo",  "Champion — LoL Pro League 2024",      "Runner-Up — LoL Spring Championship 2025", "Most Assists — Season 2024");
        achieve(p, "tWalsh",   "Champion — LoL Pro League 2024",      "Runner-Up — LoL Spring Championship 2025");
        // Apex Horizon — Champions 2025, Runner-Up 2024
        achieve(p, "iBerg",    "Champion — FIFA World Cup Sim 2025",  "Runner-Up — FIFA eLeague 2024",         "Top Scorer — Season 2025");
        achieve(p, "kMensah",  "Champion — FIFA World Cup Sim 2025",  "Runner-Up — FIFA eLeague 2024");
        achieve(p, "zAhmed",   "Champion — FIFA World Cup Sim 2025",  "Runner-Up — FIFA eLeague 2024",         "Best Winger — Season 2025");
        achieve(p, "mRuiz",    "Champion — FIFA World Cup Sim 2025",  "Runner-Up — FIFA eLeague 2024",         "Best Goalkeeper — Season 2025");
        achieve(p, "ayumiN",   "Champion — FIFA World Cup Sim 2025",  "Runner-Up — FIFA eLeague 2024");
        // Velocity Grid — Champions 2024, Runner-Up 2025
        achieve(p, "ferriV",     "Champion — SimRacing Pro League 2024", "Runner-Up — SimRacing World Cup 2025", "Rookie of the Year — 2024", "Fastest Lap Award — Season 2024");
        achieve(p, "sofiaSpeed", "Champion — SimRacing Pro League 2024", "Runner-Up — SimRacing World Cup 2025");
        achieve(p, "espinozaGP","Champion — SimRacing Pro League 2024", "Runner-Up — SimRacing World Cup 2025");
        achieve(p, "ynouri",     "Champion — SimRacing Pro League 2024", "Runner-Up — SimRacing World Cup 2025");
        achieve(p, "pvhorn",     "Champion — SimRacing Pro League 2024");
        // Nitro Kings — Champions 2025, Runner-Up 2024
        achieve(p, "hartXX",    "Champion — SimRacing World Cup 2025",  "Runner-Up — SimRacing Pro League 2024", "Tournament MVP — SimRacing World Cup 2025", "Fastest Lap Record — Season 2025");
        achieve(p, "elinRace",  "Champion — SimRacing World Cup 2025",  "Runner-Up — SimRacing Pro League 2024");
        achieve(p, "volkovGP",  "Champion — SimRacing World Cup 2025",  "Runner-Up — SimRacing Pro League 2024");
        achieve(p, "kaitoV8",   "Champion — SimRacing World Cup 2025",  "Runner-Up — SimRacing Pro League 2024");
        achieve(p, "aOsei_nk",  "Champion — SimRacing World Cup 2025");
        // Drop Zone — Champions 2024, Runner-Up 2025
        achieve(p, "gSilva_br", "Champion — BR Nations Cup 2024",       "Runner-Up — BR World Series 2025",     "Tournament MVP — BR Nations Cup 2024", "Highest Kill Count — Season 2024");
        achieve(p, "vCruz_dz",  "Champion — BR Nations Cup 2024",       "Runner-Up — BR World Series 2025");
        achieve(p, "jMoral_dz", "Champion — BR Nations Cup 2024",       "Runner-Up — BR World Series 2025");
        achieve(p, "priyaApex", "Champion — BR Nations Cup 2024",       "Runner-Up — BR World Series 2025");
        achieve(p, "nAdeyemi",  "Champion — BR Nations Cup 2024",       "Runner-Up — BR World Series 2025");
        // Zone Control — Champions 2025, Runner-Up 2024
        achieve(p, "mjLee_zc",  "Champion — BR World Series 2025",      "Runner-Up — BR Nations Cup 2024",      "Tournament MVP — BR World Series 2025", "Most Kills — Season 2025");
        achieve(p, "xWei_zc",   "Champion — BR World Series 2025",      "Runner-Up — BR Nations Cup 2024");
        achieve(p, "hinaFuji",  "Champion — BR World Series 2025",      "Runner-Up — BR Nations Cup 2024");
        achieve(p, "tRahman",   "Champion — BR World Series 2025",      "Runner-Up — BR Nations Cup 2024");
        achieve(p, "nPetrov_zc","Champion — BR World Series 2025",      "Runner-Up — BR Nations Cup 2024");
    }

    private void career(Map<String, Player> players, String nick, int mp, int w, int l) {
        Player pl = players.get(nick);
        if (pl == null) return;
        pl.setMatchesPlayed(mp);
        pl.setWins(w);
        pl.setLosses(l);
        playerRepo.save(pl);
    }

    private void achieve(Map<String, Player> players, String nick, String... achievements) {
        Player pl = players.get(nick);
        if (pl == null) return;
        List<String> list = new ArrayList<>(pl.getAchievements() != null ? pl.getAchievements() : List.of());
        for (String a : achievements) if (!list.contains(a)) list.add(a);
        pl.setAchievements(list);
        playerRepo.save(pl);
    }

    private RacingPlayer racing(String fullName, String nick, Team team,
                                int mp, int w, int l,
                                double avgPosition, int podiums, int fastestLaps, int dnf,
                                String nationality, String city, LocalDate birthDate) {
        RacingPlayer p = new RacingPlayer(fullName, nick, "password", mp, w, l, avgPosition, podiums, fastestLaps, dnf);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }

    private BattleRoyalePlayer br(String fullName, String nick, Team team,
                                  int mp, int w, int l,
                                  double avgPlacement, int kills, double top10Rate, double damagePerMatch,
                                  String nationality, String city, LocalDate birthDate) {
        BattleRoyalePlayer p = new BattleRoyalePlayer(fullName, nick, "password", mp, w, l, avgPlacement, kills, top10Rate, damagePerMatch);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }
}
