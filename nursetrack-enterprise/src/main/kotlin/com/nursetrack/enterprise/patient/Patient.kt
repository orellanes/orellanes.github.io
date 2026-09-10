package com.nursetrack.enterprise.patient

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(
    name = "nt_patients",
    uniqueConstraints = [UniqueConstraint(name = "uq_nt_patients_company_mrn", columnNames = ["company_id", "mrn"])]
)
class Patient(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false, length = 80)
    var mrn: String,

    @Column(nullable = false, length = 120)
    var firstName: String,

    @Column(length = 120)
    var middleName: String? = null,

    @Column(nullable = false, length = 120)
    var lastName: String,

    var dateOfBirth: LocalDate? = null,

    @Column(length = 120)
    var birthPlace: String? = null,

    @Column(length = 30)
    var sex: String? = null,

    @Column(length = 40)
    var maritalStatus: String? = null,

    var childrenCount: Int? = null,

    @Column(length = 40)
    var phone: String? = null,

    @Column(length = 160)
    var email: String? = null,

    @Column(length = 300)
    var residentialAddress: String? = null,

    @Column(length = 300)
    var postalAddress: String? = null,

    @Column(length = 20)
    var preferredLanguage: String? = "es",

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
