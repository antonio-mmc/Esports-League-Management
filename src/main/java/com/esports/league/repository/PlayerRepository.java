package com.esports.league.repository;

import com.esports.league.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {
    Optional<Player> findByNickname(String nickname);
    List<Player> findByTeamId(Long teamId);
    boolean existsByNickname(String nickname);
}
