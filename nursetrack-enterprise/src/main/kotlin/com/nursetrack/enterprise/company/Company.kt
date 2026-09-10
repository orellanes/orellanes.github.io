package com.nursetrack.enterprise.company

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_companies")
class Company(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false, length = 180)
    var name: String,

    @Column(length = 180)
    var legalName: String? = null,

    @Column(length = 220)
    var addressLine1: String? = null,

    @Column(length = 220)
    var addressLine2: String? = null,

    @Column(length = 100)
    var city: String? = null,

    @Column(length = 40)
    var state: String? = "PR",

    @Column(length = 20)
    var postalCode: String? = null,

    @Column(length = 40)
    var phone: String? = null,

    @Column(length = 250)
    var logoUrl: String? = null,

    @Column(nullable = false)
    var active: Boolean = true,

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun touch() { updatedAt = Instant.now() }
}
