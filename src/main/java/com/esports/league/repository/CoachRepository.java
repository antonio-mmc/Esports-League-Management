package com.esports.league.repository;

import com.esports.league.model.Coach;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CoachRepository extends JpaRepository<Coach, Long> {
    Optional<Coach> findByEmail(String email);
    boolean existsByEmail(String email);
}
