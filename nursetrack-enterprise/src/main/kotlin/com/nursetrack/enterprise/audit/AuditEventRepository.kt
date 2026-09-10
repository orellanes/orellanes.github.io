package com.nursetrack.enterprise.audit

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AuditEventRepository : JpaRepository<AuditEvent, UUID> {
    fun findTop200ByCompanyIdOrderByOccurredAtDesc(companyId: UUID): List<AuditEvent>
    fun findTop200ByCompanyIdAndPatientIdOrderByOccurredAtDesc(companyId: UUID, patientId: UUID): List<AuditEvent>
}
