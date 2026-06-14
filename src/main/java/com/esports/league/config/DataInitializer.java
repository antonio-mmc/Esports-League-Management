package com.esports.league.config;

import com.esports.league.model.*;
import com.esports.league.repository.*;
import com.esports.league.service.MarketValue;
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
    private final TransferRepository transferRepo;

    public DataInitializer(TeamRepository teamRepo, PlayerRepository playerRepo,
                           CoachRepository coachRepo, TournamentRepository tournamentRepo,
                           MatchRepository matchRepo, TransferRepository transferRepo) {
        this.teamRepo = teamRepo;
        this.playerRepo = playerRepo;
        this.coachRepo = coachRepo;
        this.tournamentRepo = tournamentRepo;
        this.matchRepo = matchRepo;
        this.transferRepo = transferRepo;
    }

    private static final Map<String, String[]> COACH_PROFILES = Map.ofEntries(
        Map.entry("Marcus Webb",        new String[]{"United Kingdom", "London",    "1985-03-15", "FPS"}),
        Map.entry("Sofia Reyes",        new String[]{"Spain",          "Valencia",  "1988-07-22", "FPS"}),
        Map.entry("Jin Park",           new String[]{"South Korea",    "Busan",     "1986-11-08", "FPS"}),
        Map.entry("Lena Müller",        new String[]{"Germany",        "Hamburg",   "1990-04-30", "MOBA"}),
        Map.entry("Dario Costa",        new String[]{"Italy",          "Naples",    "1987-09-12", "MOBA"}),
        Map.entry("Priya Nair",         new String[]{"India",          "Chennai",   "1991-02-14", "EFOOTBALL"}),
        Map.entry("Alessandro Romano",  new String[]{"Italy",          "Turin",     "1983-06-20", "RACING"}),
        Map.entry("Hans Brauer",        new String[]{"Germany",        "Frankfurt", "1984-12-03", "RACING"}),
        Map.entry("Rafael Souza",       new String[]{"Brazil",         "São Paulo", "1989-08-17", "BATTLE_ROYALE"}),
        Map.entry("Ji-ho Cho",          new String[]{"South Korea",    "Incheon",   "1992-05-25", "BATTLE_ROYALE"})
    );

    private static final Map<String, List<String>> COACH_ACHIEVEMENTS = Map.ofEntries(
        Map.entry("Marcus Webb",        List.of("FPS Coach of the Year 2025", "Led Team Nexus to 2nd place — Valorant Spring Cup 2025")),
        Map.entry("Sofia Reyes",        List.of("Best Newcomer Coach Award 2025")),
        Map.entry("Jin Park",           List.of("FPS Champions — Phantom Spring Invitational 2025", "Most Improved Team Award 2025")),
        Map.entry("Lena Müller",        List.of("MOBA Regional Champion 2024")),
        Map.entry("Dario Costa",        List.of("Echo Strike Top 4 — LoL Summer League 2025")),
        Map.entry("Priya Nair",         List.of("eFootball League Coach Award 2025")),
        Map.entry("Alessandro Romano",  List.of("SimRacing Coach of the Year 2024")),
        Map.entry("Hans Brauer",        List.of("Nitro Kings Champions — SimRacing Pro League 2025", "Best Tactical Setup Award 2025")),
        Map.entry("Rafael Souza",       List.of("Battle Royale Upset Award 2025")),
        Map.entry("Ji-ho Cho",          List.of("Zone Control Series Champion 2024", "Tactical Excellence Award 2025")),
        Map.entry("Pierre Lefèvre",     List.of("Runner-Up — CS2 Major 2025")),
        Map.entry("Veikko Laine",       List.of("Champion — Dota 2 International 2025")),
        Map.entry("Seung-min Oh",       List.of("Top 4 — Dota 2 International 2025")),
        Map.entry("Roberto Alves",      List.of("Champion — EA FC Winter Cup 2025")),
        Map.entry("Xavi Moreno",        List.of("eFootball Tactician Award 2025")),
        Map.entry("Gary Sutton",        List.of("Best Newcomer Coach 2025")),
        Map.entry("James Whitfield",    List.of("Runner-Up — Gran Turismo Champions 2025")),
        Map.entry("Kenji Mori",         List.of("Champion — Gran Turismo Champions 2025")),
        Map.entry("Chris Donovan",      List.of("Champion — Fortnite World Cup 2025")),
        Map.entry("Marc Tremblay",      List.of("Runner-Up — Fortnite World Cup 2025"))
    );

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
            boolean moreUpcoming    = matchRepo.findAll().stream().filter(m -> !m.isResultRecorded()).count() < 20;
            boolean coachesMissing          = coachRepo.findAll().stream().anyMatch(c -> c.getNationality() == null);
            boolean coachAchievementsMissing = coachRepo.findAll().stream().allMatch(c -> c.getAchievements().isEmpty());
            boolean freeAgentsMissing        = coachRepo.findAll().stream().noneMatch(c -> c.getTeam() == null);
            boolean teamDataMissing          = teamRepo.findAll().stream().anyMatch(t -> t.getGame() == null);
            boolean teamInfoMissing          = teamRepo.findAll().stream().anyMatch(t -> t.getFoundedYear() == null);
            boolean specificGameMissing      = tournamentRepo.findAll().stream().anyMatch(t -> t.getSpecificGame() == null);
            boolean eliminationMissing       = tournamentRepo.findAll().stream().noneMatch(t -> t.getFormat() != null && !"LEAGUE".equals(t.getFormat()));
            boolean endDatesMissing0         = tournamentRepo.findAll().stream().anyMatch(t -> t.getEndDate() == null && "COMPLETED".equals(t.getStatus()));
            boolean groupStageMissing0       = tournamentRepo.findAll().stream().noneMatch(t -> "GROUP_STAGE".equals(t.getFormat()));
            boolean completedElimMissing0    = tournamentRepo.findAll().stream().noneMatch(t -> "COMPLETED".equals(t.getStatus()) && !"LEAGUE".equals(t.getFormat()));
            boolean prizesMissing0           = tournamentRepo.findAll().stream().noneMatch(t -> t.getPrizeFirst() != null);
            boolean expansionMissing         = teamRepo.findAll().stream().noneMatch(t -> "Crimson Vipers".equals(t.getName()));
            boolean transfersMissing         = transferRepo.count() == 0;
            boolean teamSpecificGameMissing  = teamRepo.findAll().stream().anyMatch(t -> t.getSpecificGame() == null);
            boolean championMissing          = tournamentRepo.findAll().stream().anyMatch(t -> "COMPLETED".equals(t.getStatus()) && t.getChampionTeamName() == null);
            boolean showcaseMissing          = teamRepo.findAll().stream().noneMatch(t -> "Sentinel Core".equals(t.getName()));
            boolean leagueShowcaseMissing    = teamRepo.findAll().stream().noneMatch(t -> "Rift Guardians".equals(t.getName()));
            boolean extraFreeAgentsMissing   = playerRepo.findAll().stream().noneMatch(p -> "tobiK".equals(p.getNickname()));
            boolean activeLeagueMissing      = tournamentRepo.findAll().stream().noneMatch(t -> "Valorant Pro League 2026".equals(t.getName()));
            if (!playersMissing && !tourneysMissing && !fpsMissing && !efbMissing && !racingMissing && !brMissing && !historyMissing && !moreUpcoming && !coachesMissing && !coachAchievementsMissing && !freeAgentsMissing && !teamDataMissing && !teamInfoMissing && !specificGameMissing && !eliminationMissing && !endDatesMissing0 && !groupStageMissing0 && !completedElimMissing0 && !prizesMissing0 && !expansionMissing && !transfersMissing && !teamSpecificGameMissing && !championMissing && !showcaseMissing && !leagueShowcaseMissing && !extraFreeAgentsMissing && !activeLeagueMissing) return;

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

            if (racingMissing)  seedRacing();
            if (brMissing)      seedBattleRoyale();
            if (historyMissing) seedHistory();
            if (moreUpcoming)   seedMoreUpcoming();

            if (coachesMissing) {
                coachRepo.findAll().forEach(c -> {
                    String[] d = COACH_PROFILES.get(c.getName());
                    if (d != null && c.getNationality() == null) {
                        c.setNationality(d[0]);
                        c.setCity(d[1]);
                        c.setBirthDate(LocalDate.parse(d[2]));
                        c.setSpecialization(d[3]);
                        coachRepo.save(c);
                    }
                });
            }

            if (coachAchievementsMissing) {
                coachRepo.findAll().forEach(c -> {
                    if (!c.getAchievements().isEmpty()) return;
                    List<String> ach = COACH_ACHIEVEMENTS.get(c.getName());
                    if (ach != null) {
                        c.setAchievements(new ArrayList<>(ach));
                        coachRepo.save(c);
                    }
                });
            }

            if (freeAgentsMissing) {
                if (coachRepo.findAll().stream().noneMatch(c -> c.getTeam() == null)) {
                    Coach freeCoach = new Coach("Tomás Ferreira", "t.ferreira@freeagent.gg");
                    freeCoach.setNationality("Portugal");
                    freeCoach.setCity("Porto");
                    freeCoach.setBirthDate(LocalDate.of(1988, 9, 14));
                    freeCoach.setSpecialization("FPS");
                    freeCoach.setAchievements(new ArrayList<>(List.of("Head Coach — Team Nexus 2023–2024", "FPS Regional Finals 2024")));
                    coachRepo.save(freeCoach);
                }
                if (playerRepo.findAll().stream().noneMatch(p -> p.getTeam() == null)) {
                    FPSPlayer freePlayer = new FPSPlayer("Lucas Petit", "lPetit", 10, 6, 4, 72.5, 187, 73.8, 149.2);
                    freePlayer.setNationality("France");
                    freePlayer.setCity("Lyon");
                    freePlayer.setBirthDate(LocalDate.of(2002, 3, 18));
                    freePlayer.setAchievements(new ArrayList<>(List.of("MVP — Solo Queue Championship 2025")));
                    playerRepo.save(freePlayer);
                }
            }

            if (teamDataMissing) {
                Map<String, String[]> TEAM_META = Map.ofEntries(
                    Map.entry("Team Nexus",    new String[]{"FPS",           "Portugal"}),
                    Map.entry("Storm Raiders", new String[]{"FPS",           "Japan"}),
                    Map.entry("Phantom Squad", new String[]{"FPS",           "Sweden"}),
                    Map.entry("Iron Wolves",   new String[]{"MOBA",          "Germany"}),
                    Map.entry("Echo Strike",   new String[]{"MOBA",          "Italy"}),
                    Map.entry("Apex Horizon",  new String[]{"EFOOTBALL",     "Norway"}),
                    Map.entry("Velocity Grid", new String[]{"RACING",        "Italy"}),
                    Map.entry("Nitro Kings",   new String[]{"RACING",        "Germany"}),
                    Map.entry("Drop Zone",     new String[]{"BATTLE_ROYALE", "Brazil"}),
                    Map.entry("Zone Control",  new String[]{"BATTLE_ROYALE", "South Korea"})
                );
                Map<String, Integer> TEAM_TROPHIES = Map.of(
                    "Team Nexus",    1, "Storm Raiders", 1, "Phantom Squad", 1,
                    "Iron Wolves",   1, "Echo Strike",   1, "Apex Horizon",  1,
                    "Velocity Grid", 1, "Nitro Kings",   1,
                    "Drop Zone",     1, "Zone Control",  1
                );
                teamRepo.findAll().forEach(t -> {
                    if (t.getGame() != null) return;
                    String[] meta = TEAM_META.get(t.getName());
                    if (meta != null) { t.setGame(meta[0]); t.setNationality(meta[1]); }
                    Integer trophies = TEAM_TROPHIES.get(t.getName());
                    if (trophies != null) t.setTrophies(trophies);
                    teamRepo.save(t);
                });
            }

            if (specificGameMissing) {
                tournamentRepo.findAll().forEach(t -> {
                    if (t.getSpecificGame() != null) return;
                    t.setSpecificGame(inferSpecificGame(t.getName(), t.getGame()));
                    if (t.getFormat() == null) t.setFormat("LEAGUE");
                    tournamentRepo.save(t);
                });
            }

            if (eliminationMissing) seedElimination();

            if (endDatesMissing0) {
                Map<String, String> END_DATES = Map.ofEntries(
                    Map.entry("Valorant Champions 2025",       "2025-01-25"),
                    Map.entry("Valorant World Cup 2024",        "2024-05-12"),
                    Map.entry("LoL Spring Championship 2025",   "2025-02-12"),
                    Map.entry("LoL Pro League 2024",            "2024-03-31"),
                    Map.entry("FIFA World Cup Sim 2025",        "2025-01-26"),
                    Map.entry("FIFA eLeague 2024",              "2024-06-19"),
                    Map.entry("SimRacing World Cup 2025",       "2025-04-05"),
                    Map.entry("SimRacing Pro League 2024",      "2024-04-26"),
                    Map.entry("BR World Series 2025",           "2025-06-05"),
                    Map.entry("BR Nations Cup 2024",            "2024-06-05"),
                    Map.entry("Valorant Autumn Knockout 2024",  "2024-10-15"),
                    Map.entry("BR Double Trouble 2024",         "2024-09-20"),
                    Map.entry("Valorant Open Cup 2025",         "2025-09-15")
                );
                tournamentRepo.findAll().forEach(t -> {
                    if (t.getEndDate() != null || !"COMPLETED".equals(t.getStatus())) return;
                    String d = END_DATES.get(t.getName());
                    if (d != null) { t.setEndDate(LocalDate.parse(d)); tournamentRepo.save(t); }
                });
            }
            if (groupStageMissing0)    seedGroupStage();
            if (completedElimMissing0) seedCompletedElimination();
            if (prizesMissing0)        seedPrizes();

            if (teamInfoMissing) {
                record TI(String city, int year, List<String> history) {}
                Map<String, TI> TEAM_INFO = Map.ofEntries(
                    Map.entry("Team Nexus",    new TI("Porto",       2022, List.of("David Costa (2022–2023)"))),
                    Map.entry("Storm Raiders", new TI("Los Angeles", 2021, List.of())),
                    Map.entry("Phantom Squad", new TI("Stockholm",   2020, List.of("Lars Eriksson (2020–2022)"))),
                    Map.entry("Iron Wolves",   new TI("Berlin",      2021, List.of())),
                    Map.entry("Echo Strike",   new TI("Rome",        2022, List.of())),
                    Map.entry("Apex Horizon",  new TI("Oslo",        2023, List.of())),
                    Map.entry("Velocity Grid", new TI("Turin",       2022, List.of("Marco Ferrari (2022–2023)"))),
                    Map.entry("Nitro Kings",   new TI("Munich",      2021, List.of())),
                    Map.entry("Drop Zone",     new TI("São Paulo", 2023, List.of())),
                    Map.entry("Zone Control",  new TI("Seoul",       2022, List.of()))
                );
                teamRepo.findAll().forEach(t -> {
                    if (t.getFoundedYear() != null) return;
                    TI ti = TEAM_INFO.get(t.getName());
                    if (ti != null) {
                        t.setCity(ti.city());
                        t.setFoundedYear(ti.year());
                        if (!ti.history().isEmpty()) t.setCoachHistory(new ArrayList<>(ti.history()));
                        teamRepo.save(t);
                    }
                });
            }

            if (expansionMissing) seedExpansion();
            if (showcaseMissing) seedShowcase();   // needs the expansion teams (Crimson Vipers)
            if (leagueShowcaseMissing) seedLeagueShowcase();   // needs the expansion MOBA teams
            if (activeLeagueMissing) seedActiveLeague();        // needs the showcase Valorant teams
            if (extraFreeAgentsMissing) seedFreeAgents();
            if (transfersMissing) seedTransfers();
            if (teamSpecificGameMissing) backfillTeamSpecificGame();
            if (championMissing) backfillChampions();

            return;
        }

        // ── Teams ──────────────────────────────────────────────────────────────
        Team nexus   = team("Team Nexus",    9,  3, 1); nexus.setNationality("Portugal");   nexus.setGame("FPS");           nexus.setTrophies(1); nexus.setCity("Porto");        nexus.setFoundedYear(2022); nexus.setCoachHistory(new ArrayList<>(List.of("David Costa (2022–2023)")));
        Team storm   = team("Storm Raiders", 6,  2, 2); storm.setNationality("Japan");      storm.setGame("FPS");           storm.setTrophies(1); storm.setCity("Los Angeles");   storm.setFoundedYear(2021);
        Team phantom = team("Phantom Squad", 12, 4, 0); phantom.setNationality("Sweden");   phantom.setGame("FPS");         phantom.setTrophies(1); phantom.setCity("Stockholm"); phantom.setFoundedYear(2020); phantom.setCoachHistory(new ArrayList<>(List.of("Lars Eriksson (2020–2022)")));
        Team iron    = team("Iron Wolves",   3,  1, 3); iron.setNationality("Germany");     iron.setGame("MOBA");           iron.setTrophies(1); iron.setCity("Berlin");          iron.setFoundedYear(2021);
        Team echo    = team("Echo Strike",   6,  2, 1); echo.setNationality("Italy");       echo.setGame("MOBA");           echo.setTrophies(1); echo.setCity("Rome");            echo.setFoundedYear(2022);
        Team apex    = team("Apex Horizon",  9,  3, 0); apex.setNationality("Norway");      apex.setGame("EFOOTBALL");      apex.setTrophies(1); apex.setCity("Oslo");            apex.setFoundedYear(2023);
        teamRepo.saveAll(List.of(nexus, storm, phantom, iron, echo, apex));

        // ── Coaches ────────────────────────────────────────────────────────────
        coachRepo.saveAll(List.of(
            coach("Marcus Webb",  "marcus@nexus.gg",   nexus,   "United Kingdom", "London",    "1985-03-15", "FPS"),
            coach("Sofia Reyes",  "sofia@storm.gg",    storm,   "Spain",          "Valencia",  "1988-07-22", "FPS"),
            coach("Jin Park",     "jin@phantom.gg",    phantom, "South Korea",    "Busan",     "1986-11-08", "FPS"),
            coach("Lena Müller",  "lena@iron.gg",      iron,    "Germany",        "Hamburg",   "1990-04-30", "MOBA"),
            coach("Dario Costa",  "dario@echo.gg",     echo,    "Italy",          "Naples",    "1987-09-12", "MOBA"),
            coach("Priya Nair",   "priya@apex.gg",     apex,    "India",          "Chennai",   "1991-02-14", "EFOOTBALL")
        ));

        // ── Free agent coach (no team) ────────────────────────────────────────
        Coach freeCoach = new Coach("Tomás Ferreira", "t.ferreira@freeagent.gg");
        freeCoach.setNationality("Portugal");
        freeCoach.setCity("Porto");
        freeCoach.setBirthDate(LocalDate.of(1988, 9, 14));
        freeCoach.setSpecialization("FPS");
        freeCoach.setAchievements(new ArrayList<>(List.of("Head Coach — Team Nexus 2023–2024", "FPS Regional Finals 2024")));
        coachRepo.save(freeCoach);

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

        // ── Free agent player (no team) ───────────────────────────────────────
        FPSPlayer freePlayer = new FPSPlayer("Lucas Petit", "lPetit", 10, 6, 4, 72.5, 187, 73.8, 149.2);
        freePlayer.setNationality("France");
        freePlayer.setCity("Lyon");
        freePlayer.setBirthDate(LocalDate.of(2002, 3, 18));
        freePlayer.setAchievements(new ArrayList<>(List.of("MVP — Solo Queue Championship 2025")));
        playerRepo.save(freePlayer);

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
        seedElimination();
        seedGroupStage();
        seedCompletedElimination();
        seedPrizes();
        seedExpansion();
        seedShowcase();        // flagship 16-team Valorant single-elimination
        seedLeagueShowcase();  // full 8-team League of Legends round-robin
        seedActiveLeague();    // in-progress Valorant league: varied past + future fixtures
        seedFreeAgents();      // deeper free-agency pool across all modalities
        seedMoreUpcoming(); // so a fresh database matches one upgraded via the migration path
        seedTransfers();
        backfillTeamSpecificGame(); // derive each team's title from its tournaments
        backfillChampions();        // name the winner of each completed tournament
    }

    // ── Racing seed ────────────────────────────────────────────────────────────

    private void seedRacing() {
        // Velocity Grid: Mediterranean squad (IT/PT/MX/MA/NL), pts=9, 3W-5L
        // Nitro Kings: Northern European powerhouse (DE/SE/RU/JP/GH), pts=15, 5W-3L
        Team velocity = team("Velocity Grid", 9,  3, 5); velocity.setNationality("Italy");       velocity.setGame("RACING"); velocity.setTrophies(1); velocity.setCity("Turin");     velocity.setFoundedYear(2022); velocity.setCoachHistory(new ArrayList<>(List.of("Marco Ferrari (2022–2023)")));
        Team nitro    = team("Nitro Kings",  15,  5, 3); nitro.setNationality("Germany");        nitro.setGame("RACING");    nitro.setTrophies(1); nitro.setCity("Munich");        nitro.setFoundedYear(2021);
        teamRepo.saveAll(List.of(velocity, nitro));

        coachRepo.saveAll(List.of(
            coach("Alessandro Romano", "a.romano@velocitygrid.gg", velocity, "Italy",   "Turin",     "1983-06-20", "RACING"),
            coach("Hans Brauer",       "h.brauer@nitrokings.gg",   nitro,    "Germany", "Frankfurt", "1984-12-03", "RACING")
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
        Team dropZone    = team("Drop Zone",    6,  2, 3); dropZone.setNationality("Brazil");       dropZone.setGame("BATTLE_ROYALE");    dropZone.setTrophies(1); dropZone.setCity("São Paulo"); dropZone.setFoundedYear(2023);
        Team zoneControl = team("Zone Control", 9,  3, 2); zoneControl.setNationality("South Korea"); zoneControl.setGame("BATTLE_ROYALE"); zoneControl.setTrophies(1); zoneControl.setCity("Seoul"); zoneControl.setFoundedYear(2022);
        teamRepo.saveAll(List.of(dropZone, zoneControl));

        coachRepo.saveAll(List.of(
            coach("Rafael Souza", "r.souza@dropzone.gg",  dropZone,    "Brazil",      "São Paulo", "1989-08-17", "BATTLE_ROYALE"),
            coach("Ji-ho Cho",    "j.cho@zonecontrol.gg", zoneControl, "South Korea", "Incheon",  "1992-05-25", "BATTLE_ROYALE")
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

    // ── More upcoming matches seed ─────────────────────────────────────────────

    private void seedMoreUpcoming() {
        List<Team>       allTeams = teamRepo.findAll();
        List<Tournament> allTs    = tournamentRepo.findAll();

        Team nexus    = findTeam(allTeams, "Team Nexus");
        Team phantom  = findTeam(allTeams, "Phantom Squad");
        Team storm    = findTeam(allTeams, "Storm Raiders");
        Team iron     = findTeam(allTeams, "Iron Wolves");
        Team echo     = findTeam(allTeams, "Echo Strike");
        Team apex     = findTeam(allTeams, "Apex Horizon");
        Team velocity = findTeam(allTeams, "Velocity Grid");
        Team nitro    = findTeam(allTeams, "Nitro Kings");
        Team dropZone = findTeam(allTeams, "Drop Zone");
        Team zoneCtrl = findTeam(allTeams, "Zone Control");

        Tournament valorant  = findTourney(allTs, "Valorant Spring Cup 2026");
        Tournament lol       = findTourney(allTs, "LoL Summer League 2026");
        Tournament fifa      = findTourney(allTs, "FIFA eLeague 2026");
        Tournament simRacing = findTourney(allTs, "SimRacing Pro League 2026");
        Tournament brSeries  = findTourney(allTs, "Battle Royale World Series 2026");

        List<Match> toAdd = new ArrayList<>();

        // FPS: 2 more → total 4
        if (valorant != null && nexus != null && phantom != null && storm != null) {
            toAdd.add(upcoming(storm,    nexus,    "2026-06-17", valorant));
            toAdd.add(upcoming(phantom,  nexus,    "2026-06-20", valorant));
        }
        // MOBA: 2 more → total 4
        if (lol != null && nexus != null && iron != null && echo != null) {
            toAdd.add(upcoming(nexus,    echo,     "2026-06-18", lol));
            toAdd.add(upcoming(iron,     nexus,    "2026-06-22", lol));
        }
        // eFootball: 3 more → total 4
        if (fifa != null && apex != null && storm != null) {
            toAdd.add(upcoming(storm,    apex,     "2026-07-08", fifa));
            toAdd.add(upcoming(apex,     storm,    "2026-07-12", fifa));
            toAdd.add(upcoming(storm,    apex,     "2026-07-15", fifa));
        }
        // Racing: 2 more → total 4
        if (simRacing != null && velocity != null && nitro != null) {
            toAdd.add(upcoming(velocity, nitro,    "2026-07-05", simRacing));
            toAdd.add(upcoming(nitro,    velocity, "2026-07-12", simRacing));
        }
        // BR: 1 more → total 4
        if (brSeries != null && dropZone != null && zoneCtrl != null) {
            toAdd.add(upcoming(zoneCtrl, dropZone, "2026-07-05", brSeries));
        }

        if (!toAdd.isEmpty()) matchRepo.saveAll(toAdd);
    }

    private Team findTeam(List<Team> teams, String name) {
        return teams.stream().filter(t -> name.equals(t.getName())).findFirst().orElse(null);
    }

    private Tournament findTourney(List<Tournament> ts, String name) {
        return ts.stream().filter(t -> name.equals(t.getName())).findFirst().orElse(null);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Team team(String name, int pts, int w, int l) {
        Team t = new Team(name);
        t.setPoints(pts); t.setWins(w); t.setLosses(l);
        return t;
    }

    private Coach coach(String name, String email, Team team, String nationality, String city, String birthDate, String specialization) {
        Coach c = new Coach(name, email);
        c.setTeam(team);
        team.setCoach(c);
        c.setNationality(nationality);
        c.setCity(city);
        c.setBirthDate(LocalDate.parse(birthDate));
        c.setSpecialization(specialization);
        List<String> ach = COACH_ACHIEVEMENTS.get(name);
        if (ach != null) c.setAchievements(new ArrayList<>(ach));
        return c;
    }

    private FPSPlayer fps(String fullName, String nick, Team team,
                          int mp, int w, int l, double accuracy, int headshots, double kast, double adr,
                          String nationality, String city, LocalDate birthDate) {
        FPSPlayer p = new FPSPlayer(fullName, nick, mp, w, l, accuracy, headshots, kast, adr);
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
        MOBAPlayer p = new MOBAPlayer(fullName, nick, mp, w, l, character, kills, deaths, assists);
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
        EFootballPlayer p = new EFootballPlayer(fullName, nick, mp, w, l, position, goals, saved, assists, shotsOnTarget, ballRecoveries);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }

    private Tournament tournament(String name, String game, String status, String startDate, Team... teams) {
        return tournament(name, game, inferSpecificGame(name, game), "LEAGUE", status, startDate, null, teams);
    }

    private Tournament tournament(String name, String game, String specificGame, String format, String status, String startDate, Team... teams) {
        return tournament(name, game, specificGame, format, status, startDate, null, teams);
    }

    private Tournament tournament(String name, String game, String specificGame, String format, String status, String startDate, String endDate, Team... teams) {
        Tournament t = new Tournament(name, game);
        t.setSpecificGame(specificGame);
        t.setFormat(format);
        t.setStatus(status);
        t.setStartDate(LocalDate.parse(startDate));
        if (endDate != null) t.setEndDate(LocalDate.parse(endDate));
        for (Team team : teams) t.getParticipatingTeams().add(team);
        return t;
    }

    /**
     * Fills each team's {@code specificGame} from the tournaments it competes in:
     * a team's title is the most common {@code specificGame} among its tournaments,
     * falling back to the modality default when it has played in none.
     */
    private void backfillTeamSpecificGame() {
        List<Tournament> tournaments = tournamentRepo.findAll();
        teamRepo.findAll().forEach(team -> {
            if (team.getSpecificGame() != null) return;
            Map<String, Integer> tally = new HashMap<>();
            for (Tournament t : tournaments) {
                if (t.getSpecificGame() == null) continue;
                boolean plays = t.getParticipatingTeams().stream()
                    .anyMatch(pt -> pt.getId().equals(team.getId()));
                if (plays) tally.merge(t.getSpecificGame(), 1, Integer::sum);
            }
            String title = tally.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElseGet(() -> inferSpecificGame(team.getName(), team.getGame()));
            team.setSpecificGame(title);
            teamRepo.save(team);
        });
    }

    /**
     * Names the standings winner of each already-completed tournament so the champion
     * shows in the UI. Does not touch trophies — those are seeded manually.
     */
    private void backfillChampions() {
        for (Tournament t : tournamentRepo.findAll()) {
            if (!"COMPLETED".equals(t.getStatus()) || t.getChampionTeamName() != null) continue;
            List<Match> played = matchRepo.findByTournamentId(t.getId()).stream()
                .filter(Match::isResultRecorded).toList();
            Team winner = null;
            int bestPts = -1, bestDiff = Integer.MIN_VALUE;
            for (Team team : t.getParticipatingTeams()) {
                int w = 0, diff = 0;
                for (Match m : played) {
                    boolean isA = m.getTeamA().getId().equals(team.getId());
                    boolean isB = m.getTeamB().getId().equals(team.getId());
                    if (!isA && !isB) continue;
                    int my  = isA ? m.getTeamAScore() : m.getTeamBScore();
                    int opp = isA ? m.getTeamBScore() : m.getTeamAScore();
                    diff += my - opp;
                    if (my > opp) w++;
                }
                int pts = w * 3;
                if (pts > bestPts || (pts == bestPts && diff > bestDiff)) {
                    bestPts = pts; bestDiff = diff; winner = team;
                }
            }
            if (winner != null) {
                t.setChampionTeamId(winner.getId());
                t.setChampionTeamName(winner.getName());
                tournamentRepo.save(t);
            }
        }
    }

    private String inferSpecificGame(String name, String game) {
        String n = (name == null ? "" : name).toUpperCase();
        String g = (game == null ? "" : game).toUpperCase();
        if (n.contains("VALORANT"))                                               return "Valorant";
        if (n.contains("LOL ") || n.startsWith("LOL"))                           return "League of Legends";
        if (n.contains("FIFA"))                                                   return "FIFA";
        if (n.contains("SIMRACING") || n.contains("SIM RACING"))                 return "iRacing";
        if (n.contains("BATTLE ROYALE") || g.contains("ROYALE") || n.startsWith("BR ")) return "PUBG";
        if (g.contains("FPS"))                                                   return "Valorant";
        if (g.contains("MOBA"))                                                  return "League of Legends";
        if (g.contains("EFOOTBALL") || g.contains("FOOTBALL"))                   return "FIFA";
        if (g.contains("RACING"))                                                return "iRacing";
        return game;
    }

    private void seedElimination() {
        List<Team> allTeams = teamRepo.findAll();
        Team nexus    = findTeam(allTeams, "Team Nexus");
        Team storm    = findTeam(allTeams, "Storm Raiders");
        Team phantom  = findTeam(allTeams, "Phantom Squad");
        Team iron     = findTeam(allTeams, "Iron Wolves");
        Team echo     = findTeam(allTeams, "Echo Strike");
        Team dropZone = findTeam(allTeams, "Drop Zone");
        Team zoneCtrl = findTeam(allTeams, "Zone Control");

        // FPS — Single Elimination (Semi-Final + Grand Final)
        if (nexus != null && storm != null && phantom != null) {
            Tournament t1 = tournament("Valorant Spring Invitational 2026", "FPS", "Valorant", "SINGLE_ELIMINATION", "ACTIVE", "2026-06-01", phantom, nexus, storm);
            tournamentRepo.save(t1);
            matchRepo.saveAll(List.of(
                played(storm, nexus, "2026-06-02", t1, 9, 13),
                upcoming(phantom, nexus, "2026-06-25", t1)
            ));
        }

        // MOBA — Single Elimination (Grand Final series)
        if (iron != null && echo != null) {
            Tournament t2 = tournament("LoL Knockout Cup 2026", "MOBA", "League of Legends", "SINGLE_ELIMINATION", "UPCOMING", "2026-07-20", iron, echo);
            tournamentRepo.save(t2);
            matchRepo.save(upcoming(iron, echo, "2026-07-20", t2));
        }

        // BR — Double Elimination
        if (dropZone != null && zoneCtrl != null) {
            Tournament t3 = tournament("BR Invitational 2026", "BattleRoyale", "PUBG", "DOUBLE_ELIMINATION", "UPCOMING", "2026-07-15", zoneCtrl, dropZone);
            tournamentRepo.save(t3);
            matchRepo.saveAll(List.of(
                upcoming(zoneCtrl, dropZone, "2026-07-15", t3),
                upcoming(dropZone, zoneCtrl, "2026-07-22", t3),
                upcoming(zoneCtrl, dropZone, "2026-07-28", t3)
            ));
        }
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

    // ── Showcase seed (flagship 16-team tournament for the demo) ─────────────────
    // A real-scale Valorant single-elimination: 16 teams, 15 matches across four rounds
    // (Round of 16 → Quarter-Final → Semi-Final → Grand Final), fully played out to a
    // champion. Twelve new teams are created alongside the four existing Valorant orgs so
    // the bracket has varied, non-repeating match-ups — the kind of thing a real event
    // looks like. Idempotent: keyed on one of the new teams, and it removes the earlier
    // 4-team placeholder if a previous run left one behind.
    private void seedShowcase() {
        if (teamRepo.findAll().stream().anyMatch(x -> "Sentinel Core".equals(x.getName()))) return;

        // Drop the small 4-team placeholder from an earlier version, if present (cascade
        // removes its matches), so we don't end up with two "Valorant Masters" events.
        tournamentRepo.findAll().stream()
            .filter(x -> "Valorant Masters 2026".equals(x.getName()))
            .forEach(tournamentRepo::delete);

        Map<String, Team> tm = new HashMap<>();
        teamRepo.findAll().forEach(x -> tm.put(x.getName(), x));
        Team phantom = tm.get("Phantom Squad"), nexus = tm.get("Team Nexus"),
             storm   = tm.get("Storm Raiders"), vipers = tm.get("Crimson Vipers");
        if (phantom == null || nexus == null || storm == null || vipers == null) return;

        // ── Twelve new Valorant teams (W/L mirrors their run in this bracket) ────────
        Team sentinel = showcaseTeam("Sentinel Core",     "USA",          "Chicago",    2021, 1, 1);
        Team radiant  = showcaseTeam("Radiant Union",     "Brazil",       "Curitiba",   2020, 1, 1);
        Team spectre  = showcaseTeam("Spectre Division",  "South Korea",  "Incheon",    2022, 1, 1);
        Team vandal   = showcaseTeam("Vandal Syndicate",  "Turkey",       "Istanbul",   2019, 2, 1);
        Team eclipse  = showcaseTeam("Eclipse Vanguard",  "Canada",       "Vancouver",  2021, 1, 1);
        Team ascend   = showcaseTeam("Ascend Collective", "Australia",    "Sydney",     2022, 0, 1);
        Team nova     = showcaseTeam("Nova Tempest",      "Poland",       "Kraków",     2020, 0, 1);
        Team phoenix  = showcaseTeam("Iron Phoenix",      "China",        "Shanghai",   2019, 0, 1);
        Team astra    = showcaseTeam("Astra Legion",      "Argentina",    "Córdoba",    2021, 0, 1);
        Team cipher   = showcaseTeam("Cipher Dynasty",    "Singapore",    "Singapore",  2022, 0, 1);
        Team lotus    = showcaseTeam("Lotus Empire",      "India",        "Mumbai",     2020, 0, 1);
        Team breach   = showcaseTeam("Breach Kings",      "England",      "Birmingham", 2019, 0, 1);
        teamRepo.saveAll(List.of(sentinel, radiant, spectre, vandal, eclipse, ascend,
                                 nova, phoenix, astra, cipher, lotus, breach));

        Tournament t = tournament("Valorant Masters 2026", "FPS", "Valorant", "SINGLE_ELIMINATION",
            "COMPLETED", "2026-05-22", "2026-05-31",
            phantom, nexus, storm, vipers, sentinel, radiant, spectre, vandal,
            eclipse, ascend, nova, phoenix, astra, cipher, lotus, breach);
        t.setPrizeFirst("€100,000");
        t.setPrizeSecond("€50,000");
        t.setPrizeThird("€25,000");
        // Crown the winner explicitly — the backfill flags are evaluated before this seed
        // runs, so backfillChampions() may not pick up this freshly added tournament.
        t.setChampionTeamId(phantom.getId());
        t.setChampionTeamName(phantom.getName());
        tournamentRepo.save(t);

        // Matches are saved round by round (dates ascending) so the frontend bracket
        // groups them correctly: 8 → 4 → 2 → 1. Phantom Squad lifts the trophy.
        matchRepo.saveAll(List.of(
            // Round of 16
            played(phantom,  breach,   "2026-05-22", t, 13,  5),
            played(sentinel, storm,    "2026-05-22", t, 13, 11),
            played(vipers,   cipher,   "2026-05-23", t, 13,  8),
            played(radiant,  nova,     "2026-05-23", t, 13,  9),
            played(nexus,    lotus,    "2026-05-24", t, 13,  7),
            played(spectre,  astra,    "2026-05-24", t, 13, 10),
            played(vandal,   phoenix,  "2026-05-25", t, 13,  6),
            played(eclipse,  ascend,   "2026-05-25", t, 13, 11),
            // Quarter-Finals
            played(phantom,  sentinel, "2026-05-27", t, 13,  9),
            played(vipers,   radiant,  "2026-05-27", t, 13, 11),
            played(nexus,    spectre,  "2026-05-28", t, 13,  8),
            played(vandal,   eclipse,  "2026-05-28", t, 13, 10),
            // Semi-Finals
            played(phantom,  vipers,   "2026-05-30", t, 13, 10),
            played(nexus,    vandal,   "2026-05-30", t, 13, 11),
            // Grand Final
            played(phantom,  nexus,    "2026-05-31", t, 13,  9)
        ));
    }

    // Builds a roster-less Valorant org for the showcase bracket (pts = wins * 3).
    private Team showcaseTeam(String name, String nationality, String city, int foundedYear, int wins, int losses) {
        Team team = team(name, wins * 3, wins, losses);
        team.setGame("FPS");
        team.setSpecificGame("Valorant");
        team.setNationality(nationality);
        team.setCity(city);
        team.setFoundedYear(foundedYear);
        return team;
    }

    // ── League showcase seed (full round-robin in another discipline) ────────────
    // A complete 8-team League of Legends regular season: every team plays every other
    // once (28 matches), played out to a final standings table and a champion. Four new
    // LoL orgs join the four existing MOBA teams. Idempotent: keyed on a new team.
    private void seedLeagueShowcase() {
        if (teamRepo.findAll().stream().anyMatch(x -> "Rift Guardians".equals(x.getName()))) return;

        Map<String, Team> tm = new HashMap<>();
        teamRepo.findAll().forEach(x -> tm.put(x.getName(), x));
        Team frost = tm.get("Frost Giants"), echo = tm.get("Echo Strike"),
             mystic = tm.get("Mystic Order"), iron = tm.get("Iron Wolves");
        if (frost == null || echo == null || mystic == null || iron == null) return;

        // Four new LoL orgs (W/L mirrors their finish in this league).
        Team rift     = mobaShowcaseTeam("Rift Guardians",   "South Korea", "Gwangju",   2020, 5, 2);
        Team hextech  = mobaShowcaseTeam("Hextech Vanguard", "China",       "Chengdu",   2021, 3, 4);
        Team baron    = mobaShowcaseTeam("Baron Lords",      "USA",         "Seattle",   2022, 1, 6);
        Team summoner = mobaShowcaseTeam("Summoner's Pride", "France",      "Marseille", 2021, 0, 7);
        teamRepo.saveAll(List.of(rift, hextech, baron, summoner));

        // Final order, strongest first — the higher-placed team wins each meeting, so the
        // round-robin produces a clean ladder (Frost Giants take the title at 7-0).
        List<Team> table = List.of(frost, echo, rift, mystic, hextech, iron, baron, summoner);

        Tournament t = tournament("LoL Champions League 2026", "MOBA", "League of Legends", "LEAGUE",
            "COMPLETED", "2026-05-01", "2026-05-31", table.toArray(new Team[0]));
        t.setPrizeFirst("€80,000");
        t.setPrizeSecond("€40,000");
        t.setPrizeThird("€20,000");
        t.setChampionTeamId(frost.getId());
        t.setChampionTeamName(frost.getName());
        tournamentRepo.save(t);

        // Single round robin: each pair meets once (28 matches), scores varied for realism.
        List<Match> matches = new ArrayList<>();
        LocalDate date = LocalDate.parse("2026-05-02");
        for (int i = 0; i < table.size(); i++) {
            for (int j = i + 1; j < table.size(); j++) {
                int winScore  = 22 + ((i * 3 + j) % 9);          // 22..30 kills
                int loseScore = Math.max(8, winScore - (5 + ((i + j) % 5) * 3)); // trailing
                matches.add(played(table.get(i), table.get(j), date.toString(), t, winScore, loseScore));
                date = date.plusDays(1);
            }
        }
        matchRepo.saveAll(matches);
    }

    // Builds a roster-less League of Legends org for the league showcase (pts = wins * 3).
    private Team mobaShowcaseTeam(String name, String nationality, String city, int foundedYear, int wins, int losses) {
        Team team = team(name, wins * 3, wins, losses);
        team.setGame("MOBA");
        team.setSpecificGame("League of Legends");
        team.setNationality(nationality);
        team.setCity(city);
        team.setFoundedYear(foundedYear);
        return team;
    }

    // ── Extra free agents (fuller transfer market across every discipline) ───────
    // Players from all five modalities plus a few coaches, all without a team, so the
    // Transfers page has a deep free-agency pool. Idempotent: keyed on one new player.
    private void seedFreeAgents() {
        if (playerRepo.findAll().stream().anyMatch(p -> "tobiK".equals(p.getNickname()))) return;

        List<Player> agents = new ArrayList<>();
        agents.add(freeAgent(new FPSPlayer("Tobias Krüger", "tobiK", 14, 9, 5, 70.1, 256, 73.4, 152.0),
            "Germany", "Cologne", LocalDate.of(2001, 2, 11), "MVP — FPS Open Qualifier 2025"));
        agents.add(freeAgent(new FPSPlayer("Aria Nazari", "ariaN", 11, 7, 4, 68.9, 201, 71.2, 144.5),
            "Iran", "Tehran", LocalDate.of(2003, 6, 8), null));
        agents.add(freeAgent(new MOBAPlayer("Min-jun Seo", "mjSeo", 13, 8, 5, "Akali", 84, 51, 60),
            "South Korea", "Suwon", LocalDate.of(2002, 4, 19), "Rookie of the Split 2024"));
        agents.add(freeAgent(new MOBAPlayer("Viktor Petrov", "vPetrov", 10, 5, 5, "Orianna", 47, 55, 88),
            "Bulgaria", "Sofia", LocalDate.of(2001, 9, 23), null));
        agents.add(freeAgent(new EFootballPlayer("Bruno Carvalho", "bCarva", 12, 8, 4, "ST", 19, 0, 9, 27, 11),
            "Portugal", "Coimbra", LocalDate.of(2000, 12, 15), "Golden Boot — Regional eLeague 2025"));
        agents.add(freeAgent(new EFootballPlayer("Noah Andersson", "noahA", 9, 5, 4, "CM", 6, 0, 12, 13, 18),
            "Sweden", "Gothenburg", LocalDate.of(2002, 3, 27), null));
        agents.add(freeAgent(new RacingPlayer("Lando Beckett", "landoB", 16, 6, 4, 4.2, 9, 7, 2),
            "United Kingdom", "Norwich", LocalDate.of(2002, 7, 30), "Pole Position Record — Sim GP 2025"));
        agents.add(freeAgent(new BattleRoyalePlayer("Sofia Marín", "sMarin", 18, 7, 5, 6.8, 142, 0.61, 410.0),
            "Spain", "Valencia", LocalDate.of(2003, 3, 12), "Top Fragger — BR Showdown 2025"));
        agents.add(freeAgent(new BattleRoyalePlayer("Dmitri Volkov", "dVolk", 15, 6, 6, 7.4, 121, 0.55, 372.0),
            "Russia", "Kazan", LocalDate.of(2001, 11, 2), null));
        playerRepo.saveAll(agents);

        coachRepo.saveAll(List.of(
            freeCoach("Helena Vásquez", "h.vasquez@freeagent.gg", "MOBA", "Mexico", "Guadalajara",
                LocalDate.of(1985, 5, 20), "Head Coach — MOBA Spring Champions 2023"),
            freeCoach("Andrei Popescu", "a.popescu@freeagent.gg", "EFOOTBALL", "Romania", "Bucharest",
                LocalDate.of(1983, 8, 11), "eFootball Continental Cup 2022"),
            freeCoach("Kenji Watanabe", "k.watanabe@freeagent.gg", "RACING", "Japan", "Yokohama",
                LocalDate.of(1981, 12, 3), "Constructors' Title — Sim Racing League 2024")
        ));
    }

    // Stamps profile fields onto a team-less player (an achievement is optional).
    private Player freeAgent(Player p, String nationality, String city, LocalDate birthDate, String achievement) {
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        if (achievement != null) p.setAchievements(new ArrayList<>(List.of(achievement)));
        return p;
    }

    private Coach freeCoach(String name, String email, String specialization, String nationality,
                            String city, LocalDate birthDate, String achievement) {
        Coach c = new Coach(name, email);
        c.setSpecialization(specialization);
        c.setNationality(nationality);
        c.setCity(city);
        c.setBirthDate(birthDate);
        c.setAchievements(new ArrayList<>(List.of(achievement)));
        return c;
    }

    // ── Active league seed (a season in progress, varied past AND future) ────────
    // An 8-team Valorant round-robin played as a circle schedule: the first four rounds
    // are already played and the last three are still scheduled. Because every team meets
    // a different opponent each round, each one ends up with varied opponents in both its
    // match history and its upcoming fixtures — no repetition. Idempotent (keyed on name).
    private void seedActiveLeague() {
        if (tournamentRepo.findAll().stream().anyMatch(t -> "Valorant Pro League 2026".equals(t.getName()))) return;

        Map<String, Team> tm = new HashMap<>();
        teamRepo.findAll().forEach(x -> tm.put(x.getName(), x));
        List<Team> roster = new ArrayList<>();
        for (String name : List.of("Phantom Squad", "Team Nexus", "Crimson Vipers", "Vandal Syndicate",
                                   "Sentinel Core", "Spectre Division", "Radiant Union", "Eclipse Vanguard")) {
            Team team = tm.get(name);
            if (team == null) return;   // showcase teams not seeded yet
            roster.add(team);
        }

        Tournament t = tournament("Valorant Pro League 2026", "FPS", "Valorant", "LEAGUE",
            "ACTIVE", "2026-06-01", "2026-06-30", roster.toArray(new Team[0]));
        t.setPrizeFirst("€60,000");
        t.setPrizeSecond("€30,000");
        t.setPrizeThird("€15,000");
        tournamentRepo.save(t);

        // Strength ranking (roster order) decides the winner of an already-played match.
        Map<Long, Integer> rank = new HashMap<>();
        for (int i = 0; i < roster.size(); i++) rank.put(roster.get(i).getId(), i);

        int n = roster.size();          // 8 → 7 rounds of 4 matches (28 total)
        int playedRounds = 4;           // 4 played + 3 upcoming per team
        String[] playedDates   = { "2026-06-02", "2026-06-04", "2026-06-06", "2026-06-08" };
        String[] upcomingDates = { "2026-06-18", "2026-06-21", "2026-06-24" };

        List<Team> arr = new ArrayList<>(roster);
        List<Match> matches = new ArrayList<>();
        for (int round = 0; round < n - 1; round++) {
            boolean isPlayed = round < playedRounds;
            String date = isPlayed ? playedDates[round] : upcomingDates[round - playedRounds];
            for (int i = 0; i < n / 2; i++) {
                Team a = arr.get(i), b = arr.get(n - 1 - i);
                if (isPlayed) {
                    boolean aStronger = rank.get(a.getId()) <= rank.get(b.getId());
                    Team winner = aStronger ? a : b, loser = aStronger ? b : a;
                    matches.add(played(winner, loser, date, t, 13, 13 - (2 + ((round + i) % 6))));
                } else {
                    matches.add(upcoming(a, b, date, t));
                }
            }
            // Circle method: keep the first team fixed, rotate the rest.
            arr.add(1, arr.remove(n - 1));
        }
        matchRepo.saveAll(matches);
    }

    // ── Expansion seed (4 teams + 2 specific games per modality) ────────────────
    // Brings every discipline up to 4 teams across two real titles so the dashboard
    // game filter is populated and tournaments are proper multi-team events.

    private void seedExpansion() {
        if (teamRepo.findAll().stream().anyMatch(t -> "Crimson Vipers".equals(t.getName()))) return;

        Map<String, Team> tm = new HashMap<>();
        teamRepo.findAll().forEach(x -> tm.put(x.getName(), x));
        Team phantom = tm.get("Phantom Squad"), nexus = tm.get("Team Nexus"), storm = tm.get("Storm Raiders");
        Team echo = tm.get("Echo Strike"), iron = tm.get("Iron Wolves");
        Team apex = tm.get("Apex Horizon");
        Team nitro = tm.get("Nitro Kings"), velocity = tm.get("Velocity Grid");
        Team zoneCtrl = tm.get("Zone Control"), dropZone = tm.get("Drop Zone");

        // ── New teams (points = wins * 3, matching the base seed convention) ─────
        Team vipers = team("Crimson Vipers",   12, 4, 5); vipers.setNationality("France");         vipers.setGame("FPS");           vipers.setCity("Paris");          vipers.setFoundedYear(2022);
        Team frost  = team("Frost Giants",      15, 5, 3); frost.setNationality("Finland");         frost.setGame("MOBA");           frost.setCity("Helsinki");        frost.setFoundedYear(2021); frost.setTrophies(1);
        Team mystic = team("Mystic Order",      12, 4, 4); mystic.setNationality("South Korea");    mystic.setGame("MOBA");          mystic.setCity("Daejeon");        mystic.setFoundedYear(2022);
        Team golden = team("Golden Boot FC",    12, 4, 2); golden.setNationality("Brazil");         golden.setGame("EFOOTBALL");     golden.setCity("Rio de Janeiro"); golden.setFoundedYear(2022); golden.setTrophies(1);
        Team tiki   = team("Tiki Taka United",   9, 3, 3); tiki.setNationality("Spain");            tiki.setGame("EFOOTBALL");       tiki.setCity("Seville");          tiki.setFoundedYear(2021);
        Team netb   = team("Net Breakers",       6, 2, 4); netb.setNationality("England");          netb.setGame("EFOOTBALL");       netb.setCity("Manchester");       netb.setFoundedYear(2023);
        Team apexR  = team("Apex Racers",       12, 4, 4); apexR.setNationality("United Kingdom");   apexR.setGame("RACING");         apexR.setCity("London");          apexR.setFoundedYear(2022);
        Team turbo  = team("Turbo Dynasty",     15, 5, 3); turbo.setNationality("Japan");           turbo.setGame("RACING");         turbo.setCity("Suzuka");          turbo.setFoundedYear(2021); turbo.setTrophies(1);
        Team finalC = team("Final Circle",       9, 3, 2); finalC.setNationality("USA");            finalC.setGame("BATTLE_ROYALE"); finalC.setCity("Austin");         finalC.setFoundedYear(2022); finalC.setTrophies(1);
        Team surge  = team("Storm Surge",        6, 2, 3); surge.setNationality("Canada");          surge.setGame("BATTLE_ROYALE");  surge.setCity("Toronto");         surge.setFoundedYear(2023);
        teamRepo.saveAll(List.of(vipers, frost, mystic, golden, tiki, netb, apexR, turbo, finalC, surge));

        // ── Coaches ──────────────────────────────────────────────────────────────
        coachRepo.saveAll(List.of(
            coach("Pierre Lefèvre", "p.lefevre@crimsonvipers.gg", vipers, "France",         "Lyon",      "1986-04-12", "FPS"),
            coach("Veikko Laine",   "v.laine@frostgiants.gg",     frost,  "Finland",        "Tampere",   "1987-02-20", "MOBA"),
            coach("Seung-min Oh",   "s.oh@mysticorder.gg",        mystic, "South Korea",    "Daegu",     "1989-11-15", "MOBA"),
            coach("Roberto Alves",  "r.alves@goldenboot.gg",      golden, "Brazil",         "Rio de Janeiro", "1985-07-19", "EFOOTBALL"),
            coach("Xavi Moreno",    "x.moreno@tikitaka.gg",       tiki,   "Spain",          "Madrid",    "1983-10-05", "EFOOTBALL"),
            coach("Gary Sutton",    "g.sutton@netbreakers.gg",    netb,   "England",        "Liverpool", "1980-01-28", "EFOOTBALL"),
            coach("James Whitfield","j.whitfield@apexracers.gg",  apexR,  "United Kingdom", "Oxford",    "1982-08-14", "RACING"),
            coach("Kenji Mori",     "k.mori@turbodynasty.gg",     turbo,  "Japan",          "Nagoya",    "1984-03-22", "RACING"),
            coach("Chris Donovan",  "c.donovan@finalcircle.gg",   finalC, "USA",            "Dallas",    "1986-09-03", "BATTLE_ROYALE"),
            coach("Marc Tremblay",  "m.tremblay@stormsurge.gg",   surge,  "Canada",         "Montreal",  "1985-12-20", "BATTLE_ROYALE")
        ));

        // ── Players (5 per team) + roster achievements ─────────────────────────────
        playerRepo.saveAll(withAchievement(List.of(
            fps("Étienne Moreau", "etiboi",  vipers, 12, 7, 5, 70.1, 245, 73.0, 150.2, "France",               "Paris",    LocalDate.of(2001,  2, 11)),
            fps("Noah Becker",    "nBecker", vipers, 11, 6, 5, 67.5, 188, 69.8, 139.5, "Germany",              "Cologne",  LocalDate.of(2002,  5, 19)),
            fps("Mateo Greco",    "teoR",    vipers, 13, 8, 5, 72.3, 270, 75.1, 158.0, "Italy",                "Florence", LocalDate.of(2000,  8, 23)),
            fps("Amir Haddad",    "ariaH",   vipers, 10, 5, 5, 66.2, 150, 67.9, 130.4, "United Arab Emirates", "Dubai",    LocalDate.of(2003,  1,  7)),
            fps("Tobias Berg",    "tBerg",   vipers, 12, 6, 6, 69.0, 210, 71.2, 145.7, "Norway",               "Bergen",   LocalDate.of(2001, 11, 30))
        ), "Runner-Up — CS2 Major 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            moba("Aleksi Korhonen", "aleksiMid", frost, 10, 6, 4, "Ahri",     78, 52,  69, "Finland", "Helsinki", LocalDate.of(2000,  3, 12)),
            moba("Bjorn Dahl",      "bjornTop",  frost, 10, 6, 4, "Ornn",     41, 58,  88, "Sweden",  "Malmö",    LocalDate.of(2001,  7,  8)),
            moba("Wei Chen",        "weiADC",    frost, 10, 6, 4, "Kai'Sa",   95, 49,  52, "China",   "Chengdu",  LocalDate.of(2002,  9, 15)),
            moba("Liam O'Brien",    "liamJG",    frost, 10, 6, 4, "Vi",       67, 61,  77, "Ireland", "Cork",     LocalDate.of(2000, 12, 22)),
            moba("Sofia Lindqvist", "sofiSup",   frost, 10, 6, 4, "Nautilus", 18, 47, 121, "Sweden",  "Uppsala",  LocalDate.of(2003,  4,  3))
        ), "Champion — Dota 2 International 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            moba("Do-yun Han",  "doyunMid", mystic, 8, 4, 4, "Syndra", 84, 54,  61, "South Korea", "Daejeon", LocalDate.of(2001,  6, 18)),
            moba("Marco Russo", "grecoTop", mystic, 8, 4, 4, "Aatrox", 49, 55,  73, "Italy",       "Bari",    LocalDate.of(2000, 10,  9)),
            moba("Tunde Bello", "tundeADC", mystic, 8, 4, 4, "Jhin",   88, 46,  57, "Nigeria",     "Abuja",   LocalDate.of(2002,  2, 27)),
            moba("Pablo Núñez", "pabloJG",  mystic, 8, 4, 4, "Elise",  72, 63,  69, "Argentina",   "Córdoba", LocalDate.of(2001,  5, 14)),
            moba("Yara Saleh",  "yaraSup",  mystic, 8, 4, 4, "Lulu",   22, 41, 118, "Egypt",       "Alexandria", LocalDate.of(2003,  8, 21))
        ), "Top 4 — Dota 2 International 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            efb("Bruno Carvalho",   "brunoGoal", golden, 12, 8, 4, "ST",  28,  0,  9, 35,  7, "Brazil",    "Rio de Janeiro", LocalDate.of(2000,  4,  9)),
            efb("Diego Fernández",  "diegoEF",   golden, 12, 8, 4, "CAM", 12,  0, 19, 18, 15, "Argentina", "Rosario",        LocalDate.of(2001,  8, 17)),
            efb("Kenji Sato",       "kenjiEF",   golden, 12, 8, 4, "LW",  17,  0, 13, 23, 11, "Japan",     "Nagoya",         LocalDate.of(2002, 11, 25)),
            efb("Andre Lima",       "andreGK",   golden, 12, 8, 4, "GK",   0, 33,  1,  0,  4, "Portugal",  "Coimbra",        LocalDate.of(1999,  3, 30)),
            efb("Hugo Martins",     "hugoCB",    golden, 12, 8, 4, "CB",   2,  7,  4,  6, 28, "Portugal",  "Setúbal",        LocalDate.of(2003,  6, 12))
        ), "Champion — EA FC Winter Cup 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            efb("Sergio Vidal",   "sergioTT",  tiki, 10, 6, 4, "ST",  25,  0, 10, 30,  8, "Spain",   "Seville", LocalDate.of(2000,  9,  5)),
            efb("Pol Garcia",     "polGarcia", tiki, 10, 6, 4, "CM",   6,  0, 16, 13, 22, "Spain",   "Girona",  LocalDate.of(2002,  1, 19)),
            efb("Yassine Benali", "yassEF",    tiki, 10, 6, 4, "RW",  19,  0, 12, 25, 10, "Morocco", "Rabat",   LocalDate.of(2001,  7, 28)),
            efb("Iker Mendoza",   "ikerGK",    tiki, 10, 6, 4, "GK",   0, 29,  2,  0,  5, "Spain",   "Bilbao",  LocalDate.of(1999, 12, 14)),
            efb("Luca Conti",     "lucaCB",    tiki, 10, 6, 4, "CB",   3,  9,  5,  7, 26, "Italy",   "Genoa",   LocalDate.of(2003,  3,  8))
        ), "Top 4 — EA FC Winter Cup 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            efb("Jordan Clarke", "jClarkeEF", netb, 9, 4, 5, "ST",  23,  0,  8, 28,  9, "England",  "Manchester", LocalDate.of(2000,  5, 27)),
            efb("Oliver Hughes", "olliEF",    netb, 9, 4, 5, "CAM",  8,  0, 14, 14, 20, "Wales",    "Cardiff",    LocalDate.of(2002,  8, 11)),
            efb("Femi Adebayo",  "femiEF",    netb, 9, 4, 5, "LW",  16,  0, 11, 22, 12, "Nigeria",  "Ibadan",     LocalDate.of(2001, 10,  3)),
            efb("Ryan Scott",    "ryanGK",    netb, 9, 4, 5, "GK",   0, 27,  1,  0,  6, "Scotland", "Glasgow",    LocalDate.of(1999,  2, 22)),
            efb("Daniel Webb",   "danWebbCB", netb, 9, 4, 5, "CB",   2,  6,  4,  6, 24, "England",  "Leeds",      LocalDate.of(2003,  9, 16))
        ), "Top 4 — EA FC Winter Cup 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            racing("Oliver Grant",  "oGrant_ar", apexR, 8, 4, 4, 2.6, 5, 4, 2, "United Kingdom", "London",    LocalDate.of(2000,  6, 15)),
            racing("Lucas Meyer",   "meyerGP",   apexR, 8, 4, 4, 4.0, 3, 2, 3, "Switzerland",    "Zurich",    LocalDate.of(2001,  9, 22)),
            racing("Theo Laurent",  "theoRace",  apexR, 8, 4, 4, 5.5, 2, 3, 2, "France",         "Marseille", LocalDate.of(2002, 12, 30)),
            racing("Mads Nielsen",  "madsGP",    apexR, 8, 4, 4, 7.1, 1, 1, 4, "Denmark",        "Aarhus",    LocalDate.of(2000,  2,  7)),
            racing("Rui Tavares",   "ruiAR",     apexR, 8, 4, 4, 8.8, 0, 1, 5, "Portugal",       "Porto",     LocalDate.of(2003,  5, 19))
        ), "Runner-Up — Gran Turismo Champions 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            racing("Haruto Kobayashi", "harutoTD", turbo, 8, 5, 3, 1.9, 7, 6, 1, "Japan",       "Suzuka",    LocalDate.of(1999, 10, 12)),
            racing("Ren Watanabe",     "renGP",    turbo, 8, 5, 3, 3.4, 4, 3, 2, "Japan",       "Yokohama",  LocalDate.of(2001,  3, 28)),
            racing("Sung-ho Park",     "sunghoTD", turbo, 8, 5, 3, 5.0, 3, 4, 3, "South Korea", "Ulsan",     LocalDate.of(2000,  7, 16)),
            racing("Felipe Costa",     "felipeGP", turbo, 8, 5, 3, 6.6, 2, 2, 4, "Brazil",      "Curitiba",  LocalDate.of(2002,  5,  9)),
            racing("Aiden Murphy",     "aidenTD",  turbo, 8, 5, 3, 8.5, 0, 1, 6, "Australia",   "Melbourne", LocalDate.of(2003, 11,  1))
        ), "Champion — Gran Turismo Champions 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            br("Tyler Brooks",      "tBrooks_fc", finalC, 5, 3, 2, 3.0, 195, 79.0, 910.0, "USA",     "Austin",       LocalDate.of(2000,  4, 21)),
            br("Sasha Ivanova",     "sashaBR",    finalC, 5, 3, 2, 4.5, 150, 72.0, 760.0, "Russia",  "Novosibirsk",  LocalDate.of(2001,  9, 13)),
            br("Mohammed Al-Farsi", "mFarsi_fc",  finalC, 5, 3, 2, 6.0, 128, 66.0, 640.0, "United Arab Emirates", "Abu Dhabi", LocalDate.of(2002, 12,  5)),
            br("Lena Schulz",       "lenaBR",     finalC, 5, 3, 2, 4.0, 162, 75.0, 820.0, "Germany", "Stuttgart",    LocalDate.of(2000,  7, 30)),
            br("Diego Torres",      "dTorres_fc", finalC, 5, 3, 2, 7.0, 105, 60.0, 560.0, "Mexico",  "Guadalajara",  LocalDate.of(2003,  2, 18))
        ), "Champion — Fortnite World Cup 2025"));

        playerRepo.saveAll(withAchievement(List.of(
            br("Ethan Wright",   "ethanSS", surge, 5, 2, 3, 3.5, 175, 76.0, 850.0, "Canada",  "Toronto",      LocalDate.of(2001,  6,  9)),
            br("Mei Lin",        "meiSS",   surge, 5, 2, 3, 5.0, 140, 70.0, 710.0, "Taiwan",  "Taipei",       LocalDate.of(2002, 10, 27)),
            br("Karim Haddad",   "karimSS", surge, 5, 2, 3, 6.5, 118, 63.0, 600.0, "Lebanon", "Tripoli",      LocalDate.of(2000,  3, 14)),
            br("Olga Sokolova",  "olgaSS",  surge, 5, 2, 3, 4.2, 158, 74.0, 790.0, "Russia",  "Yekaterinburg", LocalDate.of(2001, 11, 19)),
            br("Bayo Okoro",     "bayoSS",  surge, 5, 2, 3, 7.2,  98, 58.0, 530.0, "Nigeria", "Port Harcourt", LocalDate.of(2003,  8,  7))
        ), "Runner-Up — Fortnite World Cup 2025"));

        // ── Tournaments + matches (ordered strongest-first for the round-robin) ────
        List<Team> fpsTeams    = List.of(phantom, vipers, nexus, storm);
        List<Team> mobaTeams   = List.of(frost, mystic, echo, iron);
        List<Team> efbTeams    = List.of(golden, apex, tiki, netb);
        List<Team> racingTeams = List.of(nitro, turbo, apexR, velocity);
        List<Team> brTeams     = List.of(zoneCtrl, finalC, dropZone, surge);

        // FPS — Valorant + CS2
        league("Valorant Masters 2026", "FPS", "Valorant", "ACTIVE",    "2026-05-01", null,        4, 13,  8, "€18,000", "€7,000", "€3,000", fpsTeams);
        league("CS2 Pro League 2026",   "FPS", "CS2",      "ACTIVE",    "2026-05-05", null,        4, 13,  8, "€16,000", "€6,000", "€2,500", fpsTeams);
        league("CS2 Major 2025",        "FPS", "CS2",      "COMPLETED", "2025-11-01", "2025-11-20", 6, 13,  8, "€20,000", "€8,000", "€3,000", fpsTeams);

        // MOBA — League of Legends + Dota 2
        league("LoL Champions Arena 2026", "MOBA", "League of Legends", "ACTIVE",    "2026-05-02", null,        4, 28, 17, "€18,000", "€7,000", "€3,000", mobaTeams);
        league("Dota 2 Pro Circuit 2026",  "MOBA", "Dota 2",            "ACTIVE",    "2026-05-06", null,        4, 31, 22, "€20,000", "€8,000", "€3,500", mobaTeams);
        league("Dota 2 International 2025", "MOBA", "Dota 2",            "COMPLETED", "2025-10-01", "2025-10-22", 6, 31, 22, "€25,000", "€10,000", "€4,000", mobaTeams);

        // eFootball — FIFA + EA FC 25
        league("FIFA Champions Cup 2026", "EFOOTBALL", "FIFA",     "ACTIVE",    "2026-05-03", null,        4, 3, 1, "€12,000", "€5,000", "€2,000", efbTeams);
        league("EA FC Pro League 2026",   "EFOOTBALL", "EA FC 25", "ACTIVE",    "2026-05-07", null,        4, 3, 1, "€14,000", "€6,000", "€2,500", efbTeams);
        league("EA FC Winter Cup 2025",   "EFOOTBALL", "EA FC 25", "COMPLETED", "2025-12-01", "2025-12-18", 6, 3, 1, "€16,000", "€6,000", "€2,500", efbTeams);

        // Racing — iRacing + Gran Turismo 7
        league("iRacing Grand Prix 2026",        "RACING", "iRacing",        "ACTIVE",    "2026-05-04", null,        4, 38, 26, "€10,000", "€4,000", "€2,000", racingTeams);
        league("Gran Turismo World Tour 2026",   "RACING", "Gran Turismo 7", "ACTIVE",    "2026-05-08", null,        4, 40, 28, "€12,000", "€5,000", "€2,500", racingTeams);
        league("Gran Turismo Champions 2025",    "RACING", "Gran Turismo 7", "COMPLETED", "2025-11-05", "2025-11-25", 6, 40, 28, "€14,000", "€6,000", "€3,000", racingTeams);

        // Battle Royale — PUBG + Fortnite
        league("PUBG Global Series 2026",      "BATTLE_ROYALE", "PUBG",     "ACTIVE",    "2026-05-05", null,        4, 48, 33, "€15,000", "€6,000", "€2,500", brTeams);
        league("Fortnite Champion Series 2026","BATTLE_ROYALE", "Fortnite", "ACTIVE",    "2026-05-09", null,        4, 52, 36, "€18,000", "€7,000", "€3,000", brTeams);
        league("Fortnite World Cup 2025",      "BATTLE_ROYALE", "Fortnite", "COMPLETED", "2025-10-10", "2025-10-30", 6, 52, 36, "€20,000", "€8,000", "€3,000", brTeams);
    }

    private List<Player> withAchievement(List<Player> players, String... achievements) {
        players.forEach(pl -> {
            List<String> list = new ArrayList<>(pl.getAchievements() != null ? pl.getAchievements() : List.of());
            for (String a : achievements) if (!list.contains(a)) list.add(a);
            pl.setAchievements(list);
        });
        return players;
    }

    private void league(String name, String game, String specificGame, String status,
                        String startDate, String endDate, int playedCount,
                        int winScore, int loseScore, String p1, String p2, String p3, List<Team> teams) {
        Team[] arr = teams.toArray(new Team[0]);
        Tournament t = endDate == null
            ? tournament(name, game, specificGame, "LEAGUE", status, startDate, arr)
            : tournament(name, game, specificGame, "LEAGUE", status, startDate, endDate, arr);
        if (p1 != null) t.setPrizeFirst(p1);
        if (p2 != null) t.setPrizeSecond(p2);
        if (p3 != null) t.setPrizeThird(p3);
        tournamentRepo.save(t);
        matchRepo.saveAll(roundRobinMatches(t, teams, playedCount, winScore, loseScore, startDate));
    }

    // Single round-robin; the first `playedCount` fixtures are recorded (stronger team wins),
    // the remainder are left as upcoming. Fixtures are spaced 3 days apart from the start date.
    private List<Match> roundRobinMatches(Tournament t, List<Team> teams, int playedCount,
                                          int winScore, int loseScore, String startDate) {
        List<Match> out = new ArrayList<>();
        LocalDate d = LocalDate.parse(startDate);
        int idx = 0;
        for (int i = 0; i < teams.size(); i++) {
            for (int j = i + 1; j < teams.size(); j++) {
                Team a = teams.get(i), b = teams.get(j);
                if (idx < playedCount) {
                    if (a.getPoints() >= b.getPoints()) out.add(played(a, b, d.toString(), t, winScore, loseScore));
                    else                                out.add(played(a, b, d.toString(), t, loseScore, winScore));
                } else {
                    out.add(upcoming(a, b, d.toString(), t));
                }
                d = d.plusDays(3);
                idx++;
            }
        }
        return out;
    }

    // ── Group Stage seed ───────────────────────────────────────────────────────

    private void seedGroupStage() {
        List<Team> allTeams = teamRepo.findAll();
        Team nexus   = findTeam(allTeams, "Team Nexus");
        Team storm   = findTeam(allTeams, "Storm Raiders");
        Team phantom = findTeam(allTeams, "Phantom Squad");
        if (nexus == null || storm == null || phantom == null) return;

        Tournament t = tournament("Valorant Open Cup 2025", "FPS", "Valorant", "GROUP_STAGE", "COMPLETED", "2025-09-01", "2025-09-15", nexus, storm, phantom);
        tournamentRepo.save(t);
        matchRepo.saveAll(List.of(
            played(nexus,   storm,   "2025-09-03", t, 13,  7),
            played(phantom, storm,   "2025-09-05", t, 13,  5),
            played(phantom, nexus,   "2025-09-08", t, 13, 10),
            played(phantom, nexus,   "2025-09-15", t, 13,  8)
        ));
    }

    // ── Completed Elimination seed ─────────────────────────────────────────────

    private void seedCompletedElimination() {
        List<Team> allTeams = teamRepo.findAll();
        Team nexus    = findTeam(allTeams, "Team Nexus");
        Team storm    = findTeam(allTeams, "Storm Raiders");
        Team phantom  = findTeam(allTeams, "Phantom Squad");
        Team dropZone = findTeam(allTeams, "Drop Zone");
        Team zoneCtrl = findTeam(allTeams, "Zone Control");

        if (nexus != null && storm != null && phantom != null) {
            Tournament t1 = tournament("Valorant Autumn Knockout 2024", "FPS", "Valorant", "SINGLE_ELIMINATION", "COMPLETED", "2024-10-01", "2024-10-15", phantom, nexus, storm);
            tournamentRepo.save(t1);
            matchRepo.saveAll(List.of(
                played(nexus,   storm,  "2024-10-05", t1, 13,  8),
                played(phantom, nexus,  "2024-10-15", t1, 13, 10)
            ));
        }

        if (dropZone != null && zoneCtrl != null) {
            Tournament t2 = tournament("BR Double Trouble 2024", "BATTLE_ROYALE", "PUBG", "DOUBLE_ELIMINATION", "COMPLETED", "2024-09-01", "2024-09-20", zoneCtrl, dropZone);
            tournamentRepo.save(t2);
            matchRepo.saveAll(List.of(
                played(zoneCtrl, dropZone, "2024-09-05", t2, 45, 32),
                played(dropZone, zoneCtrl, "2024-09-12", t2, 38, 35),
                played(zoneCtrl, dropZone, "2024-09-20", t2, 51, 30)
            ));
        }
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
        Tournament vc2025 = tournament("Valorant Champions 2025", "FPS", "Valorant", "LEAGUE", "COMPLETED", "2025-01-15", "2025-01-25", nexus, storm, phantom);
        tournamentRepo.save(vc2025);
        matchRepo.saveAll(List.of(
            played(phantom, storm,  "2025-01-18", vc2025, 13,  7),
            played(nexus,   storm,  "2025-01-20", vc2025, 13,  9),
            played(phantom, nexus,  "2025-01-22", vc2025, 13, 10),
            played(phantom, nexus,  "2025-01-25", vc2025, 13,  9)   // FINAL
        ));

        // Valorant World Cup 2024: Nexus wins, Phantom 2nd, Storm 3rd
        Tournament vwc2024 = tournament("Valorant World Cup 2024", "FPS", "Valorant", "LEAGUE", "COMPLETED", "2024-05-01", "2024-05-12", nexus, storm, phantom);
        tournamentRepo.save(vwc2024);
        matchRepo.saveAll(List.of(
            played(nexus,   storm,   "2024-05-05", vwc2024, 13,  9),
            played(phantom, storm,   "2024-05-07", vwc2024, 13,  8),
            played(nexus,   phantom, "2024-05-09", vwc2024, 13, 11),
            played(nexus,   phantom, "2024-05-12", vwc2024, 13,  8)  // FINAL
        ));

        // ── PAST MOBA ─────────────────────────────────────────────────────────
        // LoL Spring Championship 2025: Echo wins, Iron 2nd, Nexus 3rd
        Tournament lsc2025 = tournament("LoL Spring Championship 2025", "MOBA", "League of Legends", "LEAGUE", "COMPLETED", "2025-02-01", "2025-02-12", iron, echo, nexus);
        tournamentRepo.save(lsc2025);
        matchRepo.saveAll(List.of(
            played(echo,  iron,  "2025-02-05", lsc2025, 28, 15),
            played(nexus, iron,  "2025-02-07", lsc2025, 22, 19),
            played(echo,  nexus, "2025-02-09", lsc2025, 31, 18),
            played(echo,  iron,  "2025-02-12", lsc2025, 30, 21)      // FINAL
        ));

        // LoL Pro League 2024: Iron wins, Echo 2nd (best-of-5 tiebreak)
        Tournament lpl2024 = tournament("LoL Pro League 2024", "MOBA", "League of Legends", "LEAGUE", "COMPLETED", "2024-03-15", "2024-03-31", iron, echo);
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
        Tournament fwcs2025 = tournament("FIFA World Cup Sim 2025", "EFOOTBALL", "FIFA", "LEAGUE", "COMPLETED", "2025-01-20", "2025-01-26", apex, storm);
        tournamentRepo.save(fwcs2025);
        matchRepo.saveAll(List.of(
            played(apex,  storm, "2025-01-22", fwcs2025, 3, 1),
            played(storm, apex,  "2025-01-24", fwcs2025, 2, 1),
            played(apex,  storm, "2025-01-26", fwcs2025, 2, 0)       // FINAL: apex wins
        ));

        // FIFA eLeague 2024: Storm wins, Apex 2nd (best-of-5)
        Tournament fel2024 = tournament("FIFA eLeague 2024", "EFOOTBALL", "FIFA", "LEAGUE", "COMPLETED", "2024-06-01", "2024-06-19", apex, storm);
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
        Tournament src2025 = tournament("SimRacing World Cup 2025", "RACING", "iRacing", "LEAGUE", "COMPLETED", "2025-03-01", "2025-04-05", velocity, nitro);
        tournamentRepo.save(src2025);
        matchRepo.saveAll(List.of(
            played(nitro,    velocity, "2025-03-08", src2025, 38, 25),
            played(velocity, nitro,    "2025-03-15", src2025, 31, 28),
            played(nitro,    velocity, "2025-03-22", src2025, 40, 22),
            played(velocity, nitro,    "2025-03-29", src2025, 33, 30),
            played(nitro,    velocity, "2025-04-05", src2025, 37, 26) // FINAL G5: nitro wins
        ));

        // SimRacing Pro League 2024: Velocity wins, Nitro 2nd (4-2)
        Tournament srp2024 = tournament("SimRacing Pro League 2024", "RACING", "iRacing", "LEAGUE", "COMPLETED", "2024-03-15", "2024-04-26", velocity, nitro);
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
        Tournament brws2025 = tournament("BR World Series 2025", "BATTLE_ROYALE", "PUBG", "LEAGUE", "COMPLETED", "2025-05-01", "2025-06-05", dropZone, zoneCtrl);
        tournamentRepo.save(brws2025);
        matchRepo.saveAll(List.of(
            played(zoneCtrl, dropZone, "2025-05-08", brws2025, 49, 35),
            played(dropZone, zoneCtrl, "2025-05-15", brws2025, 42, 36),
            played(zoneCtrl, dropZone, "2025-05-22", brws2025, 55, 28),
            played(dropZone, zoneCtrl, "2025-05-29", brws2025, 44, 39),
            played(zoneCtrl, dropZone, "2025-06-05", brws2025, 51, 33) // FINAL G5: ZC wins
        ));

        // BR Nations Cup 2024: Drop Zone wins, Zone Control 2nd (3-2)
        Tournament brnc2024 = tournament("BR Nations Cup 2024", "BATTLE_ROYALE", "PUBG", "LEAGUE", "COMPLETED", "2024-05-01", "2024-06-05", dropZone, zoneCtrl);
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
        RacingPlayer p = new RacingPlayer(fullName, nick, mp, w, l, avgPosition, podiums, fastestLaps, dnf);
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
        BattleRoyalePlayer p = new BattleRoyalePlayer(fullName, nick, mp, w, l, avgPlacement, kills, top10Rate, damagePerMatch);
        p.setTeam(team);
        p.setNationality(nationality);
        p.setCity(city);
        p.setBirthDate(birthDate);
        return p;
    }

    // ── Prizes seed ────────────────────────────────────────────────────────────

    private void seedPrizes() {
        Map<String, String[]> PRIZES = Map.ofEntries(
            Map.entry("Valorant Champions 2025",           new String[]{"€15,000", "€7,000",  "€3,000"}),
            Map.entry("Valorant World Cup 2024",            new String[]{"€12,000", "€5,000",  "€2,000"}),
            Map.entry("Valorant Autumn Knockout 2024",      new String[]{"Trophy",  null,       null}),
            Map.entry("Valorant Open Cup 2025",             new String[]{"€5,000",  "€2,000",  null}),
            Map.entry("Valorant Spring Cup 2026",           new String[]{"€20,000", "€8,000",  "€3,000"}),
            Map.entry("Valorant Spring Invitational 2026",  new String[]{"€10,000", "€4,000",  null}),
            Map.entry("LoL Spring Championship 2025",       new String[]{"€15,000", "€6,000",  "€2,500"}),
            Map.entry("LoL Pro League 2024",                new String[]{"€12,000", "€5,000",  "€2,000"}),
            Map.entry("LoL Summer League 2026",             new String[]{"€18,000", "€7,000",  "€3,000"}),
            Map.entry("LoL Knockout Cup 2026",              new String[]{"Trophy",  null,       null}),
            Map.entry("FIFA World Cup Sim 2025",            new String[]{"€10,000", "€4,000",  null}),
            Map.entry("FIFA eLeague 2024",                  new String[]{"€8,000",  "€3,000",  null}),
            Map.entry("FIFA eLeague 2026",                  new String[]{"€12,000", "€5,000",  "€2,000"}),
            Map.entry("SimRacing World Cup 2025",           new String[]{"€8,000",  "€3,000",  "€1,500"}),
            Map.entry("SimRacing Pro League 2024",          new String[]{"€6,000",  "€2,500",  "€1,000"}),
            Map.entry("SimRacing Pro League 2026",          new String[]{"€10,000", "€4,000",  "€2,000"}),
            Map.entry("BR World Series 2025",               new String[]{"€12,000", "€5,000",  "€2,500"}),
            Map.entry("BR Nations Cup 2024",                new String[]{"€10,000", "€4,000",  "€2,000"}),
            Map.entry("Battle Royale World Series 2026",    new String[]{"€15,000", "€6,000",  "€2,500"}),
            Map.entry("BR Invitational 2026",               new String[]{"Trophy + €3,000", null, null}),
            Map.entry("BR Double Trouble 2024",             new String[]{"Trophy",  null,       null})
        );
        tournamentRepo.findAll().forEach(t -> {
            if (t.getPrizeFirst() != null) return;
            String[] prizes = PRIZES.get(t.getName());
            if (prizes == null) return;
            t.setPrizeFirst(prizes[0]);
            if (prizes.length > 1 && prizes[1] != null) t.setPrizeSecond(prizes[1]);
            if (prizes.length > 2 && prizes[2] != null) t.setPrizeThird(prizes[2]);
            tournamentRepo.save(t);
        });
    }

    // ── Transfer history seed ────────────────────────────────────────────────
    // A handful of past roster moves so the dashboard transfer widget is populated.
    // (null fromTeam = signed as a free agent; null toTeam = released to free agency)

    private void seedTransfers() {
        if (transferRepo.count() > 0) return;

        Map<String, Player> pByNick = new HashMap<>();
        playerRepo.findAll().forEach(p -> pByNick.put(p.getNickname(), p));
        Map<String, Coach> cByName = new HashMap<>();
        coachRepo.findAll().forEach(c -> cByName.put(c.getName(), c));

        List<Transfer> ts = new ArrayList<>();
        addPlayerTransfer(ts, pByNick, "svenL",      "Storm Raiders", "Phantom Squad", "2025-10-30");
        addPlayerTransfer(ts, pByNick, "iBerg",      null,            "Apex Horizon",  "2025-11-20");
        addPlayerTransfer(ts, pByNick, "jakeMorris", "Phantom Squad", "Storm Raiders", "2025-12-10");
        addPlayerTransfer(ts, pByNick, "lBianchi",   "Iron Wolves",   "Echo Strike",   "2026-01-05");
        addPlayerTransfer(ts, pByNick, "cMendes99",  "Storm Raiders", "Team Nexus",    "2026-01-20");
        addPlayerTransfer(ts, pByNick, "hartXX",     "Velocity Grid", "Nitro Kings",   "2026-02-01");
        addPlayerTransfer(ts, pByNick, "mjLee_zc",   "Drop Zone",     "Zone Control",  "2026-02-14");
        addPlayerTransfer(ts, pByNick, "lPetit",     "Team Nexus",    null,            "2026-03-01");
        addCoachTransfer (ts, cByName, "Jin Park",       null,         "Phantom Squad", "2025-09-15");
        addCoachTransfer (ts, cByName, "Tomás Ferreira", "Team Nexus", null,            "2024-12-31");
        addCoachTransfer (ts, cByName, "Lena Müller",    "Echo Strike", "Iron Wolves",  "2026-02-20");

        transferRepo.saveAll(ts);
    }

    private void addPlayerTransfer(List<Transfer> out, Map<String, Player> byNick,
                                   String nick, String from, String to, String date) {
        Player p = byNick.get(nick);
        if (p == null) return;
        out.add(new Transfer("PLAYER", p.getId(), p.getNickname(), p.getPlayerType(), from, to, LocalDate.parse(date), MarketValue.of(p)));
    }

    private void addCoachTransfer(List<Transfer> out, Map<String, Coach> byName,
                                  String name, String from, String to, String date) {
        Coach c = byName.get(name);
        if (c == null) return;
        out.add(new Transfer("COACH", c.getId(), c.getName(), c.getSpecialization(), from, to, LocalDate.parse(date), MarketValue.of(c)));
    }
}
