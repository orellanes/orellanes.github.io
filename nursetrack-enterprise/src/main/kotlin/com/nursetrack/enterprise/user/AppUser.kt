package com.nursetrack.enterprise.user

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "nt_users",
    uniqueConstraints = [UniqueConstraint(name = "uq_nt_users_email", columnNames = ["email"])]
)
class AppUser(
    @Id @GeneratedValue
    var id: UUID? = null,

    var companyId: UUID? = null,

    @Column(nullable = false, length = 180)
    var email: String,

    @Column(nullable = false, length = 255)
    var passwordHash: String,

    @Column(nullable = false, length = 180)
    var displayName: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    var role: UserRole,

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(nullable = false)
    var mustChangePassword: Boolean = false,

    @Column(nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun touch() { updatedAt = Instant.now() }
}
