package com.esports.league.service;

import com.esports.league.model.Coach;
import com.esports.league.model.Team;
import com.esports.league.repository.CoachRepository;
import com.esports.league.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class CoachService {

    private final CoachRepository coachRepository;
    private final TeamRepository teamRepository;
    private final TransferLog transferLog;

    public CoachService(CoachRepository coachRepository, TeamRepository teamRepository,
                        TransferLog transferLog) {
        this.coachRepository = coachRepository;
        this.teamRepository = teamRepository;
        this.transferLog = transferLog;
    }

    public List<Coach> findAll() {
        return coachRepository.findAll();
    }

    public Coach findById(Long id) {
        return coachRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coach not found: " + id));
    }

    public Coach create(Coach coach) {
        if (coachRepository.existsByEmail(coach.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        // Save the coach first, then link the team through assignTeam so the existing
        // coach (if any) is displaced and both sides of the relationship stay consistent.
        Long teamId = coach.getTeam() != null ? coach.getTeam().getId() : null;
        coach.setTeam(null);
        Coach saved = coachRepository.save(coach);
        if (teamId != null) {
            return assignTeam(saved.getId(), teamId);
        }
        return saved;
    }

    public Coach update(Long id, Coach updated) {
        Coach coach = findById(id);
        if (!coach.getEmail().equals(updated.getEmail())
                && coachRepository.existsByEmail(updated.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }
        coach.setName(updated.getName());
        coach.setEmail(updated.getEmail());
        coach.setNationality(updated.getNationality());
        coach.setBirthDate(updated.getBirthDate());
        coach.setCity(updated.getCity());
        coach.setSpecialization(updated.getSpecialization());
        coach.setAchievements(updated.getAchievements());
        if (updated.getTeam() != null && updated.getTeam().getId() != null) {
            Team team = teamRepository.findById(updated.getTeam().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + updated.getTeam().getId()));
            moveToTeam(coach, team);
        } else if (updated.getTeam() == null) {
            releaseFromTeam(coach);
        }
        return coachRepository.save(coach);
    }

    public Coach assignTeam(Long coachId, Long teamId) {
        Coach coach = findById(coachId);
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found: " + teamId));
        moveToTeam(coach, team);
        return coachRepository.save(coach);
    }

    public Coach removeTeam(Long coachId) {
        Coach coach = findById(coachId);
        releaseFromTeam(coach);
        return coachRepository.save(coach);
    }

    public void delete(Long id) {
        coachRepository.deleteById(id);
    }

    /**
     * Moves a coach into a team, displacing that team's current coach (released to
     * free agency) and vacating the coach's previous team slot. Keeps both sides of
     * the one-to-one relationship consistent and logs every move.
     */
    private void moveToTeam(Coach coach, Team team) {
        if (team.getCoach() != null && !team.getCoach().getId().equals(coach.getId())) {
            transferLog.coachMoved(team.getCoach(), team.getName(), null);
            team.getCoach().setTeam(null);
            coachRepository.save(team.getCoach());
        }
        String fromTeam = coach.getTeam() != null ? coach.getTeam().getName() : null;
        if (coach.getTeam() != null && !coach.getTeam().getId().equals(team.getId())) {
            coach.getTeam().setCoach(null);
            teamRepository.save(coach.getTeam());
        }
        coach.setTeam(team);
        team.setCoach(coach);
        if (!Objects.equals(fromTeam, team.getName())) transferLog.coachMoved(coach, fromTeam, team.getName());
    }

    /** Releases a coach to free agency, clearing both sides of the relationship. */
    private void releaseFromTeam(Coach coach) {
        if (coach.getTeam() != null) {
            transferLog.coachMoved(coach, coach.getTeam().getName(), null);
            coach.getTeam().setCoach(null);
        }
        coach.setTeam(null);
    }
}
