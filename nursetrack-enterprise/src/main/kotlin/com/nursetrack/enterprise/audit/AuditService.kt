package com.nursetrack.enterprise.audit

import org.springframework.stereotype.Service
import java.util.UUID

@Service
class AuditService(private val repository: AuditEventRepository) {
    fun record(
        actorUserId: UUID,
        action: String,
        resourceType: String,
        resourceId: UUID? = null,
        companyId: UUID? = null,
        patientId: UUID? = null,
        detailsJson: String? = null
    ) {
        repository.save(
            AuditEvent(
                actorUserId = actorUserId,
                action = action,
                resourceType = resourceType,
                resourceId = resourceId,
                companyId = companyId,
                patientId = patientId,
                detailsJson = detailsJson
            )
        )
    }
}
