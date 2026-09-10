package com.nursetrack.enterprise.social

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_social_work_assessments")
class SocialWorkAssessment(
    @Id @GeneratedValue
    var id: UUID? = null,

    @Column(nullable = false)
    var companyId: UUID,

    @Column(nullable = false)
    var patientId: UUID,

    var encounterId: UUID? = null,

    @Column(nullable = false, length = 80)
    var templateKey: String = "social_work_case_management_4page",

    @Column(columnDefinition = "text", nullable = false)
    var page1Json: String = "{}",

    @Column(columnDefinition = "text", nullable = false)
    var page2Json: String = "{}",

    @Column(columnDefinition = "text", nullable = false)
    var page3Json: String = "{}",

    @Column(columnDefinition = "text", nullable = false)
    var page4Json: String = "{}",

    @Column(columnDefinition = "text")
    var narrative: String? = null,

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
