package com.esports.league.repository;

import com.esports.league.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTournamentId(Long tournamentId);
    List<Match> findByResultRecorded(boolean resultRecorded);
    List<Match> findByTeamAIdOrTeamBId(Long teamAId, Long teamBId);
}
