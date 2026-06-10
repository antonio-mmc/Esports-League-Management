package com.esports.league.service;

import com.esports.league.model.Match;
import com.esports.league.model.Player;
import com.esports.league.model.Team;
import com.esports.league.repository.MatchRepository;
import com.esports.league.repository.PlayerRepository;
import com.esports.league.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;

    public TeamService(TeamRepository teamRepository,
                       PlayerRepository playerRepository,
                       MatchRepository matchRepository) {
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.matchRepository = matchRepository;
    }

    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    public Team findById(Long id) {
        return teamRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Team not found: " + id));
    }

    public List<Player> findPlayers(Long teamId) {
        findById(teamId);
        return playerRepository.findByTeamId(teamId);
    }

    public List<Match> findMatches(Long teamId) {
        findById(teamId);
        return matchRepository.findByTeamAIdOrTeamBId(teamId, teamId);
    }

    public Team create(Team team) {
        if (teamRepository.existsByName(team.getName())) {
            throw new IllegalArgumentException("Team name already exists.");
        }
        return teamRepository.save(team);
    }

    public Team update(Long id, Team updated) {
        Team team = findById(id);
        team.setName(updated.getName());
        team.setNationality(updated.getNationality());
        team.setGame(updated.getGame());
        team.setWins(updated.getWins());
        team.setLosses(updated.getLosses());
        team.setPoints(updated.getPoints());
        team.setTrophies(updated.getTrophies());
        team.setFoundedYear(updated.getFoundedYear());
        team.setCity(updated.getCity());
        return teamRepository.save(team);
    }

    public void delete(Long id) {
        teamRepository.deleteById(id);
    }
}
