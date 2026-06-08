package com.esports.league.service;

import com.esports.league.model.Coach;
import com.esports.league.model.Team;
import com.esports.league.repository.CoachRepository;
import com.esports.league.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CoachService {

    private final CoachRepository coachRepository;
    private final TeamRepository teamRepository;

    public CoachService(CoachRepository coachRepository, TeamRepository teamRepository) {
        this.coachRepository = coachRepository;
        this.teamRepository = teamRepository;
    }

    public List<Coach> findAll() {
        return coachRepository.findAll();
    }

    public Coach findById(Long id) {
        return coachRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coach not found: " + id));
    }

    public Coach create(Coach coach) {
        if (coachRepository.existsByEmail(coach.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        return coachRepository.save(coach);
    }

    public Coach update(Long id, Coach updated) {
        Coach coach = findById(id);
        coach.setName(updated.getName());
        coach.setEmail(updated.getEmail());
        return coachRepository.save(coach);
    }

    public Coach assignTeam(Long coachId, Long teamId) {
        Coach coach = findById(coachId);
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));
        coach.setTeam(team);
        team.setCoach(coach);
        return coachRepository.save(coach);
    }

    public void delete(Long id) {
        coachRepository.deleteById(id);
    }
}
