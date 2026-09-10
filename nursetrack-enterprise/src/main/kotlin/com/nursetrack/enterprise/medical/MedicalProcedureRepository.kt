package com.nursetrack.enterprise.medical

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MedicalProcedureRepository : JpaRepository<MedicalProcedure, UUID> {
    fun findAllByMedicalNoteIdOrderByCreatedAtAsc(medicalNoteId: UUID): List<MedicalProcedure>
    fun deleteAllByMedicalNoteId(medicalNoteId: UUID)
}
