package com.esports.league.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "players")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "player_type", discriminatorType = DiscriminatorType.STRING)
@DiscriminatorValue("GENERIC")
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "playerType",
    visible = true,
    defaultImpl = Player.class
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = FPSPlayer.class,          name = "FPS"),
    @JsonSubTypes.Type(value = MOBAPlayer.class,         name = "MOBA"),
    @JsonSubTypes.Type(value = EFootballPlayer.class,    name = "EFOOTBALL"),
    @JsonSubTypes.Type(value = RacingPlayer.class,       name = "RACING"),
    @JsonSubTypes.Type(value = BattleRoyalePlayer.class, name = "BATTLE_ROYALE"),
    @JsonSubTypes.Type(value = Player.class,             name = "GENERIC")
})
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String nickname;

    private int matchesPlayed;
    private int wins;
    private int losses;
    private LocalDate birthDate;
    private String nationality;
    private String city;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "player_achievements", joinColumns = @JoinColumn(name = "player_id"))
    @Column(name = "achievement")
    private List<String> achievements = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @JsonIgnoreProperties({"players", "coach", "tournaments", "hibernateLazyInitializer"})
    private Team team;

    public Player() {}

    public Player(String fullName, String nickname) {
        this.fullName = fullName;
        this.nickname = nickname;
    }

    public Player(String fullName, String nickname, int matchesPlayed, int wins, int losses) {
        this(fullName, nickname);
        this.matchesPlayed = matchesPlayed;
        this.wins = wins;
        this.losses = losses;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public int getMatchesPlayed() { return matchesPlayed; }
    public void setMatchesPlayed(int matchesPlayed) { this.matchesPlayed = matchesPlayed; }

    public int getWins() { return wins; }
    public void setWins(int wins) { this.wins = wins; }

    public int getLosses() { return losses; }
    public void setLosses(int losses) { this.losses = losses; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements != null ? achievements : new ArrayList<>(); }

    @Transient
    public Integer getAge() {
        if (birthDate == null) return null;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    public String getPlayerType() { return "GENERIC"; }
}
