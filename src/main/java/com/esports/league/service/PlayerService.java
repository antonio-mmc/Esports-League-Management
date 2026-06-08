package com.esports.league.service;

import com.esports.league.model.*;
import com.esports.league.repository.PlayerRepository;
import com.esports.league.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    public PlayerService(PlayerRepository playerRepository, TeamRepository teamRepository) {
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
    }

    public List<Player> findAll() {
        return playerRepository.findAll();
    }

    public List<Player> findByType(String type) {
        return playerRepository.findAll().stream()
            .filter(p -> switch (type.toUpperCase()) {
                case "FPS"       -> p instanceof FPSPlayer;
                case "MOBA"      -> p instanceof MOBAPlayer;
                case "EFOOTBALL" -> p instanceof EFootballPlayer;
                case "GENERIC"   -> !(p instanceof FPSPlayer) && !(p instanceof MOBAPlayer) && !(p instanceof EFootballPlayer);
                default          -> true;
            })
            .toList();
    }

    public Player findById(Long id) {
        return playerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Player not found: " + id));
    }

    public Player create(Player player) {
        if (playerRepository.existsByNickname(player.getNickname())) {
            throw new IllegalArgumentException("Nickname already in use.");
        }
        return playerRepository.save(player);
    }

    public Player update(Long id, Player updated) {
        Player player = findById(id);

        player.setFullName(updated.getFullName());
        player.setNickname(updated.getNickname());
        player.setMatchesPlayed(updated.getMatchesPlayed());
        player.setWins(updated.getWins());
        player.setLosses(updated.getLosses());
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            player.setPassword(updated.getPassword());
        }

        if (player instanceof FPSPlayer fps && updated instanceof FPSPlayer upd) {
            fps.setAccuracy(upd.getAccuracy());
            fps.setHeadshots(upd.getHeadshots());
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
        }

        return playerRepository.save(player);
    }

    public Player assignTeam(Long playerId, Long teamId) {
        Player player = findById(playerId);
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));
        player.setTeam(team);
        return playerRepository.save(player);
    }

    public void delete(Long id) {
        playerRepository.deleteById(id);
    }
}
