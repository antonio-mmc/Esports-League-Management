package com.esports.league.controller;

import com.esports.league.model.Transfer;
import com.esports.league.repository.TransferRepository;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferRepository transferRepository;

    public TransferController(TransferRepository transferRepository) {
        this.transferRepository = transferRepository;
    }

    /** Full transfer history, most recent first. */
    @GetMapping
    public List<Map<String, Object>> getAll() {
        return transferRepository.findAllByOrderByDateDescIdDesc().stream()
            .map(TransferController::toRow)
            .toList();
    }

    /** Shared row shape, also used by the dashboard's recent-transfers widget. */
    public static Map<String, Object> toRow(Transfer tr) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id",         tr.getId());
        row.put("personType", tr.getPersonType());
        row.put("personId",   tr.getPersonId());
        row.put("personName", tr.getPersonName());
        row.put("personMeta", tr.getPersonMeta());
        row.put("fromTeam",   tr.getFromTeam());
        row.put("toTeam",     tr.getToTeam());
        row.put("date",       tr.getDate() != null ? tr.getDate().toString() : null);
        row.put("fee",        tr.getFee());
        return row;
    }
}
