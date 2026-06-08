package com.esports.league.service;

import com.esports.league.model.Match;
import com.esports.league.model.Team;
import com.esports.league.model.Tournament;
import com.esports.league.repository.MatchRepository;
import com.esports.league.repository.TeamRepository;
import com.esports.league.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final TournamentRepository tournamentRepository;

    public MatchService(MatchRepository matchRepository, TeamRepository teamRepository, TournamentRepository tournamentRepository) {
        this.matchRepository = matchRepository;
        this.teamRepository = teamRepository;
        this.tournamentRepository = tournamentRepository;
    }

    public List<Match> findAll() {
        return matchRepository.findAll();
    }

    public Match findById(Long id) {
        return matchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Match not found: " + id));
    }

    public Match schedule(Long teamAId, Long teamBId, Long tournamentId, String date) {
        Team teamA = teamRepository.findById(teamAId)
            .orElseThrow(() -> new RuntimeException("Team A not found."));
        Team teamB = teamRepository.findById(teamBId)
            .orElseThrow(() -> new RuntimeException("Team B not found."));
        Tournament tournament = tournamentRepository.findById(tournamentId)
            .orElseThrow(() -> new RuntimeException("Tournament not found."));

        Match match = new Match(teamA, teamB, LocalDate.parse(date), tournament);
        return matchRepository.save(match);
    }

    public Match recordResult(Long matchId, int scoreA, int scoreB) {
        Match match = findById(matchId);
        match.recordResult(scoreA, scoreB);
        teamRepository.save(match.getTeamA());
        teamRepository.save(match.getTeamB());
        return matchRepository.save(match);
    }

    public void delete(Long id) {
        matchRepository.deleteById(id);
    }
}
