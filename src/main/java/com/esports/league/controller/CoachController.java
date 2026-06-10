package com.esports.league.controller;

import com.esports.league.model.Coach;
import com.esports.league.service.CoachService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/coaches")
public class CoachController {

    private final CoachService coachService;

    public CoachController(CoachService coachService) {
        this.coachService = coachService;
    }

    @GetMapping
    public List<Coach> getAll() {
        return coachService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coach> getById(@PathVariable Long id) {
        return ResponseEntity.ok(coachService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Coach> create(@RequestBody Coach coach) {
        return ResponseEntity.ok(coachService.create(coach));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coach> update(@PathVariable Long id, @RequestBody Coach coach) {
        return ResponseEntity.ok(coachService.update(id, coach));
    }

    @PutMapping("/{id}/team/{teamId}")
    public ResponseEntity<Coach> assignTeam(@PathVariable Long id, @PathVariable Long teamId) {
        return ResponseEntity.ok(coachService.assignTeam(id, teamId));
    }

    @DeleteMapping("/{id}/team")
    public ResponseEntity<Coach> removeTeam(@PathVariable Long id) {
        return ResponseEntity.ok(coachService.removeTeam(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        coachService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
