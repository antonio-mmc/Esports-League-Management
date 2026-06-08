package com.esports.league.controller;

import com.esports.league.model.Tournament;
import com.esports.league.service.TournamentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
public class TournamentController {

    private final TournamentService tournamentService;

    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @GetMapping
    public List<Tournament> getAll() {
        return tournamentService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tournament> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.findById(id));
    }

    @GetMapping("/{id}/standings")
    public ResponseEntity<List<Map<String, Object>>> getStandings(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getStandings(id));
    }

    @PostMapping
    public ResponseEntity<Tournament> create(@RequestBody Tournament tournament) {
        return ResponseEntity.ok(tournamentService.create(tournament));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tournament> update(@PathVariable Long id, @RequestBody Tournament tournament) {
        return ResponseEntity.ok(tournamentService.update(id, tournament));
    }

    @PostMapping("/{id}/teams/{teamId}")
    public ResponseEntity<Tournament> addTeam(@PathVariable Long id, @PathVariable Long teamId) {
        return ResponseEntity.ok(tournamentService.addTeam(id, teamId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tournamentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
