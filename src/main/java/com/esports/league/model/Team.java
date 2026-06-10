package com.esports.league.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String nationality;
    private String game;
    private Integer foundedYear;
    private String city;

    private int wins;
    private int losses;
    private int points;
    @Column(columnDefinition = "integer default 0")
    private int trophies;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "team_coach_history", joinColumns = @JoinColumn(name = "team_id"))
    @Column(name = "coach_entry")
    private List<String> coachHistory = new ArrayList<>();

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

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getGame() { return game; }
    public void setGame(String game) { this.game = game; }

    public int getTrophies() { return trophies; }
    public void setTrophies(int trophies) { this.trophies = trophies; }

    public Integer getFoundedYear() { return foundedYear; }
    public void setFoundedYear(Integer foundedYear) { this.foundedYear = foundedYear; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getCoachHistory() { return coachHistory; }
    public void setCoachHistory(List<String> coachHistory) { this.coachHistory = coachHistory; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

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

    public void registerLoss() {
        losses++;
    }

    private void recalcPoints() {
        this.points = wins * 3;
    }
}
