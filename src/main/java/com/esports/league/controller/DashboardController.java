package com.esports.league.controller;

import com.esports.league.model.Player;
import com.esports.league.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final CoachRepository coachRepository;
    private final TournamentRepository tournamentRepository;
    private final MatchRepository matchRepository;

    public DashboardController(TeamRepository teamRepository, PlayerRepository playerRepository,
                               CoachRepository coachRepository, TournamentRepository tournamentRepository,
                               MatchRepository matchRepository) {
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.coachRepository = coachRepository;
        this.tournamentRepository = tournamentRepository;
        this.matchRepository = matchRepository;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
            "teams",            teamRepository.count(),
            "players",          playerRepository.count(),
            "coaches",          coachRepository.count(),
            "tournaments",      tournamentRepository.count(),
            "matches",          matchRepository.count(),
            "completedMatches", (long) matchRepository.findByResultRecorded(true).size()
        );
    }

    @GetMapping("/top-players")
    public List<Map<String, Object>> getTopPlayers() {
        return playerRepository.findAll().stream()
            .filter(p -> (p.getWins() + p.getLosses()) >= 3)
            .sorted(Comparator.comparingDouble((Player p) -> {
                int total = p.getWins() + p.getLosses();
                return total > 0 ? (double) p.getWins() / total : 0;
            }).reversed())
            .map(p -> {
                int total = p.getWins() + p.getLosses();
                int wr = total > 0 ? Math.round((float) p.getWins() / total * 100) : 0;
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id",         p.getId());
                row.put("fullName",   p.getFullName());
                row.put("nickname",   p.getNickname());
                row.put("playerType", p.getPlayerType());
                row.put("teamName",   p.getTeam() != null ? p.getTeam().getName() : null);
                row.put("wins",       p.getWins());
                row.put("losses",     p.getLosses());
                row.put("winRate",    wr);
                return row;
            })
            .toList();
    }

    @GetMapping("/game-breakdown")
    public Map<String, Long> getGameBreakdown() {
        List<Player> all = playerRepository.findAll();
        long fps          = all.stream().filter(p -> "FPS".equals(p.getPlayerType())).count();
        long moba         = all.stream().filter(p -> "MOBA".equals(p.getPlayerType())).count();
        long efootball    = all.stream().filter(p -> "EFOOTBALL".equals(p.getPlayerType())).count();
        long racing       = all.stream().filter(p -> "RACING".equals(p.getPlayerType())).count();
        long battleRoyale = all.stream().filter(p -> "BATTLE_ROYALE".equals(p.getPlayerType())).count();
        long generic      = all.stream().filter(p -> "GENERIC".equals(p.getPlayerType())).count();
        return Map.of("FPS", fps, "MOBA", moba, "EFOOTBALL", efootball,
                      "RACING", racing, "BATTLE_ROYALE", battleRoyale, "GENERIC", generic);
    }
}
