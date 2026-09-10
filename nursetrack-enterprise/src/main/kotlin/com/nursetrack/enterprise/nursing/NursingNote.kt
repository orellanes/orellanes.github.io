package com.nursetrack.enterprise.nursing

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_nursing_notes")
class NursingNote(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    var encounterId: UUID? = null,

    @Column(nullable = false, length = 40)
    var visitType: String,

    @Column(length = 20)
    var bloodPressure: String? = null,

    var pulse: Int? = null,
    var respirations: Int? = null,
    var temperatureF: Double? = null,
    var spo2: Int? = null,
    var weightLb: Double? = null,
    var heightIn: Double? = null,
    var bmi: Double? = null,

    @Column(columnDefinition = "text")
    var findingsJson: String? = null,

    @Column(columnDefinition = "text", nullable = false)
    var narrative: String,

    @Column(columnDefinition = "text")
    var educationJson: String? = null,

    @Column(columnDefinition = "text")
    var interventionsJson: String? = null,

    @Column(columnDefinition = "text")
    var plan: String? = null,

    @Column(columnDefinition = "text")
    var dischargeNote: String? = null,

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
