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
        List<Tournament> all = tournamentRepository.findAll();
        all.forEach(this::refreshStatus); // keep date-derived statuses current
        return all;
    }

    public Tournament findById(Long id) {
        Tournament t = tournamentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tournament not found: " + id));
        refreshStatus(t);
        return t;
    }

    /**
     * Recomputes a tournament's status from its dates and, when that crosses the
     * COMPLETED boundary, awards or revokes the champion's trophy accordingly.
     */
    private void refreshStatus(Tournament t) {
        String derived = GameCatalog.deriveStatus(t.getStartDate(), t.getEndDate());
        if (derived.equals(t.getStatus())) return;
        boolean wasCompleted = isCompleted(t.getStatus());
        t.setStatus(derived);
        if (!wasCompleted && isCompleted(derived))      awardChampion(t);
        else if (wasCompleted && !isCompleted(derived)) revokeChampion(t);
        tournamentRepository.save(t);
    }

    /** Title/date/format-size checks shared by create and update. */
    private void validate(Tournament t) {
        GameCatalog.validateTitle(t.getGame(), t.getSpecificGame());
        if (t.getStartDate() != null && t.getEndDate() != null
                && t.getEndDate().isBefore(t.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before the start date.");
        }
        int teamCount = t.getParticipatingTeams() == null ? 0 : t.getParticipatingTeams().size();
        int max = GameCatalog.maxTeams(t.getFormat());
        if (teamCount > max) {
            throw new IllegalArgumentException(
                "This format supports at most " + max + " teams (" + teamCount + " selected).");
        }
    }

    public List<Map<String, Object>> getStandings(Long tournamentId) {
        return computeStandings(findById(tournamentId));
    }

    /**
     * Standings sorted by points, then wins, then score difference (round wins minus
     * round losses across the tournament's recorded matches) as a real tiebreaker.
     */
    private List<Map<String, Object>> computeStandings(Tournament tournament) {
        List<Match> played = matchRepository.findByTournamentId(tournament.getId()).stream()
            .filter(Match::isResultRecorded)
            .toList();

        return tournament.getParticipatingTeams().stream()
            .map(team -> {
                int w = 0, l = 0, diff = 0;
                for (Match m : played) {
                    boolean isA = m.getTeamA().getId().equals(team.getId());
                    boolean isB = m.getTeamB().getId().equals(team.getId());
                    if (!isA && !isB) continue;
                    int myScore  = isA ? m.getTeamAScore() : m.getTeamBScore();
                    int oppScore = isA ? m.getTeamBScore() : m.getTeamAScore();
                    diff += myScore - oppScore;
                    if (myScore > oppScore) w++;
                    else                    l++; // no draws: every recorded match is a win or a loss
                }
                int pts = w * 3; // consistent with Team.points (wins * 3)
                int played2 = w + l;
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("team",   team);
                row.put("played", played2);
                row.put("wins",   w);
                row.put("losses", l);
                row.put("points", pts);
                row.put("diff",   diff);
                return row;
            })
            .sorted(Comparator.<Map<String, Object>, Integer>comparing(
                m -> -(Integer) m.get("points"))
                .thenComparing(m -> -(Integer) m.get("wins"))
                .thenComparing(m -> -(Integer) m.get("diff")))
            .toList();
    }

    public Tournament create(Tournament tournament) {
        validate(tournament);
        // Replace client-supplied team stubs ({id}) with managed entities, as update does.
        if (tournament.getParticipatingTeams() != null && !tournament.getParticipatingTeams().isEmpty()) {
            List<Team> resolved = new ArrayList<>();
            tournament.getParticipatingTeams().forEach(t -> {
                if (t.getId() != null) teamRepository.findById(t.getId()).ifPresent(resolved::add);
            });
            tournament.setParticipatingTeams(resolved);
        }
        // Status is derived from the dates, never trusted from the client.
        tournament.setStatus(GameCatalog.deriveStatus(tournament.getStartDate(), tournament.getEndDate()));
        tournament.setChampionTeamId(null);
        tournament.setChampionTeamName(null);
        Tournament saved = tournamentRepository.save(tournament);
        if (isCompleted(saved.getStatus())) awardChampion(saved);
        return saved;
    }

    public Tournament update(Long id, Tournament updated) {
        validate(updated);
        Tournament tournament = findById(id);
        boolean wasCompleted = isCompleted(tournament.getStatus());

        tournament.setName(updated.getName());
        tournament.setGame(updated.getGame());
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

        // Re-derive status from the (possibly changed) dates and reconcile the trophy.
        String derived = GameCatalog.deriveStatus(tournament.getStartDate(), tournament.getEndDate());
        tournament.setStatus(derived);
        boolean nowCompleted = isCompleted(derived);
        if (!wasCompleted && nowCompleted)      awardChampion(tournament);
        else if (wasCompleted && !nowCompleted) revokeChampion(tournament);

        return tournamentRepository.save(tournament);
    }

    private static boolean isCompleted(String status) {
        return "COMPLETED".equals(status);
    }

    /** Crowns the standings winner and awards them a trophy (idempotent per tournament). */
    private void awardChampion(Tournament tournament) {
        if (tournament.getChampionTeamId() != null) return; // already crowned
        List<Map<String, Object>> standings = computeStandings(tournament);
        if (standings.isEmpty()) return;
        Team winner = (Team) standings.get(0).get("team");
        winner.setTrophies(winner.getTrophies() + 1);
        teamRepository.save(winner);
        tournament.setChampionTeamId(winner.getId());
        tournament.setChampionTeamName(winner.getName());
    }

    /** Reverts a previously awarded trophy when a tournament leaves the COMPLETED state. */
    private void revokeChampion(Tournament tournament) {
        if (tournament.getChampionTeamId() == null) return;
        teamRepository.findById(tournament.getChampionTeamId()).ifPresent(team -> {
            if (team.getTrophies() > 0) team.setTrophies(team.getTrophies() - 1);
            teamRepository.save(team);
        });
        tournament.setChampionTeamId(null);
        tournament.setChampionTeamName(null);
    }

    public Tournament addTeam(Long tournamentId, Long teamId) {
        Tournament tournament = findById(tournamentId);
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        if (!tournament.getParticipatingTeams().contains(team)) {
            tournament.getParticipatingTeams().add(team);
        }
        return tournamentRepository.save(tournament);
    }

    public void delete(Long id) {
        Tournament tournament = findById(id);
        // A completed tournament's trophy is given back when it's deleted.
        revokeChampion(tournament);
        // Reverting recorded results keeps team standings consistent; the matches
        // themselves are removed via CascadeType.ALL when the tournament is deleted.
        for (Match m : matchRepository.findByTournamentId(id)) {
            if (m.isResultRecorded()) {
                m.revertResultEffect();
                teamRepository.save(m.getTeamA());
                teamRepository.save(m.getTeamB());
            }
        }
        tournamentRepository.delete(tournament);
    }
}
