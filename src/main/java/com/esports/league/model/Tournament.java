package com.esports.league.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tournaments")
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String game;

    private String status = "ACTIVE";

    private String format = "LEAGUE"; // LEAGUE, SINGLE_ELIMINATION, DOUBLE_ELIMINATION, GROUP_STAGE

    private String specificGame; // e.g., Valorant, League of Legends, FIFA, iRacing, PUBG

    private LocalDate startDate;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "tournament_teams",
        joinColumns = @JoinColumn(name = "tournament_id"),
        inverseJoinColumns = @JoinColumn(name = "team_id")
    )
    @JsonIgnoreProperties({"tournaments", "players", "coach", "hibernateLazyInitializer"})
    private List<Team> participatingTeams = new ArrayList<>();

    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"tournament", "hibernateLazyInitializer"})
    private List<Match> matches = new ArrayList<>();

    public Tournament() {}

    public Tournament(String name, String game) {
        this.name = name;
        this.game = game;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGame() { return game; }
    public void setGame(String game) { this.game = game; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public String getSpecificGame() { return specificGame; }
    public void setSpecificGame(String specificGame) { this.specificGame = specificGame; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public List<Team> getParticipatingTeams() { return participatingTeams; }
    public void setParticipatingTeams(List<Team> participatingTeams) { this.participatingTeams = participatingTeams; }

    public List<Match> getMatches() { return matches; }
    public void setMatches(List<Match> matches) { this.matches = matches; }
}
