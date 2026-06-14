package com.esports.league.service;

import com.esports.league.model.Coach;
import com.esports.league.model.Player;
import com.esports.league.model.Transfer;
import com.esports.league.repository.TransferRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/** Records roster/coaching moves so they show up in the transfer history. */
@Component
public class TransferLog {

    private final TransferRepository transferRepository;

    public TransferLog(TransferRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    public void playerMoved(Player player, String fromTeam, String toTeam) {
        transferRepository.save(new Transfer("PLAYER", player.getId(), player.getNickname(),
            player.getPlayerType(), fromTeam, toTeam, LocalDate.now(), MarketValue.of(player)));
    }

    public void coachMoved(Coach coach, String fromTeam, String toTeam) {
        transferRepository.save(new Transfer("COACH", coach.getId(), coach.getName(),
            coach.getSpecialization(), fromTeam, toTeam, LocalDate.now(), MarketValue.of(coach)));
    }
}
