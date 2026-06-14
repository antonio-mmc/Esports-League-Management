package com.esports.league.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * An immutable log entry recording a player's or coach's move between teams.
 * Team and person names are denormalised (stored as text) so the history
 * survives even if the referenced team, player or coach is later deleted.
 * A null {@code fromTeam} means the person was a free agent; a null
 * {@code toTeam} means they were released to free agency.
 */
@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String personType; // "PLAYER" | "COACH"
    private Long personId;
    private String personName;
    private String personMeta; // playerType (player) or specialization (coach), for display
    private String fromTeam;
    private String toTeam;
    private LocalDate date;
    private Long fee; // transfer fee in euros, captured at the time of the move

    public Transfer() {}

    public Transfer(String personType, Long personId, String personName, String personMeta,
                    String fromTeam, String toTeam, LocalDate date, Long fee) {
        this.personType = personType;
        this.personId = personId;
        this.personName = personName;
        this.personMeta = personMeta;
        this.fromTeam = fromTeam;
        this.toTeam = toTeam;
        this.date = date;
        this.fee = fee;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPersonType() { return personType; }
    public void setPersonType(String personType) { this.personType = personType; }

    public Long getPersonId() { return personId; }
    public void setPersonId(Long personId) { this.personId = personId; }

    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }

    public String getPersonMeta() { return personMeta; }
    public void setPersonMeta(String personMeta) { this.personMeta = personMeta; }

    public String getFromTeam() { return fromTeam; }
    public void setFromTeam(String fromTeam) { this.fromTeam = fromTeam; }

    public String getToTeam() { return toTeam; }
    public void setToTeam(String toTeam) { this.toTeam = toTeam; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getFee() { return fee; }
    public void setFee(Long fee) { this.fee = fee; }
}
