package com.esports.league.repository;

import com.esports.league.model.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findAllByOrderByDateDescIdDesc();
}
