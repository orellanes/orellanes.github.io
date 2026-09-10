package com.nursetrack.enterprise.medical

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_medical_procedures")
class MedicalProcedure(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    @Column(nullable = false)
    var medicalNoteId: UUID,

    @Column(nullable = false, length = 20)
    var codeSystem: String = "CPT",

    @Column(nullable = false, length = 30)
    var code: String,

    @Column(length = 500)
    var label: String? = null,

    @Column(nullable = false)
    var units: Double = 1.0,

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now()
)
