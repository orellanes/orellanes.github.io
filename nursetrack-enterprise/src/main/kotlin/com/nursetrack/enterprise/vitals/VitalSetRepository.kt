package com.nursetrack.enterprise.vitals

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface VitalSetRepository : JpaRepository<VitalSet, UUID> {
    fun findAllByCompanyIdAndPatientIdOrderByMeasuredAtDesc(companyId: UUID, patientId: UUID): List<VitalSet>
    fun findByCompanyIdAndPatientIdAndEncounterId(companyId: UUID, patientId: UUID, encounterId: UUID): VitalSet?
}
