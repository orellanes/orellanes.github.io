package com.nursetrack.enterprise.nursing

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface NursingNoteRepository : JpaRepository<NursingNote, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(companyId: UUID, patientId: UUID): List<NursingNote>
}
