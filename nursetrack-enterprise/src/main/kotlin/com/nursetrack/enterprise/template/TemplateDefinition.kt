package com.nursetrack.enterprise.template

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "nt_template_definitions")
class TemplateDefinition(
    @Id @GeneratedValue
    var id: UUID? = null,

    var companyId: UUID? = null,

    @Column(nullable = false, length = 100)
    var templateKey: String,

    @Column(nullable = false, length = 40)
    var discipline: String,

    @Column(nullable = false, length = 12)
    var language: String = "es",

    @Column(nullable = false)
    var version: Int = 1,

    @Column(nullable = false, length = 180)
    var title: String,

    @Column(columnDefinition = "text", nullable = false)
    var schemaJson: String,

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
