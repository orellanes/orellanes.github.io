package com.nursetrack.enterprise.medical

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_medical_notes")
class MedicalNote(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    var encounterId: UUID? = null,

    @Column(nullable = false)
    var providerUserId: UUID,

    @Column(nullable = false, length = 180)
    var providerName: String,

    @Column(columnDefinition = "text")
    var chiefComplaint: String? = null,

    @Column(columnDefinition = "text")
    var hpi: String? = null,

    @Column(columnDefinition = "text")
    var assessment: String? = null,

    @Column(columnDefinition = "text")
    var plan: String? = null,

    @Column(columnDefinition = "text")
    var notes: String? = null,

    @Column(nullable = false, length = 20)
    var status: String = "DRAFT",

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
