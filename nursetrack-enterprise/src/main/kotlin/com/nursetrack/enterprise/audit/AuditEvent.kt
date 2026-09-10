package com.nursetrack.enterprise.audit

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_audit_events")
class AuditEvent(
    @Id @GeneratedValue
    var id: UUID? = null,

    var companyId: UUID? = null,
    var patientId: UUID? = null,

    @Column(nullable = false)
    var actorUserId: UUID,

    @Column(nullable = false, length = 80)
    var action: String,

    @Column(nullable = false, length = 80)
    var resourceType: String,

    var resourceId: UUID? = null,

    @Column(columnDefinition = "text")
    var detailsJson: String? = null,

    @Column(nullable = false, updatable = false)
    var occurredAt: Instant = Instant.now()
)
