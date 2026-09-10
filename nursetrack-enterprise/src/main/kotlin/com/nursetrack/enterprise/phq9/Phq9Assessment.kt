package com.nursetrack.enterprise.phq9

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "nt_phq9_assessments")
class Phq9Assessment(
    @Id
    @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    var encounterId: UUID? = null,

    @Column(nullable = false)
    var screeningDate: LocalDate,

    @Column(nullable = false) var q1: Int,
    @Column(nullable = false) var q2: Int,
    @Column(nullable = false) var q3: Int,
    @Column(nullable = false) var q4: Int,
    @Column(nullable = false) var q5: Int,
    @Column(nullable = false) var q6: Int,
    @Column(nullable = false) var q7: Int,
    @Column(nullable = false) var q8: Int,
    @Column(nullable = false) var q9: Int,

    @Column(nullable = false)
    var totalScore: Int,

    @Column(nullable = false, length = 40)
    var severity: String,

    @Column(nullable = false)
    var suicidalIdeation: Boolean = false,

    @Column(nullable = false)
    var followUpRequired: Boolean = false,

    @Column(columnDefinition = "text")
    var actionTaken: String? = null,

    @Column(columnDefinition = "text")
    var notes: String? = null,

    @Column(nullable = false, length = 20)
    var status: String = "DRAFT",

    @Column(nullable = false)
    var createdByUserId: UUID,

    var signedByUserId: UUID? = null,
    var signedAt: Instant? = null,

    @Column(length = 64)
    var signatureHash: String? = null,

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun touch() { updatedAt = Instant.now() }
}
