package com.esports.league.service;

import com.esports.league.model.Match;
import com.esports.league.model.Player;
import com.esports.league.model.Team;
import com.esports.league.model.Tournament;
import com.esports.league.repository.MatchRepository;
import com.esports.league.repository.PlayerRepository;
import com.esports.league.repository.TeamRepository;
import com.esports.league.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;
    private final PlayerRepository playerRepository;

    public MatchService(MatchRepository matchRepository, TeamRepository teamRepository,
                        TournamentRepository tournamentRepository, PlayerRepository playerRepository) {
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.tournamentRepository = tournamentRepository;
        this.playerRepository = playerRepository;
    }

    public List<Match> findAll() {
        return matchRepository.findAll();
    }

    public Match findById(Long id) {
        return matchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));
    }

    public Match schedule(Long teamAId, Long teamBId, Long tournamentId, String date) {
        if (teamAId.equals(teamBId)) {
            throw new IllegalArgumentException("A match needs two different teams.");
        }
        LocalDate matchDate;
        try {
            matchDate = LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format (expected yyyy-MM-dd): " + date);
        }
        Team teamA = teamRepository.findById(teamAId)
            .orElseThrow(() -> new ResourceNotFoundException("Team A not found."));
        Team teamB = teamRepository.findById(teamBId)
            .orElseThrow(() -> new ResourceNotFoundException("Team B not found."));
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found."));

        requireParticipant(tournament, teamA);
        requireParticipant(tournament, teamB);

        Match match = new Match(teamA, teamB, matchDate, tournament);
        return matchRepository.save(match);
    }

    /** A match can only be scheduled between teams that take part in the tournament. */
    private void requireParticipant(Tournament tournament, Team team) {
        boolean participates = tournament.getParticipatingTeams().stream()
            .anyMatch(t -> t.getId().equals(team.getId()));
        if (!participates) {
            throw new IllegalArgumentException(
                team.getName() + " does not take part in " + tournament.getName() + ".");
        }
    }

    public Match recordResult(Long matchId, int scoreA, int scoreB) {
        Match match = findById(matchId);
        // Recording for the first time applies points; editing an existing result
        // reverts the old outcome and applies the new one so totals stay consistent.
        if (match.isResultRecorded()) {
            applyPlayerStats(match, false); // undo the previous outcome on the rosters first
            match.updateResult(scoreA, scoreB);
        } else {
            match.recordResult(scoreA, scoreB);
        }
        applyPlayerStats(match, true); // apply the new outcome to the rosters
        teamRepository.save(match.getTeamA());
        teamRepository.save(match.getTeamB());
        return matchRepository.save(match);
    }

    public void delete(Long id) {
        Match match = findById(id);
        // Deleting a played match must undo the points/wins/losses it awarded.
        if (match.isResultRecorded()) {
            match.revertResultEffect();
            applyPlayerStats(match, false);
            teamRepository.save(match.getTeamA());
            teamRepository.save(match.getTeamB());
        }
        matchRepository.delete(match);
    }

    /**
     * Mirrors a match outcome onto both teams' rosters: {@code apply} adds a played
     * match plus a win/loss to every player, {@code !apply} reverts it. Uses the
     * scores currently stored on the match to decide which side won.
     */
    private void applyPlayerStats(Match match, boolean apply) {
        Team winner = match.getTeamAScore() > match.getTeamBScore() ? match.getTeamA() : match.getTeamB();
        Team loser  = winner == match.getTeamA() ? match.getTeamB() : match.getTeamA();
        adjustRoster(winner, apply, true);
        adjustRoster(loser,  apply, false);
    }

    private void adjustRoster(Team team, boolean apply, boolean won) {
        int delta = apply ? 1 : -1;
        List<Player> roster = playerRepository.findByTeamId(team.getId());
        for (Player p : roster) {
            p.setMatchesPlayed(Math.max(0, p.getMatchesPlayed() + delta));
            if (won) p.setWins(Math.max(0, p.getWins() + delta));
            else     p.setLosses(Math.max(0, p.getLosses() + delta));
        }
        playerRepository.saveAll(roster);
    }
}
