package com.esports.league.service;

import com.esports.league.model.*;
import com.esports.league.repository.PlayerRepository;
import com.esports.league.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class PlayerService {

    private static final Set<String> KNOWN_TYPES =
        Set.of("FPS", "MOBA", "EFOOTBALL", "RACING", "BATTLE_ROYALE", "GENERIC");

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final TransferLog transferLog;

    public PlayerService(PlayerRepository playerRepository, TeamRepository teamRepository,
                         TransferLog transferLog) {
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.transferLog = transferLog;
    }

    public List<Player> findAll() {
        return playerRepository.findAll();
    }

    public List<Player> findByType(String type) {
        String wanted = type.toUpperCase();
        if (!KNOWN_TYPES.contains(wanted)) return findAll();
        return playerRepository.findAll().stream()
            .filter(p -> wanted.equals(p.getPlayerType()))
            .toList();
    }

    public Player findById(Long id) {
        return playerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Player not found: " + id));
    }

    public Player create(Player player) {
        if (playerRepository.existsByNickname(player.getNickname())) {
            throw new IllegalArgumentException("Nickname already in use.");
        }
        // Replace any client-supplied team stub ({id}) with a managed entity.
        if (player.getTeam() != null && player.getTeam().getId() != null) {
            Team team = teamRepository.findById(player.getTeam().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + player.getTeam().getId()));
            player.setTeam(team);
        } else {
            player.setTeam(null);
        }
        return playerRepository.save(player);
    }

    public Player update(Long id, Player updated) {
        Player player = findById(id);

        if (!player.getNickname().equals(updated.getNickname())
                && playerRepository.existsByNickname(updated.getNickname())) {
            throw new IllegalArgumentException("Nickname already in use.");
        }

        player.setFullName(updated.getFullName());
        player.setNickname(updated.getNickname());
        player.setMatchesPlayed(updated.getMatchesPlayed());
        player.setWins(updated.getWins());
        player.setLosses(updated.getLosses());
        player.setBirthDate(updated.getBirthDate());
        player.setNationality(updated.getNationality());
        player.setCity(updated.getCity());
        player.setAchievements(updated.getAchievements());

        // Team assignment from the edit form (an empty selection clears it).
        String fromTeam = player.getTeam() != null ? player.getTeam().getName() : null;
        Team newTeam = null;
        if (updated.getTeam() != null && updated.getTeam().getId() != null) {
            newTeam = teamRepository.findById(updated.getTeam().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + updated.getTeam().getId()));
        }
        String toTeam = newTeam != null ? newTeam.getName() : null;
        player.setTeam(newTeam);
        if (!Objects.equals(fromTeam, toTeam)) transferLog.playerMoved(player, fromTeam, toTeam);

        if (player instanceof FPSPlayer fps && updated instanceof FPSPlayer upd) {
            fps.setAccuracy(upd.getAccuracy());
            fps.setHeadshots(upd.getHeadshots());
            fps.setKast(upd.getKast());
            fps.setAdr(upd.getAdr());
        } else if (player instanceof MOBAPlayer moba && updated instanceof MOBAPlayer upd) {
            moba.setMainCharacter(upd.getMainCharacter());
            moba.setKills(upd.getKills());
            moba.setDeaths(upd.getDeaths());
            moba.setMobaAssists(upd.getMobaAssists());
        } else if (player instanceof EFootballPlayer ef && updated instanceof EFootballPlayer upd) {
            ef.setMainPosition(upd.getMainPosition());
            ef.setGoalsScored(upd.getGoalsScored());
            ef.setGoalsSaved(upd.getGoalsSaved());
            ef.setEfbAssists(upd.getEfbAssists());
            ef.setShotsOnTarget(upd.getShotsOnTarget());
            ef.setBallRecoveries(upd.getBallRecoveries());
        } else if (player instanceof RacingPlayer rp && updated instanceof RacingPlayer upd) {
            rp.setAvgPosition(upd.getAvgPosition());
            rp.setPodiums(upd.getPodiums());
            rp.setFastestLaps(upd.getFastestLaps());
            rp.setDnf(upd.getDnf());
        } else if (player instanceof BattleRoyalePlayer br && updated instanceof BattleRoyalePlayer upd) {
            br.setAvgPlacement(upd.getAvgPlacement());
            br.setKills(upd.getKills());
            br.setTop10Rate(upd.getTop10Rate());
            br.setDamagePerMatch(upd.getDamagePerMatch());
        }

        return playerRepository.save(player);
    }

    public Player assignTeam(Long playerId, Long teamId) {
        Player player = findById(playerId);
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        String fromTeam = player.getTeam() != null ? player.getTeam().getName() : null;
        if (!Objects.equals(fromTeam, team.getName())) transferLog.playerMoved(player, fromTeam, team.getName());
        player.setTeam(team);
        return playerRepository.save(player);
    }

    public Player removeTeam(Long playerId) {
        Player player = findById(playerId);
        if (player.getTeam() != null) transferLog.playerMoved(player, player.getTeam().getName(), null);
        player.setTeam(null);
        return playerRepository.save(player);
    }

    public void delete(Long id) {
        playerRepository.deleteById(id);
    }
}
