package com.nursetrack.enterprise.medical

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface MedicalDiagnosisRepository : JpaRepository<MedicalDiagnosis, UUID> {
    fun findAllByMedicalNoteIdOrderByPrimaryDiagnosisDescCreatedAtAsc(medicalNoteId: UUID): List<MedicalDiagnosis>
    fun deleteAllByMedicalNoteId(medicalNoteId: UUID)
}
