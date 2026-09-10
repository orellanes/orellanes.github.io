package com.nursetrack.enterprise.encounter

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EncounterRepository : JpaRepository<Encounter, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByStartedAtDesc(companyId: UUID, patientId: UUID): List<Encounter>
}
