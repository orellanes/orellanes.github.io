package com.nursetrack.enterprise.patient

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "nt_patients")
class Patient(
    @Id
    @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false, length = 80)
    var mrn: String,

    @Column(nullable = false, length = 120)
    var firstName: String,

    @Column(nullable = false, length = 120)
    var lastName: String,

    var dateOfBirth: LocalDate? = null,

    @Column(length = 40)
    var phone: String? = null,

    @Column(length = 160)
    var email: String? = null,

    @Column(nullable = false, length = 24)
    var status: String = "ACTIVE",

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun touch() { updatedAt = Instant.now() }
}
