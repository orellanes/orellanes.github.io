package com.nursetrack.enterprise.medical

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MedicalNoteRepository : JpaRepository<MedicalNote, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(companyId: UUID, patientId: UUID): List<MedicalNote>
    fun countByCompanyIdAndStatusIgnoreCase(companyId: UUID, status: String): Long
}
