package com.nursetrack.enterprise.phq9

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface Phq9Repository : JpaRepository<Phq9Assessment, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByScreeningDateDescCreatedAtDesc(companyId: UUID, patientId: UUID): List<Phq9Assessment>
    fun countByCompanyIdAndFollowUpRequiredTrue(companyId: UUID): Long
}
