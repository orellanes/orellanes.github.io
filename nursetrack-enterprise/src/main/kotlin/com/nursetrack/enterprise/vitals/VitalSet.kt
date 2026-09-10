package com.nursetrack.enterprise.vitals

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_vital_sets")
class VitalSet(
    @Id
    @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    var encounterId: UUID? = null,

    @Column(nullable = false)
    var measuredAt: Instant = Instant.now(),

    var systolic: Int? = null,
    var diastolic: Int? = null,
    var heartRate: Int? = null,
    var respiratoryRate: Int? = null,
    var temperatureC: Double? = null,
    var spo2: Int? = null,
    var weightKg: Double? = null,
    var heightCm: Double? = null,
    var bmi: Double? = null,
    var painScore: Int? = null,

    @Column(nullable = false, length = 40)
    var source: String = "MANUAL",

    @Column(columnDefinition = "text")
    var notes: String? = null,

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
