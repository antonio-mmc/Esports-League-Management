package com.esports.league.controller;

import com.esports.league.model.Player;
import com.esports.league.service.PlayerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public List<Player> getAll(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return playerService.findByType(type);
        }
        return playerService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Player> getById(@PathVariable Long id) {
        return ResponseEntity.ok(playerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Player> create(@RequestBody Player player) {
        return ResponseEntity.ok(playerService.create(player));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Player> update(@PathVariable Long id, @RequestBody Player player) {
        return ResponseEntity.ok(playerService.update(id, player));
    }

    @PutMapping("/{id}/team/{teamId}")
    public ResponseEntity<Player> assignTeam(@PathVariable Long id, @PathVariable Long teamId) {
        return ResponseEntity.ok(playerService.assignTeam(id, teamId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
