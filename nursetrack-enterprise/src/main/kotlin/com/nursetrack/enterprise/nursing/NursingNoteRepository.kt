package com.nursetrack.enterprise.nursing

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface NursingNoteRepository : JpaRepository<NursingNote, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByCreatedAtDesc(companyId: UUID, patientId: UUID): List<NursingNote>
    fun findAllByCompanyIdAndPatientIdAndEncounterIdOrderByCreatedAtDesc(
        companyId: UUID,
        patientId: UUID,
        encounterId: UUID
    ): List<NursingNote>
    fun findFirstByCompanyIdAndPatientIdAndEncounterIdAndStatusOrderByCreatedAtDesc(
        companyId: UUID,
        patientId: UUID,
        encounterId: UUID,
        status: String
    ): NursingNote?
    fun countByCompanyIdAndStatusIgnoreCase(companyId: UUID, status: String): Long
}
