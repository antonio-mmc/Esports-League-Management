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
        Long teamAId = requiredId(body, "teamAId");
        Long teamBId = requiredId(body, "teamBId");
        Long tournamentId = requiredId(body, "tournamentId");
        String date = required(body, "date").toString();
        return ResponseEntity.ok(matchService.schedule(teamAId, teamBId, tournamentId, date));
    }

    @PutMapping("/{id}/result")
    public ResponseEntity<Match> recordResult(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer scoreA = body.get("scoreA");
        Integer scoreB = body.get("scoreB");
        if (scoreA == null || scoreB == null) {
            throw new IllegalArgumentException("Both scoreA and scoreB are required.");
        }
        return ResponseEntity.ok(matchService.recordResult(id, scoreA, scoreB));
    }

    private static Object required(Map<String, Object> body, String field) {
        Object value = body.get(field);
        if (value == null) throw new IllegalArgumentException("Missing required field: " + field);
        return value;
    }

    private static Long requiredId(Map<String, Object> body, String field) {
        try {
            return Long.valueOf(required(body, field).toString());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Field " + field + " must be a numeric id.");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        matchService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
