package com.esports.league.repository;

import com.esports.league.model.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByGame(String game);
    List<Tournament> findByStatus(String status);
}
