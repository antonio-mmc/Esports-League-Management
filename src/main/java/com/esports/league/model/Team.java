package com.esports.league.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private int wins;
    private int draws;
    private int losses;
    private int points;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("team")
    private List<Player> players = new ArrayList<>();

    @OneToOne(mappedBy = "team", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"team", "hibernateLazyInitializer"})
    private Coach coach;

    @ManyToMany(mappedBy = "participatingTeams", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"participatingTeams", "matches", "hibernateLazyInitializer"})
    private List<Tournament> tournaments = new ArrayList<>();

    public Team() {}

    public Team(String name) {
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

    public int getDraws() { return draws; }
    public void setDraws(int draws) { this.draws = draws; }

    public int getLosses() { return losses; }
    public void setLosses(int losses) { this.losses = losses; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public List<Player> getPlayers() { return players; }
    public void setPlayers(List<Player> players) { this.players = players; }

    public Coach getCoach() { return coach; }
    public void setCoach(Coach coach) { this.coach = coach; }

    public List<Tournament> getTournaments() { return tournaments; }
    public void setTournaments(List<Tournament> tournaments) { this.tournaments = tournaments; }

    public void registerWin() {
        wins++;
        recalcPoints();
    }

    public void registerDraw() {
        draws++;
        recalcPoints();
    }

    public void registerLoss() {
        losses++;
    }

    private void recalcPoints() {
        this.points = wins * 3 + draws;
    }
}
