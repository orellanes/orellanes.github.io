package com.nursetrack.enterprise.medical

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_medical_diagnoses")
class MedicalDiagnosis(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    @Column(nullable = false)
    var medicalNoteId: UUID,

    @Column(nullable = false, length = 30)
    var code: String,

    @Column(length = 500)
    var description: String? = null,

    @Column(nullable = false)
    var primaryDiagnosis: Boolean = false,

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()
)
