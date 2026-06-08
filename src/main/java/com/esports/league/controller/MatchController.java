package com.esports.league.controller;

import com.esports.league.model.Match;
import com.esports.league.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public List<Match> getAll() {
        return matchService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getById(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Match> schedule(@RequestBody Map<String, Object> body) {
        Long teamAId = Long.valueOf(body.get("teamAId").toString());
        Long teamBId = Long.valueOf(body.get("teamBId").toString());
        Long tournamentId = Long.valueOf(body.get("tournamentId").toString());
        String date = body.get("date").toString();
        return ResponseEntity.ok(matchService.schedule(teamAId, teamBId, tournamentId, date));
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<Match> recordResult(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(matchService.recordResult(id, body.get("scoreA"), body.get("scoreB")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        matchService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
