package com.nursetrack.enterprise.social

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SocialWorkAssessmentRepository : JpaRepository<SocialWorkAssessment, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(companyId: UUID, patientId: UUID): List<SocialWorkAssessment>
}
