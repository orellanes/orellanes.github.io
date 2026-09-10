package com.nursetrack.enterprise.encounter

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_encounters")
class Encounter(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    @Column(nullable = false, length = 40)
    var encounterType: String,

    @Column(nullable = false, length = 24)
    var status: String = "OPEN",

    @Column(nullable = false)
    var startedAt: Instant = Instant.now(),

    var closedAt: Instant? = null,

    @Column(nullable = false)
    var createdByUserId: UUID,

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun touch() { updatedAt = Instant.now() }
}
