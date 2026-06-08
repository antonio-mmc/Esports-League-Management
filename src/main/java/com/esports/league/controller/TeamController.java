package com.esports.league.controller;

import com.esports.league.model.Match;
import com.esports.league.model.Player;
import com.esports.league.model.Team;
import com.esports.league.service.TeamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public List<Team> getAll() {
        return teamService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.findById(id));
    }

    @GetMapping("/{id}/players")
    public ResponseEntity<List<Player>> getPlayers(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.findPlayers(id));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<Match>> getMatches(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.findMatches(id));
    }

    @PostMapping
    public ResponseEntity<Team> create(@RequestBody Team team) {
        return ResponseEntity.ok(teamService.create(team));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> update(@PathVariable Long id, @RequestBody Team team) {
        return ResponseEntity.ok(teamService.update(id, team));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        teamService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
