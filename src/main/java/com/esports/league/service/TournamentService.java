package com.esports.league.service;

import com.esports.league.model.Match;
import com.esports.league.model.Team;
import com.esports.league.model.Tournament;
import com.esports.league.repository.MatchRepository;
import com.esports.league.repository.TeamRepository;
import com.esports.league.repository.TournamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;

    public TournamentService(TournamentRepository tournamentRepository,
                             TeamRepository teamRepository,
                             MatchRepository matchRepository) {
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
        this.matchRepository = matchRepository;
    }

    public List<Tournament> findAll() {
        return tournamentRepository.findAll();
    }

    public Tournament findById(Long id) {
        return tournamentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tournament not found: " + id));
    }

    public List<Map<String, Object>> getStandings(Long tournamentId) {
        Tournament tournament = findById(tournamentId);
        List<Match> played = matchRepository.findByTournamentId(tournamentId).stream()
            .filter(Match::isResultRecorded)
            .toList();

        return tournament.getParticipatingTeams().stream()
            .map(team -> {
                int w = 0, l = 0;
                for (Match m : played) {
                    boolean isA = m.getTeamA().getId().equals(team.getId());
                    boolean isB = m.getTeamB().getId().equals(team.getId());
                    if (!isA && !isB) continue;
                    int myScore  = isA ? m.getTeamAScore() : m.getTeamBScore();
                    int oppScore = isA ? m.getTeamBScore() : m.getTeamAScore();
                    if (myScore > oppScore) w++;
                    else                   l++;
                }
                int pts = w * 3;
                int played2 = w + l;
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("team",   team);
                row.put("played", played2);
                row.put("wins",   w);
                row.put("losses", l);
                row.put("points", pts);
                return row;
            })
            .sorted(Comparator.<Map<String, Object>, Integer>comparing(
                m -> -(Integer) m.get("points"))
                .thenComparing(m -> -(Integer) m.get("wins")))
            .toList();
    }

    public Tournament create(Tournament tournament) {
        return tournamentRepository.save(tournament);
    }

    public Tournament update(Long id, Tournament updated) {
        Tournament tournament = findById(id);
        tournament.setName(updated.getName());
        tournament.setGame(updated.getGame());
        tournament.setStatus(updated.getStatus());
        if (updated.getFormat() != null)       tournament.setFormat(updated.getFormat());
        if (updated.getSpecificGame() != null) tournament.setSpecificGame(updated.getSpecificGame());
        tournament.setStartDate(updated.getStartDate());
        tournament.setEndDate(updated.getEndDate());
        tournament.setPrizeFirst(updated.getPrizeFirst());
        tournament.setPrizeSecond(updated.getPrizeSecond());
        tournament.setPrizeThird(updated.getPrizeThird());
        if (updated.getParticipatingTeams() != null) {
            tournament.getParticipatingTeams().clear();
            updated.getParticipatingTeams().forEach(t ->
                teamRepository.findById(t.getId()).ifPresent(tournament.getParticipatingTeams()::add)
            );
        }
        return tournamentRepository.save(tournament);
    }

    public Tournament addTeam(Long tournamentId, Long teamId) {
        Tournament tournament = findById(tournamentId);
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));
        if (!tournament.getParticipatingTeams().contains(team)) {
            tournament.getParticipatingTeams().add(team);
        }
        return tournamentRepository.save(tournament);
    }

    public void delete(Long id) {
        tournamentRepository.deleteById(id);
    }
}
