package com.esports.league.service;

import com.esports.league.model.Coach;
import com.esports.league.model.Match;
import com.esports.league.model.Player;
import com.esports.league.model.Team;
import com.esports.league.model.Tournament;
import com.esports.league.repository.CoachRepository;
import com.esports.league.repository.MatchRepository;
import com.esports.league.repository.PlayerRepository;
import com.esports.league.repository.TeamRepository;
import com.esports.league.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final MatchRepository matchRepository;
    private final CoachRepository coachRepository;
    private final TournamentRepository tournamentRepository;
    private final TransferLog transferLog;

    public TeamService(TeamRepository teamRepository,
                       PlayerRepository playerRepository,
                       MatchRepository matchRepository,
                       CoachRepository coachRepository,
                       TournamentRepository tournamentRepository,
                       TransferLog transferLog) {
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.matchRepository = matchRepository;
        this.coachRepository = coachRepository;
        this.tournamentRepository = tournamentRepository;
        this.transferLog = transferLog;
    }

    public List<Team> findAll() {
        return teamRepository.findAll();
    }

    public Team findById(Long id) {
        return teamRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + id));
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
        GameCatalog.validateTitle(team.getGame(), team.getSpecificGame());
        team.syncPoints(); // points are derived from wins, never sent by the client
        return teamRepository.save(team);
    }

    public Team update(Long id, Team updated) {
        Team team = findById(id);
        GameCatalog.validateTitle(updated.getGame(), updated.getSpecificGame());
        team.setName(updated.getName());
        team.setNationality(updated.getNationality());
        team.setGame(updated.getGame());
        team.setSpecificGame(updated.getSpecificGame());
        team.setWins(updated.getWins());
        team.setLosses(updated.getLosses());
        team.setTrophies(updated.getTrophies());
        team.setFoundedYear(updated.getFoundedYear());
        team.setCity(updated.getCity());
        team.syncPoints(); // keep points = wins * 3 instead of trusting the (absent) payload value
        return teamRepository.save(team);
    }

    public void delete(Long id) {
        Team team = findById(id);

        // Detach the related rows that would otherwise violate foreign keys, and keep
        // standings consistent by reverting the effect of this team's recorded matches.
        for (Match m : matchRepository.findByTeamAIdOrTeamBId(id, id)) {
            if (m.isResultRecorded()) {
                m.revertResultEffect();           // corrects the opponent's W/L/points
                teamRepository.save(m.getTeamA());
                teamRepository.save(m.getTeamB());
            }
            matchRepository.delete(m);
        }

        // Remove the team from every tournament it takes part in (owning side is the tournament).
        for (Tournament t : List.copyOf(team.getTournaments())) {
            t.getParticipatingTeams().removeIf(pt -> pt.getId().equals(id));
            tournamentRepository.save(t);
        }

        // Release players to free agency instead of deleting them with the team,
        // mirroring how the coach is handled. Each release is logged as a transfer.
        for (Player p : playerRepository.findByTeamId(id)) {
            transferLog.playerMoved(p, team.getName(), null);
            p.setTeam(null);
            playerRepository.save(p);
        }
        team.getPlayers().clear();

        // Free its coach, if any.
        Coach coach = team.getCoach();
        if (coach != null) {
            transferLog.coachMoved(coach, team.getName(), null);
            coach.setTeam(null);
            coachRepository.save(coach);
            team.setCoach(null);
        }

        teamRepository.delete(team);
    }
}
