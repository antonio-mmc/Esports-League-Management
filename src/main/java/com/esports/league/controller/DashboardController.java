package com.esports.league.controller;

import com.esports.league.model.Player;
import com.esports.league.repository.*;
import com.esports.league.service.MarketValue;
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
    private final TransferRepository transferRepository;

    public DashboardController(TeamRepository teamRepository, PlayerRepository playerRepository,
                               CoachRepository coachRepository, TournamentRepository tournamentRepository,
                               MatchRepository matchRepository, TransferRepository transferRepository) {
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.coachRepository = coachRepository;
        this.tournamentRepository = tournamentRepository;
        this.matchRepository = matchRepository;
        this.transferRepository = transferRepository;
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

    @GetMapping("/free-agents")
    public Map<String, Object> getFreeAgents() {
        List<Map<String, Object>> players = playerRepository.findAll().stream()
            .filter(p -> p.getTeam() == null)
            .map(p -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id",          p.getId());
                row.put("fullName",    p.getFullName());
                row.put("nickname",    p.getNickname());
                row.put("playerType",  p.getPlayerType());
                row.put("nationality", p.getNationality());
                row.put("value",       MarketValue.of(p));
                return row;
            }).toList();
        List<Map<String, Object>> coaches = coachRepository.findAll().stream()
            .filter(c -> c.getTeam() == null)
            .map(c -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id",             c.getId());
                row.put("name",           c.getName());
                row.put("specialization", c.getSpecialization());
                row.put("nationality",    c.getNationality());
                row.put("value",          MarketValue.of(c));
                return row;
            }).toList();
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("players", players);
        out.put("coaches", coaches);
        return out;
    }

    @GetMapping("/recent-transfers")
    public List<Map<String, Object>> getRecentTransfers() {
        return transferRepository.findAllByOrderByDateDescIdDesc().stream()
            .limit(12)
            .map(TransferController::toRow)
            .toList();
    }
}
