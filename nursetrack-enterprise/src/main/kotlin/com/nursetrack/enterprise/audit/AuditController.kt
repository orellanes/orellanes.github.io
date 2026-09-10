package com.nursetrack.enterprise.audit

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/admin/audit")
class AuditController(private val audits: AuditEventRepository) {

    @GetMapping
    fun list(
        @RequestParam companyId: UUID,
        @RequestParam(required = false) patientId: UUID?
    ): List<AuditEvent> = if (patientId == null) {
        audits.findTop200ByCompanyIdOrderByOccurredAtDesc(companyId)
    } else {
        audits.findTop200ByCompanyIdAndPatientIdOrderByOccurredAtDesc(companyId, patientId)
    }
}
